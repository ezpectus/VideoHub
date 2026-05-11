// Author: Denys(Ezpectus) 

import { Request, Response } from "express";
import { videoService } from "../services/video.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { toString } from "../utils/query.utils";

export const videoController = {

  // UPLOAD FILE VIDEO
  async upload(req: AuthRequest, res: Response) {
    try {
      const file = req.file;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!file) {
        return res.status(400).json({ message: "No file" });
      }

      const title = (req.body.title as string) || file.originalname;
      const description = req.body.description as string | undefined;

      const result = await videoService.uploadVideo(
        title,
        file.path,
        userId,
        description
      );

      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  },

  // UPLOAD BY URL
  async uploadByUrl(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { title, url, description } = req.body as {
        title?: string;
        url?: string;
        description?: string;
      };

      if (!title?.trim() || !url?.trim()) {
        return res
          .status(400)
          .json({ message: "Title and URL are required" });
      }

      const result = await videoService.createVideoFromUrl(
        title.trim(),
        url.trim(),
        userId,
        description?.trim() || undefined
      );

      return res.status(201).json(result);
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  },

  // GET ALL VIDEOS
  async getAll(req: AuthRequest, res: Response) {
    try {
      const authorId = toString(req.query.userId);
      const search = toString(req.query.search);
      const currentUserId = req.userId;
  
      const result = await videoService.getVideos(
        authorId,
        currentUserId,
        search
      );
  
      return res.json(result);
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  },

  // GET ONE VIDEO
  async getOne(req: AuthRequest, res: Response) {
    try {
      const id = toString(req.params.id);
  
      if (!id) {
        return res.status(400).json({ message: "Invalid id" });
      }
  
      const currentUserId = req.userId;
  
      const result = await videoService.getVideoById(id, currentUserId);
      return res.json(result);
    } catch (error: any) {
      if (error.message === "Video not found") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Server error" });
    }
  },

  // TOGGLE LIKE
  async toggleLike(req: AuthRequest, res: Response) {
    try {
      const videoId = toString(req.params.id);
      const userId = req.userId;
  
      if (!videoId || !userId) {
        return res.status(400).json({ message: "Bad request" });
      }
  
      const result = await videoService.toggleLike(videoId, userId);
      return res.json(result);
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  },

  // MY VIDEOS
  async getMyVideos(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const videos = await videoService.getMyVideos(userId);
      return res.json(videos);
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  },


  // UPDATE VIDEO
  async update(req: AuthRequest, res: Response) {
    try {
      const videoId = toString(req.params.id);
      const userId = req.userId;

     if (!videoId || !userId) {
         return res.status(400).json({ message: "Bad request" });
         }  

      const { title, description } = req.body;

      const updatedVideo = await videoService.updateVideo(
        videoId,
        userId,
        { title, description }
      );

      return res.json(updatedVideo);
    } catch (error: any) {
      if (error.message === "Forbidden") {
        return res
          .status(403)
          .json({ message: "You don't have permission" });
      }
      return res.status(500).json({ message: "Server error" });
    }
  },


  // DELETE VIDEO
  async delete(req: AuthRequest, res: Response) {
    try {
      const videoId = toString(req.params.id);
      const userId = req.userId;
      
      if (!videoId || !userId) {
        return res.status(400).json({ message: "Bad request" });
      }

      await videoService.deleteVideo(videoId, userId);

      return res.json({ message: "Video deleted successfully" });
    } catch (error: any) {
      if (error.message === "Forbidden") {
        return res
          .status(403)
          .json({ message: "You don't have permission" });
      }
      return res.status(500).json({ message: "Server error" });
    }
  },
};
