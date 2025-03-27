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

/**
 * @route   POST /api/chat/conversations
 * @desc    Create a new conversation
 * @access  Private
 */
router.post('/conversations', auth, chatController.createConversation);

/**
 * @route   GET /api/chat/conversations
 * @desc    Get all conversations for the current user
 * @access  Private
 */
router.get('/conversations', auth, chatController.getUserConversations);

/**
 * @route   GET /api/chat/conversations/:id
 * @desc    Get a conversation by ID
 * @access  Private
 */
router.get('/conversations/:id', auth, chatController.getConversation);

export default router;
