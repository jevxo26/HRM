import { Router } from 'express';
import { createProject, getProjects, getProjectById, addComment, updateProject, deleteProject } from '../controllers/projectController';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.use(verifyToken);

const requireManagement = authorizeRoles('admin', 'cto', 'founder', 'ceo', 'teamlead');

router.post('/', requireManagement, upload.single('image'), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', requireManagement, upload.single('image'), updateProject);
router.delete('/:id', requireManagement, deleteProject);
router.post('/:id/comment', requireManagement, addComment);

export default router;
