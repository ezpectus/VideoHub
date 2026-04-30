// Author: Denys(Ezpectus) + Oleksandr-C-S
import { videoRepository } from "../repositories/video.repository";
import { prisma } from "../config/prisma";

export const videoService = {
  uploadVideo: async (
    title: string,
    filePath: string,
    userId: string
  ) => {
    if (!title || !filePath) {
      throw new Error("Missing video data");
    }

    return videoRepository.createVideo({
      title,
      url: filePath,
      authorId: userId,
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
      thumbnail: video.thumbnail,
      views: video.views,
      createdAt: video.createdAt,
      authorId: video.authorId,
      author: video.author,
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
      thumbnail: video.thumbnail,
      views: video.views,
      createdAt: video.createdAt,
      authorId: video.authorId,
      author: video.author,
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
      return { message: "Like removed", isLiked: false };
    } else {
      //If there is no like -> create one
      await prisma.like.create({
        data: { userId, videoId }
      });
      return { message: "Like added", isLiked: true };
    }
  },
};