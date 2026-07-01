"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProjects = exports.createProject = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createProject = async (name, description, image, progress) => {
    return await prisma.project.create({
        data: {
            name,
            description,
            image,
            progress: progress || 0,
        },
    });
};
exports.createProject = createProject;
const getProjects = async (userId) => {
    const where = userId ? {
        tasks: {
            some: {
                userId
            }
        }
    } : {};
    return await prisma.project.findMany({
        where,
        include: { tasks: true },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getProjects = getProjects;
const updateProject = async (id, name, description, image, progress) => {
    return await prisma.project.update({
        where: { id },
        data: {
            name,
            description,
            image,
            progress,
        },
    });
};
exports.updateProject = updateProject;
const deleteProject = async (id) => {
    return await prisma.project.delete({
        where: { id },
    });
};
exports.deleteProject = deleteProject;
