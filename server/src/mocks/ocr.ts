/**
 * Mock OCR service using Mistral OCR API
 * This simulates the functionality of OCR for development
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mistral API key should be in .env file
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || 'your-mistral-api-key';

interface MistralOcrResponse {
  pages: {
    index: number;
    markdown: string;
    images: any[];
    dimensions: {
      dpi: number;
      height: number;
      width: number;
    };
  }[];
}

export class MockOcrService {
  /**
   * Extract text from an image using Mistral OCR API
   * @param imageBuffer Base64 encoded image or Buffer
   * @returns Extracted text
   */
  async extractText(imageBuffer: Buffer | string): Promise<string> {
    console.log('Mock OCR service: extracting text from image using Mistral OCR');
    
    try {
      // For development, we can either use the Mistral API or return mock data
      if (!MISTRAL_API_KEY || MISTRAL_API_KEY === 'your-mistral-api-key') {
        console.log('No Mistral API key found, using mock data');
        return this.getMockIngredientList();
      }
      
      // Convert Buffer to base64 string if needed
      let base64Image: string;
      if (Buffer.isBuffer(imageBuffer)) {
        base64Image = imageBuffer.toString('base64');
      } else if (typeof imageBuffer === 'string') {
        // If it's already a base64 string, use it directly
        // Remove potential data URL prefix if present
        base64Image = imageBuffer.replace(/^data:image\/\w+;base64,/, '');
      } else {
        throw new Error('Invalid image format');
      }
      
      // Prepare the image URL with base64 data
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;
      
      // Call Mistral OCR API
      const response = await axios.post(
        'https://api.mistral.ai/v1/ocr',
        {
          model: 'mistral-ocr-latest',
          document: {
            type: 'image_url',
            image_url: imageUrl
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}`
          }
        }
      );
      
      // Extract text from response
      const ocrResponse = response.data as MistralOcrResponse;
      
      // Combine text from all pages
      let extractedText = '';
      for (const page of ocrResponse.pages) {
        extractedText += page.markdown + '\n';
      }
      
      // Process the text to extract ingredients
      // This is a simplified version - in a real app, you'd want more sophisticated parsing
      const ingredientsSection = this.extractIngredientsSection(extractedText);
      
      return ingredientsSection || this.getMockIngredientList();
      
    } catch (error) {
      console.error('Error calling Mistral OCR API:', error);
      // Fallback to mock data in case of error
      return this.getMockIngredientList();
    }
  }
  
  /**
   * Extract the ingredients section from OCR text
   * This is a simplified implementation - in a real app, you'd want more sophisticated parsing
   */
  private extractIngredientsSection(text: string): string | null {
    // Look for common ingredient list patterns
    const patterns = [
      /ingredients:?\s*([^.]*)/i,
      /contains:?\s*([^.]*)/i,
      /composition:?\s*([^.]*)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // If no specific ingredients section is found, return the first paragraph
    // that looks like a comma-separated list
    const paragraphs = text.split('\n\n');
    for (const paragraph of paragraphs) {
      if (paragraph.includes(',') && paragraph.split(',').length > 3) {
        return paragraph.trim();
      }
    }
    
    return null;
  }
  
  /**
   * Get a mock ingredient list for fallback
   */
  private getMockIngredientList(): string {
    // For development, return one of several predefined ingredient lists
    const ingredientLists = [
      "Water, Glycerin, Phenoxyethanol, Fragrance, Tocopherol",
      "Aqua, Sodium Lauryl Sulfate, Fragrance, Parabens, Glycerin",
      "Water, Aloe Vera, Hyaluronic Acid, Niacinamide, Glycerin",
      "Water, Dimethicone, Titanium Dioxide, Zinc Oxide, Fragrance",
      "Aqua, Retinol, Glycerin, Hyaluronic Acid, Tocopherol"
    ];
    
    // Return a random ingredient list
    const randomIndex = Math.floor(Math.random() * ingredientLists.length);
    return ingredientLists[randomIndex];
  }
}

export default new MockOcrService();
