// Author: Denys(Ezpectus)
// Files: prisma.ts, env.ts, auth.middleware.ts, auth.controller.ts, video.controller.ts, comment.controller.ts
import { Request, Response } from "express";
import { authService } from "../services/auth.service";

const isValid = (v?: string) =>
  typeof v === "string" && v.trim().length > 0;

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, username } = req.body;

      if (!isValid(email) || !isValid(password) || !isValid(username)) {
        return res.status(400).json({ message: "Missing fields" });
      }

      const result = await authService.register(email, password, username);

      return res.status(201).json(result);
    } catch (error: any) {
      if (error.message === "User already exists") {
        return res.status(409).json({ message: error.message });
      }

      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!isValid(email) || !isValid(password)) {
        return res.status(400).json({ message: "Missing fields" });
      }

      const result = await authService.login(email, password);

      return res.json(result);
    } catch (error: any) {
      if (error.message === "Invalid credentials") {
        return res.status(401).json({ message: error.message });
      }

      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
};