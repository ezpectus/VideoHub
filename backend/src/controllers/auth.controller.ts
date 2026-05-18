// Author: Denys(Ezpectus)
// Files: prisma.ts, env.ts, auth.middleware.ts, auth.controller.ts, video.controller.ts, comment.controller.ts
import { Request, Response } from "express";
import { authService } from "../services/auth.service";

const isValid = (v?: string) =>
  typeof v === "string" && v.trim().length > 0;

// Native email validation using regex
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Native password strength validation
const validatePasswordStrength = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character" };
  }
  
  return { valid: true };
};

// Native username validation
const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9]{3,30}$/;
  return usernameRegex.test(username);
};

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, username } = req.body;

      if (!isValid(email) || !isValid(password) || !isValid(username)) {
        return res.status(400).json({ message: "Missing fields" });
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validate username format
      if (!isValidUsername(username)) {
        return res.status(400).json({ message: "Username must be 3-30 alphanumeric characters" });
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
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

      // Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
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