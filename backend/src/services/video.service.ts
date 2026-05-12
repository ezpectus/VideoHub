// Author: Denys(Ezpectus) + Oleksandr-C-S(Oleksandr Chakun)
import { Prisma } from "@prisma/client";
import { videoRepository } from "../repositories/video.repository";
import { prisma } from "../config/prisma";
import path from "path";

export const videoService = {
  /**
   * Extract a YouTube video ID from various URL formats
   */
  extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const re of patterns) {
      const match = url.match(re);
      if (match) return match[1];
    }
    return null;
  },

  /**
   * Build a thumbnail URL — YouTube auto-thumbnail or null for local files
   */
  getThumbnailUrl(videoUrl: string): string | undefined {
    const ytId = videoService.extractYouTubeId(videoUrl);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    return undefined;
  },

  uploadVideo: async (
    title: string,
    filePath: string,
    userId: string,
    description?: string
  ) => {
    if (!title || !filePath) {
      throw new Error("Missing video data");
    }

    const fileName = path.basename(filePath);
    const publicUrl = `/uploads/videos/${fileName}`;

    return videoRepository.createVideo({
      title,
      url: publicUrl,
      description,
      authorId: userId,
    });
  },

  createVideoFromUrl: async (
    title: string,
    url: string,
    userId: string,
    description?: string
  ) => {
    if (!title || !url) {
      throw new Error("Missing video data");
    }

    const thumbnail = videoService.getThumbnailUrl(url);

    return videoRepository.createVideo({
      title,
      url,
      description,
      authorId: userId,
      thumbnail,
    });
  },

  
  getVideos: async (authorId?: string, currentUserId?: string, search?: string) => {
    const videos = await prisma.video.findMany({
      where: {
        ...(authorId ? { authorId } : {}),
        ...(search
          ? { title: { contains: search, mode: "insensitive" } }
          : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: { likes: true },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });
  
    return videos.map((video) => {
      const isLiked =
        currentUserId && Array.isArray(video.likes)
          ? video.likes.length > 0
          : false;
  
      return {
        id: video.id,
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnailUrl: video.thumbnail,
        views: video.views,
        createdAt: video.createdAt,
  
        user: {
          id: video.author.id,
          username: video.author.username,
          avatarUrl: video.author.avatar,
        },
  
        likesCount: video._count.likes,
        isLiked,
      };
    });
  },
  
  getVideoById: async (id: string, currentUserId?: string) => {
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: { likes: true },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });
  
    if (!video) throw new Error("Video not found");
  
    await prisma.video.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  
    return {
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnailUrl: video.thumbnail,
      views: video.views + 1, // фикс: сразу отображаем +1
  
      createdAt: video.createdAt,
  
      user: {
        id: video.author.id,
        username: video.author.username,
        avatarUrl: video.author.avatar,
      },
  
      likesCount: video._count.likes,
      isLiked:
        currentUserId && Array.isArray(video.likes)
          ? video.likes.length > 0
          : false,
    };
  },

  toggleLike: async (videoId: string, userId: string) => {
    try {
      await prisma.like.create({
        data: { userId, videoId },
      });

      const likesCount = await prisma.like.count({ where: { videoId } });

      return {
        isLiked: true,
        likesCount,
      };
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        await prisma.like.delete({
          where: {
            userId_videoId: { userId, videoId },
          },
        });

        const likesCount = await prisma.like.count({ where: { videoId } });

        return {
          isLiked: false,
          likesCount,
        };
      }

      throw e;
    }
  },

  getMyVideos: async (userId: string) => {
    return await prisma.video.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
    });
  },

  updateVideo: async (
    videoId: string,
    userId: string,
    data: { title?: string; description?: string }
  ) => {
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new Error("Video not found");

    if (video.authorId !== userId) {
      throw new Error("Forbidden");
    }

    return await prisma.video.update({
      where: { id: videoId },
      data: {
        title: data.title !== undefined ? data.title : video.title,
        description:
          data.description !== undefined ? data.description : video.description,
      },
    });
  },

  deleteVideo: async (videoId: string, userId: string) => {
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new Error("Video not found");

    if (video.authorId !== userId) {
      throw new Error("Forbidden");
    }

    return await prisma.video.delete({
      where: { id: videoId },
    });
  },
};