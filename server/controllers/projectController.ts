import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as projectService from '../services/projectService';

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, progress } = req.body;
    let image = req.body.image;

    // Use uploaded file if present
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    
    if (['employee', 'hr'].includes(req.user?.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const project = await projectService.createProject(name, description, image, progress ? Number(progress) : 0);
    res.status(201).json({ message: 'Project created', project });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    
    let projects;
    if (!['employee', 'hr'].includes(role)) {
      projects = await projectService.getProjects();
    } else {
      projects = await projectService.getProjects(userId);
    }
    
    // Calculate statistics for each project
    const projectsWithStats = projects.map(project => {
      const tasks = project.tasks || [];
      const pendingTasksCount = tasks.filter((t: any) => t.status === 'pending').length;
      const successTasksCount = tasks.filter((t: any) => t.status === 'completed').length; // assuming 'completed' means success
      const inreviewTasksCount = tasks.filter((t: any) => ['in_progress', 'in_review'].includes(t.status)).length;
      
      const uniqueUsers = new Set();
      tasks.forEach((t: any) => {
        if (t.userId) uniqueUsers.add(t.userId);
      });
      const activeUsersCount = uniqueUsers.size;

      return {
        ...project,
        stats: {
          totalTasks: tasks.length,
          pendingTasks: pendingTasksCount,
          successTasks: successTasksCount,
          inreviewTasks: inreviewTasksCount,
          activeUsers: activeUsersCount
        }
      };
    });

    res.status(200).json(projectsWithStats);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id as string, 10) },
      include: {
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true, profile: { select: { profilePicture: true } } } },
            comments: {
              include: {
                user: { select: { id: true, name: true, email: true, profile: { select: { profilePicture: true } } } }
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.status(200).json(project);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, progress } = req.body;
    const { id } = req.params;
    let image = req.body.image;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    
    if (['employee', 'hr'].includes(req.user?.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const project = await projectService.updateProject(Number(id), name, description, image, progress ? Number(progress) : undefined);
    res.status(200).json({ message: 'Project updated', project });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (['employee', 'hr'].includes(req.user?.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await projectService.deleteProject(Number(id));
    res.status(200).json({ message: 'Project deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id as string);
    const { comment } = req.body;
    
    if (['employee', 'hr'].includes(req.user?.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (!comment) {
      res.status(400).json({ error: 'Comment is required' });
      return;
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          include: { user: true }
        }
      }
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Collect unique emails of all users assigned to tasks in this project
    const emails = new Set<string>();
    project.tasks.forEach((task: any) => {
      if (task.user && task.user.email) {
        emails.add(task.user.email);
      }
    });

    if (emails.size > 0) {
      const { sendTemplateEmail } = require('../services/emailService');
      // Send email to all unique users
      for (const email of Array.from(emails)) {
        await sendTemplateEmail(
          email, 
          `Update on Project: ${project.name}`, 
          'project-comment', 
          {
            projectName: project.name,
            comment: comment,
            year: new Date().getFullYear()
          }
        ).catch(console.error);
      }
    }

    res.status(200).json({ message: 'Comment posted and emails sent successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
