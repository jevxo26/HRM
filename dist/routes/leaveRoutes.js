"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaveController_1 = require("../controllers/leaveController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Employee & Admin routes
router.get('/types', authMiddleware_1.verifyToken, leaveController_1.leaveController.getTypes);
router.post('/apply', authMiddleware_1.verifyToken, leaveController_1.leaveController.applyLeave);
router.get('/my-requests', authMiddleware_1.verifyToken, leaveController_1.leaveController.getMyLeaves);
// Admin only routes
router.post('/types', authMiddleware_1.verifyToken, authMiddleware_1.isNotEmployee, leaveController_1.leaveController.createType);
router.get('/all', authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('cto', 'ceo', 'teamlead', 'hr', 'founder', 'admin'), leaveController_1.leaveController.getAllLeaves);
router.put('/:id/status', authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('cto', 'ceo', 'teamlead', 'hr', 'founder', 'admin'), leaveController_1.leaveController.approveRejectLeave);
exports.default = router;
