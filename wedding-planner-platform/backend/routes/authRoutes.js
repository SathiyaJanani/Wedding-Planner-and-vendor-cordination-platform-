const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Standard Authentication with Rate Limiting
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Official Google OAuth 2.0 Endpoints
router.get('/google/url', authLimiter, authController.getGoogleAuthUrl);
router.get('/google', authLimiter, authController.redirectToGoogle);
router.get('/google/callback', authController.handleGoogleCallback);
router.post('/google/token', authLimiter, authController.verifyGoogleCredential);
router.post('/google', authLimiter, authController.googleLogin);
router.post('/oauth', authLimiter, authController.googleLogin);

// Protected Routes
router.get('/me', authMiddleware, authController.getMe);
router.get('/verify-token', authMiddleware, authController.verifyTokenEndpoint);
router.post('/refresh-token', authMiddleware, authController.refreshTokenEndpoint);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
