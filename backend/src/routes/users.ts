import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';

const router = Router();
const userController = new UserController();

// Require authentication for all user routes
router.use(authenticateToken);

router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));

// Only Admin can create / update / delete users
router.post('/', authorizeRoles(['Admin']), userController.createUser.bind(userController));
router.put('/:id', authorizeRoles(['Admin']), userController.updateUser.bind(userController));
router.delete('/:id', authorizeRoles(['Admin']), userController.deleteUser.bind(userController));

export default router;
