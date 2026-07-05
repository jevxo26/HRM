import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTask = async (projectId: number, title: string, description?: string, userId?: number, priority: string = 'medium', dueDate?: Date) => {
  return await prisma.task.create({
    data: {
      projectId,
      title,
      description,
      userId,
      priority,
      dueDate,
    },
  });
};

export const getTasks = async (userId?: number) => {
  const where = userId ? { userId } : {};
  return await prisma.task.findMany({
    where,
    include: { 
      project: true, 
      assignedTo: { 
        select: { 
          id: true, 
          name: true, 
          email: true,
          profile: {
            include: {
              team: true
            }
          }
        } 
      } 
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateTaskStatus = async (id: number, status: string, userId: number, role: string) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new Error('Task not found');

  if (['employee', 'hr'].includes(role) && task.userId !== userId) {
    throw new Error('Forbidden. You can only update your own tasks.');
  }

  if (status === 'completed' && ['employee', 'hr'].includes(role)) {
    throw new Error('Only admins or CTO can mark a task as completed');
  }

  return await prisma.task.update({
    where: { id },
    data: { status },
  });
};

export const updateTask = async (id: number, data: any, userId: number, role: string) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new Error('Task not found');

  if (['employee', 'hr'].includes(role) && task.userId !== userId) {
    throw new Error('Forbidden. You can only update your own tasks.');
  }

  if (data.status === 'completed' && ['employee', 'hr'].includes(role)) {
    throw new Error('Only admins or CTO can mark a task as completed');
  }

  return await prisma.task.update({
    where: { id },
    data,
  });
};

export const deleteTask = async (id: number) => {
  return await prisma.task.delete({
    where: { id },
  });
};
