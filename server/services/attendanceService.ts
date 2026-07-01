import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkIn = async (userId: number) => {
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

export const checkOut = async (userId: number) => {
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

export const getAllAttendances = async (userId?: number) => {
  const where = userId ? { userId } : {};
  return await prisma.attendance.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { date: 'desc' },
  });
};

export const createAttendance = async (userId: number, date: Date, checkIn: Date | null, checkOut: Date | null, status: string) => {
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

export const updateAttendance = async (id: number, date: Date, checkIn: Date | null, checkOut: Date | null, status: string) => {
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

export const deleteAttendance = async (id: number) => {
  return await prisma.attendance.delete({
    where: { id },
  });
};
