import express from 'express';
const router = express.Router();
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin-login', authController.adminLogin);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

// Account recovery & verification
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/change-password', authenticate, authController.changePassword);

export default router;
