# Ava Development Guidelines

## Build & Run Commands
- **Setup**: `npm run setup` (installs all dependencies)
- **Dev Servers**: `npm run dev` (runs both client and server concurrently)
- **Client**: `npm run client` (runs React Native Expo app)
- **Server**: `npm run server` (runs Express server with hot reload)
- **Database**:
  - Migrations: `cd server && npm run prisma:migrate`
  - Generate client: `cd server && npm run prisma:generate`
  - Database GUI: `cd server && npm run prisma:studio`
  - Seed database: `cd server && npm run seed`

## Code Structure
- **Client**:
  - `/src/components`: Reusable UI components (Button, Input, etc.)
  - `/src/screens`: Screen components for navigation
  - `/src/context`: React Context providers for state management
  - `/src/services`: API services for backend communication
  - `/src/types`: TypeScript type definitions

- **Server**:
  - `/src/controllers`: Route handlers (request validation, service calls)
  - `/src/services`: Business logic and data access
  - `/src/middleware`: Express middleware (auth, error handling)
  - `/src/routes`: Express route definitions
  - `/src/mocks`: Mock services for OCR and LLM (development)
  - `/prisma`: Database schema and migrations

## Code Style Guidelines
- **TypeScript**:
  - Use strict mode for type safety
  - Define interfaces for all data models and API payloads
  - Properly type React components and props
  - Use type inference where appropriate but explicit return types for functions

- **React & React Native**:
  - Use functional components with hooks
  - Create small, focused components (<200 lines)
  - Use React Context for global state
  - Follow React Navigation patterns for screen navigation
  - Implement responsive designs

- **Naming Conventions**:
  - `PascalCase` for components, interfaces, and types
  - `camelCase` for variables, functions, and methods
  - Use descriptive names (avoid abbreviations)
  - Prefix interface props with `I` (e.g., `IButtonProps`)

- **Imports & Organization**:
  - Use absolute imports with `@/` prefix on client
  - Group imports: React/RN, third-party, local
  - Organize component code: imports, types, component, exports

- **Error Handling**:
  - Use try/catch blocks for async operations
  - Log errors with appropriate context
  - Return descriptive error messages to the client
  - Use Zod (server) and Yup (client) for validation

- **API Services**:
  - Organize by resource (auth, user, scan, chat)
  - Use axios interceptors for auth tokens
  - Type all request/response interfaces
  - Handle network errors gracefully

- **Database**:
  - Use Prisma for database operations
  - Define clear schema with relationships
  - Use migrations for schema changes
  - Add descriptive comments to schema

## Best Practices
- **Architecture**:
  - Follow controller-service pattern on backend
  - Use React Context for state management on frontend
  - Implement proper separation of concerns
  - Create mockable services for testing

- **Security**:
  - Validate all inputs with Zod schemas
  - Use JWT for authentication with proper expiration
  - Hash passwords with bcrypt
  - Don't expose sensitive data to the client

- **Performance**:
  - Minimize rerenders with React.memo when appropriate
  - Use pagination for large datasets
  - Implement proper loading states
  - Cache results when appropriate

- **Documentation**:
  - Add JSDoc comments to functions and interfaces
  - Document API endpoints
  - Create meaningful commit messages
  - Update README.md with new features

## Testing (Future Implementation)
- Implement Jest for unit testing
- Use React Native Testing Library for component tests
- Create end-to-end tests with Detox
- Mock external services and API calls