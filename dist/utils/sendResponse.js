"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const defaultMessages = {
    200: 'Success',
    201: 'Created Successfully',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
};
const sendResponse = (res, data) => {
    const statusCode = data.statusCode;
    const message = data.message || defaultMessages[statusCode] || 'Success';
    res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 300,
        message,
        data: data.data || null,
    });
};
exports.sendResponse = sendResponse;
