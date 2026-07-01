"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const catchServiceAsync_1 = require("../utils/catchServiceAsync");
const emailService_1 = require("./emailService");
const prisma = new client_1.PrismaClient();
class AuthService {
}
exports.AuthService = AuthService;
_a = AuthService;
AuthService.registerUser = (0, catchServiceAsync_1.catchServiceAsync)(async (data) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new Error('User already exists with this email');
    }
    const dataToSave = Object.assign({}, data);
    if (data.password) {
        const saltRounds = 10;
        dataToSave.password = await bcrypt_1.default.hash(data.password, saltRounds);
    }
    const user = await prisma.user.create({
        data: dataToSave,
    });
    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
    return userWithoutPassword;
});
AuthService.getMe = (0, catchServiceAsync_1.catchServiceAsync)(async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            issueDate: true,
            createdAt: true,
            updatedAt: true
        }
    });
    return user;
});
AuthService.loginUser = (0, catchServiceAsync_1.catchServiceAsync)(async (email, passwordInput) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    if (!user.password) {
        throw new Error('Invalid email or password');
    }
    const isPasswordValid = await bcrypt_1.default.compare(passwordInput, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: (process.env.JWT_EXPIRES_IN || '30d') });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') });
    // Update login log (store current timestamp)
    let loginLog = [];
    if (user.loginLog) {
        if (Array.isArray(user.loginLog)) {
            loginLog = user.loginLog;
        }
        else if (typeof user.loginLog === 'string') {
            try {
                loginLog = JSON.parse(user.loginLog);
            }
            catch (e) {
                // Ignore parse errors
            }
        }
    }
    loginLog.push(new Date().toISOString());
    await prisma.user.update({
        where: { id: user.id },
        data: { loginLog, refreshToken },
    });
    const { password, resetPasswordToken, resetPasswordExpires } = user, userWithoutPassword = __rest(user, ["password", "resetPasswordToken", "resetPasswordExpires"]);
    return {
        user: userWithoutPassword,
        token,
        refreshToken,
    };
});
AuthService.forgotPassword = (0, catchServiceAsync_1.catchServiceAsync)(async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('User not found');
    }
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken, resetPasswordExpires },
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    await (0, emailService_1.sendTemplateEmail)(user.email, 'Password Reset Request', 'passwordReset', { name: user.name, appName: 'My App', resetLink: resetUrl, year: new Date().getFullYear() });
    return { message: 'Password reset link sent to email' };
});
AuthService.resetPassword = (0, catchServiceAsync_1.catchServiceAsync)(async (token, newPassword) => {
    const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { gt: new Date() },
        },
    });
    if (!user) {
        throw new Error('Token is invalid or has expired');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt_1.default.hash(newPassword, saltRounds);
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        },
    });
    return { message: 'Password has been reset successfully' };
});
AuthService.refreshToken = (0, catchServiceAsync_1.catchServiceAsync)(async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
        const user = await prisma.user.findFirst({
            where: { id: decoded.userId, refreshToken },
        });
        if (!user) {
            throw new Error('Invalid refresh token');
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: (process.env.JWT_EXPIRES_IN || '30d') });
        return { token: newAccessToken };
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
});
AuthService.logoutUser = (0, catchServiceAsync_1.catchServiceAsync)(async (userId) => {
    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
});
