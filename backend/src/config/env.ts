// Author: Denys(Ezpectus)
// Files: prisma.ts, env.ts, auth.middleware.ts, auth.controller.ts, video.controller.ts, comment.controller.ts
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`ENV missing: ${name}`);
  }
  return value;
}

// Generate a strong JWT secret if not provided
function generateJWTSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

export const ENV = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // JWT Secret - use environment variable or generate strong fallback
  JWT_SECRET: process.env.JWT_SECRET || generateJWTSecret(),

  // Database Configuration
  DATABASE_URL: requireEnv("DATABASE_URL"),

  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:5000/api/auth/google/callback",

  // Frontend Configuration - support multiple environments
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000'],
};