// Author: Denys(Ezpectus) + Oleksandr-C-S
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

  
  getVideos: async (authorId?: string, currentUserId?: string) => {
    const whereCondition = authorId ? { authorId } : {};

    const videos = await prisma.video.findMany({
      where: whereCondition,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          }
        },
        _count: {
          select: { likes: true } //count the number of likes
        },
        likes: currentUserId ? {
          where: { userId: currentUserId } //Check if the curr user has liked it
        } : false
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mapping res
    return videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnailUrl: video.thumbnail,
      views: video.views,
      createdAt: video.createdAt,
      authorId: video.authorId,
      user: {
        id: video.author.id,
        username: video.author.username,
        avatarUrl: video.author.avatar,
      },
      likesCount: video._count.likes,
      isLiked: currentUserId ? video.likes.length > 0 : false,
    }));
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
          }
        },
        _count: {
          select: { likes: true }
        },
        likes: currentUserId ? {
          where: { userId: currentUserId }
        } : false
      }
    });

    if (!video) {
      throw new Error('Video not found');
    }

    return {
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnailUrl: video.thumbnail,
      views: video.views,
      createdAt: video.createdAt,
      authorId: video.authorId,
      user: {
        id: video.author.id,
        username: video.author.username,
        avatarUrl: video.author.avatar,
      },
      likesCount: video._count.likes,
      isLiked: currentUserId ? video.likes.length > 0 : false,
    };
  },

  //Toggle Like
  toggleLike: async (videoId: string, userId: string) => {
   //check if curr user has liked this video
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: { userId, videoId }
      }
    });

    if (existingLike) {
      //If there is already a like -> delete it
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      const count = await prisma.like.count({ where: { videoId } });
      return { message: "Like removed", isLiked: false, likesCount: count };
    } else {
      //If there is no like -> create one
      await prisma.like.create({
        data: { userId, videoId }
      });
      const count = await prisma.like.count({ where: { videoId } });
      return { message: "Like added", isLiked: true, likesCount: count };
    }
  },

 // Dashboard — get the video of the current author only
getMyVideos: async (userId: string) => {
  return await prisma.video.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' }
  });
},

// Dashboard — update the video with a permission check
updateVideo: async (videoId: string, userId: string, data: { title?: string, description?: string }) => {
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) throw new Error("Video not found");

  if (video.authorId !== userId) {
    throw new Error("Forbidden");
  }

  return await prisma.video.update({
    where: { id: videoId },
    data: {
      title: data.title !== undefined ? data.title : video.title,
      description: data.description !== undefined ? data.description : video.description
    }
  });
},

// Dashboard — remove video with permission verification
deleteVideo: async (videoId: string, userId: string) => {
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) throw new Error("Video not found");

  if (video.authorId !== userId) {
    throw new Error("Forbidden");
  }

  return await prisma.video.delete({
    where: { id: videoId }
    });
  },
};