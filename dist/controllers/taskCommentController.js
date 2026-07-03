"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskComments = exports.createTaskComment = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createTaskComment = async (req, res) => {
    var _a;
    try {
        const taskId = parseInt(req.params.id, 10);
        const { content } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!content) {
            res.status(400).json({ error: 'Comment content is required' });
            return;
        }
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { assignedTo: true, project: true }
        });
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        const comment = await prisma.taskComment.create({
            data: {
                taskId,
                userId,
                content,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
        // Send email notification to assignee if it's someone else commenting
        if (task.assignedTo && task.assignedTo.id !== userId) {
            const { sendTemplateEmail } = require('../services/emailService');
            await sendTemplateEmail(task.assignedTo.email, `New Comment on Task: ${task.title}`, 'project-comment', // using existing template for now
            {
                projectName: task.project.name,
                comment: content,
                year: new Date().getFullYear()
            }).catch(console.error);
        }
        res.status(201).json({ message: 'Comment created', comment });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createTaskComment = createTaskComment;
const getTaskComments = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id, 10);
        const comments = await prisma.taskComment.findMany({
            where: { taskId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true, profile: { select: { profilePicture: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(comments);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getTaskComments = getTaskComments;
