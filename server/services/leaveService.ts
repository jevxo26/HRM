import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LeaveService {
  async createLeaveType(data: { name: string; description?: string; defaultDays?: number }) {
    return await prisma.leaveType.create({
      data
    });
  }

  async getLeaveTypes() {
    return await prisma.leaveType.findMany();
  }

  async updateLeaveType(id: number, data: { name: string; description?: string; defaultDays?: number }) {
    return await prisma.leaveType.update({
      where: { id },
      data
    });
  }

  async deleteLeaveType(id: number) {
    return await prisma.leaveType.delete({
      where: { id }
    });
  }

  async applyForLeave(userId: number, data: { leaveTypeId: number; startDate: Date; endDate: Date; dayType: string; reason?: string }) {
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

  async getMyLeaves(userId: number) {
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

  async updateLeaveStatus(id: number, status: string) {
    return await prisma.leaveRequest.update({
      where: { id },
      data: { status }
    });
  }
}

export const leaveService = new LeaveService();
