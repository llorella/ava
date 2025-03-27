import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import chatService from '../services/chat';
import userService from '../services/user';

// Validation schemas
const chatSchema = z.object({
  message: z.string(),
  productId: z.string().optional(),
  conversationId: z.string().optional(),
});

const createConversationSchema = z.object({
  initialMessage: z.string().optional(),
  productId: z.string().optional(),
  title: z.string().optional(),
});

const getMessagesSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
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
    
    // If conversationId is provided, add the message to that conversation
    if (validation.data.conversationId) {
      const message = await chatService.generateAndSaveResponse(
        validation.data.message,
        validation.data.conversationId,
        req.user.userId,
        validation.data.productId
      );
      
      return res.status(200).json({ message: message.content });
    }
    
    // Otherwise, create a new conversation with this message
    const conversation = await chatService.createConversation(
      req.user.userId,
      validation.data.message, 
      validation.data.productId
    );
    
    // Generate and save AI response
    const responseMessage = await chatService.generateAndSaveResponse(
      validation.data.message,
      conversation.id,
      req.user.userId,
      validation.data.productId
    );
    
    return res.status(200).json({ 
      conversationId: conversation.id,
      message: responseMessage.content 
    });
  } catch (error) {
    console.error('Error in chat controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new conversation
 */
export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Validate request body
    const validation = createConversationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: validation.error.errors 
      });
    }
    
    const conversation = await chatService.createConversation(
      req.user.userId,
      validation.data.initialMessage,
      validation.data.productId,
      validation.data.title
    );
    
    // If there was an initial message, generate and save a response
    if (validation.data.initialMessage) {
      await chatService.generateAndSaveResponse(
        validation.data.initialMessage,
        conversation.id,
        req.user.userId,
        validation.data.productId
      );
    }
    
    // Get updated conversation with messages
    const updatedConversation = await chatService.getConversation(conversation.id);
    
    return res.status(201).json({ conversation: updatedConversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a conversation by ID
 */
export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const conversationId = req.params.id;
    if (!conversationId) {
      return res.status(400).json({ message: 'Conversation ID is required' });
    }
    
    const conversation = await chatService.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Ensure user owns this conversation
    if (conversation.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    return res.status(200).json({ conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all conversations for the current user
 */
export const getUserConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Parse pagination parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    
    const conversations = await chatService.getUserConversations(
      req.user.userId,
      limit,
      offset
    );
    
    return res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
