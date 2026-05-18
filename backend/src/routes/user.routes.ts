// Author: Denys(Ezpectus) + Oleksandr-C-S
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { optionalAuthMiddleware, authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/me', authMiddleware, userController.getMe);

// Getting the user's public profile by ID (with optional auth for isSubscribed)
router.get('/:id', optionalAuthMiddleware, userController.getProfile);

export default router;