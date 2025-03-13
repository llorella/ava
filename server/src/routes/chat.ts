import express from 'express';
import * as chatController from '../controllers/chat';
import auth from '../middleware/auth';

const router = express.Router();

/**
 * @route   POST /api/chat
 * @desc    Chat with the AI assistant
 * @access  Private
 */
router.post('/', auth, chatController.chat);

export default router;
