import { Request } from 'express';

// User types
export interface UserPreferences {
  allergies: string[];
  dietaryPreferences: string[];
  skinConditions: string[];
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  allergies: string | string[];
  dietaryPreferences: string | string[];
  skinConditions: string | string[];
  createdAt: Date;
}

// Product types
export interface Product {
  id: string;
  name: string;
  category: string;
  barcode?: string;
  createdAt: Date;
}

// Ingredient types
export interface Ingredient {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  healthRating: number;
  riskFactors: string[];
  description: string;
}

export interface AnalyzedIngredient extends Ingredient {
  isRisky: boolean;
}

// Request/Response types
export interface ScanLabelRequest {
  image: string; // base64 encoded image
}

export interface ScanLabelResponse {
  extractedText: string;
}

export interface AnalyzeIngredientsRequest {
  text: string;
}

export interface AnalyzeIngredientsResponse {
  ingredients: AnalyzedIngredient[];
}

export interface ChatRequest {
  message: string;
  productId?: string;
}

export interface ChatResponse {
  message: string;
}

export interface UserProfileRequest {
  allergies?: string[];
  dietaryPreferences?: string[];
  skinConditions?: string[];
}

export interface UserProfileResponse {
  allergies: string[];
  dietaryPreferences: string[];
  skinConditions: string[];
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

// JWT payload
export interface JwtPayload {
  userId: string;
  email: string;
}

// Request with authenticated user
export interface AuthRequest extends Request {
  user?: JwtPayload;
  body: any;
}

// Conversation types
export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  productId?: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  product?: Product;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: 'user' | 'ava';
  timestamp: Date;
}

export interface MessageCreateInput {
  conversationId: string;
  content: string;
  sender: 'user' | 'ava';
}

export interface ConversationCreateInput {
  userId: string;
  title?: string;
  productId?: string;
  initialMessage?: string;
}

export interface ConversationListResponse {
  conversations: ConversationWithMessages[];
}

export interface ConversationResponse {
  conversation: ConversationWithMessages;
}
