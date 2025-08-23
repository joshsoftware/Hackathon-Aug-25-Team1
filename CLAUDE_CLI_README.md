# Claude CLI Tools

This repository contains command-line tools for interacting with Claude AI using the Anthropic API. These tools allow you to send prompts to Claude, have interactive conversations, analyze sentiment, extract structured data, and more.

## Prerequisites

- Node.js installed on your system
- The Claude client library (included in this project)

## Setup

The scripts are pre-configured with the provided API key:

```
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
```

If you need to use a different API key, you can modify the `CLAUDE_API_KEY` variable in the scripts.

## Available Tools

### 1. Standalone Claude CLI (`claude-standalone.js`)

A standalone CLI tool for interacting with Claude that doesn't rely on the project's Claude client implementation. This script uses Node.js built-in modules to communicate directly with the Claude API.

#### Usage

```bash
node claude-standalone.js [options] [prompt]
```

#### Options

- `--mode, -m <mode>`: Operation mode (prompt, chat)
- `--system, -s <prompt>`: System prompt to guide Claude's behavior
- `--temperature, -t <num>`: Temperature setting (0.0 to 1.0, default: 0.7)
- `--max-tokens <num>`: Maximum tokens to generate (default: 1024)
- `--help, -h`: Show help message

#### Examples

```bash
# Simple prompt
node claude-standalone.js "What is the capital of France?"

# Interactive chat
node claude-standalone.js --mode chat

# Using system prompt
node claude-standalone.js --system "You are a helpful assistant" "Tell me about AI"
```

### 2. Simple Claude CLI (`claude-cli.js`)

A basic CLI tool for sending prompts to Claude and getting responses.

#### Usage

```bash
node claude-cli.js "Your prompt here"
```

#### Examples

```bash
node claude-cli.js "What is the capital of France?"
node claude-cli.js "Write a short poem about technology"
node claude-cli.js "show all tickets of someone"
```

### 3. Advanced Claude CLI (`claude-advanced.js`)

A more advanced CLI tool with multiple modes of operation, including chat, sentiment analysis, data extraction, and summarization.

#### Usage

```bash
node claude-advanced.js [options] [prompt]
```

#### Options

- `--mode, -m <mode>`: Operation mode (prompt, chat, sentiment, extract, summarize)
- `--input, -i <file>`: Input file path (for reading prompts or text)
- `--output, -o <file>`: Output file path (for saving responses)
- `--system, -s <prompt>`: System prompt to guide Claude's behavior
- `--temperature, -t <num>`: Temperature setting (0.0 to 1.0, default: 0.7)
- `--max-tokens <num>`: Maximum tokens to generate (default: 1024)
- `--help, -h`: Show help message

#### Modes

- **prompt**: Send a single prompt to Claude (default)
- **chat**: Start an interactive chat session with Claude
- **sentiment**: Analyze sentiment of text
- **extract**: Extract structured data from text
- **summarize**: Summarize text

#### Examples

```bash
# Simple prompt
node claude-advanced.js "What is the capital of France?"

# Interactive chat
node claude-advanced.js --mode chat

# Sentiment analysis
node claude-advanced.js --mode sentiment --input feedback.txt

# Data extraction
node claude-advanced.js --mode extract --input data.txt

# Summarization
node claude-advanced.js --mode summarize --input article.txt --max-tokens 500

# Using system prompt
node claude-advanced.js --system "You are a helpful assistant" "Tell me about AI"

# Save output to file
node claude-advanced.js "What is quantum computing?" --output quantum.txt
```

## Common Use Cases

### Getting Quick Answers

```bash
node claude-cli.js "What is the difference between REST and GraphQL?"
```

### Interactive Conversations

```bash
node claude-advanced.js --mode chat
```

### Analyzing Customer Feedback

```bash
# First, save feedback to a file
echo "I really enjoyed using your product, but the checkout process was confusing." > feedback.txt

# Then analyze sentiment
node claude-advanced.js --mode sentiment --input feedback.txt
```

### Extracting Information from Text

```bash
# First, save text to a file
echo "The meeting with John Smith and Sarah Johnson from Acme Corp is scheduled for March 15th at 2pm in New York." > meeting.txt

# Then extract structured data
node claude-advanced.js --mode extract --input meeting.txt
```

### Summarizing Long Documents

```bash
node claude-advanced.js --mode summarize --input long-article.txt --output summary.txt
```

## Customizing the Scripts

You can modify these scripts to suit your specific needs:

- Change the default model by modifying the `model` parameter in the `ClaudeMCPClient` initialization
- Add new modes or functionality to the advanced CLI
- Customize the extraction schema for specific use cases

## Troubleshooting

If you encounter issues:

1. Ensure your API key is valid and has not expired
2. Check your internet connection
3. Verify that the Claude API is available
4. For specific error messages, refer to the Anthropic API documentation

## Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Claude Models Overview](https://www.anthropic.com/claude)
