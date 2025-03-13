import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import chatService from '../services/chat';
import userService from '../services/user';

// Validation schema
const chatSchema = z.object({
  message: z.string(),
  productId: z.string().optional()
});

/**
 * Chat with the AI assistant
 */
export const chat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Validate request body
    const validation = chatSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: validation.error.errors 
      });
    }
    
    // Get user preferences
    const userPreferences = await userService.getUserPreferences(req.user.userId);
    
    // Generate response
    const response = await chatService.generateResponse(
      validation.data.message,
      validation.data.productId,
      userPreferences
    );
    
    return res.status(200).json({ message: response });
  } catch (error) {
    console.error('Error in chat controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
