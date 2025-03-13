import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { authenticate } from '../middleware/auth';
import authRoutes from '../routes/auth';
import userRoutes from '../routes/user';
import scanRoutes from '../routes/scan';
import chatRoutes from '../routes/chat';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';

// Create a test Express app
const app = express();

// Configure middleware
app.use(express.json());
app.use(cors());

// Configure routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticate, userRoutes);
app.use('/api/scan', authenticate, scanRoutes);
app.use('/api/chat', authenticate, chatRoutes);

// Default route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Ava API is running' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

describe('API Integration', () => {
  it('should respond with 200 on root endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Ava API is running');
  });

  it('should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
  });
});