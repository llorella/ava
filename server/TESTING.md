# Ava API Testing Guide

This document outlines the testing approach for the Ava API server.

## Test Structure

Tests are organized by endpoint category:

- `auth.test.ts`: Authentication endpoints (register, login)
- `user.test.ts`: User profile endpoints
- `scan.test.ts`: Food scanning and analysis endpoints
- `chat.test.ts`: AI assistant chat endpoints
- `index.test.ts`: API integration tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run a specific test file
npm test -- src/__tests__/auth.test.ts

# Run tests in watch mode during development
npm test -- --watch
```

## Test Utilities

Test utilities are located in `src/__tests__/utils/`:

- `testUtils.ts`: Common test utilities and mock data
  - `getMockPrisma()`: Get mocked Prisma client
  - `authenticatedRequest()`: Helper for making authenticated requests
  - Test data objects: `testUser`, `testProduct`, `testIngredients`

## Mocking Strategy

Tests use the following mocking approach:

1. **External Services**: Services like OCR and LLM are mocked at the service level
2. **Database**: Prisma client is mocked using jest-mock-extended
3. **Authentication**: JWT verification is mocked to simplify authenticated tests
4. **Password Hashing**: bcrypt is mocked for predictable results

## Test Coverage

The tests cover:

- ✅ Happy path scenarios for all endpoints
- ✅ Input validation error handling
- ✅ Authentication error scenarios
- ✅ Database-related errors
- ✅ Edge cases in business logic

## Adding New Tests

When adding new endpoints:

1. Create controller and service implementations
2. Update types as needed
3. Create test file following existing patterns
4. Mock dependencies appropriately
5. Test all success and error scenarios
6. Update this documentation if significant changes are made

## Continuous Integration

Tests are automatically run as part of the CI pipeline on GitHub Actions for:
- Pull requests to the main branch
- Direct pushes to the main branch

## Future Improvements

Potential future enhancements to testing:

- Integration tests with a test database
- End-to-end tests with real client interactions
- Performance testing for high-load scenarios
- Security testing focused on authentication and authorization