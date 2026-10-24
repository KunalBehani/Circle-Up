import { Router } from 'express';
import { updateComment, deleteComment } from '../controllers/commentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.patch('/:commentId', requireAuth, updateComment);
router.delete('/:commentId', requireAuth, deleteComment);

export default router;
