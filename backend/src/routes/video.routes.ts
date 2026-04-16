//Author Jutsu78 (Oleksii)
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
router.get('/:id', videoController.getById);

router.post('/upload', authMiddleware, upload.single('file'), videoController.upload);

export default router;
