#!/usr/bin/env node

const { ClaudeMCPClient } = require('./app/src/mcp/claude-client.ts');

// The API key provided by the user
const CLAUDE_API_KEY = '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';

// Initialize the Claude client with the provided API key
const claudeClient = new ClaudeMCPClient({
    apiKey: CLAUDE_API_KEY,
    model: 'claude-3-opus-20240229' // You can change this to other Claude models if needed
});

// Get the prompt from command line arguments
const args = process.argv.slice(2);
const prompt = args.join(' ');

if (!prompt) {
    console.log(`
Claude CLI - Send prompts to Claude AI

Usage:
  node claude-cli.js "Your prompt here"

Examples:
  node claude-cli.js "What is the capital of France?"
  node claude-cli.js "Write a short poem about technology"
  node claude-cli.js "show all tickets of someone"
  `);
    process.exit(1);
}

// Send the prompt to Claude and get the response
async function sendPrompt() {
    try {
        console.log('Sending prompt to Claude...');
        const response = await claudeClient.createCompletion(prompt);

        console.log('\nClaude Response:');
        console.log('----------------');
        console.log(response.content[0].text);
        console.log('\nToken Usage:');
        console.log(`Input tokens: ${response.usage.input_tokens}`);
        console.log(`Output tokens: ${response.usage.output_tokens}`);
        console.log(`Total tokens: ${response.usage.input_tokens + response.usage.output_tokens}`);
    } catch (error) {
        console.error('Error communicating with Claude:', error.message);
        if (error.message.includes('API key')) {
            console.error('Please check that your API key is valid and has not expired.');
        }
    }
}

sendPrompt();
