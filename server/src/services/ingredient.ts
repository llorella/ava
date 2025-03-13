import { PrismaClient } from '@prisma/client';
import { AnalyzedIngredient, UserPreferences } from '../types';

const prisma = new PrismaClient();

/**
 * Service for ingredient-related operations
 */
export class IngredientService {
  /**
   * Parse ingredient text and match to database
   * @param text Raw ingredient text from OCR
   * @returns Array of matched ingredients
   */
  async parseIngredients(text: string): Promise<AnalyzedIngredient[]> {
    // Split text by commas and clean up each ingredient name
    const ingredientNames = text
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    // Find matching ingredients in the database
    const ingredients = await prisma.ingredient.findMany({
      where: {
        OR: ingredientNames.map(name => ({
          OR: [
            { name: { contains: name, mode: 'insensitive' } },
            { aliases: { array_contains: name } }
          ]
        }))
      }
    });
    
    // Convert to AnalyzedIngredient type (without risk assessment yet)
    return ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      aliases: ing.aliases as string[],
      category: ing.category,
      healthRating: ing.healthRating,
      riskFactors: ing.riskFactors as string[],
      description: ing.description,
      isRisky: false // Will be updated in analyzeIngredients
    }));
  }
  
  /**
   * Analyze ingredients based on user preferences
   * @param ingredients Array of ingredients
   * @param userPreferences User's health preferences
   * @returns Analyzed ingredients with risk assessment
   */
  analyzeIngredients(
    ingredients: AnalyzedIngredient[],
    userPreferences: UserPreferences
  ): AnalyzedIngredient[] {
    return ingredients.map(ingredient => {
      // Check if ingredient is risky based on user preferences
      const isRisky = this.isIngredientRisky(ingredient, userPreferences);
      
      return {
        ...ingredient,
        isRisky
      };
    });
  }
  
  /**
   * Determine if an ingredient is risky for a user
   * @param ingredient Ingredient to check
   * @param userPreferences User's health preferences
   * @returns Whether the ingredient is risky
   */
  private isIngredientRisky(
    ingredient: AnalyzedIngredient,
    userPreferences: UserPreferences
  ): boolean {
    // Check allergies
    const allergies = userPreferences.allergies || [];
    if (allergies.some(allergy => 
      ingredient.name.toLowerCase().includes(allergy.toLowerCase()) ||
      ingredient.aliases.some(alias => alias.toLowerCase().includes(allergy.toLowerCase()))
    )) {
      return true;
    }
    
    // Check skin conditions
    const skinConditions = userPreferences.skinConditions || [];
    if (
      skinConditions.includes('Sensitive Skin') && 
      ingredient.riskFactors.includes('skin irritation')
    ) {
      return true;
    }
    
    if (
      skinConditions.includes('Eczema') && 
      (ingredient.riskFactors.includes('skin irritation') || 
       ingredient.riskFactors.includes('allergic reactions'))
    ) {
      return true;
    }
    
    // Check health rating
    if (ingredient.healthRating < 5) {
      return true;
    }
    
    return false;
  }
}

export default new IngredientService();
