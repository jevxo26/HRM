"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTask = exports.updateTaskStatus = exports.getTasks = exports.createTask = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createTask = async (projectId, title, description, userId, priority = 'medium', dueDate) => {
    return await prisma.task.create({
        data: {
            projectId,
            title,
            description,
            userId,
            priority,
            dueDate,
        },
    });
};
exports.createTask = createTask;
const getTasks = async (userId) => {
    const where = userId ? { userId } : {};
    return await prisma.task.findMany({
        where,
        include: { project: true, assignedTo: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getTasks = getTasks;
const updateTaskStatus = async (id, status, userId, role) => {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task)
        throw new Error('Task not found');
    if (['employee', 'hr'].includes(role) && task.userId !== userId) {
        throw new Error('Forbidden. You can only update your own tasks.');
    }
    return await prisma.task.update({
        where: { id },
        data: { status },
    });
};
exports.updateTaskStatus = updateTaskStatus;
const updateTask = async (id, data, userId, role) => {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task)
        throw new Error('Task not found');
    if (['employee', 'hr'].includes(role) && task.userId !== userId) {
        throw new Error('Forbidden. You can only update your own tasks.');
    }
    return await prisma.task.update({
        where: { id },
        data,
    });
};
exports.updateTask = updateTask;
