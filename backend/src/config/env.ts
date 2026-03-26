// Author: Denys(Ezpectus)
// Files: prisma.ts, env.ts, auth.middleware.ts, auth.controller.ts, video.controller.ts, comment.controller.ts


import dotenv from 'dotenv'
dotenv.config()

export const ENV = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  DATABASE_URL: process.env.DATABASE_URL || ''
}