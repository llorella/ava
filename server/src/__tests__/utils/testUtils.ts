import { Express } from 'express';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';

// Get the Prisma client instance mock
export const getMockPrisma = (): jest.Mocked<PrismaClient> => {
  return {} as jest.Mocked<PrismaClient>;
};

// Helper to make authenticated requests
export const authenticatedRequest = (app: Express, token = 'valid-token') => {
  return {
    get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string, body?: any) => request(app).post(url).set('Authorization', `Bearer ${token}`).send(body),
    put: (url: string, body?: any) => request(app).put(url).set('Authorization', `Bearer ${token}`).send(body),
    delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
};

// Test user data
export const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  password: 'hashed_password123',
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Test product data
export const testProduct = {
  id: 'test-product-id',
  name: 'Test Product',
  barcode: '1234567890123',
  imageUrl: 'https://example.com/image.jpg',
  userId: testUser.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Test ingredients data
export const testIngredients = [
  {
    id: 'ingredient-1',
    name: 'Water',
    description: 'A clear, colorless, odorless, and tasteless liquid',
    riskLevel: 'SAFE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ingredient-2',
    name: 'Sugar',
    description: 'A sweet crystalline substance',
    riskLevel: 'MODERATE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ingredient-3',
    name: 'Sodium Benzoate',
    description: 'A preservative',
    riskLevel: 'HIGH',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];