import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkIn = async (userId: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all attendance records for today
  const todaysAttendances = await prisma.attendance.findMany({
    where: {
      userId,
      date: { gte: today },
    },
  });

  let totalMilliseconds = 0;
  for (const att of todaysAttendances) {
    if (att.checkIn && !att.checkOut) {
      throw new Error('Already checked in. Please check out first.');
    }
    if (att.checkIn && att.checkOut) {
      totalMilliseconds += (att.checkOut.getTime() - att.checkIn.getTime());
    }
  }

  const totalHours = totalMilliseconds / (1000 * 60 * 60);
  if (totalHours >= 5) {
    throw new Error('Shift completed (5 hours). No more check-ins allowed today.');
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
      checkOut: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!existing || !existing.checkIn) {
    throw new Error('No open check-in found for today');
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
