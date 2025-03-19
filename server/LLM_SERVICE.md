# LLM Service Documentation

This document provides information about the LLM (Large Language Model) service in the Ava application, which uses OpenAI's API to generate responses for the chat interface.

## Overview

The LLM service is responsible for generating intelligent, contextual responses to user queries about product ingredients and health implications. It uses OpenAI's API to process prompts that include user preferences, product information, and the user's specific question.

## Implementation

The LLM service is implemented in `server/src/services/llm.ts` and provides a clean interface for generating responses based on prompts.

### Key Features

1. **Specialized System Prompt** - The service uses a detailed system prompt that positions Ava as a health assistant specializing in product ingredients analysis.

2. **Error Handling** - Comprehensive error handling with detailed logging and graceful fallback responses.

3. **Configurable Model** - The OpenAI model can be configured via environment variables.

## Configuration

The LLM service can be configured in the `.env` file:

```
# OpenAI Configuration
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini" # Options: gpt-4o-mini, gpt-4o, gpt-3.5-turbo
```

## Usage

### Basic Usage

The LLM service is primarily used by the Chat service to generate responses:

```typescript
import llmService from './services/llm';

// Generate a response
const prompt = "User has allergies to nuts.\n\nUser asks: \"Is this product safe for me?\"";
const response = await llmService.generateResponse(prompt);
console.log(response);
```

## System Prompt

The system prompt is carefully crafted to guide the model's responses:

```
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
```

## Error Handling

The service includes robust error handling:

1. **API Errors** - Detailed logging of API errors with status codes and response data
2. **Network Errors** - Handling of connection issues
3. **Fallback Responses** - Graceful user-friendly responses when errors occur

## Performance Considerations

- The default model is `gpt-4o-mini`, which offers a good balance of quality and speed
- For higher quality responses, consider using `gpt-4o`
- For faster responses at lower cost, consider using `gpt-3.5-turbo`

## Future Improvements

Potential future improvements for the LLM service:

1. Add support for streaming responses
2. Implement response caching for common queries
3. Add more advanced prompt engineering techniques
4. Implement retry logic for failed API calls
5. Add support for additional LLM providers (e.g., Anthropic, Mistral)
