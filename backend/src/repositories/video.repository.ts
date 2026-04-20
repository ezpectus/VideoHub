import { prisma } from "../config/prisma";

export const videoRepository = {

  createVideo: async (data: {
    title: string;
    url: string;
    authorId: string;
  }) => {
    return prisma.video.create({
      data: {
        title: data.title,
        url: data.url,
        author: {
          connect: {
            id: data.authorId,
          },
        },
      },
    });
  },

  getAllVideos: async () => {
    return prisma.video.findMany({
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getVideoById: async (id: string) => {
    return prisma.video.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });
  },
};