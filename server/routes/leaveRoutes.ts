import { Router } from 'express';
import { leaveController } from '../controllers/leaveController';
import { verifyToken, isAdmin, isNotEmployee } from '../middlewares/authMiddleware';

const router = Router();

// Employee & Admin routes
router.get('/types', verifyToken, leaveController.getTypes);
router.post('/apply', verifyToken, leaveController.applyLeave);
router.get('/my-requests', verifyToken, leaveController.getMyLeaves);

// Admin only routes
router.post('/types', verifyToken, isNotEmployee, leaveController.createType);
router.get('/all', verifyToken, isAdmin, leaveController.getAllLeaves);
router.put('/:id/status', verifyToken, isAdmin, leaveController.approveRejectLeave);

export default router;
