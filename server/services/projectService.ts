import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createProject = async (name: string, description?: string, image?: string, progress?: number) => {
  return await prisma.project.create({
    data: {
      name,
      description,
      image,
      progress: progress || 0,
    },
  });
};

export const getProjects = async (userId?: number) => {
  const where = userId ? {
    tasks: {
      some: {
        userId
      }
    }
  } : {};

  return await prisma.project.findMany({
    where,
    include: { tasks: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateProject = async (id: number, name: string, description?: string, image?: string, progress?: number) => {
  return await prisma.project.update({
    where: { id },
    data: {
      name,
      description,
      image,
      progress,
    },
  });
};

export const deleteProject = async (id: number) => {
  return await prisma.project.delete({
    where: { id },
  });
};
