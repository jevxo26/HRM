"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await authService_1.AuthService.registerUser(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        message: 'User registered successfully',
        data: user,
    });
});
AuthController.login = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 400,
            message: 'Email and password are required',
        });
        return;
    }
    const result = await authService_1.AuthService.loginUser(email, password);
    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        message: 'Login successful',
        data: {
            user: result.user,
            token: result.token,
        },
    });
});
AuthController.forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 400, message: 'Email is required' });
        return;
    }
    const result = await authService_1.AuthService.forgotPassword(email);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, message: result.message });
});
AuthController.resetPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 400, message: 'Token and new password are required' });
        return;
    }
    const result = await authService_1.AuthService.resetPassword(token, newPassword);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, message: result.message });
});
AuthController.refreshToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Refresh token not found' });
        return;
    }
    const result = await authService_1.AuthService.refreshToken(refreshToken);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, message: 'Token refreshed', data: result });
});
AuthController.logout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (userId) {
        await authService_1.AuthService.logoutUser(userId);
    }
    res.clearCookie('refreshToken');
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, message: 'Logged out successfully' });
});
AuthController.me = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 401,
            message: 'Unauthorized',
        });
        return;
    }
    const user = await authService_1.AuthService.getMe(userId);
    if (!user) {
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 404,
            message: 'User not found',
        });
        return;
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        data: user,
    });
});
