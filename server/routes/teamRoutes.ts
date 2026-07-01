import { Router } from 'express';
import { createTeam, getTeams, assignUser, updateTeam, deleteTeam } from '../controllers/teamController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.post('/', createTeam);
router.get('/', getTeams);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.post('/assign', assignUser);

export default router;
