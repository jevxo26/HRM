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
exports.deleteTask = exports.updateTask = exports.updateTaskStatus = exports.getTasks = exports.createTask = void 0;
const taskService = __importStar(require("../services/taskService"));
const createTask = async (req, res) => {
    var _a;
    try {
        const { projectId, title, description, userId, priority, dueDate } = req.body;
        if (['employee', 'hr'].includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.role)) {
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
                        projectName: (project === null || project === void 0 ? void 0 : project.name) || 'Unknown Project',
                        description: description || 'No description provided.',
                        year: new Date().getFullYear()
                    });
                }
            }
            catch (emailErr) {
                console.error('Error sending task email:', emailErr);
            }
        }
        res.status(201).json({ message: 'Task created', task });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createTask = createTask;
const getTasks = async (req, res) => {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        let tasks;
        if (!['employee', 'hr'].includes(role)) {
            tasks = await taskService.getTasks();
        }
        else {
            tasks = await taskService.getTasks(userId);
        }
        res.status(200).json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};
exports.getTasks = getTasks;
const updateTaskStatus = async (req, res) => {
    var _a, _b;
    try {
        const taskId = parseInt(req.params.id);
        const { status } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const task = await taskService.updateTaskStatus(taskId, status, userId, role);
        res.status(200).json({ message: 'Task status updated', task });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateTaskStatus = updateTaskStatus;
const updateTask = async (req, res) => {
    var _a, _b;
    try {
        const taskId = parseInt(req.params.id);
        const { title, description, status, projectId, userId, priority, dueDate } = req.body;
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!currentUserId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const data = {};
        if (title !== undefined)
            data.title = title;
        if (description !== undefined)
            data.description = description;
        if (status !== undefined)
            data.status = status;
        if (projectId !== undefined)
            data.projectId = projectId;
        if (userId !== undefined)
            data.userId = userId;
        if (priority !== undefined)
            data.priority = priority;
        if (dueDate !== undefined)
            data.dueDate = dueDate ? new Date(dueDate) : null;
        const task = await taskService.updateTask(taskId, data, currentUserId, role);
        res.status(200).json({ message: 'Task updated', task });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    var _a;
    try {
        const taskId = parseInt(req.params.id);
        const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (role === 'employee') {
            res.status(403).json({ error: 'Forbidden. Employees cannot delete tasks.' });
            return;
        }
        await taskService.deleteTask(taskId);
        res.status(200).json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deleteTask = deleteTask;
