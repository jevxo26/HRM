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
      profiles: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getTeamById = async (id: number) => {
  return await prisma.team.findUnique({
    where: { id },
    include: { 
      profiles: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }
    }
  });
};

export const updateTeam = async (id: number, name: string, description?: string) => {
  return await prisma.team.update({
    where: { id },
    data: { name, description },
  });
};

export const deleteTeam = async (id: number) => {
  // First unlink all profiles from this team
  await prisma.employeeProfile.updateMany({
    where: { teamId: id },
    data: { teamId: null },
  });
  
  return await prisma.team.delete({
    where: { id },
  });
};

export const assignUserToTeam = async (userId: number, teamId: number) => {
  return await prisma.employeeProfile.update({
    where: { userId },
    data: { teamId },
  });
};
