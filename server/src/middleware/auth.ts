import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    
    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!userExists) {
      return res.status(401).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
    }
    
    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Mock authentication middleware for development
 * This bypasses real authentication and uses a demo user
 */
export const mockAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Attach mock user to request
  req.user = {
    userId: 'mock-user-id',
    email: 'demo@example.com'
  };
  
  next();
};

// Always use real authentication
export default authenticate;
