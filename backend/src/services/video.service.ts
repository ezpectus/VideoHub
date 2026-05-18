// Author: Denys(Ezpectus) + Oleksandr-C-S(Oleksandr Chakun) 
import { Prisma } from "@prisma/client";
import { videoRepository } from "../repositories/video.repository";
import { prisma } from "../config/prisma";
import path from "path";

// MVP-grade in-memory view counter buffering
const viewBuffer = new Map<string, number>();
let bufferFlushInterval: NodeJS.Timeout | null = null;

// Increment view count in memory buffer
const incrementViewCount = (videoId: string): number => {
  const currentCount = viewBuffer.get(videoId) || 0;
  const newCount = currentCount + 1;
  viewBuffer.set(videoId, newCount);
  return newCount;
};

// Get buffered view count for a video
const getBufferedViewCount = (videoId: string): number => {
  return viewBuffer.get(videoId) || 0;
};

// Batch flush buffered view counts to database
const flushViewBuffer = async (): Promise<void> => {
  if (viewBuffer.size === 0) return;

  const entries = Array.from(viewBuffer.entries());
  viewBuffer.clear();

  for (const [videoId, count] of entries) {
    try {
      await prisma.video.update({
        where: { id: videoId },
        data: { views: { increment: count } },
      });
    } catch (error) {
      console.error(`Failed to flush view count for video ${videoId}:`, error);
    }
  }
};

// Start buffer flush scheduler (every 60 seconds)
const startBufferFlushScheduler = (): void => {
  if (bufferFlushInterval) return;
  bufferFlushInterval = setInterval(flushViewBuffer, 60000);
};

// Start the scheduler on module load
startBufferFlushScheduler();

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
    const publicUrl = `/stream/videos/${fileName}`;

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

  /**
   * Get a list of videos, optionally filtered by author or search query
   */
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

  /**
   * Get a video by ID, including author and view count
   */
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

    // Increment view count in memory buffer
    incrementViewCount(id);

    // Get total views (DB + buffer)
    const bufferedViews = getBufferedViewCount(id);
    const totalViews = video.views + bufferedViews;

    return {
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnailUrl: video.thumbnail,
      views: totalViews,
  
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
    // Use atomic transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Check if like exists
      const existingLike = await tx.like.findUnique({
        where: {
          userId_videoId: { userId, videoId },
        },
      });

      if (existingLike) {
        // Remove like
        await tx.like.delete({
          where: { id: existingLike.id },
        });
      } else {
        // Add like
        await tx.like.create({
          data: { userId, videoId },
        });
      }

      // Get updated count atomically
      const likesCount = await tx.like.count({ where: { videoId } });

      return {
        isLiked: !existingLike,
        likesCount,
      };
    });

    return result;
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