"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignUserToTeam = exports.deleteTeam = exports.updateTeam = exports.getTeams = exports.createTeam = void 0;
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
        include: {
            profiles: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, role: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getTeams = getTeams;
const updateTeam = async (id, name, description) => {
    return await prisma.team.update({
        where: { id },
        data: { name, description },
    });
};
exports.updateTeam = updateTeam;
const deleteTeam = async (id) => {
    // First unlink all profiles from this team
    await prisma.employeeProfile.updateMany({
        where: { teamId: id },
        data: { teamId: null },
    });
    return await prisma.team.delete({
        where: { id },
    });
};
exports.deleteTeam = deleteTeam;
const assignUserToTeam = async (userId, teamId) => {
    return await prisma.employeeProfile.update({
        where: { userId },
        data: { teamId },
    });
};
exports.assignUserToTeam = assignUserToTeam;
