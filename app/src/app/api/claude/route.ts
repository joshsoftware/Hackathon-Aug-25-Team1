import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// MCP Client for connecting to Claude MCP Server
let mcpClient: Client | null = null;

async function getMCPClient(): Promise<Client> {
    if (!mcpClient) {
        mcpClient = new Client(
            {
                name: 'claude-web-client',
                version: '1.0.0',
            },
            {
                capabilities: {},
            }
        );

        // Connect to the MCP server
        const transport = new StdioClientTransport({
            command: 'npx',
            args: ['tsx', 'src/mcp/claude-mcp-server.ts'],
            env: {
                ...process.env,
                CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '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',
                CLAUDE_MODEL: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
            },
        });

        await mcpClient.connect(transport);
    }
    return mcpClient;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    try {
        const client = await getMCPClient();

        switch (action) {
            case 'health':
                return NextResponse.json({
                    status: 'ok',
                    message: 'Claude MCP API is running',
                    config: {
                        model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
                        hasApiKey: !!process.env.CLAUDE_API_KEY,
                    },
                });

            default:
                return NextResponse.json(
                    {
                        error: 'Invalid action',
                        availableActions: [
                            'health',
                        ],
                    },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Claude MCP Error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    try {
        const client = await getMCPClient();
        const body = await request.json();

        switch (action) {
            case 'jira-prompt':
                const { prompt: jiraPrompt } = body;
                if (!jiraPrompt) {
                    return NextResponse.json(
                        {
                            error: 'Missing required fields',
                            required: ['prompt'],
                        },
                        { status: 400 }
                    );
                }

                // First, use Claude to interpret the prompt
                const interpretationPrompt = `
You are an assistant that helps users interact with Jira. Analyze the following prompt and determine:
1. What Jira action the user wants to perform
2. What parameters are needed for that action

Available Jira actions:
- list_projects: List all Jira projects
- get_project: Get details of a specific project (requires projectId)
- list_issues: List issues with optional filters (can filter by projectKey, status, assignee, or use JQL)
- get_issue: Get details of a specific issue (requires issueIdOrKey)
- create_issue: Create a new issue (requires projectKey, summary, description, type)
- add_comment: Add a comment to an issue (requires issueIdOrKey, comment)
- list_users: Search for users (requires query)
- list_boards: List Jira boards (can filter by projectKey)
- list_sprints: List sprints for a board (requires boardId)
- get_sprint_issues: Get issues in a sprint (requires sprintId)

User prompt: "${jiraPrompt}"

Respond with a JSON object containing:
{
  "action": "the_jira_action",
  "parameters": {
    // parameters needed for the action
  },
  "explanation": "brief explanation of what the user wants"
}
`;

                const interpretationResult = await client.callTool({
                    name: 'claude_prompt',
                    arguments: {
                        prompt: interpretationPrompt,
                        temperature: 0.1,
                    },
                });

                const interpretationText = (interpretationResult.content as Array<{ text: string }>)[0].text;

                // Extract the JSON from the response
                const jsonMatch = interpretationText.match(/```json\n([\s\S]*?)\n```/) ||
                    interpretationText.match(/```\n([\s\S]*?)\n```/) ||
                    [null, interpretationText];

                const jsonStr = jsonMatch[1].trim();
                const interpretation = JSON.parse(jsonStr);

                return NextResponse.json({
                    success: true,
                    data: interpretation,
                });
            case 'prompt':
                const { prompt: claudePrompt, temperature, maxTokens, system } = body;
                if (!claudePrompt) {
                    return NextResponse.json(
                        {
                            error: 'Missing required fields',
                            required: ['prompt'],
                        },
                        { status: 400 }
                    );
                }
                const promptResult = await client.callTool({
                    name: 'claude_prompt',
                    arguments: {
                        prompt: claudePrompt,
                        temperature,
                        maxTokens,
                        system
                    },
                });
                return NextResponse.json({
                    success: true,
                    data: (promptResult.content as Array<{ text: string }>)[0].text,
                });

            case 'chat':
                const { messages } = body;
                if (!messages || !Array.isArray(messages)) {
                    return NextResponse.json(
                        {
                            error: 'Missing required fields',
                            required: ['messages (array)'],
                        },
                        { status: 400 }
                    );
                }
                const chatResult = await client.callTool({
                    name: 'claude_chat',
                    arguments: {
                        messages,
                        temperature: body.temperature,
                        maxTokens: body.maxTokens,
                        system: body.system
                    },
                });
                return NextResponse.json({
                    success: true,
                    data: (chatResult.content as Array<{ text: string }>)[0].text,
                });

            case 'extract-data':
                const { text, schema, instructions } = body;
                if (!text || !schema) {
                    return NextResponse.json(
                        {
                            error: 'Missing required fields',
                            required: ['text', 'schema'],
                        },
                        { status: 400 }
                    );
                }
                const extractResult = await client.callTool({
                    name: 'claude_extract_data',
                    arguments: { text, schema, instructions },
                });
                return NextResponse.json({
                    success: true,
                    data: JSON.parse((extractResult.content as Array<{ text: string }>)[0].text),
                });

            case 'summarize':
                const { text: summaryText, maxLength, format, focus } = body;
                if (!summaryText) {
                    return NextResponse.json(
                        {
                            error: 'Missing required fields',
                            required: ['text'],
                        },
                        { status: 400 }
                    );
                }
                const summaryResult = await client.callTool({
                    name: 'claude_summarize',
                    arguments: { text: summaryText, maxLength, format, focus },
                });
                return NextResponse.json({
                    success: true,
                    data: (summaryResult.content as Array<{ text: string }>)[0].text,
                });

            case 'analyze-sentiment':
                const { text: sentimentText } = body;
                if (!sentimentText) {
                    return NextResponse.json(
                        {
                            error: 'Missing required fields',
                            required: ['text'],
                        },
                        { status: 400 }
                    );
                }
                const sentimentResult = await client.callTool({
                    name: 'claude_analyze_sentiment',
                    arguments: { text: sentimentText },
                });
                return NextResponse.json({
                    success: true,
                    data: JSON.parse((sentimentResult.content as Array<{ text: string }>)[0].text),
                });

            case 'generate-content':
                const { prompt: contentPrompt, format: contentFormat } = body;
                if (!contentPrompt) {
                    return NextResponse.json(
                        {
                            error: 'Missing required fields',
                            required: ['prompt'],
                        },
                        { status: 400 }
                    );
                }
                const contentResult = await client.callTool({
                    name: 'claude_generate_content',
                    arguments: {
                        prompt: contentPrompt,
                        format: contentFormat,
                        temperature: body.temperature,
                        maxTokens: body.maxTokens,
                        system: body.system
                    },
                });
                return NextResponse.json({
                    success: true,
                    data: (contentResult.content as Array<{ text: string }>)[0].text,
                });

            default:
                return NextResponse.json(
                    {
                        error: 'Invalid action',
                        availableActions: [
                            'prompt',
                            'chat',
                            'extract-data',
                            'summarize',
                            'analyze-sentiment',
                            'generate-content',
                            'jira-prompt'
                        ],
                    },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Claude MCP Error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
