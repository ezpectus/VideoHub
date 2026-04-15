// script for auth via Email and password
// Author Jutsu78 (Oleksii) 

import { Router} from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);