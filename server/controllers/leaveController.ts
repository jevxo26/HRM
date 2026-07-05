import { Request, Response } from 'express';
import { leaveService } from '../services/leaveService';

export class LeaveController {
  async createType(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, defaultDays } = req.body;
      if (!name) {
        res.status(400).json({ success: false, message: 'Name is required' });
        return;
      }

      const leaveType = await leaveService.createLeaveType({ name, description, defaultDays });
      res.status(201).json({ success: true, message: 'Leave type created', data: leaveType });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = await leaveService.getLeaveTypes();
      res.status(200).json({ success: true, data: types });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, defaultDays } = req.body;
      const leaveType = await leaveService.updateLeaveType(Number(id), { name, description, defaultDays });
      res.status(200).json({ success: true, message: 'Leave type updated', data: leaveType });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await leaveService.deleteLeaveType(Number(id));
      res.status(200).json({ success: true, message: 'Leave type deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async applyLeave(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { leaveTypeId, startDate, endDate, dayType, reason } = req.body;

      if (!leaveTypeId || !startDate || !endDate) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      const leave = await leaveService.applyForLeave(userId, {
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        dayType: dayType || 'full_day',
        reason
      });

      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const leaveWithUserAndType = await prisma.leaveRequest.findUnique({
          where: { id: leave.id },
          include: { user: true, leaveType: true }
        });

        if (leaveWithUserAndType) {
          const { sendTemplateEmail } = require('../services/emailService');
          const hrEmails = ['cto@jevxo.com', 'info@jevxo.com', 'arkohr@jevxo.com'];

          for (const email of hrEmails) {
            await sendTemplateEmail(
              email,
              `New Leave Request from ${leaveWithUserAndType.user.name}`,
              'leave-request-admin',
              {
                employeeName: leaveWithUserAndType.user.name,
                leaveType: leaveWithUserAndType.leaveType.name,
                startDate: new Date(leaveWithUserAndType.startDate).toLocaleDateString(),
                endDate: new Date(leaveWithUserAndType.endDate).toLocaleDateString(),
                reason: reason || 'Not provided',
                year: new Date().getFullYear()
              }
            ).catch(console.error);
          }
        }
      } catch (emailErr) {
        console.error('Error sending leave request email:', emailErr);
      }

      res.status(201).json({ success: true, message: 'Leave request submitted successfully', data: leave });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyLeaves(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user.userId;
      const role = user.role;
      let leaves;
      
      const allAccessRoles = ['cto', 'ceo', 'teamlead', 'hr', 'founder'];
      if (allAccessRoles.includes(role)) {
        leaves = await leaveService.getAllLeaves();
      } else {
        leaves = await leaveService.getMyLeaves(userId);
      }
      
      res.status(200).json({ success: true, data: leaves });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllLeaves(req: Request, res: Response): Promise<void> {
    try {
      const leaves = await leaveService.getAllLeaves();
      res.status(200).json({ success: true, data: leaves });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async approveRejectLeave(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body; // approved, rejected

      if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status' });
        return;
      }

      const updatedLeave = await leaveService.updateLeaveStatus(Number(id), status);

      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const leaveWithUser = await prisma.leaveRequest.findUnique({
          where: { id: Number(id) },
          include: { user: true, leaveType: true }
        });

        if (leaveWithUser && leaveWithUser.user.email) {
          const { sendTemplateEmail } = require('../services/emailService');
          await sendTemplateEmail(
            leaveWithUser.user.email,
            `Leave Request ${status.toUpperCase()}`,
            'leave-status',
            {
              status: status,
              statusClass: status,
              leaveType: leaveWithUser.leaveType.name,
              startDate: new Date(leaveWithUser.startDate).toLocaleDateString(),
              endDate: new Date(leaveWithUser.endDate).toLocaleDateString(),
              year: new Date().getFullYear()
            }
          );
        }
      } catch (emailErr) {
        console.error('Error sending leave email:', emailErr);
      }

      res.status(200).json({ success: true, message: `Leave request ${status}`, data: updatedLeave });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteLeave(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await leaveService.deleteLeaveRequest(Number(id));
      res.status(200).json({ success: true, message: 'Leave request deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const leaveController = new LeaveController();
