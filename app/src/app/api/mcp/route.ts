import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// MCP Client for connecting to Jira MCP Server
let mcpClient: Client | null = null;

async function getMCPClient(): Promise<Client> {
    if (!mcpClient) {
        mcpClient = new Client(
            {
                name: 'jira-web-client',
                version: '1.0.0',
            },
            {
                capabilities: {},
            }
        );

        // Connect to the MCP server
        const transport = new StdioClientTransport({
            command: 'npx',
            args: ['tsx', 'src/mcp/jira-mcp-server.ts'],
            env: {
                ...process.env,
                JIRA_BASE_URL: process.env.JIRA_BASE_URL || 'https://your-domain.atlassian.net',
                JIRA_EMAIL: process.env.JIRA_EMAIL || 'your-email@example.com',
                JIRA_API_TOKEN: process.env.JIRA_API_TOKEN || 'your-api-token',
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
                    message: 'Jira MCP API is running',
                    config: {
                        baseUrl: process.env.JIRA_BASE_URL || 'https://your-domain.atlassian.net',
                        email: process.env.JIRA_EMAIL || 'your-email@example.com',
                        hasToken: !!process.env.JIRA_API_TOKEN,
                    },
                });

            case 'projects':
                const projectsResult = await client.callTool({
                    name: 'jira_list_projects',
                    arguments: {},
                });
                const projectsContent = (projectsResult.content as Array<{ text: string }>)[0];
                const projects = JSON.parse(projectsContent.text);
                return NextResponse.json({
                    success: true,
                    data: projects,
                    count: projects.length,
                });

            case 'project':
                const projectId = searchParams.get('projectId');
                if (!projectId) {
                    return NextResponse.json(
                        { error: 'projectId parameter is required' },
                        { status: 400 }
                    );
                }
                const projectResult = await client.callTool({
                    name: 'jira_get_project',
                    arguments: { projectId },
                });
                const project = JSON.parse((projectResult.content as Array<{ text: string }>)[0].text);
                return NextResponse.json({
                    success: true,
                    data: project,
                });

            case 'issues':
                const issueParams = {
                    projectKey: searchParams.get('projectKey') || undefined,
                    jql: searchParams.get('jql') || undefined,
                    status: searchParams.get('status') || undefined,
                    assignee: searchParams.get('assignee') || undefined,
                    since: searchParams.get('since') || undefined,
                };
                // Remove undefined values
                const cleanIssueParams = Object.fromEntries(
                    Object.entries(issueParams).filter(([, v]) => v !== undefined)
                );
                const issuesResult = await client.callTool({
                    name: 'jira_list_issues',
                    arguments: cleanIssueParams,
                });
                const issues = JSON.parse((issuesResult.content as Array<{ text: string }>)[0].text);
                return NextResponse.json({
                    success: true,
                    data: issues.issues,
                    total: issues.total,
                });

            case 'issue':
                const issueIdOrKey = searchParams.get('issueIdOrKey');
                if (!issueIdOrKey) {
                    return NextResponse.json(
                        { error: 'issueIdOrKey parameter is required' },
                        { status: 400 }
                    );
                }
                const issueResult = await client.callTool({
                    name: 'jira_get_issue',
                    arguments: { issueIdOrKey },
                });
                const issueContent = (issueResult.content as Array<{ text: string }>)[0];
                const issue = JSON.parse(issueContent.text);
                return NextResponse.json({
                    success: true,
                    data: issue,
                });

            case 'users':
                const query = searchParams.get('query');
                if (!query) {
                    return NextResponse.json(
                        { error: 'query parameter is required for user search' },
                        { status: 400 }
                    );
                }
                const usersResult = await client.callTool({
                    name: 'jira_search_users',
                    arguments: { query },
                });
                const usersContentArray = usersResult.content as Array<{ text: string }>;
                const users = JSON.parse(usersContentArray[0].text);
                return NextResponse.json({
                    success: true,
                    data: users,
                    count: users.length,
                });

            case 'users-from-projects':
                const projectUsersResult = await client.callTool({
                    name: 'jira_get_users_from_projects',
                    arguments: {},
                });
                const projectUsersData = JSON.parse((projectUsersResult.content as Array<{ text: string }>)[0].text);
                return NextResponse.json({
                    success: true,
                    data: projectUsersData.users,
                    count: projectUsersData.users.length,
                    uniqueAccountIds: projectUsersData.totalUniqueUsers,
                });

            case 'users-by-email':
                const emailQuery = searchParams.get('emailQuery');
                if (!emailQuery) {
                    return NextResponse.json(
                        { error: 'emailQuery parameter is required' },
                        { status: 400 }
                    );
                }
                const emailUsersResult = await client.callTool({
                    name: 'jira_search_users',
                    arguments: { query: emailQuery },
                });
                const emailUsers = JSON.parse((emailUsersResult.content as Array<{ text: string }>)[0].text);
                return NextResponse.json({
                    success: true,
                    data: emailUsers,
                    count: emailUsers.length,
                });

            case 'user':
                const accountId = searchParams.get('accountId');
                if (!accountId) {
                    return NextResponse.json(
                        { error: 'accountId parameter is required' },
                        { status: 400 }
                    );
                }
                const userResult = await client.callTool({
                    name: 'jira_get_user',
                    arguments: { accountId },
                });
                const user = JSON.parse((userResult.content as Array<{ text: string }>)[0].text);
                return NextResponse.json({
                    success: true,
                    data: user,
                });

            case 'boards':
                const boardProjectKey = searchParams.get('projectKey') || undefined;
                const boardParams = boardProjectKey ? { projectKey: boardProjectKey } : {};
                const boardsResult = await client.callTool({
                    name: 'jira_list_boards',
                    arguments: boardParams,
                });
                const boards = JSON.parse((boardsResult.content as Array<{ text: string }>)[0].text);
                return NextResponse.json({
                    success: true,
                    data: boards.values,
                    count: boards.values.length,
                });

            case 'sprints':
                const boardId = searchParams.get('boardId');
                if (!boardId) {
                    return NextResponse.json(
                        { error: 'boardId parameter is required' },
                        { status: 400 }
                    );
                }
                const sprintState = searchParams.get('state') || undefined;
                const sprintParams = {
                    boardId: parseInt(boardId),
                    ...(sprintState && { state: sprintState }),
                };
                const sprintsResult = await client.callTool({
                    name: 'jira_list_sprints',
                    arguments: sprintParams,
                });
                const sprints = JSON.parse((sprintsResult.content as Array<{ text: string }>)[0].text);
                return NextResponse.json({
                    success: true,
                    data: sprints.values,
                    count: sprints.values.length,
                });

            case 'sprint-issues':
                const sprintId = searchParams.get('sprintId');
                if (!sprintId) {
                    return NextResponse.json(
                        { error: 'sprintId parameter is required' },
                        { status: 400 }
                    );
                }
                const sprintIssuesResult = await client.callTool({
                    name: 'jira_get_sprint_issues',
                    arguments: { sprintId: parseInt(sprintId) },
                });
                const sprintIssues = JSON.parse((sprintIssuesResult.content as Array<{ text: string }>)[0].text);
                return NextResponse.json({
                    success: true,
                    data: sprintIssues.issues,
                    count: sprintIssues.issues.length,
                });

            default:
                return NextResponse.json(
                    {
                        error: 'Invalid action',
                        availableActions: [
                            'health',
                            'projects',
                            'project',
                            'issues',
                            'issue',
                            'users',
                            'users-from-projects',
                            'users-by-email',
                            'user',
                            'boards',
                            'sprints',
                            'sprint-issues',
                        ],
                    },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Jira MCP Error:', error);
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
            case 'create-issue':
                const { projectKey, summary, description, type } = body;
                if (!projectKey || !summary || !description || !type) {
                    return NextResponse.json(
                        {
                            error: 'Missing required fields',
                            required: ['projectKey', 'summary', 'description', 'type'],
                        },
                        { status: 400 }
                    );
                }
                const newIssueResult = await client.callTool({
                    name: 'jira_create_issue',
                    arguments: { projectKey, summary, description, type },
                });
                const newIssue = JSON.parse((newIssueResult.content as Array<{ text: string }>)[0].text);
                return NextResponse.json({
                    success: true,
                    data: newIssue,
                    message: 'Issue created successfully',
                });

            case 'transition-issue':
                const { issueIdOrKey, transitionId } = body;
                if (!issueIdOrKey || !transitionId) {
                    return NextResponse.json(
                        {
                            error: 'Missing required fields',
                            required: ['issueIdOrKey', 'transitionId'],
                        },
                        { status: 400 }
                    );
                }
                await client.callTool({
                    name: 'jira_transition_issue',
                    arguments: { issueIdOrKey, transitionId },
                });
                return NextResponse.json({
                    success: true,
                    message: 'Issue transitioned successfully',
                });

            case 'add-comment':
                const { issueIdOrKey: commentIssueId, comment } = body;
                if (!commentIssueId || !comment) {
                    return NextResponse.json(
                        {
                            error: 'Missing required fields',
                            required: ['issueIdOrKey', 'comment'],
                        },
                        { status: 400 }
                    );
                }
                await client.callTool({
                    name: 'jira_add_comment',
                    arguments: { issueIdOrKey: commentIssueId, comment },
                });
                return NextResponse.json({
                    success: true,
                    message: 'Comment added successfully',
                });

            default:
                return NextResponse.json(
                    {
                        error: 'Invalid action',
                        availableActions: ['create-issue', 'transition-issue', 'add-comment'],
                    },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Jira MCP Error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
