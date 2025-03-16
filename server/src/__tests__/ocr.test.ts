import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import ocrService from '../services/ocr';
import { setOcrProviderForTest } from './utils/testUtils';

// Mock axios to prevent actual API calls
jest.mock('axios');

describe('OCR Service', () => {
  // Reset OCR provider before each test
  beforeEach(() => {
    // Reset environment variables
    process.env.OCR_PROVIDER = 'mistral';
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  test('should extract text using the default provider', async () => {
    // Mock the extractWithMistral method
    const mockExtractText = jest.spyOn(ocrService as any, 'extractWithMistral');
    mockExtractText.mockResolvedValue({ text: 'Ingredients: Water, Sugar, Salt' });
    
    // Load a test image
    const imagePath = path.join(__dirname, '../services/test.jpg');
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Extract text
    const result = await ocrService.extractText(imageBuffer);
    
    // Verify the result
    expect(result).toBe('Water, Sugar, Salt');
    expect(mockExtractText).toHaveBeenCalled();
  });
  
  test('should switch to Google Vision provider', async () => {
    // Set provider to Google
    setOcrProviderForTest('google');
    
    // Mock the extractWithGoogle method
    const mockExtractText = jest.spyOn(ocrService as any, 'extractWithGoogle');
    mockExtractText.mockResolvedValue({ text: 'Ingredients: Flour, Eggs, Milk' });
    
    // Load a test image
    const imagePath = path.join(__dirname, '../services/test.jpg');
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Extract text
    const result = await ocrService.extractText(imageBuffer);
    
    // Verify the result
    expect(result).toBe('Flour, Eggs, Milk');
    expect(mockExtractText).toHaveBeenCalled();
  });
  
  test('should use mock provider for testing', async () => {
    // Set provider to mock
    setOcrProviderForTest('mock');
    
    // Mock the extractWithMock method to return a specific value
    const mockExtractText = jest.spyOn(ocrService as any, 'extractWithMock');
    mockExtractText.mockResolvedValue({ text: 'Water, Glycerin, Phenoxyethanol, Fragrance, Tocopherol' });
    
    // Extract text (no need for an actual image with mock provider)
    const result = await ocrService.extractText(Buffer.from('dummy'));
    
    // Verify the result
    expect(result).toBe('Water, Glycerin, Phenoxyethanol, Fragrance, Tocopherol');
    expect(mockExtractText).toHaveBeenCalled();
  });
  
  test('should extract ingredients section from OCR text', async () => {
    // Mock the extractWithMistral method
    const mockExtractText = jest.spyOn(ocrService as any, 'extractWithMistral');
    mockExtractText.mockResolvedValue({ 
      text: 'Product Name: Test Product\n\nIngredients: Water, Sugar, Salt, Preservatives\n\nManufactured by: Test Company' 
    });
    
    // Extract text
    const result = await ocrService.extractText(Buffer.from('dummy'));
    
    // Verify the result
    expect(result).toBe('Water, Sugar, Salt, Preservatives');
  });
});
