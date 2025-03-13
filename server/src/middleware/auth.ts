import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload } from '../types';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    
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

// Use mock authentication for development, real authentication for production
export default process.env.NODE_ENV === 'production' ? authenticate : mockAuthenticate;
