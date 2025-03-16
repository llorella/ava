# OCR Service Documentation

This document provides information about the OCR (Optical Character Recognition) service in the Ava application, which now supports multiple providers.

## Overview

The OCR service is responsible for extracting text from images, particularly ingredient lists from product labels. The service has been refactored to support multiple OCR providers, making it easy to swap between them for testing and capability improvements.

## Supported Providers

The OCR service currently supports the following providers:

1. **Mistral OCR** (default) - Uses the Mistral AI OCR API
2. **Google Vision** - Uses the Google Cloud Vision API
3. **Mock** - Uses predefined mock data for testing

## Configuration

The OCR provider can be configured in the `.env` file:

```
# OCR Configuration
OCR_PROVIDER="mistral" # Options: mistral, google, mock
MISTRAL_API_KEY="your-mistral-api-key"
GOOGLE_API_KEY="your-google-api-key"
```

## Usage

### Basic Usage

The OCR service can be used as follows:

```typescript
import ocrService from './services/ocr';

// Extract text from an image
const imageBuffer = fs.readFileSync('path/to/image.jpg');
const extractedText = await ocrService.extractText(imageBuffer);
console.log(extractedText);
```

### Switching Providers Programmatically

You can switch providers programmatically:

```typescript
import ocrService from './services/ocr';

// Switch to Google Vision provider
ocrService.setProvider('google');

// Switch to mock provider for testing
ocrService.setProvider('mock');

// Switch back to Mistral
ocrService.setProvider('mistral');
```

## Testing

A utility function is provided for testing to easily switch between providers:

```typescript
import { setOcrProviderForTest } from './utils/testUtils';

// In your test
setOcrProviderForTest('mock');
```

Example test cases can be found in `server/src/__tests__/ocr.test.ts`.

## Adding New Providers

To add a new OCR provider:

1. Update the `OcrProvider` type in `ocr.ts`:

```typescript
type OcrProvider = 'mistral' | 'google' | 'mock' | 'new-provider';
```

2. Add a new method to extract text using the new provider:

```typescript
private async extractWithNewProvider(base64Image: string): Promise<OcrResult> {
  // Implementation for the new provider
}
```

3. Update the switch statement in the `extractText` method:

```typescript
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
  case 'new-provider':
    result = await this.extractWithNewProvider(base64Image);
    break;
  default:
    throw new Error(`Unsupported OCR provider: ${this.provider}`);
}
```

4. Update the `.env` file to include any necessary API keys for the new provider.

## Error Handling

The OCR service includes error handling for each provider. If a provider fails, it will throw an error with a descriptive message. You can implement fallback mechanisms by catching these errors and switching to a different provider.

## Performance Considerations

Different OCR providers may have different performance characteristics, accuracy, and cost. Consider the following when choosing a provider:

- **Mistral OCR**: Good general-purpose OCR with support for multiple languages
- **Google Vision**: High accuracy with advanced features like document text detection
- **Mock**: Zero latency but fixed responses, suitable for testing only

## Future Improvements

Potential future improvements for the OCR service:

1. Add more OCR providers (AWS Textract, Azure Computer Vision, etc.)
2. Implement fallback mechanisms if a provider fails
3. Add caching to improve performance and reduce API costs
4. Add metrics to compare provider performance
5. Implement provider-specific configuration options
