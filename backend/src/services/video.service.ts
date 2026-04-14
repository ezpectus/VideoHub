import { videoRepository } from "../repositories/video.repository";

export const videoService = {
  uploadVideo: async (
    title: string,
    filePath: string,
    userId: number
  ) => {
    if (!title || !filePath) {
      throw new Error("Missing video data");
    }

    return videoRepository.createVideo({
      title,
      url: filePath,
      userId,
    });
  },

  getVideos: async () => {
    return videoRepository.getAllVideos();
  },

  getVideoById: async (id: number) => {
    const video = await videoRepository.getVideoById(id);

    if (!video) {
      throw new Error("Video not found");
    }

    return video;
  },
};