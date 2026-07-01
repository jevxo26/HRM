import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfileByUserId = async (userId: number) => {
  return await prisma.employeeProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, team: true }
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
      user: {
        select: { id: true, name: true, email: true, role: true, team: true }
      }
    }
  });
};
