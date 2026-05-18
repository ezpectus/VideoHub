// Author: Denys(ezpectus)
// Rate limiting middleware to prevent abuse and DDoS attacks

import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env';

// General rate limiter for all API endpoints
export const generalRateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS, // 15 minutes by default
  max: ENV.RATE_LIMIT_MAX_REQUESTS, // 100 requests per window by default
  message: {
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    message: 'Too many authentication attempts, please try again later.',
  },
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for video uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    message: 'Upload limit reached, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for comments
export const commentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 comments per minute
  message: {
    message: 'You are commenting too fast, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
