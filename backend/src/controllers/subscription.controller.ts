// Author Jutsu78 (Oleksii)

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/prisma';

class SubscribeController {
  async toggleSubscription(req: AuthRequest, res: Response) {
    try {
      const { channelId } = req.params;
      const subscriberId = req.userId;

      
      if (!subscriberId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (subscriberId === channelId) {
        return res.status(400).json({ message: "You cannot subscribe to yourself." });
      }

      const existingSubscription = await prisma.subscription.findUnique({
        where: {
          subscriberId_channelId: {
            subscriberId,
            channelId,
          },
        },
      });

      if (existingSubscription) {
        await prisma.subscription.delete({
          where: { id: existingSubscription.id },
        });
        return res.status(200).json({ message: "Unsubscribed successfully." });
      } else {
        await prisma.subscription.create({
          data: { subscriberId, channelId },
        });
        return res.status(200).json({ message: "Subscribed successfully." });
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export const subscribeController = new SubscribeController();