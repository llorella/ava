import express from 'express';
import * as scanController from '../controllers/scan';
import auth from '../middleware/auth';

const router = express.Router();

/**
 * @route   POST /api/scan/label
 * @desc    Scan a product label
 * @access  Private
 */
router.post('/label', auth, scanController.scanLabel);

/**
 * @route   POST /api/scan/analyze
 * @desc    Analyze ingredients from text
 * @access  Private
 */
router.post('/analyze', auth, scanController.analyzeIngredients);

export default router;
