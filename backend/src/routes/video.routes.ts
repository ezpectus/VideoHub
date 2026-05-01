// Author: Jutsu78 (Oleksii) + Denys(Ezpectus)
import { Router } from 'express';
import multer from 'multer';
import { videoController } from '../controllers/video.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
// Configuration of multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.get('/', videoController.getAll);
router.get('/my', authMiddleware, videoController.getMyVideos); //Dashboard
router.get('/:id', videoController.getOne);
router.post('/upload', authMiddleware, upload.single('file'), videoController.upload);
router.post('/upload-by-url', authMiddleware, videoController.uploadByUrl);
router.post('/:id/like', authMiddleware, videoController.toggleLike);

//Dashboard - editing and deletion
router.patch('/:id', authMiddleware, videoController.update);
router.delete('/:id', authMiddleware, videoController.delete);

export default router;