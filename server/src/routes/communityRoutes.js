import { Router } from 'express';
import {
  getCommunities,
  getCommunityByName,
  createCommunity,
  joinCommunity,
  leaveCommunity,
} from '../controllers/communityController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, getCommunities);
router.post('/', requireAuth, createCommunity);
router.get('/:communityName', optionalAuth, getCommunityByName);
router.post('/:communityId/join', requireAuth, joinCommunity);
router.delete('/:communityId/join', requireAuth, leaveCommunity);

export default router;
