import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTeam = async (name: string, description?: string) => {
  return await prisma.team.create({
    data: {
      name,
      description,
    },
  });
};

export const getTeams = async () => {
  return await prisma.team.findMany({
    include: { users: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const assignUserToTeam = async (userId: number, teamId: number) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { teamId },
  });
};
