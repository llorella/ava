import { PrismaClient } from '@prisma/client';
import { UserPreferences } from '../types';
import llmService from '../mocks/llm';

const prisma = new PrismaClient();

/**
 * Service for chat-related operations
 */
export class ChatService {
  /**
   * Generate a response to a user's message
   * @param message User's message
   * @param productId Optional product ID for context
   * @param userPreferences User's health preferences
   * @returns Generated response
   */
  async generateResponse(
    message: string,
    productId: string | undefined,
    userPreferences: UserPreferences
  ): Promise<string> {
    // Build context for the LLM
    const context = await this.buildContext(productId, userPreferences);
    
    // Construct prompt
    const prompt = this.constructPrompt(message, context);
    
    // Generate response using LLM service
    return llmService.generateResponse(prompt);
  }
  
  /**
   * Build context for the LLM based on product and user preferences
   * @param productId Product ID
   * @param userPreferences User's health preferences
   * @returns Context string
   */
  private async buildContext(
    productId: string | undefined,
    userPreferences: UserPreferences
  ): Promise<string> {
    let context = `User has the following preferences:\n`;
    
    // Add allergies
    if (userPreferences.allergies && userPreferences.allergies.length > 0) {
      context += `- Allergies: ${userPreferences.allergies.join(', ')}\n`;
    } else {
      context += `- No known allergies\n`;
    }
    
    // Add dietary preferences
    if (userPreferences.dietaryPreferences && userPreferences.dietaryPreferences.length > 0) {
      context += `- Dietary preferences: ${userPreferences.dietaryPreferences.join(', ')}\n`;
    }
    
    // Add skin conditions
    if (userPreferences.skinConditions && userPreferences.skinConditions.length > 0) {
      context += `- Skin conditions: ${userPreferences.skinConditions.join(', ')}\n`;
    }
    
    // Add product information if available
    if (productId) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            ingredients: {
              include: {
                ingredient: true
              }
            }
          }
        });
        
        if (product) {
          context += `\nUser scanned a ${product.category} product called "${product.name}" containing the following ingredients:\n`;
          
          for (const productIngredient of product.ingredients) {
            const ingredient = productIngredient.ingredient;
            context += `- ${ingredient.name} (health rating: ${ingredient.healthRating}/10) – ${ingredient.description}\n`;
          }
        }
      } catch (error) {
        console.error('Error fetching product information:', error);
      }
    }
    
    return context;
  }
  
  /**
   * Construct a prompt for the LLM
   * @param message User's message
   * @param context Context information
   * @returns Constructed prompt
   */
  private constructPrompt(message: string, context: string): string {
    return `${context}\n\nUser asks: "${message}"\n\nProvide a helpful, accurate response about the health implications of this product based on the user's preferences and the ingredients.`;
  }
}

export default new ChatService();
