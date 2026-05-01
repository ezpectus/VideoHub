// Author Jutsu78 (Oleksii)

import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

class SubscribeController {
    async toggleSubscription(req: any, res: Response) {
try {
    const { channelId } = req.params;
    const subid = req.user.id;

    if (subid === channelId) {
        return res.status(400).json({ message: "You cannot subscribe to yourself." });
    }
}
    }
}