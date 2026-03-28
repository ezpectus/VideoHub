// Author: Denys(Ezpectus)
// Files: prisma.ts, env.ts, auth.middleware.ts, auth.controller.ts, video.controller.ts, comment.controller.ts

import { Request, Response } from 'express'
import { videoService } from '../services/video.service'

interface AuthRequest extends Request {
  userId?: string
}

export const videoController = {
    async upload(req: AuthRequest, res: Response) { 
        try {
        const file = req.file
        const userId = req.userId
        if (!file) return res.status(400).json({ message: 'No file' })
        const result = await videoService.upload(file, userId)
        return res.status(201).json(result)
       
         } catch(error) {
           return res.status(500).json({ message: "Server error" });
        }
     },
    async getAll(req: Request, res: Response) { 
        try {
            const result = await videoService.getAll()
            return res.json(result)
       
        } catch(error) {
          return res.status(500).json({ message: "Server error" });
       }
     },
    async getOne(req: Request, res: Response) { 
        try {
            const id = req.params.id
            const result = await videoService.getOne(id)
            return res.json(result)

        } catch(error) {
          return res.status(500).json({ message: "Server error" });
       }
     },
  }