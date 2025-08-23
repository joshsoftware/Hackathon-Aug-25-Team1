#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

// The API key provided by the user
const CLAUDE_API_KEY = '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';
const CLAUDE_MODEL = 'claude-3-haiku-20240307'; // You can change this to other Claude models if needed

// Available Claude models:
// - claude-3-opus-20240229
// - claude-3-sonnet-20240229
// - claude-3-haiku-20240307
// - claude-2.0
// - claude-2.1
// - claude-instant-1.2

// Create readline interface for interactive mode
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Parse command line arguments
const args = process.argv.slice(2);
let mode = 'prompt'; // Default mode
let systemPrompt = null;
let temperature = 0.7;
let maxTokens = 1024;

// Parse arguments
for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--mode' || arg === '-m') {
        mode = args[++i];
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
Claude Standalone CLI - Interact with Claude AI

Usage:
  node claude-standalone.js [options] [prompt]

Options:
  --mode, -m <mode>       Operation mode (prompt, chat)
  --system, -s <prompt>   System prompt to guide Claude's behavior
  --temperature, -t <num> Temperature setting (0.0 to 1.0, default: 0.7)
  --max-tokens <num>      Maximum tokens to generate (default: 1024)
  --help, -h              Show this help message

Modes:
  prompt     Send a single prompt to Claude (default)
  chat       Start an interactive chat session with Claude

Examples:
  node claude-standalone.js "What is the capital of France?"
  node claude-standalone.js --mode chat
  node claude-standalone.js --system "You are a helpful assistant" "Tell me about AI"
  `);
}

// Make a request to the Claude API
function callClaudeAPI(body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsedData = JSON.parse(data);
                        resolve(parsedData);
                    } catch (error) {
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                } else {
                    reject(new Error(`API request failed with status code ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Request error: ${error.message}`));
        });

        req.write(JSON.stringify(body));
        req.end();
    });
}

// Send a prompt to Claude
async function sendPrompt(prompt, options = {}) {
    const body = {
        model: CLAUDE_MODEL,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: options.temperature ?? temperature,
        max_tokens: options.maxTokens ?? maxTokens,
        ...(options.system && { system: options.system })
    };

    return callClaudeAPI(body);
}

// Send a conversation to Claude
async function sendChat(messages, options = {}) {
    const body = {
        model: CLAUDE_MODEL,
        messages,
        temperature: options.temperature ?? temperature,
        max_tokens: options.maxTokens ?? maxTokens,
        ...(options.system && { system: options.system })
    };

    return callClaudeAPI(body);
}

// Handle prompt mode
async function handlePrompt() {
    // Get all arguments that aren't options or option values
    let promptArgs = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--') || arg.startsWith('-')) {
            // Skip this option and its value
            i++;
            continue;
        }
        // Check if this arg is a value for a previous option
        const prevArg = i > 0 ? args[i - 1] : null;
        if (prevArg && (prevArg.startsWith('--') || prevArg.startsWith('-'))) {
            continue;
        }
        promptArgs.push(arg);
    }

    const prompt = promptArgs.join(' ');

    if (!prompt) {
        console.error('Error: No prompt provided. Use --help for usage information.');
        process.exit(1);
    }

    try {
        console.log('Sending prompt to Claude...');
        const response = await sendPrompt(prompt, { system: systemPrompt });

        const responseText = response.content[0].text;

        console.log('\nClaude Response:');
        console.log('----------------');
        console.log(responseText);
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
                console.log('Claude is thinking...');
                const response = await sendChat(messages, { system: systemPrompt });

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

// Main function
async function main() {
    switch (mode) {
        case 'prompt':
            await handlePrompt();
            break;
        case 'chat':
            await handleChat();
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
