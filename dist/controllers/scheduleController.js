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
exports.deleteSchedule = exports.getSchedules = exports.createSchedule = void 0;
const scheduleService = __importStar(require("../services/scheduleService"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createSchedule = async (req, res) => {
    var _a, _b;
    try {
        // If not admin, force userId to be the logged in user
        let { userId, dayOfWeek, startTime, endTime } = req.body;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId; // force to their own ID
        }
        if (!userId || !dayOfWeek || !startTime || !endTime) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const schedule = await scheduleService.createSchedule(userId, dayOfWeek, startTime, endTime);
        res.status(201).json({ message: 'Schedule created', schedule });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createSchedule = createSchedule;
const getSchedules = async (req, res) => {
    var _a, _b;
    try {
        let teamId = null;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'employee') {
            const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { profile: true } });
            teamId = ((_b = user === null || user === void 0 ? void 0 : user.profile) === null || _b === void 0 ? void 0 : _b.teamId) || null;
        }
        const schedules = await scheduleService.getSchedules(teamId);
        res.status(200).json(schedules);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
};
exports.getSchedules = getSchedules;
const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        await scheduleService.deleteSchedule(Number(id));
        res.status(200).json({ message: 'Schedule deleted' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deleteSchedule = deleteSchedule;
