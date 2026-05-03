// Author: Denys(Ezpectus) + Oleksandr-C-S
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { optionalAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Getting the user's public profile by ID (with optional auth for isSubscribed)
router.get('/:id', optionalAuthMiddleware, userController.getProfile);

export default router;