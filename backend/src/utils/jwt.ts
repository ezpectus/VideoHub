import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export const generateToken = (payload: { userId: string }) => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });
};