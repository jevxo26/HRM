import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSchedule = async (userId: number, dayOfWeek: string, startTime: string, endTime: string) => {
  return await prisma.schedule.create({
    data: {
      userId,
      dayOfWeek,
      startTime,
      endTime,
    },
  });
};

export const getSchedules = async (teamId?: number | null) => {
  const where = teamId ? { user: { teamId } } : {};
  return await prisma.schedule.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true, teamId: true } } },
    orderBy: { dayOfWeek: 'asc' },
  });
};

export const deleteSchedule = async (id: number) => {
  return await prisma.schedule.delete({
    where: { id },
  });
};
