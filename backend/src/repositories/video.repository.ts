import { prisma } from "../config/prisma";

export const videoRepository = {
  createVideo: async (data: {
    title: string;
    url: string;
    userId: number;
  }) => {
    return prisma.video.create({
      data,
    });
  },
  getAllVideos: async () => {
    return prisma.video.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
  getVideoById: async (id: number) => {
    return prisma.video.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  },
};