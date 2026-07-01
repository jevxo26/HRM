import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfileByUserId = async (userId: number) => {
  return await prisma.employeeProfile.findUnique({
    where: { userId },
    include: {
      team: true,
      user: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });
};

export const upsertProfile = async (userId: number, profileData: any) => {
  return await prisma.employeeProfile.upsert({
    where: { userId },
    update: profileData,
    create: {
      userId,
      ...profileData,
    },
  });
};

export const getAllProfiles = async () => {
  return await prisma.employeeProfile.findMany({
    include: {
      team: true,
      user: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });
};
