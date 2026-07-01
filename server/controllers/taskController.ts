import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as taskService from '../services/taskService';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, title, description, userId, priority, dueDate } = req.body;
    
    if (['employee', 'hr'].includes(req.user?.role)) {
      res.status(403).json({ error: 'Forbidden. Access restricted.' });
      return;
    }

    if (!projectId || !title) {
      res.status(400).json({ error: 'Project ID and title are required' });
      return;
    }

    const parsedDueDate = dueDate ? new Date(dueDate) : undefined;
    const task = await taskService.createTask(projectId, title, description, userId, priority || 'medium', parsedDueDate);
    
    if (userId) {
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const assignedUser = await prisma.user.findUnique({ where: { id: userId } });
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (assignedUser && assignedUser.email) {
          const { sendTemplateEmail } = require('../services/emailService');
          await sendTemplateEmail(assignedUser.email, 'New Task Assigned: ' + title, 'task-assigned', {
            title,
            projectName: project?.name || 'Unknown Project',
            description: description || 'No description provided.',
            year: new Date().getFullYear()
          });
        }
      } catch (emailErr) {
        console.error('Error sending task email:', emailErr);
      }
    }

    res.status(201).json({ message: 'Task created', task });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    
    let tasks;
    if (!['employee', 'hr'].includes(role)) {
      tasks = await taskService.getTasks();
    } else {
      tasks = await taskService.getTasks(userId);
    }
    
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id as string);
    const { status } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const task = await taskService.updateTaskStatus(taskId, status, userId, role);
    res.status(200).json({ message: 'Task status updated', task });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id as string);
    const { title, description, status, projectId, userId, priority, dueDate } = req.body;
    const currentUserId = req.user?.id;
    const role = req.user?.role;

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (projectId !== undefined) data.projectId = projectId;
    if (userId !== undefined) data.userId = userId;
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await taskService.updateTask(taskId, data, currentUserId, role);
    res.status(200).json({ message: 'Task updated', task });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
