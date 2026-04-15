import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import authRoutes from './routes/auth.routes';
import passport from './config/passport';

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
});