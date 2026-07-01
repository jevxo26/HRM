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
exports.manualDelete = exports.manualUpdate = exports.manualCreate = exports.getAttendances = exports.checkOut = exports.checkIn = void 0;
const attendanceService = __importStar(require("../services/attendanceService"));
const checkIn = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const attendance = await attendanceService.checkIn(userId);
        res.status(201).json({ message: 'Checked in successfully', attendance });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.checkIn = checkIn;
const checkOut = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const attendance = await attendanceService.checkOut(userId);
        res.status(200).json({ message: 'Checked out successfully', attendance });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.checkOut = checkOut;
const getAttendances = async (req, res) => {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        let attendances;
        if (role === 'admin') {
            // Admin sees all
            attendances = await attendanceService.getAllAttendances();
        }
        else {
            // Employee sees own
            attendances = await attendanceService.getAllAttendances(userId);
        }
        res.status(200).json(attendances);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendances' });
    }
};
exports.getAttendances = getAttendances;
const manualCreate = async (req, res) => {
    var _a;
    try {
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            res.status(403).json({ error: 'Forbidden. Admin access required.' });
            return;
        }
        const { userId, date, checkIn, checkOut, status } = req.body;
        const attendance = await attendanceService.createAttendance(Number(userId), new Date(date), checkIn ? new Date(checkIn) : null, checkOut ? new Date(checkOut) : null, status);
        res.status(201).json({ message: 'Attendance created', attendance });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.manualCreate = manualCreate;
const manualUpdate = async (req, res) => {
    var _a;
    try {
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            res.status(403).json({ error: 'Forbidden. Admin access required.' });
            return;
        }
        const { id } = req.params;
        const { date, checkIn, checkOut, status } = req.body;
        const attendance = await attendanceService.updateAttendance(Number(id), new Date(date), checkIn ? new Date(checkIn) : null, checkOut ? new Date(checkOut) : null, status);
        res.status(200).json({ message: 'Attendance updated', attendance });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.manualUpdate = manualUpdate;
const manualDelete = async (req, res) => {
    var _a;
    try {
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            res.status(403).json({ error: 'Forbidden. Admin access required.' });
            return;
        }
        const { id } = req.params;
        await attendanceService.deleteAttendance(Number(id));
        res.status(200).json({ message: 'Attendance deleted' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.manualDelete = manualDelete;
