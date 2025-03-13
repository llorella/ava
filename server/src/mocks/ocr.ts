/**
 * Mock OCR service
 * This simulates the functionality of Google Cloud Vision API for development
 */
export class MockOcrService {
  /**
   * Extract text from an image
   * @param imageBuffer Base64 encoded image
   * @returns Extracted text
   */
  async extractText(imageBuffer: Buffer | string): Promise<string> {
    console.log('Mock OCR service: extracting text from image');
    
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
