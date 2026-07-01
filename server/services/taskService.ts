import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTask = async (projectId: number, title: string, description?: string, userId?: number) => {
  return await prisma.task.create({
    data: {
      projectId,
      title,
      description,
      userId,
    },
  });
};

export const getTasks = async (userId?: number) => {
  const where = userId ? { userId } : {};
  return await prisma.task.findMany({
    where,
    include: { project: true, assignedTo: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateTaskStatus = async (id: number, status: string, userId: number, role: string) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new Error('Task not found');

  if (role !== 'admin' && task.userId !== userId) {
    throw new Error('Forbidden. You can only update your own tasks.');
  }

  return await prisma.task.update({
    where: { id },
    data: { status },
  });
};
