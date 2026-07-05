"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulkEmail = exports.deleteTeam = exports.updateTeam = exports.assignUser = exports.getTeamById = exports.getTeams = exports.createTeam = void 0;
const teamService = __importStar(require("../services/teamService"));
const emailService = __importStar(require("../services/emailService"));
const createTeam = async (req, res) => {
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
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createTeam = createTeam;
const getTeams = async (req, res) => {
    try {
        const teams = await teamService.getTeams();
        res.status(200).json(teams);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
};
exports.getTeams = getTeams;
const getTeamById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const team = await teamService.getTeamById(id);
        if (!team) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        res.status(200).json(team);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch team' });
    }
};
exports.getTeamById = getTeamById;
const assignUser = async (req, res) => {
    var _a;
    try {
        const { userId, teamId } = req.body;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            res.status(403).json({ error: 'Forbidden. Admin access required.' });
            return;
        }
        const updatedUser = await teamService.assignUserToTeam(userId, teamId);
        res.status(200).json({ message: 'User assigned to team', user: updatedUser });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.assignUser = assignUser;
const updateTeam = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, description } = req.body;
        const allowedRoles = ['admin', 'cto', 'ceo', 'founder', 'teamlead'];
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden. Admin access required.' });
            return;
        }
        const updatedTeam = await teamService.updateTeam(id, name, description);
        res.status(200).json({ message: 'Team updated', team: updatedTeam });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateTeam = updateTeam;
const deleteTeam = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const allowedRoles = ['admin', 'cto', 'ceo', 'founder', 'teamlead'];
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden. Admin access required.' });
            return;
        }
        await teamService.deleteTeam(id);
        res.status(200).json({ message: 'Team deleted' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deleteTeam = deleteTeam;
const sendBulkEmail = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
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
            .map(p => { var _a; return (_a = p.user) === null || _a === void 0 ? void 0 : _a.email; })
            .filter((email) => !!email);
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
        await Promise.all(emails.map(email => emailService.sendEmail(email, subject, message, htmlContent)));
        res.status(200).json({ message: `Emails queued for ${emails.length} team members` });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to send bulk email', details: error.message });
    }
};
exports.sendBulkEmail = sendBulkEmail;
