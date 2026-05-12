// script for auth via Email and Google OAuth
// Author Jutsu78 (Oleksii) 

import { Request, Response, Router } from "express";
import { authController } from "../controllers/auth.controller";
import passport from "../config/passport";
import { ENV } from "../config/env";

const router = Router();

// EMAIL AUTH
router.post("/register", authController.register);
router.post("/login", authController.login);

// GOOGLE OAUTH
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${ENV.FRONTEND_URL}/login`,
  }),
  (req: Request, res: Response) => {
    const pkg = (req as Request & {
      user: {
        token: string;
        user: {
          id: string;
          email: string;
          username: string;
          avatar?: string | null;
        };
      };
    }).user;

    const publicUser = JSON.stringify({
      id: pkg.user.id,
      email: pkg.user.email,
      username: pkg.user.username,
      avatarUrl: pkg.user.avatar ?? undefined,
    });

    const tokenQ = encodeURIComponent(pkg.token);
    const userQ = encodeURIComponent(publicUser);

    res.redirect(
      `${ENV.FRONTEND_URL}/auth/callback?token=${tokenQ}&user=${userQ}`
    );
  }
);

export default router;
