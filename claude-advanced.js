#!/usr/bin/env node

const { ClaudeMCPClient } = require('./app/src/mcp/claude-client.ts');
const fs = require('fs');
const readline = require('readline');

// The API key provided by the user
const CLAUDE_API_KEY = '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';

// Initialize the Claude client with the provided API key
const claudeClient = new ClaudeMCPClient({
    apiKey: CLAUDE_API_KEY,
    model: 'claude-3-opus-20240229' // You can change this to other Claude models if needed
});

// Create readline interface for interactive mode
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Parse command line arguments
const args = process.argv.slice(2);
let mode = 'prompt'; // Default mode
let inputFile = null;
let outputFile = null;
let systemPrompt = null;
let temperature = 0.7;
let maxTokens = 1024;

// Parse arguments
for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--mode' || arg === '-m') {
        mode = args[++i];
    } else if (arg === '--input' || arg === '-i') {
        inputFile = args[++i];
    } else if (arg === '--output' || arg === '-o') {
        outputFile = args[++i];
    } else if (arg === '--system' || arg === '-s') {
        systemPrompt = args[++i];
    } else if (arg === '--temperature' || arg === '-t') {
        temperature = parseFloat(args[++i]);
    } else if (arg === '--max-tokens') {
        maxTokens = parseInt(args[++i]);
    } else if (arg === '--help' || arg === '-h') {
        showHelp();
        process.exit(0);
    }
}

// Show help information
function showHelp() {
    console.log(`
Claude Advanced CLI - Interact with Claude AI

Usage:
  node claude-advanced.js [options] [prompt]

Options:
  --mode, -m <mode>       Operation mode (prompt, chat, sentiment, extract, summarize)
  --input, -i <file>      Input file path (for reading prompts or text)
  --output, -o <file>     Output file path (for saving responses)
  --system, -s <prompt>   System prompt to guide Claude's behavior
  --temperature, -t <num> Temperature setting (0.0 to 1.0, default: 0.7)
  --max-tokens <num>      Maximum tokens to generate (default: 1024)
  --help, -h              Show this help message

Modes:
  prompt     Send a single prompt to Claude (default)
  chat       Start an interactive chat session with Claude
  sentiment  Analyze sentiment of text
  extract    Extract structured data from text
  summarize  Summarize text

Examples:
  node claude-advanced.js "What is the capital of France?"
  node claude-advanced.js --mode chat
  node claude-advanced.js --mode sentiment --input feedback.txt
  node claude-advanced.js --mode extract --input data.txt
  node claude-advanced.js --mode summarize --input article.txt --max-tokens 500
  node claude-advanced.js --system "You are a helpful assistant" "Tell me about AI"
  `);
}

// Read input from file or use command line arguments
async function getInput() {
    if (inputFile) {
        try {
            return fs.readFileSync(inputFile, 'utf8');
        } catch (error) {
            console.error(`Error reading input file: ${error.message}`);
            process.exit(1);
        }
    } else {
        const remainingArgs = args.filter(arg =>
            arg !== '--mode' && arg !== '-m' &&
            arg !== '--input' && arg !== '-i' &&
            arg !== '--output' && arg !== '-o' &&
            arg !== '--system' && arg !== '-s' &&
            arg !== '--temperature' && arg !== '-t' &&
            arg !== '--max-tokens' &&
            args.indexOf(arg) !== args.indexOf('--mode') + 1 &&
            args.indexOf(arg) !== args.indexOf('-m') + 1 &&
            args.indexOf(arg) !== args.indexOf('--input') + 1 &&
            args.indexOf(arg) !== args.indexOf('-i') + 1 &&
            args.indexOf(arg) !== args.indexOf('--output') + 1 &&
            args.indexOf(arg) !== args.indexOf('-o') + 1 &&
            args.indexOf(arg) !== args.indexOf('--system') + 1 &&
            args.indexOf(arg) !== args.indexOf('-s') + 1 &&
            args.indexOf(arg) !== args.indexOf('--temperature') + 1 &&
            args.indexOf(arg) !== args.indexOf('-t') + 1 &&
            args.indexOf(arg) !== args.indexOf('--max-tokens') + 1
        );

        return remainingArgs.join(' ');
    }
}

// Save output to file
function saveOutput(content) {
    if (outputFile) {
        try {
            fs.writeFileSync(outputFile, content);
            console.log(`Response saved to ${outputFile}`);
        } catch (error) {
            console.error(`Error saving output file: ${error.message}`);
        }
    }
}

// Handle prompt mode
async function handlePrompt(input) {
    if (!input) {
        console.error('Error: No prompt provided. Use --help for usage information.');
        process.exit(1);
    }

    try {
        console.log('Sending prompt to Claude...');
        const response = await claudeClient.createCompletion(input, {
            temperature,
            maxTokens,
            system: systemPrompt
        });

        const responseText = response.content[0].text;

        console.log('\nClaude Response:');
        console.log('----------------');
        console.log(responseText);
        console.log('\nToken Usage:');
        console.log(`Input tokens: ${response.usage.input_tokens}`);
        console.log(`Output tokens: ${response.usage.output_tokens}`);
        console.log(`Total tokens: ${response.usage.input_tokens + response.usage.output_tokens}`);

        saveOutput(responseText);
    } catch (error) {
        console.error('Error communicating with Claude:', error.message);
    }
}

// Handle chat mode
async function handleChat() {
    console.log('Starting chat with Claude. Type "exit" or "quit" to end the conversation.');
    console.log('----------------');

    const messages = [];
    if (systemPrompt) {
        console.log(`[System prompt set: "${systemPrompt}"]`);
    }

    const askQuestion = () => {
        rl.question('You: ', async (input) => {
            if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
                rl.close();
                return;
            }

            messages.push({ role: 'user', content: input });

            try {
                const response = await claudeClient.createChatCompletion(messages, {
                    temperature,
                    maxTokens,
                    system: systemPrompt
                });

                const responseText = response.content[0].text;
                console.log(`\nClaude: ${responseText}\n`);

                messages.push({ role: 'assistant', content: responseText });

                askQuestion();
            } catch (error) {
                console.error('Error communicating with Claude:', error.message);
                askQuestion();
            }
        });
    };

    askQuestion();
}

// Handle sentiment analysis mode
async function handleSentiment(input) {
    if (!input) {
        console.error('Error: No text provided for sentiment analysis. Use --help for usage information.');
        process.exit(1);
    }

    try {
        console.log('Analyzing sentiment...');
        const sentiment = await claudeClient.analyzeSentiment(input);

        console.log('\nSentiment Analysis:');
        console.log('-------------------');
        console.log(`Sentiment: ${sentiment.sentiment}`);
        console.log(`Score: ${sentiment.score}`);
        console.log(`Explanation: ${sentiment.explanation}`);

        saveOutput(JSON.stringify(sentiment, null, 2));
    } catch (error) {
        console.error('Error analyzing sentiment:', error.message);
    }
}

// Handle data extraction mode
async function handleExtract(input) {
    if (!input) {
        console.error('Error: No text provided for data extraction. Use --help for usage information.');
        process.exit(1);
    }

    // Define a default schema for extraction
    const defaultSchema = {
        type: 'object',
        properties: {
            entities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Named entities mentioned in the text'
            },
            topics: {
                type: 'array',
                items: { type: 'string' },
                description: 'Main topics discussed in the text'
            },
            summary: {
                type: 'string',
                description: 'Brief summary of the text'
            },
            keyPoints: {
                type: 'array',
                items: { type: 'string' },
                description: 'Key points from the text'
            }
        }
    };

    try {
        console.log('Extracting data...');
        const extractedData = await claudeClient.extractData(
            input,
            defaultSchema,
            'Extract the main entities, topics, and key points from this text. Provide a brief summary.'
        );

        console.log('\nExtracted Data:');
        console.log('---------------');
        console.log(JSON.stringify(extractedData, null, 2));

        saveOutput(JSON.stringify(extractedData, null, 2));
    } catch (error) {
        console.error('Error extracting data:', error.message);
    }
}

// Handle summarization mode
async function handleSummarize(input) {
    if (!input) {
        console.error('Error: No text provided for summarization. Use --help for usage information.');
        process.exit(1);
    }

    try {
        console.log('Generating summary...');
        const summary = await claudeClient.summarize(input, {
            maxLength: maxTokens / 4, // Rough estimate for word count
            format: 'paragraph'
        });

        console.log('\nSummary:');
        console.log('---------');
        console.log(summary);

        saveOutput(summary);
    } catch (error) {
        console.error('Error generating summary:', error.message);
    }
}

// Main function
async function main() {
    const input = await getInput();

    switch (mode) {
        case 'prompt':
            await handlePrompt(input);
            break;
        case 'chat':
            await handleChat();
            break;
        case 'sentiment':
            await handleSentiment(input);
            break;
        case 'extract':
            await handleExtract(input);
            break;
        case 'summarize':
            await handleSummarize(input);
            break;
        default:
            console.error(`Error: Unknown mode '${mode}'. Use --help for usage information.`);
            process.exit(1);
    }

    // Close readline interface if not in chat mode
    if (mode !== 'chat') {
        rl.close();
    }
}

// Start the program
main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
});
