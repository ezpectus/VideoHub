// script for auth via Email and password
// Author Jutsu78 (Oleksii) 

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import passport from '../config/passport';
import { ENV } from '../config/env';

const router = Router();
router.post('/register', authController.register);
router.post('/login', authController.login);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${ENV.FRONTEND_URL}/login` }),
  (req: any, res) => {
    const { token } = req.user;
    res.redirect(`${ENV.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

export default router;
