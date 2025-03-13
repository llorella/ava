import { Request, Response } from 'express';
import { z } from 'zod';
import userService from '../services/user';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: validation.error.errors 
      });
    }
    
    const { email, password } = validation.data;
    
    // Register user
    const result = await userService.register(email, password);
    
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'User already exists') {
      return res.status(409).json({ message: error.message });
    }
    
    console.error('Error in register controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: validation.error.errors 
      });
    }
    
    const { email, password } = validation.data;
    
    // Login user
    const result = await userService.login(email, password);
    
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid credentials') {
      return res.status(401).json({ message: error.message });
    }
    
    console.error('Error in login controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
