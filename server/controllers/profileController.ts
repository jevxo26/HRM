import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as profileService from '../services/profileService';

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const profile = await profileService.getProfileByUserId(userId);
    res.status(200).json({ data: profile });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const getProfileById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId as string);
    
    // Only admins/management or the user themselves can view the profile
    const allowedRoles = ['admin', 'cto', 'ceo', 'founder', 'teamlead', 'hr'];
    if (!allowedRoles.includes(req.user?.role || '') && req.user?.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const profile = await profileService.getProfileByUserId(userId);
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let userId = req.user?.userId;
    const { userId: targetUserId, ...profileData } = req.body;

    const isAdminRole = req.user && ['admin', 'cto', 'ceo', 'founder', 'teamlead', 'hr'].includes(req.user.role);

    // If an admin/management is updating someone else's profile
    if (targetUserId && isAdminRole) {
      userId = parseInt(targetUserId as string, 10);
    }

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!isAdminRole) {
      // Remove restricted fields
      delete profileData.basicSalary;
      delete profileData.allowances;
      delete profileData.grossSalary;
      delete profileData.employeeCode;
      delete profileData.employmentType;
      delete profileData.salaryGrade;
      delete profileData.designation; // added restriction for designation
    } else {
      // Convert numeric fields if present
      if (profileData.basicSalary) profileData.basicSalary = parseFloat(profileData.basicSalary as string);
      if (profileData.allowances) profileData.allowances = parseFloat(profileData.allowances as string);
      if (profileData.grossSalary) profileData.grossSalary = parseFloat(profileData.grossSalary as string);
    }

    if (profileData.teamId) profileData.teamId = parseInt(profileData.teamId as string, 10);
    if (profileData.reportingManager) profileData.reportingManager = parseInt(profileData.reportingManager as string, 10);

    // Convert date strings to Date objects for Prisma
    const dateFields = ['dateOfBirth', 'joiningDate', 'confirmationDate'];
    for (const field of dateFields) {
      if (profileData[field]) {
        profileData[field] = new Date(profileData[field]);
      } else {
        delete profileData[field]; // Prevent updating to empty string
      }
    }

    const updatedProfile = await profileService.upsertProfile(userId, profileData);
    res.status(200).json({ message: 'Profile updated', profile: updatedProfile });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
