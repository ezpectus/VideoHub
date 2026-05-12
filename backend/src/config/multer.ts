// Author: Denys(Ezpectus)
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'avatar') {
      cb(null, 'uploads/avatars');
    } else if (file.fieldname === 'thumbnail') {
      cb(null, 'uploads/thumbnails');
    } else if (file.fieldname === 'video' || file.fieldname === 'file') {
      cb(null, 'uploads/videos');
    } else {
      cb(new Error('Unexpected upload field'), '');
    }
  },
  filename: (req, file, cb) => {
    // Generating unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// file filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Avatars
  if (file.fieldname === 'avatar' || file.fieldname === 'thumbnail') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'));
    }
  }
  // Video
  else if (file.fieldname === 'video' || file.fieldname === 'file') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only videos are allowed!'));
    }
  } else {
    cb(new Error('Unexpected upload field'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB Max
  },
});