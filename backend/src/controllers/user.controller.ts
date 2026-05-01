// Author: Denys(Ezpectus)
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const userController = {
  async getProfile(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          avatar: true,
          createdAt: true,
        }
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
};