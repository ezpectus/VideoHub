import express from 'express';
import cors from 'cors';
import path from 'path';
import { ENV } from './config/env';
import authRoutes from './routes/auth.routes';
import videoRoutes from './routes/video.routes';
import commentRoutes from './routes/comment.routes';
import uploadRoutes from './routes/upload.routes';
import passport from './config/passport';
import userRoutes from './routes/user.routes';
import subscriptionRoutes from './routes/subscription.routes';
import fs from 'fs';

const app = express();

// CORS configuration for multi-environment support
app.use(
  cors({
    origin: ENV.ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// MVP-grade HTTP 206 Range Request streaming for videos
app.get('/stream/videos/:filename', (req, res) => {
  const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  const filePath = path.join(__dirname, '../uploads/videos', filename);

  // Security: Validate filename to prevent path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ message: 'Invalid filename' });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Video not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Parse Range header (e.g., "bytes=0-1023")
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Validate range
    if (start >= fileSize || end >= fileSize || start > end) {
      return res.status(416).json({
        message: 'Requested range not satisfiable',
        range: `bytes */${fileSize}`,
      });
    }

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
      'Cache-Control': 'public, max-age=31536000',
    };

    res.writeHead(206, head);
    file.pipe(res);

    file.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Stream error' });
      }
    });
  } else {
    // No Range header, send entire file
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000',
    };

    res.writeHead(200, head);
    const file = fs.createReadStream(filePath);
    file.pipe(res);

    file.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Stream error' });
      }
    });
  }
});

// Stream for thumbnails and avatars (static files with caching)
app.get('/stream/thumbnails/:filename', (req, res) => {
  const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  const filePath = path.join(__dirname, '../uploads/thumbnails', filename);

  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ message: 'Invalid filename' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;

  const head = {
    'Content-Length': fileSize,
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'public, max-age=31536000',
  };

  res.writeHead(200, head);
  const file = fs.createReadStream(filePath);
  file.pipe(res);
});

app.get('/stream/avatars/:filename', (req, res) => {
  const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  const filePath = path.join(__dirname, '../uploads/avatars', filename);

  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ message: 'Invalid filename' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;

  const head = {
    'Content-Length': fileSize,
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'public, max-age=31536000',
  };

  res.writeHead(200, head);
  const file = fs.createReadStream(filePath);
  file.pipe(res);
});

// Keep static serving for uploads directory as fallback
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api', commentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

export default app;