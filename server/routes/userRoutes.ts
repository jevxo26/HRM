import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Protect all user routes
router.use(verifyToken);

const allowedRoles = ['admin', 'cto', 'ceo', 'teamlead', 'founder'];

router.get('/', authorizeRoles(...allowedRoles), UserController.getAllUsers);
router.get('/events/celebrations', UserController.getCelebrations);
router.get('/:id', UserController.getUserById);
router.post('/', authorizeRoles(...allowedRoles), UserController.createUser);
router.put('/:id', authorizeRoles(...allowedRoles), UserController.updateUser);
router.delete('/:id', authorizeRoles(...allowedRoles), UserController.deleteUser);

export default router;
