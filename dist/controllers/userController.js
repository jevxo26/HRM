"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
const emailService_1 = require("../services/emailService");
class UserController {
}
exports.UserController = UserController;
_a = UserController;
UserController.getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const users = await userService_1.UserService.getAllUsers();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        data: users,
    });
});
UserController.getUserById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const user = await userService_1.UserService.getUserById(id);
    if (user) {
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 200,
            data: user,
        });
    }
    else {
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 404,
            message: 'User not found',
        });
    }
});
UserController.createUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await userService_1.UserService.createUser(req.body);
    // Send welcome email with login credentials
    try {
        const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000/login';
        await (0, emailService_1.sendTemplateEmail)(user.email, 'Welcome to HRM System - Your Account Details', 'welcome', {
            email: user.email,
            password: req.body.password,
            loginUrl,
            year: new Date().getFullYear()
        });
    }
    catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        message: 'User created successfully',
        data: user,
    });
});
UserController.updateUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const user = await userService_1.UserService.updateUser(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        message: 'User updated successfully',
        data: user,
    });
});
UserController.deleteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    await userService_1.UserService.deleteUser(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        message: 'User deleted successfully',
    });
});
UserController.getCelebrations = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const celebrations = await userService_1.UserService.getCelebrations();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        data: celebrations,
    });
});
