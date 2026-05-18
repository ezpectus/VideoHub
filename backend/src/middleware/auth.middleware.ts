// Author: Denys(Ezpectus) (refactored safe version)

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export interface AuthRequest extends Request {
  userId?: string;
}

type JwtPayload = {
  userId: string;
};

// MAIN AUTH MIDDLEWARE
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // strict runtime validation
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("userId" in decoded)
    ) {
      return res.status(401).json({ error: "Invalid token structure" });
    }

    req.userId = (decoded as JwtPayload).userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};


export const optionalAuthMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded
    ) {
      req.userId = (decoded as JwtPayload).userId;
    }
  } catch {
    // ignore invalid token 
  }

  next();
};