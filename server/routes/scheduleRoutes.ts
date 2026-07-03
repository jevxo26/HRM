import { Router } from 'express';
import { createSchedule, getSchedules, deleteSchedule } from '../controllers/scheduleController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.post('/', createSchedule);
router.get('/', getSchedules);
router.delete('/:id', deleteSchedule);

export default router;
