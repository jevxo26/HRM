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
    
    // Only admins or the user themselves can view the profile (or maybe managers)
    if (req.user?.role !== 'admin' && req.user?.userId !== userId) {
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

    // If an admin is updating someone else's profile
    if (targetUserId && req.user?.role === 'admin') {
      userId = targetUserId;
    }

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Admins can update any field, but employees shouldn't be able to update salary/employment info
    // For simplicity, we just pass the data, but in a real app, restrict fields based on role
    // Admins can update any field, but employees shouldn't be able to update salary/employment info
    // For simplicity, we just pass the data, but in a real app, restrict fields based on role
    if (req.user?.role !== 'admin') {
      // Remove restricted fields
      delete profileData.basicSalary;
      delete profileData.allowances;
      delete profileData.grossSalary;
      delete profileData.employeeCode;
      delete profileData.employmentType;
      delete profileData.salaryGrade;
      delete profileData.designation; // added restriction for designation
    }

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
