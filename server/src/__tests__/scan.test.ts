import express from 'express';
import { authenticatedRequest, getMockPrisma, testIngredients } from './utils/testUtils';
import scanRoutes from '../routes/scan';
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

// Mock the scan service
jest.mock('../services/scan', () => {
  return {
    default: {
      processImage: jest.fn().mockImplementation((imageData, userPreferences) => {
        return Promise.resolve([
          {
            id: 'ingredient-1',
            name: 'Water',
            description: 'A clear, colorless, odorless, and tasteless liquid',
            riskLevel: 'SAFE',
            risks: [],
            benefits: ['Hydration'],
            allergen: false,
          },
          {
            id: 'ingredient-2',
            name: 'Sugar',
            description: 'A sweet crystalline substance',
            riskLevel: 'MODERATE',
            risks: ['May cause diabetes in excess'],
            benefits: ['Energy source'],
            allergen: false,
          },
          {
            id: 'ingredient-3',
            name: 'Sodium Benzoate',
            description: 'A preservative',
            riskLevel: 'HIGH',
            risks: ['May cause allergic reactions', 'Linked to inflammation'],
            benefits: [],
            allergen: false,
          },
        ]);
      }),
      
      saveProduct: jest.fn().mockImplementation((name, category, barcode, ingredients) => {
        return Promise.resolve({
          id: 'product-id',
          name,
          category,
          barcode,
          createdAt: new Date(),
          updatedAt: new Date(),
          ingredients: ingredients.map((ingredient: any) => ({
            id: `product-ingredient-${ingredient.id}`,
            productId: 'product-id',
            ingredientId: ingredient.id,
            ingredient,
          })),
        });
      })
    }
  };
});

// Set up express app for testing
const app = express();
app.use(express.json());
app.use('/api/scan', authenticate, scanRoutes);

describe('Scan Controller', () => {
  let prisma: jest.Mocked<PrismaClient>;
  
  beforeEach(() => {
    prisma = getMockPrisma();
    jest.clearAllMocks();
  });
  
  describe('POST /api/scan/label', () => {
    it('should scan label successfully', async () => {
      const res = await authenticatedRequest(app)
        .post('/api/scan/label')
        .send({
          image: 'base64-encoded-image-data',
          productName: 'Test Product',
          productCategory: 'Beverages',
          barcode: '1234567890123',
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ingredients');
      expect(res.body).toHaveProperty('product');
      expect(res.body.ingredients).toHaveLength(3);
      expect(res.body.product.name).toBe('Test Product');
      expect(res.body.product.category).toBe('Beverages');
      expect(res.body.product.barcode).toBe('1234567890123');
    });
    
    it('should scan label without saving product', async () => {
      const res = await authenticatedRequest(app)
        .post('/api/scan/label')
        .send({
          image: 'base64-encoded-image-data',
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ingredients');
      expect(res.body.product).toBeNull();
      expect(res.body.ingredients).toHaveLength(3);
    });
    
    it('should return 400 if image is missing', async () => {
      const res = await authenticatedRequest(app)
        .post('/api/scan/label')
        .send({
          productName: 'Test Product',
          productCategory: 'Beverages',
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
        .post('/api/scan/label')
        .send({
          image: 'base64-encoded-image-data',
        });
      
      expect(res.status).toBe(401);
    });
  });
  
  describe('POST /api/scan/analyze', () => {
    it('should analyze ingredients successfully', async () => {
      const res = await authenticatedRequest(app)
        .post('/api/scan/analyze')
        .send({
          text: 'Water, Sugar, Sodium Benzoate',
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ingredients');
      expect(res.body.ingredients).toHaveLength(3);
    });
    
    it('should return 400 if text is missing', async () => {
      const res = await authenticatedRequest(app)
        .post('/api/scan/analyze')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid input');
    });
    
    it('should return 401 if not authenticated', async () => {
      // Override the mock once for this test
      (authenticate as jest.Mock).mockImplementationOnce((req, res, next) => {
        return res.status(401).json({ message: 'Authentication required' });
      });
      
      const res = await authenticatedRequest(app, 'invalid-token')
        .post('/api/scan/analyze')
        .send({
          text: 'Water, Sugar, Sodium Benzoate',
        });
      
      expect(res.status).toBe(401);
    });
  });
});