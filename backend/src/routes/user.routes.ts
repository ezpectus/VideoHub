// Author: Denys(Ezpectus) + Oleksandr-C-S
import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const router = Router();

// Getting the user's public profile by ID
router.get('/:id', userController.getProfile);

export default router;