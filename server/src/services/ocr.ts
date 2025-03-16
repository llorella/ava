/**
 * OCR service with support for multiple providers
 * This service provides OCR functionality for extracting text from images
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define provider types
type OcrProvider = 'mistral' | 'google' | 'mock';

// Define common response structure
interface OcrResult {
  text: string;
  confidence?: number;
}

// Define interfaces for Mistral OCR API response
interface MistralOcrPage {
  index: number;
  markdown: string;
  images: any[];
  dimensions: {
    dpi: number;
    height: number;
    width: number;
  };
}

interface MistralOcrResponse {
  pages: MistralOcrPage[];
}

/**
 * Service for OCR-related operations with support for multiple providers
 */
export class OcrService {
  private provider: OcrProvider;
  
  constructor() {
    // Get provider from environment or default to mistral
    this.provider = (process.env.OCR_PROVIDER as OcrProvider) || 'mistral';
  }
  
  /**
   * Set the OCR provider to use
   */
  setProvider(provider: OcrProvider): void {
    this.provider = provider;
  }
  
  /**
   * Extract text from an image using the configured OCR provider
   * @param imageBuffer Base64 encoded image or Buffer
   * @returns Extracted text
   */
  async extractText(imageBuffer: Buffer | string): Promise<string> {
    console.log(`OCR service: extracting text using ${this.provider} provider`);
    
    // Prepare the image data
    const base64Image = this.prepareImageData(imageBuffer);
    
    // Get text from the appropriate provider
    let result: OcrResult;
    
    switch (this.provider) {
      case 'mistral':
        result = await this.extractWithMistral(base64Image);
        break;
      case 'google':
        result = await this.extractWithGoogle(base64Image);
        break;
      case 'mock':
        result = await this.extractWithMock();
        break;
      default:
        throw new Error(`Unsupported OCR provider: ${this.provider}`);
    }
    
    // Process the text to extract ingredients
    const ingredientsSection = this.extractIngredientsSection(result.text);
    return ingredientsSection || result.text;
  }
  
  /**
   * Prepare image data for OCR processing
   */
  private prepareImageData(imageBuffer: Buffer | string): string {
    if (Buffer.isBuffer(imageBuffer)) {
      return imageBuffer.toString('base64');
    } else if (typeof imageBuffer === 'string') {
      // Remove potential data URL prefix if present
      return imageBuffer.replace(/^data:image\/\w+;base64,/, '');
    } else {
      throw new Error('Invalid image format');
    }
  }
  
  /**
   * Extract text using Mistral OCR API
   */
  private async extractWithMistral(base64Image: string): Promise<OcrResult> {
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    
    if (!MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY environment variable is required');
    }
    
    try {
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
      
      return { text: extractedText };
    } catch (error) {
      console.error('Error calling Mistral OCR API:', error);
      throw new Error('Failed to extract text from image using Mistral');
    }
  }
  
  /**
   * Extract text using Google Vision API
   */
  private async extractWithGoogle(base64Image: string): Promise<OcrResult> {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }
    
    try {
      // Call Google Vision API
      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
        {
          requests: [
            {
              image: {
                content: base64Image
              },
              features: [
                {
                  type: 'TEXT_DETECTION'
                }
              ]
            }
          ]
        }
      );
      
      // Extract text from response
      const textAnnotations = response.data.responses[0].textAnnotations;
      const extractedText = textAnnotations && textAnnotations.length > 0 
        ? textAnnotations[0].description 
        : '';
      
      return { text: extractedText };
    } catch (error) {
      console.error('Error calling Google Vision API:', error);
      throw new Error('Failed to extract text from image using Google Vision');
    }
  }
  
  /**
   * Extract text using mock data (for testing)
   */
  private async extractWithMock(): Promise<OcrResult> {
    // For testing, return one of several predefined ingredient lists
    const ingredientLists = [
      "Water, Glycerin, Phenoxyethanol, Fragrance, Tocopherol",
      "Aqua, Sodium Lauryl Sulfate, Fragrance, Parabens, Glycerin",
      "Water, Aloe Vera, Hyaluronic Acid, Niacinamide, Glycerin",
      "Water, Dimethicone, Titanium Dioxide, Zinc Oxide, Fragrance",
      "Aqua, Retinol, Glycerin, Hyaluronic Acid, Tocopherol"
    ];
    
    // Return a random ingredient list
    const randomIndex = Math.floor(Math.random() * ingredientLists.length);
    return { text: ingredientLists[randomIndex] };
  }
  
  /**
   * Extract the ingredients section from OCR text
   * This is a specialized method for the Ava app to identify ingredient lists
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
}

export default new OcrService();
