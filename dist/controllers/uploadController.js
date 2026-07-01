"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
class UploadController {
}
exports.UploadController = UploadController;
_a = UploadController;
UploadController.uploadFile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.file) {
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 400,
            message: 'No file provided',
        });
        return;
    }
    // Construct the backend URL for the file
    // Assuming backend runs on a specific domain/port which is known by the frontend,
    // or we can generate a relative URL that the frontend appends to its backend base URL.
    const fileUrl = `/uploads/${req.file.filename}`;
    // If you need an absolute URL and you know the backend URL from env:
    // const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    // const fileUrl = `${backendUrl}/uploads/${req.file.filename}`;
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        message: 'File uploaded successfully',
        data: {
            url: fileUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
        },
    });
});
UploadController.uploadMultipleFiles = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 400,
            message: 'No files provided',
        });
        return;
    }
    const fileData = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
    }));
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        message: 'Files uploaded successfully',
        data: fileData,
    });
});
