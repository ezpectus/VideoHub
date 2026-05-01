// Author Jutsu78 (Oleksii)

import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

class SubscribeController {
    async toggleSubscription(req: any, res: Response) {
try {
    const { channelId } = req.params;
    const subscriberId = req.user.id;

     if (subscriberId === channelId) {
        return res.status(400).json({ message: "You cannot subscribe to yourself." });
    }

    const existingSubscription = await prisma.subscription.findUnique({
        where: {
            subscriberId_channelId: {
                subscriberId: subscriberId,
                channelId: channelId,
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
            data: {
               subscriberId: subscriberId, 
                channelId: channelId,
            },
        });

        return res.status(200).json({ message: "Subscribed successfully." });
    }
} catch (error) {
    console.error("Error toggling subscription:", error);
    return res.status(500).json({ message: "internal server error" });
}
    }
}

export const subscribeController = new SubscribeController();