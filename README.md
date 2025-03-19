# Ava - Personal Health Assistant

Ava is a personal health assistant that analyzes ingredient labels from food, beauty, and household products and provides health insights through a conversational chat interface.

## Features

- **Scan Product Labels**: Take a photo of any product label to analyze its ingredients
- **Ingredient Analysis**: Get detailed information about each ingredient, including health ratings and potential risks
- **Personalized Insights**: Receive tailored health insights based on your allergies, dietary preferences, and skin conditions
- **Chat Interface**: Ask questions about products and get personalized health advice

## Tech Stack

### Frontend
- React Native (TypeScript)
- React Navigation
- React Context API for state management
- Formik & Yup for form validation

### Backend
- Node.js with Express.js
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Zod for input validation

### Services
- Multi-provider OCR service (supports Mistral OCR, Google Cloud Vision, and mock data)
- OpenAI-powered LLM service for intelligent chat responses

## Project Structure

```
ava/
├── client/                 # React Native frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # App screens
│   │   ├── context/        # React Context for state management
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   └── App.tsx         # Main app component
├── server/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic and services (OCR, LLM)
│   │   ├── __tests__/      # Test files (currently being rebuilt)
│   │   └── types/          # TypeScript type definitions
│   ├── prisma/             # Prisma ORM
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
```

> **Note**: The testing suite is currently being rebuilt. See [Testing Documentation](server/TESTING.md) for details.

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- React Native development environment

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/ava.git
   cd ava
   ```

2. Install dependencies
   ```
   npm run setup
   ```

3. Set up the database
   ```
   cd server
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Configure environment variables
   ```
   # In server/.env
   # OCR Configuration
   OCR_PROVIDER="mistral" # Options: mistral, google, mock
   MISTRAL_API_KEY="your-mistral-api-key"
   GOOGLE_API_KEY="your-google-api-key" # Optional, if using Google Vision
   
   # OpenAI Configuration
   OPENAI_API_KEY="your-openai-api-key"
   OPENAI_MODEL="gpt-4o-mini" # Options: gpt-4o-mini, gpt-4o, gpt-3.5-turbo
   ```

## OCR Service

The application now features a multi-provider OCR service that can use different OCR engines:

- **Mistral OCR** (default): Uses the Mistral AI OCR API
- **Google Vision**: Uses the Google Cloud Vision API
- **Mock**: Uses predefined mock data for testing

For more details, see [OCR Service Documentation](server/OCR_SERVICE.md).

## LLM Service

The application uses an OpenAI-powered LLM service for generating intelligent responses in the chat interface:

- Uses a specialized system prompt tailored for health and ingredient analysis
- Configurable model selection (gpt-4o-mini, gpt-4o, gpt-3.5-turbo)
- Comprehensive error handling with graceful fallbacks

For more details, see [LLM Service Documentation](server/LLM_SERVICE.md).
