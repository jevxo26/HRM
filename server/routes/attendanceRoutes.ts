import { Router } from 'express';
import { checkIn, checkOut, getAttendances, manualCreate, manualUpdate, manualDelete } from '../controllers/attendanceController';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

// All attendance routes require authentication
router.use(verifyToken);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/', getAttendances);

// Manual admin routes
router.post('/manual', isAdmin, manualCreate);
router.put('/:id', isAdmin, manualUpdate);
router.delete('/:id', isAdmin, manualDelete);

export default router;
