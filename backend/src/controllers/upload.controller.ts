// Author: Denys(Ezpectus)
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/prisma';

export const uploadController = {
  uploadAvatar: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      await prisma.user.update({
        where: { id: req.userId },
        data: { avatar: avatarUrl },
      });

      return res.json({ url: avatarUrl });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Upload failed' });
    }
  },

  uploadThumbnail: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;
      return res.json({ url: thumbnailUrl });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Upload failed' });
    }
  },

  uploadVideo: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const videoUrl = `/uploads/videos/${req.file.filename}`;
      return res.json({ url: videoUrl, filename: req.file.filename });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Upload failed' });
    }
  },
};