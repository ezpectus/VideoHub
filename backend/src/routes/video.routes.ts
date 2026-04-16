//Author Jutsu78 (Oleksii)
import { Router } from 'express';
import multer from 'multer';
import { videoController } from '../controllers/video.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
