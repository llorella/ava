import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import userService from '../services/user';

// Validation schema
const updatePreferencesSchema = z.object({
  allergies: z.array(z.string()).optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  skinConditions: z.array(z.string()).optional()
});

/**
 * Get user profile
 */
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userPreferences = await userService.getUserPreferences(req.user.userId);
    
    return res.status(200).json(userPreferences);
  } catch (error) {
    console.error('Error in getUserProfile controller:', error);
    
    if (error instanceof Error && error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Validate request body
    const validation = updatePreferencesSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: validation.error.errors 
      });
    }
    
    const updatedPreferences = await userService.updateUserPreferences(
      req.user.userId,
      validation.data
    );
    
    return res.status(200).json(updatedPreferences);
  } catch (error) {
    console.error('Error in updateUserProfile controller:', error);
    
    if (error instanceof Error && error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  }
};
