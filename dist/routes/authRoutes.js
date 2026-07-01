"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const socialAuthController_1 = require("../controllers/socialAuthController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', authController_1.AuthController.register);
router.post('/login', authController_1.AuthController.login);
router.post('/forgot-password', authController_1.AuthController.forgotPassword);
router.post('/reset-password', authController_1.AuthController.resetPassword);
router.post('/refresh-token', authController_1.AuthController.refreshToken);
router.post('/logout', authMiddleware_1.verifyToken, authController_1.AuthController.logout); // Optional: verifyToken ensures only logged in users can logout
router.get('/me', authMiddleware_1.verifyToken, authController_1.AuthController.me);
router.post('/social-login/google', socialAuthController_1.SocialAuthController.loginWithGoogle);
router.post('/social-login/facebook', socialAuthController_1.SocialAuthController.loginWithFacebook);
exports.default = router;
