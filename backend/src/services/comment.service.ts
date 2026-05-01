import { commentRepository } from "../repositories/comment.repository";

export const commentService = {

  addComment: async (
    content: string,
    userId: string,
    videoId: string
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

  getCommentsByVideo: async (
    videoId: string
  ) => {

    return commentRepository.getCommentsByVideoId(
      videoId
    );

  },

};