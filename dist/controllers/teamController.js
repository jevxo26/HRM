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
exports.deleteTeam = exports.updateTeam = exports.assignUser = exports.getTeams = exports.createTeam = void 0;
const teamService = __importStar(require("../services/teamService"));
const createTeam = async (req, res) => {
    var _a;
    try {
        const { name, description } = req.body;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            res.status(403).json({ error: 'Forbidden. Admin access required.' });
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
    var _a;
    try {
        const id = parseInt(req.params.id, 10);
        const { name, description } = req.body;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
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
    var _a;
    try {
        const id = parseInt(req.params.id, 10);
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
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
