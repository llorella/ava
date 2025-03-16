import { PrismaClient } from '@prisma/client';
import { AnalyzedIngredient, UserPreferences } from '../types';
import ocrService from './ocr';
import ingredientService from './ingredient';

const prisma = new PrismaClient();

/**
 * Service for scan-related operations
 */
export class ScanService {
  /**
   * Process an image and extract ingredients
   * @param imageData Base64 encoded image
   * @param userPreferences User's health preferences
   * @returns Analyzed ingredients
   */
  async processImage(
    imageData: string,
    userPreferences: UserPreferences
  ): Promise<AnalyzedIngredient[]> {
    try {
      // Extract text from image using OCR
      const extractedText = await ocrService.extractText(imageData);
      
      // Parse ingredients from text
      const ingredients = await ingredientService.parseIngredients(extractedText);
      
      // Analyze ingredients based on user preferences
      const analyzedIngredients = ingredientService.analyzeIngredients(
        ingredients,
        userPreferences
      );
      
      return analyzedIngredients;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }
  
  /**
   * Save a product and its ingredients to the database
   * @param name Product name
   * @param category Product category
   * @param barcode Optional product barcode
   * @param ingredients Analyzed ingredients
   * @returns Created product
   */
  async saveProduct(
    name: string,
    category: string,
    barcode: string | undefined,
    ingredients: AnalyzedIngredient[]
  ) {
    try {
      // Create product
      const product = await prisma.product.create({
        data: {
          name,
          category,
          barcode,
          ingredients: {
            create: ingredients.map(ingredient => ({
              ingredient: {
                connect: {
                  id: ingredient.id
                }
              }
            }))
          }
        },
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      });
      
      return product;
    } catch (error) {
      console.error('Error saving product:', error);
      throw new Error('Failed to save product');
    }
  }
}

export default new ScanService();
