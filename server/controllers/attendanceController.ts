import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as attendanceService from '../services/attendanceService';

export const checkIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const attendance = await attendanceService.checkIn(userId);
    res.status(201).json({ message: 'Checked in successfully', attendance });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const checkOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const attendance = await attendanceService.checkOut(userId);
    res.status(200).json({ message: 'Checked out successfully', attendance });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAttendances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    
    let attendances;
    if (role !== 'employee') {
      // Non-employees see all
      attendances = await attendanceService.getAllAttendances();
    } else {
      // Employees see own
      attendances = await attendanceService.getAllAttendances(userId);
    }
    
    res.status(200).json(attendances);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch attendances' });
  }
};

export const manualCreate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden. Admin access required.' });
      return;
    }
    const { userId, date, checkIn, checkOut, status } = req.body;
    const attendance = await attendanceService.createAttendance(
      Number(userId), 
      new Date(date), 
      checkIn ? new Date(checkIn) : null, 
      checkOut ? new Date(checkOut) : null, 
      status
    );
    res.status(201).json({ message: 'Attendance created', attendance });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const manualUpdate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden. Admin access required.' });
      return;
    }
    const { id } = req.params;
    const { date, checkIn, checkOut, status } = req.body;
    const attendance = await attendanceService.updateAttendance(
      Number(id), 
      new Date(date), 
      checkIn ? new Date(checkIn) : null, 
      checkOut ? new Date(checkOut) : null, 
      status
    );
    res.status(200).json({ message: 'Attendance updated', attendance });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const manualDelete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await attendanceService.deleteAttendance(Number(id));
    res.status(200).json({ message: 'Attendance deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
