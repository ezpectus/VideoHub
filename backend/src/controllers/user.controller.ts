// Author: Denys(Ezpectus)
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const userController = {
  /**
   * GET /api/users/:id — full channel profile
   * Returns user info + subscriber count + video count + isSubscribed (if authenticated)
   */
  async getProfile(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      // Extract current user ID from the extended AuthRequest
      const currentUserId = (req as any).userId as string | undefined;

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
          // Check if the current user is subscribed to this channel
          subscribers: currentUserId
            ? { where: { subscriberId: currentUserId }, select: { id: true } }
            : false,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        id: user.id,
        username: user.username,
        avatarUrl: user.avatar,
        bannerUrl: user.banner,
        description: user.description,
        createdAt: user.createdAt,
        subscriberCount: user._count.subscribers,
        videoCount: user._count.videos,
        isSubscribed: currentUserId ? user.subscribers.length > 0 : false,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },
};