"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchedule = exports.updateSchedule = exports.getScheduleById = exports.getSchedules = exports.createSchedule = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createSchedule = async (userId, dayOfWeek, startTime, endTime) => {
    return await prisma.schedule.create({
        data: {
            userId,
            dayOfWeek,
            startTime,
            endTime,
        },
    });
};
exports.createSchedule = createSchedule;
const getSchedules = async (teamId) => {
    const where = teamId ? { user: { profile: { teamId } } } : {};
    return await prisma.schedule.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profile: { select: { teamId: true } }
                }
            }
        },
        orderBy: { dayOfWeek: 'asc' },
    });
};
exports.getSchedules = getSchedules;
const getScheduleById = async (id) => {
    return await prisma.schedule.findUnique({
        where: { id },
    });
};
exports.getScheduleById = getScheduleById;
const updateSchedule = async (id, dayOfWeek, startTime, endTime) => {
    return await prisma.schedule.update({
        where: { id },
        data: { dayOfWeek, startTime, endTime },
    });
};
exports.updateSchedule = updateSchedule;
const deleteSchedule = async (id) => {
    return await prisma.schedule.delete({
        where: { id },
    });
};
exports.deleteSchedule = deleteSchedule;
