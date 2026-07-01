"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignUserToTeam = exports.getTeams = exports.createTeam = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createTeam = async (name, description) => {
    return await prisma.team.create({
        data: {
            name,
            description,
        },
    });
};
exports.createTeam = createTeam;
const getTeams = async () => {
    return await prisma.team.findMany({
        include: { users: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getTeams = getTeams;
const assignUserToTeam = async (userId, teamId) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { teamId },
    });
};
exports.assignUserToTeam = assignUserToTeam;
