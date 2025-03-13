import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockDeep<PrismaClient>()),
}));

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: jest.fn().mockImplementation((token) => {
    if (token === 'valid-token') {
      return { userId: 'test-user-id' };
    }
    throw new Error('Invalid token');
  }),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn().mockImplementation((password, hash) => {
    return Promise.resolve(hash === `hashed_${password}`);
  }),
}));

// Global test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  jest.clearAllMocks();
});