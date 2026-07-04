import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { upload } from '../middlewares/uploadMiddleware';
import { verifyToken } from '../middlewares/authMiddleware';
import path from 'path';
import fs from 'fs';

const router = Router();

// Route for serving files
router.get('/file/:filename', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Route for single file upload (e.g. avatar, cover photo)
// verifyToken is used to ensure only authenticated users can upload files
router.post('/single', verifyToken, upload.single('file'), UploadController.uploadFile);

// Route for multiple file uploads (e.g. gallery images, attachments)
router.post('/multiple', verifyToken, upload.array('files', 10), UploadController.uploadMultipleFiles);

export default router;
