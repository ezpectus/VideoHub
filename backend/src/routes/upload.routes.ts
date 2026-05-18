// Author: Denys(Ezpectus)
import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../config/multer';

const router = Router();

//All routes are protected by authorization
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadController.uploadAvatar);
router.post('/thumbnail', authMiddleware, upload.single('thumbnail'), uploadController.uploadThumbnail);
router.post('/video', authMiddleware, upload.single('video'), uploadController.uploadVideo);

export default router;