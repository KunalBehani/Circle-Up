import { Router } from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, globalSearch);

export default router;
