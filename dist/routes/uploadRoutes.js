"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Route for single file upload (e.g. avatar, cover photo)
// verifyToken is used to ensure only authenticated users can upload files
router.post('/single', authMiddleware_1.verifyToken, uploadMiddleware_1.upload.single('file'), uploadController_1.UploadController.uploadFile);
// Route for multiple file uploads (e.g. gallery images, attachments)
router.post('/multiple', authMiddleware_1.verifyToken, uploadMiddleware_1.upload.array('files', 10), uploadController_1.UploadController.uploadMultipleFiles);
exports.default = router;
