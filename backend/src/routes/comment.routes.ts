//Author Justsu78 (Oleksii)

import { Router} from 'express';
import { commentController } from '../controllers/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
// getting comments for video (for all users)
router.get('/videos/:id/comments', commentController.getAll);

// creating comment (only for authorized users)
router.post('/videos/:id/comments', authMiddleware, commentController.create);

export default router;