import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login.bind(authController));
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));

export default router;
