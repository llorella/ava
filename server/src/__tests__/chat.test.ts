import express from 'express';
import { authenticatedRequest, getMockPrisma } from './utils/testUtils';
import chatRoutes from '../routes/chat';
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
      getUserPreferences: jest.fn().mockResolvedValue({
        allergies: ['peanuts', 'dairy'],
        dietaryPreferences: ['vegan'],
        skinConditions: ['eczema'],
      })
    }
  };
});

// Mock the chat service
jest.mock('../services/chat', () => {
  return {
    default: {
      generateResponse: jest.fn().mockImplementation((message, productId, userPreferences) => {
        // Different responses based on scenarios
        if (message.includes('allergy')) {
          return Promise.resolve('Based on your allergies to peanuts and dairy, you should avoid products containing these ingredients.');
        } else if (message.includes('vegan')) {
          return Promise.resolve('As a vegan, you should look for products that do not contain any animal-derived ingredients.');
        } else if (productId) {
          return Promise.resolve('This product contains ingredients that are generally safe for you, but watch out for the high sugar content.');
        } else {
          return Promise.resolve('I can help you understand food ingredients and their effects on your health. What would you like to know?');
        }
      })
    }
  };
});

// Set up express app for testing
const app = express();
app.use(express.json());
app.use('/api/chat', authenticate, chatRoutes);

describe('Chat Controller', () => {
  let prisma: jest.Mocked<PrismaClient>;
  
  beforeEach(() => {
    prisma = getMockPrisma();
    jest.clearAllMocks();
  });
  
  describe('POST /api/chat', () => {
    it('should respond to a general message successfully', async () => {
      const res = await authenticatedRequest(app)
        .post('/')
        .send({
          message: 'Hello, how can you help me?',
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('I can help you understand food ingredients and their effects on your health. What would you like to know?');
    });
    
    it('should respond to a message about allergies', async () => {
      const res = await authenticatedRequest(app)
        .post('/')
        .send({
          message: 'What should I know about my allergy?',
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Based on your allergies to peanuts and dairy, you should avoid products containing these ingredients.');
    });
    
    it('should respond to a message about vegan diet', async () => {
      const res = await authenticatedRequest(app)
        .post('/')
        .send({
          message: 'What should I look for as a vegan?',
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('As a vegan, you should look for products that do not contain any animal-derived ingredients.');
    });
    
    it('should include product context if productId is provided', async () => {
      const res = await authenticatedRequest(app)
        .post('/')
        .send({
          message: 'Is this product good for me?',
          productId: 'test-product-id',
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('This product contains ingredients that are generally safe for you, but watch out for the high sugar content.');
    });
    
    it('should return 400 if message is missing', async () => {
      const res = await authenticatedRequest(app)
        .post('/')
        .send({
          productId: 'test-product-id',
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
        .post('/')
        .send({
          message: 'Hello',
        });
      
      expect(res.status).toBe(401);
    });
  });
});