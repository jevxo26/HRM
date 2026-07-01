import { Router } from 'express';
import { createSchedule, getSchedules } from '../controllers/scheduleController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.post('/', createSchedule);
router.get('/', getSchedules);

export default router;
