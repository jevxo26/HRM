"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAuthController = void 0;
const socialAuthService_1 = require("../services/socialAuthService");
const sendResponse_1 = require("../utils/sendResponse");
class SocialAuthController {
    static async loginWithGoogle(req, res) {
        try {
            const { credential } = req.body;
            if (!credential) {
                res.status(400).json({ error: 'Google credential is required' });
                return;
            }
            const result = await socialAuthService_1.SocialAuthService.loginWithGoogle(credential);
            (0, sendResponse_1.sendResponse)(res, {
                statusCode: 200,
                message: 'Successfully logged in with Google',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message || 'Failed to login with Google' });
        }
    }
    static async loginWithFacebook(req, res) {
        try {
            const { accessToken } = req.body;
            if (!accessToken) {
                res.status(400).json({ error: 'Facebook access token is required' });
                return;
            }
            const result = await socialAuthService_1.SocialAuthService.loginWithFacebook(accessToken);
            (0, sendResponse_1.sendResponse)(res, {
                statusCode: 200,
                message: 'Successfully logged in with Facebook',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message || 'Failed to login with Facebook' });
        }
    }
}
exports.SocialAuthController = SocialAuthController;
