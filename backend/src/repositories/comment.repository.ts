//Author: Oleksandr Chakun
import { prisma } from "../config/prisma";

export const commentRepository = {

  createComment: async (data: {
    content: string;
    userId: string;
    videoId: string;
  }) => {

    return prisma.comment.create({
      data: {

        text: data.content,

        user: {
          connect: {
            id: data.userId
          }
        },

        video: {
          connect: {
            id: data.videoId
          }
        }

      }
    });

  },

  getCommentsByVideoId: async (
    videoId: string
  ) => {

    return prisma.comment.findMany({

      where: {
        videoId
      },

      include: {
        user: true
      },

      orderBy: {
        createdAt: "desc"
      }

    });

  },

};