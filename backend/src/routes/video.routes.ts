// Author: Jutsu78 (Oleksii) + Denys(Ezpectus)
import { Router } from 'express';
import { videoController } from '../controllers/video.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload as uploadMiddleware } from '../config/multer';

const router = Router();

router.get('/', videoController.getAll);
router.get('/my', authMiddleware, videoController.getMyVideos); //Dashboard
router.get('/:id', videoController.getOne);
router.post('/upload', authMiddleware, uploadMiddleware.single('file'), videoController.upload);
router.post('/upload-by-url', authMiddleware, videoController.uploadByUrl);
router.post('/:id/like', authMiddleware, videoController.toggleLike);

//Dashboard - editing and deletion
router.patch('/:id', authMiddleware, videoController.update);
router.delete('/:id', authMiddleware, videoController.delete);

export default router;