// Author: Denys(Ezpectus)
// Files: prisma.ts, env.ts, auth.middleware.ts, auth.controller.ts, video.controller.ts, comment.controller.ts

import { Request, Response } from 'express';
import { videoService } from '../services/video.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const videoController = {
  async upload(req: AuthRequest, res: Response) { 
    try {
      const file = req.file;
      const userId = req.userId;
      if (!file) return res.status(400).json({ message: 'No file' });
      
      const result = await videoService.uploadVideo(
        file.originalname,
        file.path,
        userId!
      );
      return res.status(201).json(result);
    } catch(error) {
      return res.status(500).json({ message: "Server error" });
    }
  },

  async getAll(req: AuthRequest, res: Response) { 
    try {
      const authorId = req.query.userId as string | undefined;
      const currentUserId = req.userId; //Take from the token (if authorized)
      
      const result = await videoService.getVideos(authorId, currentUserId);
      return res.json(result);
    } catch(error) {
      return res.status(500).json({ message: "Server error" });
    }
  },

  async getOne(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const currentUserId = req.userId;
      
      const result = await videoService.getVideoById(id, currentUserId);
      return res.json(result);
    } catch (error: any) {
      if (error.message === 'Video not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  },

  //Toggle Like
  async toggleLike(req: AuthRequest, res: Response) {
    try {
      const videoId = req.params.id as string;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await videoService.toggleLike(videoId, userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
};