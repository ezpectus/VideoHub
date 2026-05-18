// Author: Denys(Ezpectus)
// Files: prisma.ts, env.ts, auth.middleware.ts, auth.controller.ts, video.controller.ts, comment.controller.ts

import { Request, Response } from 'express'
import { commentService } from '../services/comment.service'
import { AuthRequest } from '../middleware/auth.middleware'

export const commentController = {

  async create(req: AuthRequest, res: Response) {
    try {
      const videoId = req.params.id as string;
      const text = req.body.text;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ message: "Comment text is required" });
      }

      // Validate comment length
      if (text.trim().length > 5000) {
        return res.status(400).json({ message: "Comment text is too long (max 5000 characters)" });
      }

      // Native XSS sanitization - strip HTML tags
      const sanitizedText = text.trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

      // Additional validation
      if (sanitizedText.length < 1 || sanitizedText.length > 5000) {
        return res.status(400).json({ message: "Invalid comment length" });
      }

      const result = await commentService.addComment(sanitizedText, userId, videoId);
      return res.status(201).json(result);

    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const videoId = req.params.id as string;
      const result = await commentService.getCommentsByVideo(videoId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  },

};
