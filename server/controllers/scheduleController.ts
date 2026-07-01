import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as scheduleService from '../services/scheduleService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // If not admin, force userId to be the logged in user
    let { userId, dayOfWeek, startTime, endTime } = req.body;
    
    if (req.user?.role !== 'admin') {
      userId = req.user?.id; // force to their own ID
    }

    if (!userId || !dayOfWeek || !startTime || !endTime) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const schedule = await scheduleService.createSchedule(userId, dayOfWeek, startTime, endTime);
    res.status(201).json({ message: 'Schedule created', schedule });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let teamId = null;

    if (req.user?.role === 'employee' || req.user?.role === 'teamlead') {
      const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { profile: true } });
      teamId = user?.profile?.teamId || null;
    }

    const schedules = await scheduleService.getSchedules(teamId);
    res.status(200).json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};
