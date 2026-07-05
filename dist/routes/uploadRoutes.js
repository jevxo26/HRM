"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Route for serving files
router.get('/file/:filename', (req, res) => {
    const filePath = path_1.default.join(process.cwd(), 'public', 'uploads', req.params.filename);
    if (fs_1.default.existsSync(filePath)) {
        res.sendFile(filePath);
    }
    else {
        res.status(404).json({ error: 'File not found' });
    }
});
// Route for single file upload (e.g. avatar, cover photo)
// verifyToken is used to ensure only authenticated users can upload files
router.post('/single', authMiddleware_1.verifyToken, uploadMiddleware_1.upload.single('file'), uploadController_1.UploadController.uploadFile);
// Route for multiple file uploads (e.g. gallery images, attachments)
router.post('/multiple', authMiddleware_1.verifyToken, uploadMiddleware_1.upload.array('files', 10), uploadController_1.UploadController.uploadMultipleFiles);
exports.default = router;
