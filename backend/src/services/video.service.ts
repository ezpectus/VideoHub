import { videoRepository } from "../repositories/video.repository";

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

  getVideos: async () => {
    return videoRepository.getAllVideos();
  },

  getVideoById: async (id: string) => {

    const video =
      await videoRepository.getVideoById(id);

    if (!video) {
      throw new Error("Video not found");
    }

    return video;

  },

};