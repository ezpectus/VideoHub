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
      const userId = req.userId as string;

      const result =
        await commentService.addComment(
          text,
          userId,
          videoId
        );

      return res.status(201).json(result);

    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  },

  async getAll(req: Request, res: Response) {
    try {

      const videoId = req.params.id as string;

      const result =
        await commentService.getCommentsByVideo(videoId);

      return res.status(200).json(result);

    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  },

};


