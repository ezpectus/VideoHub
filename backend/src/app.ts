import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import commentRoutes from './routes/comment.routes';
import videoRoutes from './routes/video.routes';
import passport from './config/passport';

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api', commentRoutes);

export default app;