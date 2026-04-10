import { prisma } from "../config/prisma";
export const commentRepository = {
  createComment: async (data: {
    content: string;
    userId: number;
    videoId: number;
  }) => {
    return prisma.comment.create({
      data,
    });
  },
  getCommentsByVideoId: async (videoId: number) => {
    return prisma.comment.findMany({
      where: { videoId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};