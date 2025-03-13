import express from 'express';
import * as userController from '../controllers/user';
import auth from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', auth, userController.getUserProfile);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth, userController.updateUserProfile);

export default router;
