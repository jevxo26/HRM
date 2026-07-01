"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProfiles = exports.upsertProfile = exports.getProfileByUserId = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProfileByUserId = async (userId) => {
    return await prisma.employeeProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: { id: true, name: true, email: true, role: true, team: true }
            }
        }
    });
};
exports.getProfileByUserId = getProfileByUserId;
const upsertProfile = async (userId, profileData) => {
    return await prisma.employeeProfile.upsert({
        where: { userId },
        update: profileData,
        create: Object.assign({ userId }, profileData),
    });
};
exports.upsertProfile = upsertProfile;
const getAllProfiles = async () => {
    return await prisma.employeeProfile.findMany({
        include: {
            user: {
                select: { id: true, name: true, email: true, role: true, team: true }
            }
        }
    });
};
exports.getAllProfiles = getAllProfiles;
