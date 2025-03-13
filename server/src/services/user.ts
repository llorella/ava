import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserPreferences, JwtPayload } from '../types';

const prisma = new PrismaClient();

/**
 * Service for user-related operations
 */
class UserService {
  /**
   * Register a new user
   * @param email User's email
   * @param password User's password
   * @returns Created user and JWT token
   */
  async register(email: string, password: string) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          allergies: JSON.stringify([]),
          dietaryPreferences: JSON.stringify([]),
          skinConditions: JSON.stringify([])
        }
      });
      
      // Generate JWT token
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        allergies: JSON.parse(user.allergies as string),
        dietaryPreferences: JSON.parse(user.dietaryPreferences as string),
        skinConditions: JSON.parse(user.skinConditions as string),
        createdAt: user.createdAt
      });
      
      return {
        user: {
          id: user.id,
          email: user.email
        },
        token
      };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  
  /**
   * Login a user
   * @param email User's email
   * @param password User's password
   * @returns User and JWT token
   */
  async login(email: string, password: string) {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      
      // Generate JWT token
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        allergies: JSON.parse(user.allergies as string),
        dietaryPreferences: JSON.parse(user.dietaryPreferences as string),
        skinConditions: JSON.parse(user.skinConditions as string),
        createdAt: user.createdAt
      });
      
      return {
        user: {
          id: user.id,
          email: user.email
        },
        token
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }
  
  /**
   * Get user preferences
   * @param userId User ID
   * @returns User preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        allergies: JSON.parse(user.allergies as string),
        dietaryPreferences: JSON.parse(user.dietaryPreferences as string),
        skinConditions: JSON.parse(user.skinConditions as string)
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }
  
  /**
   * Update user preferences
   * @param userId User ID
   * @param preferences User preferences to update
   * @returns Updated user preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          allergies: preferences.allergies !== undefined 
            ? JSON.stringify(preferences.allergies) 
            : user.allergies,
          dietaryPreferences: preferences.dietaryPreferences !== undefined 
            ? JSON.stringify(preferences.dietaryPreferences) 
            : user.dietaryPreferences,
          skinConditions: preferences.skinConditions !== undefined 
            ? JSON.stringify(preferences.skinConditions) 
            : user.skinConditions
        }
      });
      
      return {
        allergies: JSON.parse(updatedUser.allergies as string),
        dietaryPreferences: JSON.parse(updatedUser.dietaryPreferences as string),
        skinConditions: JSON.parse(updatedUser.skinConditions as string)
      };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
  
  /**
   * Generate a JWT token for a user
   * @param user User to generate token for
   * @returns JWT token
   */
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email
    };
    
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );
  }
}

// Create a singleton instance
const userService = new UserService();

// Export the instance as default
export default userService;
