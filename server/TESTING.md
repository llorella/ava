# Ava API Testing Guide

> **Note: Testing Suite Under Reconstruction**
>
> The testing suite has been temporarily removed as part of our transition from mock implementations to real service implementations. We plan to rebuild the testing suite from scratch with a more robust approach that works with our new OpenAI-powered LLM service and other real implementations.

## Future Testing Plan

When rebuilding the testing suite, we will focus on:

1. **Unit Tests**:
   - Test individual services in isolation
   - Properly mock external dependencies (OpenAI API, database)

2. **Integration Tests**:
   - Test the interaction between services
   - Use test databases for data-related tests

3. **API Tests**:
   - Test the API endpoints
   - Focus on request/response validation

4. **Mock Strategy**:
   - Create proper mocks for external services (OpenAI)
   - Use Jest's mocking capabilities instead of separate mock files

## Running Tests

Once tests are implemented, they will be runnable with:

```bash
# Run all tests
npm test
```

## Continuous Integration

Tests will be automatically run as part of the CI pipeline on GitHub Actions for:
- Pull requests to the main branch
- Direct pushes to the main branch
