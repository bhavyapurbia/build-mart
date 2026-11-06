import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import { authenticate  } from '../middleware/auth.js';

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin-login', authController.adminLogin);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

export default router;

