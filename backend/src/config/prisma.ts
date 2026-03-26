// Author: Denys(Ezpectus)
// Files: prisma.ts, env.ts, auth.middleware.ts, auth.controller.ts, video.controller.ts, comment.controller.ts


const { PrismaClient } = require("@prisma/client")

declare global {
    var prisma: InstanceType<typeof PrismaClient> | undefined
}

export const prisma = global.prisma  || new PrismaClient()
if(process.env.ENV !== 'production') global.prisma = prisma

