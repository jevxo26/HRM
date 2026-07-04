import { Router } from 'express';
import { leaveController } from '../controllers/leaveController';
import { verifyToken, authorizeRoles, isAdmin, isNotEmployee } from '../middlewares/authMiddleware';

const router = Router();

// Employee & Admin routes
router.get('/types', verifyToken, leaveController.getTypes);
router.post('/apply', verifyToken, leaveController.applyLeave);
router.get('/my-requests', verifyToken, leaveController.getMyLeaves);

// Admin only routes
router.post('/types', verifyToken, isNotEmployee, leaveController.createType);
router.put('/types/:id', verifyToken, isNotEmployee, leaveController.updateType);
router.delete('/types/:id', verifyToken, isNotEmployee, leaveController.deleteType);
router.get('/all', verifyToken, authorizeRoles('cto', 'ceo', 'teamlead', 'hr', 'founder', 'admin'), leaveController.getAllLeaves);
router.put('/:id/status', verifyToken, authorizeRoles('cto', 'ceo', 'teamlead', 'hr', 'founder', 'admin'), leaveController.approveRejectLeave);

export default router;
