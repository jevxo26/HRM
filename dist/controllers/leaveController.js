"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveController = exports.LeaveController = void 0;
const leaveService_1 = require("../services/leaveService");
class LeaveController {
    async createType(req, res) {
        try {
            const { name, description, defaultDays } = req.body;
            if (!name) {
                res.status(400).json({ success: false, message: 'Name is required' });
                return;
            }
            const leaveType = await leaveService_1.leaveService.createLeaveType({ name, description, defaultDays });
            res.status(201).json({ success: true, message: 'Leave type created', data: leaveType });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async getTypes(req, res) {
        try {
            const types = await leaveService_1.leaveService.getLeaveTypes();
            res.status(200).json({ success: true, data: types });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async updateType(req, res) {
        try {
            const { id } = req.params;
            const { name, description, defaultDays } = req.body;
            const leaveType = await leaveService_1.leaveService.updateLeaveType(Number(id), { name, description, defaultDays });
            res.status(200).json({ success: true, message: 'Leave type updated', data: leaveType });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async deleteType(req, res) {
        try {
            const { id } = req.params;
            await leaveService_1.leaveService.deleteLeaveType(Number(id));
            res.status(200).json({ success: true, message: 'Leave type deleted' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async applyLeave(req, res) {
        try {
            const userId = req.user.userId;
            const { leaveTypeId, startDate, endDate, dayType, reason } = req.body;
            if (!leaveTypeId || !startDate || !endDate) {
                res.status(400).json({ success: false, message: 'Missing required fields' });
                return;
            }
            const leave = await leaveService_1.leaveService.applyForLeave(userId, {
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
                        await sendTemplateEmail(email, `New Leave Request from ${leaveWithUserAndType.user.name}`, 'leave-request-admin', {
                            employeeName: leaveWithUserAndType.user.name,
                            leaveType: leaveWithUserAndType.leaveType.name,
                            startDate: new Date(leaveWithUserAndType.startDate).toLocaleDateString(),
                            endDate: new Date(leaveWithUserAndType.endDate).toLocaleDateString(),
                            reason: reason || 'Not provided',
                            year: new Date().getFullYear()
                        }).catch(console.error);
                    }
                }
            }
            catch (emailErr) {
                console.error('Error sending leave request email:', emailErr);
            }
            res.status(201).json({ success: true, message: 'Leave request submitted successfully', data: leave });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async getMyLeaves(req, res) {
        try {
            const user = req.user;
            const userId = user.userId;
            const role = user.role;
            let leaves;
            const allAccessRoles = ['cto', 'ceo', 'teamlead', 'hr', 'founder'];
            if (allAccessRoles.includes(role)) {
                leaves = await leaveService_1.leaveService.getAllLeaves();
            }
            else {
                leaves = await leaveService_1.leaveService.getMyLeaves(userId);
            }
            res.status(200).json({ success: true, data: leaves });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async getAllLeaves(req, res) {
        try {
            const leaves = await leaveService_1.leaveService.getAllLeaves();
            res.status(200).json({ success: true, data: leaves });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async approveRejectLeave(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body; // approved, rejected
            if (!['approved', 'rejected'].includes(status)) {
                res.status(400).json({ success: false, message: 'Invalid status' });
                return;
            }
            const updatedLeave = await leaveService_1.leaveService.updateLeaveStatus(Number(id), status);
            try {
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();
                const leaveWithUser = await prisma.leaveRequest.findUnique({
                    where: { id: Number(id) },
                    include: { user: true, leaveType: true }
                });
                if (leaveWithUser && leaveWithUser.user.email) {
                    const { sendTemplateEmail } = require('../services/emailService');
                    await sendTemplateEmail(leaveWithUser.user.email, `Leave Request ${status.toUpperCase()}`, 'leave-status', {
                        status: status,
                        statusClass: status,
                        leaveType: leaveWithUser.leaveType.name,
                        startDate: new Date(leaveWithUser.startDate).toLocaleDateString(),
                        endDate: new Date(leaveWithUser.endDate).toLocaleDateString(),
                        year: new Date().getFullYear()
                    });
                }
            }
            catch (emailErr) {
                console.error('Error sending leave email:', emailErr);
            }
            res.status(200).json({ success: true, message: `Leave request ${status}`, data: updatedLeave });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async deleteLeave(req, res) {
        try {
            const { id } = req.params;
            await leaveService_1.leaveService.deleteLeaveRequest(Number(id));
            res.status(200).json({ success: true, message: 'Leave request deleted' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.LeaveController = LeaveController;
exports.leaveController = new LeaveController();
