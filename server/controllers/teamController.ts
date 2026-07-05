import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as teamService from '../services/teamService';
import * as emailService from '../services/emailService';

export const createTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    
    const allowedRoles = ['admin', 'cto', 'ceo', 'founder', 'teamlead'];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
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

export const getTeamById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const team = await teamService.getTeamById(id);
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    res.status(200).json(team);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch team' });
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

    const allowedRoles = ['admin', 'cto', 'ceo', 'founder', 'teamlead'];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
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

    const allowedRoles = ['admin', 'cto', 'ceo', 'founder', 'teamlead'];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden. Admin access required.' });
      return;
    }

    await teamService.deleteTeam(id);
    res.status(200).json({ message: 'Team deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const sendBulkEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { subject, message, link, documentLink } = req.body;

    const allowedRoles = ['admin', 'cto', 'ceo', 'founder', 'teamlead', 'hr'];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden. Admin/HR access required.' });
      return;
    }

    if (!subject || !message) {
      res.status(400).json({ error: 'Subject and message are required' });
      return;
    }

    const teams = await teamService.getTeams();
    const team = teams.find(t => t.id === id);

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const emails = team.profiles
      .map(p => p.user?.email)
      .filter((email): email is string => !!email);

    if (emails.length === 0) {
      res.status(400).json({ error: 'No members with valid emails found in this team' });
      return;
    }

    // Prepare email content
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2>Message for ${team.name} Team</h2>
        <p style="white-space: pre-wrap;">${message}</p>
    `;

    if (link || documentLink) {
      htmlContent += `<div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px;">`;
      if (link) {
        htmlContent += `<p><strong>Important Link:</strong> <br> <a href="${link}" style="color: #4f46e5; text-decoration: none;">${link}</a></p>`;
      }
      if (documentLink) {
        htmlContent += `<p><strong>Document Link:</strong> <br> <a href="${documentLink}" style="color: #4f46e5; text-decoration: none;">${documentLink}</a></p>`;
      }
      htmlContent += `</div>`;
    }
    htmlContent += `</div>`;

    // Send emails in parallel
    await Promise.all(
      emails.map(email => emailService.sendEmail(email, subject, message, htmlContent))
    );

    res.status(200).json({ message: `Emails queued for ${emails.length} team members` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to send bulk email', details: error.message });
  }
};
