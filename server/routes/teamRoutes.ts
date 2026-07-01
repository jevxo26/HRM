import { Router } from 'express';
import { createTeam, getTeams, assignUser } from '../controllers/teamController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.post('/', createTeam);
router.get('/', getTeams);
router.post('/assign', assignUser);

export default router;
