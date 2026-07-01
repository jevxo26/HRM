import { Router } from 'express';
import { createTask, getTasks, updateTaskStatus } from '../controllers/taskController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.post('/', createTask);
router.get('/', getTasks);
router.patch('/:id/status', updateTaskStatus);

export default router;
