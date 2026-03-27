// Author: Denys(Ezpectus)
// Files: prisma.ts, env.ts, auth.middleware.ts, auth.controller.ts, video.controller.ts, comment.controller.ts
import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import {ENV } from '../config/env'

interface AuthRequest extends Request{
    userId?: string
}

//authMiddleware
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
const token = req.headers.authorization?.split(' ')[1]

if(!token) {return res.status(401).json({error: 'No token' }) }

try{
    const decoded = jwt.verify(token,ENV.JWT_SECRET) as {userId: string}
    req.userId = decoded.userId
  next()
} catch{
    return res.status(401).json({ error: 'Invalid token' })
     }
}