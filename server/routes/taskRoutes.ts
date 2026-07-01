import { Router } from 'express';
import { createTask, getTasks, updateTaskStatus, updateTask } from '../controllers/taskController';
import { createTaskComment, getTaskComments } from '../controllers/taskCommentController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.post('/', createTask);
router.get('/', getTasks);
router.patch('/:id/status', updateTaskStatus);
router.put('/:id', updateTask);

router.post('/:id/comments', createTaskComment);
router.get('/:id/comments', getTaskComments);

export default router;
