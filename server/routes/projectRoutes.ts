import { Router } from 'express';
import { createProject, getProjects, addComment, updateProject, deleteProject } from '../controllers/projectController';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.use(verifyToken);

router.post('/', isAdmin, upload.single('image'), createProject);
router.get('/', getProjects);
router.put('/:id', isAdmin, upload.single('image'), updateProject);
router.delete('/:id', isAdmin, deleteProject);
router.post('/:id/comment', isAdmin, addComment);

export default router;
