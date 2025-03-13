// User types
export interface UserPreferences {
  allergies: string[];
  dietaryPreferences: string[];
  skinConditions: string[];
}

export interface User {
  id: string;
  email: string;
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Product types
export interface Product {
  id: string;
  name: string;
  category: string;
  barcode?: string;
  createdAt: string;
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
  isRisky: boolean;
}

// Scan types
export interface ScanResult {
  ingredients: Ingredient[];
  product?: Product;
}

export interface ScanState {
  recentScans: ScanResult[];
  currentScan: ScanResult | null;
  loading: boolean;
  error: string | null;
}

// Chat types
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ava';
  timestamp: string;
}

export interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ScanResult: { scanId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  Chat: undefined;
  Profile: undefined;
};
