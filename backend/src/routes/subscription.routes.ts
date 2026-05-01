// Author Jutsu78 (Oleksii)

import { Router } from 'express';
import { subscribeController } from '../controllers/subscription.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/subscriptions/:channelId/toggle
router.post('/:channelId/toggle', authMiddleware, subscribeController.toggleSubscription);

export default router;