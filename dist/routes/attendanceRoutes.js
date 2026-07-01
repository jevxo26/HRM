"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendanceController_1 = require("../controllers/attendanceController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// All attendance routes require authentication
router.use(authMiddleware_1.verifyToken);
router.post('/check-in', attendanceController_1.checkIn);
router.post('/check-out', attendanceController_1.checkOut);
router.get('/', attendanceController_1.getAttendances);
// Manual admin routes
router.post('/manual', authMiddleware_1.isAdmin, attendanceController_1.manualCreate);
router.put('/:id', authMiddleware_1.isAdmin, attendanceController_1.manualUpdate);
router.delete('/:id', authMiddleware_1.isAdmin, attendanceController_1.manualDelete);
exports.default = router;
