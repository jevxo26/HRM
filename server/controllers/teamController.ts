import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as teamService from '../services/teamService';

export const createTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'employee')) {
      res.status(403).json({ error: 'Forbidden. Access required.' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'Team name is required' });
      return;
    }

    const team = await teamService.createTeam(name, description);
    res.status(201).json({ message: 'Team created', team });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teams = await teamService.getTeams();
    res.status(200).json(teams);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

export const assignUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, teamId } = req.body;

    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden. Admin access required.' });
      return;
    }

    const updatedUser = await teamService.assignUserToTeam(userId, teamId);
    res.status(200).json({ message: 'User assigned to team', user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { name, description } = req.body;

    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden. Admin access required.' });
      return;
    }

    const updatedTeam = await teamService.updateTeam(id, name, description);
    res.status(200).json({ message: 'Team updated', team: updatedTeam });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    if (req.user?.role === 'employee') {
      res.status(403).json({ error: 'Forbidden. Employees cannot delete teams.' });
      return;
    }

    await teamService.deleteTeam(id);
    res.status(200).json({ message: 'Team deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
