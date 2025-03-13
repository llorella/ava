import express from 'express';
import { authenticatedRequest, getMockPrisma, testUser } from './utils/testUtils';
import userRoutes from '../routes/user';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

// Mock the auth middleware
jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn((req: AuthRequest, res, next) => {
    req.user = { userId: 'test-user-id', email: 'test@example.com' };
    next();
  }),
}));

// Mock the user service
jest.mock('../services/user', () => {
  return {
    default: {
      getUserPreferences: jest.fn().mockImplementation((userId) => {
        if (userId === 'unknown-user-id') {
          throw new Error('User not found');
        }
        
        return Promise.resolve({
          allergies: ['peanuts', 'dairy'],
          dietaryPreferences: ['vegan'],
          skinConditions: ['eczema'],
        });
      }),
      
      updateUserPreferences: jest.fn().mockImplementation((userId, preferences) => {
        if (userId === 'unknown-user-id') {
          throw new Error('User not found');
        }
        
        return Promise.resolve({
          allergies: preferences.allergies || ['peanuts', 'dairy'],
          dietaryPreferences: preferences.dietaryPreferences || ['vegan'],
          skinConditions: preferences.skinConditions || ['eczema'],
        });
      })
    }
  };
});

// Set up express app for testing
const app = express();
app.use(express.json());
app.use('/api/user', authenticate, userRoutes);

describe('User Controller', () => {
  let prisma: jest.Mocked<PrismaClient>;
  
  beforeEach(() => {
    prisma = getMockPrisma();
    jest.clearAllMocks();
  });
  
  describe('GET /api/user/profile', () => {
    it('should get user preferences successfully', async () => {
      const res = await authenticatedRequest(app).get('/api/user/profile');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('allergies');
      expect(res.body).toHaveProperty('dietaryPreferences');
      expect(res.body).toHaveProperty('skinConditions');
      expect(res.body.allergies).toEqual(['peanuts', 'dairy']);
      expect(res.body.dietaryPreferences).toEqual(['vegan']);
      expect(res.body.skinConditions).toEqual(['eczema']);
    });
    
    it('should return 401 if not authenticated', async () => {
      // Override the mock once for this test
      (authenticate as jest.Mock).mockImplementationOnce((req, res, next) => {
        return res.status(401).json({ message: 'Authentication required' });
      });
      
      const res = await authenticatedRequest(app, 'invalid-token').get('/api/user/profile');
      
      expect(res.status).toBe(401);
    });
    
    it('should return 404 if user not found', async () => {
      // Override the auth middleware mock once to use unknown user ID
      (authenticate as jest.Mock).mockImplementationOnce((req: AuthRequest, res, next) => {
        req.user = { userId: 'unknown-user-id', email: 'unknown@example.com' };
        next();
      });
      
      const res = await authenticatedRequest(app).get('/api/user/profile');
      
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });
  });
  
  describe('PUT /api/user/profile', () => {
    it('should update user preferences successfully', async () => {
      const res = await authenticatedRequest(app)
        .put('/api/user/profile')
        .send({
          allergies: ['gluten', 'soy'],
          dietaryPreferences: ['vegetarian'],
          skinConditions: ['psoriasis'],
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('allergies');
      expect(res.body).toHaveProperty('dietaryPreferences');
      expect(res.body).toHaveProperty('skinConditions');
      expect(res.body.allergies).toEqual(['gluten', 'soy']);
      expect(res.body.dietaryPreferences).toEqual(['vegetarian']);
      expect(res.body.skinConditions).toEqual(['psoriasis']);
    });
    
    it('should update partial preferences successfully', async () => {
      const res = await authenticatedRequest(app)
        .put('/api/user/profile')
        .send({
          allergies: ['shellfish'],
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('allergies');
      expect(res.body.allergies).toEqual(['shellfish']);
      expect(res.body.dietaryPreferences).toEqual(['vegan']);
      expect(res.body.skinConditions).toEqual(['eczema']);
    });
    
    it('should return 400 if input is invalid', async () => {
      const res = await authenticatedRequest(app)
        .put('/api/user/profile')
        .send({
          allergies: 'not-an-array', // Should be an array
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid input');
    });
    
    it('should return 401 if not authenticated', async () => {
      // Override the mock once for this test
      (authenticate as jest.Mock).mockImplementationOnce((req, res, next) => {
        return res.status(401).json({ message: 'Authentication required' });
      });
      
      const res = await authenticatedRequest(app, 'invalid-token')
        .put('/api/user/profile')
        .send({
          allergies: ['nuts'],
        });
      
      expect(res.status).toBe(401);
    });
    
    it('should return 404 if user not found', async () => {
      // Override the auth middleware mock once to use unknown user ID
      (authenticate as jest.Mock).mockImplementationOnce((req: AuthRequest, res, next) => {
        req.user = { userId: 'unknown-user-id', email: 'unknown@example.com' };
        next();
      });
      
      const res = await authenticatedRequest(app)
        .put('/api/user/profile')
        .send({
          allergies: ['nuts'],
        });
      
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });
  });
});