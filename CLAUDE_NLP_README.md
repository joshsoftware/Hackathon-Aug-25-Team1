# Claude NLP Integration

This project integrates Claude, Anthropic's powerful AI assistant, into the application using the Model Context Protocol (MCP). This integration enables natural language processing capabilities including prompting, data extraction, sentiment analysis, and more.

## Features

- **Prompting**: Send prompts to Claude and get completions
- **Chat**: Have multi-turn conversations with Claude
- **Data Extraction**: Extract structured data from unstructured text
- **Sentiment Analysis**: Analyze the sentiment of text
- **Summarization**: Generate concise summaries of longer texts
- **Entity Extraction**: Identify entities like people, organizations, and locations
- **Content Generation**: Generate content based on prompts

## Setup

1. **Configure Claude API Key**:
   - Get an API key from [Anthropic](https://www.anthropic.com/)
   - Add your API key to the `mcp-config.json` file:

     ```json
     "claude": {
         "command": "node",
         "args": [
             "app/dist/mcp/claude-mcp-server.js"
         ],
         "env": {
             "CLAUDE_API_KEY": "your-api-key-here",
             "CLAUDE_MODEL": "claude-3-opus-20240229"
         }
     }
     ```

2. **Build the Project**:

   ```bash
   cd app
   npm install
   npm run build
   ```

3. **Start the Application**:

   ```bash
   npm run start
   ```

## Usage

### Frontend Demo

The application includes a demo component that showcases Claude's capabilities. You can:

- Send prompts to Claude
- Analyze sentiment of text
- Extract entities from text
- Summarize text

### API Endpoints

The Claude API is accessible through the following endpoints:

#### GET Endpoints

- `GET /api/claude?action=health`: Check the health of the Claude MCP server

#### POST Endpoints

- `POST /api/claude?action=prompt`: Send a prompt to Claude

  ```json
  {
    "prompt": "Explain quantum computing in simple terms",
    "temperature": 0.7,
    "maxTokens": 1000,
    "system": "You are a helpful assistant that explains complex topics simply."
  }
  ```

- `POST /api/claude?action=chat`: Have a conversation with Claude

  ```json
  {
    "messages": [
      {"role": "user", "content": "Hello, can you help me with something?"},
      {"role": "assistant", "content": "Of course! What can I help you with?"},
      {"role": "user", "content": "Explain the difference between REST and GraphQL"}
    ],
    "temperature": 0.7
  }
  ```

- `POST /api/claude?action=extract-data`: Extract structured data from text

  ```json
  {
    "text": "John Smith was born on January 15, 1980 in New York City. He works at Acme Corporation as a Senior Engineer.",
    "schema": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "birthDate": {"type": "string"},
        "birthPlace": {"type": "string"},
        "employer": {"type": "string"},
        "jobTitle": {"type": "string"}
      }
    },
    "instructions": "Extract the person's details from the text."
  }
  ```

- `POST /api/claude?action=summarize`: Summarize text

  ```json
  {
    "text": "Long text to summarize...",
    "maxLength": 100,
    "format": "paragraph"
  }
  ```

- `POST /api/claude?action=analyze-sentiment`: Analyze sentiment of text

  ```json
  {
    "text": "I absolutely love this product! It's amazing and has exceeded all my expectations."
  }
  ```

- `POST /api/claude?action=generate-content`: Generate content based on a prompt

  ```json
  {
    "prompt": "Write a short blog post about sustainable living",
    "format": "markdown",
    "temperature": 0.8
  }
  ```

## Utility Functions

The project includes a utility class `ClaudeDataFetcher` that provides easy access to Claude's capabilities:

```typescript
import ClaudeDataFetcher from '../utils/claude-data-fetcher';

const claudeDataFetcher = new ClaudeDataFetcher();

// Send a prompt to Claude
const response = await claudeDataFetcher.prompt("Explain quantum computing");

// Analyze sentiment
const sentiment = await claudeDataFetcher.analyzeSentiment("I love this product!");

// Extract entities
const entities = await claudeDataFetcher.extractEntities("Apple Inc. announced a new iPhone at their headquarters in Cupertino.");

// Summarize text
const summary = await claudeDataFetcher.summarize(longText, { maxLength: 100 });

// Extract meeting points from a transcript
const meetingData = await claudeDataFetcher.extractMeetingPoints(meetingTranscript);

// Analyze customer feedback
const feedbackAnalysis = await claudeDataFetcher.analyzeFeedback(customerFeedback);
```

## Architecture

The Claude integration uses the Model Context Protocol (MCP) architecture:

1. **Claude Client** (`claude-client.ts`): Handles direct communication with the Claude API
2. **Claude MCP Server** (`claude-mcp-server.ts`): Implements the MCP server that exposes Claude's capabilities as tools
3. **API Routes** (`app/api/claude/route.ts`): Next.js API routes that connect to the Claude MCP server
4. **Data Fetcher** (`claude-data-fetcher.ts`): Utility class for easy access to Claude's capabilities
5. **Demo Component** (`ClaudeDemo.tsx`): React component that demonstrates Claude's capabilities

## Models

By default, the integration uses the `claude-3-opus-20240229` model, but you can change this in the configuration. Available models include:

- `claude-3-opus-20240229`: Most powerful model, best for complex tasks
- `claude-3-sonnet-20240229`: Balanced model for most tasks
- `claude-3-haiku-20240307`: Fastest and most cost-effective model

## Limitations

- The Claude API has rate limits that may affect usage
- Processing large amounts of text may take time and consume more tokens
- The quality of extracted data depends on the clarity of instructions and schema

## Troubleshooting

- **API Key Issues**: Ensure your Claude API key is correctly set in the configuration
- **Connection Problems**: Check that the Claude MCP server is running
- **Rate Limiting**: If you encounter rate limiting, consider implementing backoff strategies
- **Large Responses**: For large responses, consider increasing the `maxTokens` parameter

## Further Development

- Implement streaming responses for better user experience
- Add more specialized data extraction utilities
- Create domain-specific prompting templates
- Implement caching for common queries
