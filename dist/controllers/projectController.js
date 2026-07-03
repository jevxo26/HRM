"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const projectService = __importStar(require("../services/projectService"));
const createProject = async (req, res) => {
    var _a;
    try {
        const { name, description, progress } = req.body;
        let image = req.body.image;
        // Use uploaded file if present
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }
        if (['employee', 'hr'].includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.role)) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        if (!name) {
            res.status(400).json({ error: 'Name is required' });
            return;
        }
        const project = await projectService.createProject(name, description, image, progress ? Number(progress) : 0);
        res.status(201).json({ message: 'Project created', project });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createProject = createProject;
const getProjects = async (req, res) => {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        let projects;
        if (!['employee', 'hr'].includes(role)) {
            projects = await projectService.getProjects();
        }
        else {
            projects = await projectService.getProjects(userId);
        }
        // Calculate statistics for each project
        const projectsWithStats = projects.map(project => {
            const tasks = project.tasks || [];
            const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;
            const successTasksCount = tasks.filter((t) => t.status === 'completed').length; // assuming 'completed' means success
            const uniqueUsers = new Set();
            tasks.forEach((t) => {
                if (t.userId)
                    uniqueUsers.add(t.userId);
            });
            const activeUsersCount = uniqueUsers.size;
            return Object.assign(Object.assign({}, project), { stats: {
                    totalTasks: tasks.length,
                    pendingTasks: pendingTasksCount,
                    successTasks: successTasksCount,
                    activeUsers: activeUsersCount
                } });
        });
        res.status(200).json(projectsWithStats);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const project = await prisma.project.findUnique({
            where: { id: parseInt(id, 10) },
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
};
exports.getProjectById = getProjectById;
const updateProject = async (req, res) => {
    var _a;
    try {
        const { name, description, progress } = req.body;
        const { id } = req.params;
        let image = req.body.image;
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }
        if (['employee', 'hr'].includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.role)) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const project = await projectService.updateProject(Number(id), name, description, image, progress ? Number(progress) : undefined);
        res.status(200).json({ message: 'Project updated', project });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        if (['employee', 'hr'].includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.role)) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        await projectService.deleteProject(Number(id));
        res.status(200).json({ message: 'Project deleted' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deleteProject = deleteProject;
const addComment = async (req, res) => {
    var _a;
    try {
        const projectId = parseInt(req.params.id);
        const { comment } = req.body;
        if (['employee', 'hr'].includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.role)) {
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
        const emails = new Set();
        project.tasks.forEach((task) => {
            if (task.user && task.user.email) {
                emails.add(task.user.email);
            }
        });
        if (emails.size > 0) {
            const { sendTemplateEmail } = require('../services/emailService');
            // Send email to all unique users
            for (const email of Array.from(emails)) {
                await sendTemplateEmail(email, `Update on Project: ${project.name}`, 'project-comment', {
                    projectName: project.name,
                    comment: comment,
                    year: new Date().getFullYear()
                }).catch(console.error);
            }
        }
        res.status(200).json({ message: 'Comment posted and emails sent successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addComment = addComment;
