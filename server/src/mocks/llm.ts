/**
 * Interface for LLM services
 */
export interface LlmService {
  generateResponse(prompt: string): Promise<string>;
}

/**
 * Mock OpenAI service
 * This simulates the functionality of the OpenAI API for development
 */
export class MockOpenAiService implements LlmService {
  /**
   * Generate a response based on a prompt
   * @param prompt The prompt to generate a response for
   * @returns Generated response
   */
  async generateResponse(prompt: string): Promise<string> {
    console.log('Mock OpenAI service: generating response for prompt');
    
    // For development, return predefined responses based on keywords in the prompt
    if (prompt.toLowerCase().includes('safe') && prompt.toLowerCase().includes('skin')) {
      return "Based on your skin sensitivity to parabens and fragrance, this product contains ingredients that might cause irritation. The fragrance in this product is a common allergen for sensitive skin, and phenoxyethanol can sometimes cause reactions in people with eczema. I'd recommend doing a patch test first or looking for fragrance-free alternatives.";
    }
    
    if (prompt.toLowerCase().includes('ingredient') && prompt.toLowerCase().includes('worst')) {
      return "In this product, the most concerning ingredient is Sodium Lauryl Sulfate (SLS), which has a health rating of 3/10. SLS is a strong surfactant that can strip natural oils from skin and hair, potentially causing dryness and irritation. It's particularly problematic for people with sensitive skin or conditions like eczema.";
    }
    
    if (prompt.toLowerCase().includes('alternative') || prompt.toLowerCase().includes('recommend')) {
      return "For someone with your skin sensitivities, I'd recommend looking for products with ingredients like hyaluronic acid, glycerin, aloe vera, and niacinamide. These are generally well-tolerated even by sensitive skin and provide good hydration. Avoid products containing fragrance, parabens, and strong surfactants like SLS.";
    }
    
    if (prompt.toLowerCase().includes('glycerin') || prompt.toLowerCase().includes('hyaluronic')) {
      return "Glycerin and Hyaluronic Acid are excellent ingredients for skin health. Glycerin is a humectant with a health rating of 9/10 that helps skin retain moisture. Hyaluronic Acid has a perfect 10/10 health rating and can hold up to 1000 times its weight in water, making it exceptional for hydration. Both are safe for all skin types, including sensitive skin.";
    }
    
    // Default response
    return "I don't have enough context to provide a specific answer about this product. Could you ask a more specific question about the ingredients or your concerns?";
  }
}

export default new MockOpenAiService();
