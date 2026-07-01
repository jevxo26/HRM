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
    include: { 
      users: { 
        select: { 
          id: true, 
          name: true, 
          email: true,
          role: true,
          profile: true
        } 
      } 
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateTeam = async (id: number, name: string, description?: string) => {
  return await prisma.team.update({
    where: { id },
    data: { name, description },
  });
};

export const deleteTeam = async (id: number) => {
  // First unlink all users from this team
  await prisma.user.updateMany({
    where: { teamId: id },
    data: { teamId: null },
  });
  
  return await prisma.team.delete({
    where: { id },
  });
};

export const assignUserToTeam = async (userId: number, teamId: number) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { teamId },
  });
};
