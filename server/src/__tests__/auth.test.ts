import request from 'supertest';
import express from 'express';
import { getMockPrisma, testUser } from './utils/testUtils';
import authRoutes from '../routes/auth';
import { PrismaClient } from '@prisma/client';

// Mock the user service
jest.mock('../services/user', () => {
  return {
    default: {
      register: jest.fn().mockImplementation((email, password) => {
        if (email === 'existing@example.com') {
          throw new Error('User already exists');
        }
        
        return Promise.resolve({
          user: {
            id: 'new-user-id',
            email,
          },
          token: 'valid-token',
        });
      }),
      
      login: jest.fn().mockImplementation((email, password) => {
        if (email === 'invalid@example.com' || password === 'wrongpassword') {
          throw new Error('Invalid credentials');
        }
        
        return Promise.resolve({
          user: {
            id: testUser.id,
            email,
          },
          token: 'valid-token',
        });
      })
    }
  };
});

// Set up express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Controller', () => {
  let prisma: jest.Mocked<PrismaClient>;
  
  beforeEach(() => {
    prisma = getMockPrisma();
    jest.clearAllMocks();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('newuser@example.com');
    });
    
    it('should return 409 if user already exists', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
        });
      
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('message', 'User already exists');
    });
    
    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid input');
    });
    
    it('should return 400 if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'valid@example.com',
          password: '12345', // Less than 6 characters
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid input');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'valid@example.com',
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid input');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login a user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });
    
    it('should return 401 if credentials are invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'password123',
        });
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
    
    it('should return 401 if password is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
    
    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid input');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid input');
    });
  });
});