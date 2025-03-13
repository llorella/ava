import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import scanService from '../services/scan';
import userService from '../services/user';

// Validation schemas
const scanLabelSchema = z.object({
  image: z.string(), // base64 encoded image
  productName: z.string().optional(),
  productCategory: z.string().optional(),
  barcode: z.string().optional()
});

const analyzeIngredientsSchema = z.object({
  text: z.string()
});

/**
 * Scan a product label
 */
export const scanLabel = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Validate request body
    const validation = scanLabelSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: validation.error.errors 
      });
    }
    
    // Get user preferences
    const userPreferences = await userService.getUserPreferences(req.user.userId);
    
    // Process image
    const analyzedIngredients = await scanService.processImage(
      validation.data.image,
      userPreferences
    );
    
    // Save product if name and category are provided
    let product = null;
    if (validation.data.productName && validation.data.productCategory) {
      product = await scanService.saveProduct(
        validation.data.productName,
        validation.data.productCategory,
        validation.data.barcode,
        analyzedIngredients
      );
    }
    
    return res.status(200).json({
      ingredients: analyzedIngredients,
      product
    });
  } catch (error) {
    console.error('Error in scanLabel controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Analyze ingredients from text
 */
export const analyzeIngredients = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Validate request body
    const validation = analyzeIngredientsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: validation.error.errors 
      });
    }
    
    // Get user preferences
    const userPreferences = await userService.getUserPreferences(req.user.userId);
    
    // Parse and analyze ingredients
    const ingredients = await scanService.processImage(
      validation.data.text,
      userPreferences
    );
    
    return res.status(200).json({ ingredients });
  } catch (error) {
    console.error('Error in analyzeIngredients controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
