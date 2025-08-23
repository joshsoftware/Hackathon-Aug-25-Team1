#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const claude_client_js_1 = require("./claude-client.js");
// Server configuration
const server = new index_js_1.Server({
    name: 'claude-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
exports.server = server;
// Initialize Claude client
const claudeConfig = {
    apiKey: process.env.CLAUDE_API_KEY || 'your-api-key',
    baseUrl: process.env.CLAUDE_BASE_URL || 'https://api.anthropic.com',
    model: process.env.CLAUDE_MODEL || 'claude-3-opus-20240229',
};
const claudeClient = new claude_client_js_1.ClaudeMCPClient(claudeConfig);
// Tool definitions
const TOOLS = [
    {
        name: 'claude_prompt',
        description: 'Send a prompt to Claude and get a completion',
        inputSchema: {
            type: 'object',
            properties: {
                prompt: {
                    type: 'string',
                    description: 'The prompt to send to Claude',
                },
                temperature: {
                    type: 'number',
                    description: 'Controls randomness. Higher values (e.g., 0.8) make output more random, lower values (e.g., 0.2) make it more deterministic.',
                },
                maxTokens: {
                    type: 'number',
                    description: 'Maximum number of tokens to generate',
                },
                system: {
                    type: 'string',
                    description: 'Optional system prompt to guide Claude\'s behavior',
                },
            },
            required: ['prompt'],
        },
    },
    {
        name: 'claude_chat',
        description: 'Send a conversation to Claude and get a response',
        inputSchema: {
            type: 'object',
            properties: {
                messages: {
                    type: 'array',
                    description: 'Array of messages in the conversation',
                    items: {
                        type: 'object',
                        properties: {
                            role: {
                                type: 'string',
                                description: 'Role of the message sender (user or assistant)',
                                enum: ['user', 'assistant'],
                            },
                            content: {
                                type: 'string',
                                description: 'Content of the message',
                            },
                        },
                        required: ['role', 'content'],
                    },
                },
                temperature: {
                    type: 'number',
                    description: 'Controls randomness. Higher values (e.g., 0.8) make output more random, lower values (e.g., 0.2) make it more deterministic.',
                },
                maxTokens: {
                    type: 'number',
                    description: 'Maximum number of tokens to generate',
                },
                system: {
                    type: 'string',
                    description: 'Optional system prompt to guide Claude\'s behavior',
                },
            },
            required: ['messages'],
        },
    },
    {
        name: 'claude_extract_data',
        description: 'Extract structured data from text using Claude',
        inputSchema: {
            type: 'object',
            properties: {
                text: {
                    type: 'string',
                    description: 'The text to extract data from',
                },
                schema: {
                    type: 'object',
                    description: 'JSON schema defining the structure of the data to extract',
                },
                instructions: {
                    type: 'string',
                    description: 'Instructions for Claude on how to extract the data',
                },
            },
            required: ['text', 'schema'],
        },
    },
    {
        name: 'claude_summarize',
        description: 'Summarize text using Claude',
        inputSchema: {
            type: 'object',
            properties: {
                text: {
                    type: 'string',
                    description: 'The text to summarize',
                },
                maxLength: {
                    type: 'number',
                    description: 'Maximum length of the summary in words',
                },
                format: {
                    type: 'string',
                    description: 'Format of the summary (paragraph or bullets)',
                    enum: ['paragraph', 'bullets'],
                },
                focus: {
                    type: 'string',
                    description: 'Aspect to focus on in the summary',
                },
            },
            required: ['text'],
        },
    },
    {
        name: 'claude_analyze_sentiment',
        description: 'Analyze sentiment of text using Claude',
        inputSchema: {
            type: 'object',
            properties: {
                text: {
                    type: 'string',
                    description: 'The text to analyze sentiment for',
                },
            },
            required: ['text'],
        },
    },
    {
        name: 'claude_generate_content',
        description: 'Generate content based on a prompt using Claude',
        inputSchema: {
            type: 'object',
            properties: {
                prompt: {
                    type: 'string',
                    description: 'The prompt for content generation',
                },
                format: {
                    type: 'string',
                    description: 'Format of the generated content',
                    enum: ['text', 'html', 'markdown'],
                },
                temperature: {
                    type: 'number',
                    description: 'Controls randomness. Higher values (e.g., 0.8) make output more random, lower values (e.g., 0.2) make it more deterministic.',
                },
                maxTokens: {
                    type: 'number',
                    description: 'Maximum number of tokens to generate',
                },
                system: {
                    type: 'string',
                    description: 'Optional system prompt to guide Claude\'s behavior',
                },
            },
            required: ['prompt'],
        },
    },
];
// List tools handler
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: TOOLS,
    };
});
// Call tool handler
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'claude_prompt': {
                const { prompt, temperature, maxTokens, system } = args;
                const response = await claudeClient.createCompletion(prompt, {
                    temperature,
                    maxTokens,
                    system,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: response.content[0].text,
                        },
                    ],
                };
            }
            case 'claude_chat': {
                const { messages, temperature, maxTokens, system } = args;
                const response = await claudeClient.createChatCompletion(messages, {
                    temperature,
                    maxTokens,
                    system,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: response.content[0].text,
                        },
                    ],
                };
            }
            case 'claude_extract_data': {
                const { text, schema, instructions = 'Extract the data according to the schema.' } = args;
                const extractedData = await claudeClient.extractData(text, schema, instructions);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(extractedData, null, 2),
                        },
                    ],
                };
            }
            case 'claude_summarize': {
                const { text, maxLength, format, focus } = args;
                const summary = await claudeClient.summarize(text, {
                    maxLength,
                    format,
                    focus,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: summary,
                        },
                    ],
                };
            }
            case 'claude_analyze_sentiment': {
                const { text } = args;
                const sentiment = await claudeClient.analyzeSentiment(text);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(sentiment, null, 2),
                        },
                    ],
                };
            }
            case 'claude_generate_content': {
                const { prompt, format, temperature, maxTokens, system } = args;
                const content = await claudeClient.generateContent(prompt, {
                    format,
                    temperature,
                    maxTokens,
                    system,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: content,
                        },
                    ],
                };
            }
            default:
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    }
    catch (error) {
        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
});
// Start the server
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('Claude MCP Server running on stdio');
}
if (require.main === module) {
    main().catch((error) => {
        console.error('Server error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=claude-mcp-server.js.map