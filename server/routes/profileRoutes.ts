import { Router } from 'express';
import { getMyProfile, getProfileById, updateProfile } from '../controllers/profileController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.get('/me', getMyProfile);
router.get('/:userId', getProfileById);
router.post('/update', updateProfile);

export default router;
