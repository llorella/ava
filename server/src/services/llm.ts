import { OpenAI } from "openai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Interface for LLM services
 */
export interface LlmService {
  generateResponse(prompt: string): Promise<string>;
}

/**
 * OpenAI service implementation for Ava health assistant
 */
export class OpenAiService implements LlmService {
  private openai: OpenAI;
  private model: string;
  private systemPrompt: string;
  
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({ apiKey });
    
    // Default to GPT-4o-mini, but could be configurable via env
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    
    // Detailed system prompt specific to Ava's functionality
    this.systemPrompt = `
You are Ava, a personal health assistant specializing in analyzing ingredients in food, beauty, and household products.

Your primary responsibilities:
1. Analyze product ingredients and their potential health implications
2. Provide personalized advice based on user's health profile (allergies, dietary preferences, skin conditions)
3. Explain ingredient properties, benefits, and risks in clear, accessible language
4. Recommend safer alternatives when appropriate

Guidelines for your responses:
- Be factual and evidence-based when discussing ingredient health impacts
- Personalize advice based on the user's specific health profile
- For ingredients with low health ratings (below 5/10), explain the specific concerns
- Highlight ingredients that match user's allergies or may trigger skin conditions
- When discussing beauty products, consider skin sensitivity and potential irritants
- For food products, focus on nutritional value, allergens, and dietary restrictions
- Maintain a helpful, informative tone without causing unnecessary alarm
- When recommending alternatives, suggest specific ingredient substitutes

Remember that users rely on your expertise to make informed health decisions about the products they use.
`;
  }
  
  /**
   * Generate a response based on a prompt using OpenAI
   * @param prompt The prompt containing user message and context
   * @returns Generated response
   */
  async generateResponse(prompt: string): Promise<string> {
    try {
      console.log('OpenAI service: generating response for prompt');
      
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      const response = completion.choices[0].message.content;
      
      if (!response) {
        throw new Error('Empty response from OpenAI API');
      }
      
      return response;
    } catch (error: any) {
      // Detailed error logging
      if (error.response) {
        console.error('OpenAI API error:', {
          status: error.response.status,
          data: error.response.data
        });
      } else {
        console.error('OpenAI service error:', error.message);
      }
      
      // Provide a graceful fallback response
      return "I'm sorry, I'm having trouble analyzing this information right now. Please try again in a moment.";
    }
  }
}

// Export a singleton instance
export default new OpenAiService();


// for testing

const testService = new OpenAiService();
testService.generateResponse("What are the ingredients in Coca-Cola?").then(response => {
  console.log('Test response:', response);
});