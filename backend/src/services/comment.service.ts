import { commentRepository } from "../repositories/comment.repository";

export const commentService = {
  addComment: async (
    content: string,
    userId: number,
    videoId: number
  ) => {
    if (!content) {
      throw new Error("Comment cannot be empty");
    }

    return commentRepository.createComment({
      content,
      userId,
      videoId,
    });
  },

  getCommentsByVideo: async (videoId: number) => {
    return commentRepository.getCommentsByVideoId(videoId);
  },
};