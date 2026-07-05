"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveService = exports.LeaveService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class LeaveService {
    async createLeaveType(data) {
        return await prisma.leaveType.create({
            data
        });
    }
    async getLeaveTypes() {
        return await prisma.leaveType.findMany();
    }
    async updateLeaveType(id, data) {
        return await prisma.leaveType.update({
            where: { id },
            data
        });
    }
    async deleteLeaveType(id) {
        return await prisma.leaveType.delete({
            where: { id }
        });
    }
    async applyForLeave(userId, data) {
        return await prisma.leaveRequest.create({
            data: {
                userId,
                leaveTypeId: data.leaveTypeId,
                startDate: data.startDate,
                endDate: data.endDate,
                dayType: data.dayType,
                reason: data.reason
            }
        });
    }
    async getMyLeaves(userId) {
        return await prisma.leaveRequest.findMany({
            where: { userId },
            include: { leaveType: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getAllLeaves() {
        return await prisma.leaveRequest.findMany({
            include: { user: { select: { id: true, name: true, email: true } }, leaveType: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async updateLeaveStatus(id, status) {
        return await prisma.leaveRequest.update({
            where: { id },
            data: { status }
        });
    }
    async deleteLeaveRequest(id) {
        return await prisma.leaveRequest.delete({
            where: { id }
        });
    }
}
exports.LeaveService = LeaveService;
exports.leaveService = new LeaveService();
