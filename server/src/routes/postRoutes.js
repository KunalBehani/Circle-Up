import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  votePost,
  getPostVote,
} from '../controllers/postController.js';
import {
  getCommentsByPost,
  createComment,
} from '../controllers/commentController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, getPosts);
router.post('/', requireAuth, createPost);
router.get('/:postId', optionalAuth, getPostById);
router.patch('/:postId', requireAuth, updatePost);
router.delete('/:postId', requireAuth, deletePost);

// Voting
router.post('/:postId/vote', requireAuth, votePost);
router.get('/:postId/vote', requireAuth, getPostVote);

// Nested Comments for convenience
router.get('/:postId/comments', getCommentsByPost);
router.post('/:postId/comments', requireAuth, createComment);

export default router;
