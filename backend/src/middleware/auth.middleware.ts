// Author: Denys(Ezpectus)
// Files: prisma.ts, env.ts, auth.middleware.ts, auth.controller.ts, video.controller.ts, comment.controller.ts


import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import {ENV } from '../config/env'


interface AuthRequest extends Request{
    userId?: string
}

//authMiddleware

