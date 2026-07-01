"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttendance = exports.updateAttendance = exports.createAttendance = exports.getAllAttendances = exports.checkOut = exports.checkIn = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const checkIn = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Check if already checked in today
    const existing = await prisma.attendance.findFirst({
        where: {
            userId,
            date: { gte: today },
        },
    });
    if (existing) {
        throw new Error('Already checked in today');
    }
    return await prisma.attendance.create({
        data: {
            userId,
            date: new Date(),
            checkIn: new Date(),
            status: 'present',
        },
    });
};
exports.checkIn = checkIn;
const checkOut = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await prisma.attendance.findFirst({
        where: {
            userId,
            date: { gte: today },
        },
        orderBy: { createdAt: 'desc' },
    });
    if (!existing) {
        throw new Error('No check-in found for today');
    }
    if (existing.checkOut) {
        throw new Error('Already checked out today');
    }
    return await prisma.attendance.update({
        where: { id: existing.id },
        data: { checkOut: new Date() },
    });
};
exports.checkOut = checkOut;
const getAllAttendances = async (userId) => {
    const where = userId ? { userId } : {};
    return await prisma.attendance.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { date: 'desc' },
    });
};
exports.getAllAttendances = getAllAttendances;
const createAttendance = async (userId, date, checkIn, checkOut, status) => {
    return await prisma.attendance.create({
        data: {
            userId,
            date,
            checkIn,
            checkOut,
            status,
        },
    });
};
exports.createAttendance = createAttendance;
const updateAttendance = async (id, date, checkIn, checkOut, status) => {
    return await prisma.attendance.update({
        where: { id },
        data: {
            date,
            checkIn,
            checkOut,
            status,
        },
    });
};
exports.updateAttendance = updateAttendance;
const deleteAttendance = async (id) => {
    return await prisma.attendance.delete({
        where: { id },
    });
};
exports.deleteAttendance = deleteAttendance;
