// Author: Denys(Ezpectus)
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/prisma';

export const userController = {
  async getMe(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          avatar: true,
          banner: true,
          description: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar ?? undefined,
        bannerUrl: user.banner ?? undefined,
        description: user.description ?? undefined,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // GET USER CHANNEL / PROFILE
  async getProfile(req: AuthRequest, res: Response) {
    try {
      // profile owner id from route params
      const id = req.params.id as string;
      // current authorized user (optional)
      const currentUserId = req.userId;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          avatar: true,
          banner: true,
          description: true,
          createdAt: true,
          _count: {
            select: {
              videos: true,
              subscribers: true,
            },
          },
          subscribers: currentUserId
            ? { where: { subscriberId: currentUserId }, select: { id: true } }
            : false,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // return normalized response
      return res.status(200).json({
        id: user.id,
        username: user.username,
        avatarUrl: user.avatar,
        bannerUrl: user.banner,
        description: user.description,
        createdAt: user.createdAt,
        subscriberCount: user._count.subscribers,
        videoCount: user._count.videos,
        isSubscribed: currentUserId && Array.isArray(user.subscribers)
          ? user.subscribers.length > 0
          : false,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },
};