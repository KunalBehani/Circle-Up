import { Router } from 'express';
import { getUserProfile } from '../controllers/userController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:username', optionalAuth, getUserProfile);

export default router;
