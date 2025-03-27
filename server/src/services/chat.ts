import { PrismaClient } from '@prisma/client';
import { UserPreferences, ConversationWithMessages, MessageCreateInput, Message } from '../types';
import llmService from '../services/llm';

const prisma = new PrismaClient();

/**
 * Service for chat-related operations
 */
export class ChatService {
  /**
   * Create a new conversation
   * @param userId User ID
   * @param initialMessage Optional initial message
   * @param productId Optional product ID
   * @param title Optional conversation title
   * @returns Created conversation with messages
   */
  async createConversation(
    userId: string,
    initialMessage?: string,
    productId?: string,
    title?: string
  ): Promise<ConversationWithMessages> {
    // Verify user exists before creating conversation
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        productId,
        title: title || 'New Conversation',
      },
      include: {
        messages: true,
        product: true,
      },
    });

    // If there's an initial message, add it to the conversation
    if (initialMessage) {
      await this.addMessage({
        conversationId: conversation.id,
        content: initialMessage,
        sender: 'user',
      });
    }

    return conversation as unknown as ConversationWithMessages;
  }

  /**
   * Get a conversation by ID
   * @param conversationId Conversation ID
   * @returns Conversation with messages
   */
  async getConversation(conversationId: string): Promise<ConversationWithMessages | null> {
    return prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
        product: true,
      },
    }) as unknown as Promise<ConversationWithMessages | null>;
  }

  /**
   * Get all conversations for a user
   * @param userId User ID
   * @param limit Optional limit of conversations to return
   * @param offset Optional offset for pagination
   * @returns Array of conversations with messages
   */
  async getUserConversations(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ConversationWithMessages[]> {
    return prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          take: 1, // Include only the most recent message for previews
        },
        product: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    }) as unknown as Promise<ConversationWithMessages[]>;
  }

  /**
   * Add a message to a conversation
   * @param messageData Message data
   * @returns Created message
   */
  async addMessage(messageData: MessageCreateInput): Promise<Message> {
    const message = await prisma.message.create({
      data: messageData,
    });

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: messageData.conversationId },
      data: { updatedAt: new Date() },
    });

    return message as unknown as Message;
  }

  /**
   * Generate a response to a user's message and save to conversation
   * @param message User's message
   * @param conversationId Conversation ID
   * @param userId User ID
   * @param productId Optional product ID for context
   * @returns Generated response message
   */
  async generateAndSaveResponse(
    message: string,
    conversationId: string,
    userId: string,
    productId?: string
  ): Promise<Message> {
    // Save user message first
    await this.addMessage({
      conversationId,
      content: message,
      sender: 'user',
    });

    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Parse JSON strings to arrays if needed
    const userPreferences: UserPreferences = {
      allergies: typeof user.allergies === 'string' ? JSON.parse(user.allergies) : user.allergies,
      dietaryPreferences: typeof user.dietaryPreferences === 'string' ? JSON.parse(user.dietaryPreferences) : user.dietaryPreferences,
      skinConditions: typeof user.skinConditions === 'string' ? JSON.parse(user.skinConditions) : user.skinConditions,
    };

    // Generate response
    const response = await this.generateResponse(message, productId, userPreferences);

    // Save response message
    return this.addMessage({
      conversationId,
      content: response,
      sender: 'ava',
    });
  }

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
