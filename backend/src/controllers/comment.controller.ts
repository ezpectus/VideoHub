// Author: Denys(Ezpectus)
// Files: prisma.ts, env.ts, auth.middleware.ts, auth.controller.ts, video.controller.ts, comment.controller.ts

import { Request, Response } from 'express'
import { commentService } from '../services/comment.service'

interface AuthRequest extends Request {
    userId?: string
  }


export const commentController = {
    async create(req: AuthRequest, res: Response) { 
          try {
            const videoId = req.params.id;
            const text = req.body.text;
            const userId = req.userId;
            const result = await commentService.create(videoId, text, userId)

            return res.status(201).json(result)

        } catch(error) {
          return res.status(500).json({ message: "Server error" });
        }
     },
    async getAll(req: Request, res: Response) { 
        try {
          const videoId = req.params.id;
          const result= await commentService.getAll(videoId)
          return res.status(200).json(result)
          
        } catch(error) {
          return res.status(500).json({ message: "Server error" });
        }
     },
  }





