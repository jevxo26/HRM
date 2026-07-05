import { Router } from 'express';
import { createTeam, getTeams, getTeamById, assignUser, updateTeam, deleteTeam, sendBulkEmail } from '../controllers/teamController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.post('/', createTeam);
router.get('/', getTeams);
router.get('/:id', getTeamById);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.post('/assign', assignUser);
router.post('/:id/bulk-email', sendBulkEmail);

export default router;
