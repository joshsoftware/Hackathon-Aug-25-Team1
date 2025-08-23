#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { JiraMCPClient, JiraConfig } from './client.js';

// Server configuration
const server = new Server(
    {
        name: 'jira-mcp-server',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Initialize Jira client
const jiraConfig: JiraConfig = {
    baseUrl: process.env.JIRA_BASE_URL || 'https://your-domain.atlassian.net',
    email: process.env.JIRA_EMAIL || 'your-email@example.com',
    apiToken: process.env.JIRA_API_TOKEN || 'your-api-token',
};

const jiraClient = new JiraMCPClient(jiraConfig);

// Tool definitions
const TOOLS = [
    {
        name: 'jira_list_projects',
        description: 'List all Jira projects',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'jira_get_project',
        description: 'Get details of a specific Jira project',
        inputSchema: {
            type: 'object',
            properties: {
                projectId: {
                    type: 'string',
                    description: 'The project ID or key',
                },
            },
            required: ['projectId'],
        },
    },
    {
        name: 'jira_list_issues',
        description: 'List Jira issues with optional filters',
        inputSchema: {
            type: 'object',
            properties: {
                projectKey: {
                    type: 'string',
                    description: 'Filter by project key',
                },
                jql: {
                    type: 'string',
                    description: 'JQL query string',
                },
                status: {
                    type: 'string',
                    description: 'Filter by status',
                },
                assignee: {
                    type: 'string',
                    description: 'Filter by assignee',
                },
                since: {
                    type: 'string',
                    description: 'Filter by updated date (YYYY-MM-DD)',
                },
            },
        },
    },
    {
        name: 'jira_get_issue',
        description: 'Get details of a specific Jira issue',
        inputSchema: {
            type: 'object',
            properties: {
                issueIdOrKey: {
                    type: 'string',
                    description: 'The issue ID or key',
                },
            },
            required: ['issueIdOrKey'],
        },
    },
    {
        name: 'jira_create_issue',
        description: 'Create a new Jira issue',
        inputSchema: {
            type: 'object',
            properties: {
                projectKey: {
                    type: 'string',
                    description: 'The project key',
                },
                summary: {
                    type: 'string',
                    description: 'Issue summary/title',
                },
                description: {
                    type: 'string',
                    description: 'Issue description',
                },
                type: {
                    type: 'string',
                    description: 'Issue type (e.g., Task, Bug, Story)',
                },
            },
            required: ['projectKey', 'summary', 'description', 'type'],
        },
    },
    {
        name: 'jira_transition_issue',
        description: 'Transition a Jira issue to a different status',
        inputSchema: {
            type: 'object',
            properties: {
                issueIdOrKey: {
                    type: 'string',
                    description: 'The issue ID or key',
                },
                transitionId: {
                    type: 'string',
                    description: 'The transition ID',
                },
            },
            required: ['issueIdOrKey', 'transitionId'],
        },
    },
    {
        name: 'jira_add_comment',
        description: 'Add a comment to a Jira issue',
        inputSchema: {
            type: 'object',
            properties: {
                issueIdOrKey: {
                    type: 'string',
                    description: 'The issue ID or key',
                },
                comment: {
                    type: 'string',
                    description: 'The comment text',
                },
            },
            required: ['issueIdOrKey', 'comment'],
        },
    },
    {
        name: 'jira_search_users',
        description: 'Search for Jira users',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query (name, email, or domain)',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'jira_get_user',
        description: 'Get details of a specific Jira user',
        inputSchema: {
            type: 'object',
            properties: {
                accountId: {
                    type: 'string',
                    description: 'The user account ID',
                },
            },
            required: ['accountId'],
        },
    },
    {
        name: 'jira_list_boards',
        description: 'List Jira boards (Agile)',
        inputSchema: {
            type: 'object',
            properties: {
                projectKey: {
                    type: 'string',
                    description: 'Filter by project key',
                },
            },
        },
    },
    {
        name: 'jira_list_sprints',
        description: 'List sprints for a board',
        inputSchema: {
            type: 'object',
            properties: {
                boardId: {
                    type: 'number',
                    description: 'The board ID',
                },
                state: {
                    type: 'string',
                    description: 'Sprint state (active, closed, future)',
                },
            },
            required: ['boardId'],
        },
    },
    {
        name: 'jira_get_sprint_issues',
        description: 'Get issues in a specific sprint',
        inputSchema: {
            type: 'object',
            properties: {
                sprintId: {
                    type: 'number',
                    description: 'The sprint ID',
                },
            },
            required: ['sprintId'],
        },
    },
    {
        name: 'jira_get_users_from_projects',
        description: 'Extract all unique users from project issues',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    // Enhanced ticket operations
    {
        name: 'jira_update_issue_status',
        description: 'Update ticket status by status name (e.g., "In Progress", "Done")',
        inputSchema: {
            type: 'object',
            properties: {
                issueIdOrKey: {
                    type: 'string',
                    description: 'The issue ID or key',
                },
                statusName: {
                    type: 'string',
                    description: 'The target status name (e.g., "In Progress", "Done", "To Do")',
                },
            },
            required: ['issueIdOrKey', 'statusName'],
        },
    },
    {
        name: 'jira_close_issue',
        description: 'Close/resolve a ticket with optional resolution',
        inputSchema: {
            type: 'object',
            properties: {
                issueIdOrKey: {
                    type: 'string',
                    description: 'The issue ID or key',
                },
                resolution: {
                    type: 'string',
                    description: 'Resolution type (e.g., "Fixed", "Won\'t Fix", "Duplicate")',
                },
            },
            required: ['issueIdOrKey'],
        },
    },
    {
        name: 'jira_get_issue_transitions',
        description: 'Get available status transitions for a ticket',
        inputSchema: {
            type: 'object',
            properties: {
                issueIdOrKey: {
                    type: 'string',
                    description: 'The issue ID or key',
                },
            },
            required: ['issueIdOrKey'],
        },
    },
    // Enhanced comment operations
    {
        name: 'jira_get_issue_comments',
        description: 'Get all comments for a ticket',
        inputSchema: {
            type: 'object',
            properties: {
                issueIdOrKey: {
                    type: 'string',
                    description: 'The issue ID or key',
                },
            },
            required: ['issueIdOrKey'],
        },
    },
    {
        name: 'jira_update_comment',
        description: 'Update an existing comment on a ticket',
        inputSchema: {
            type: 'object',
            properties: {
                issueIdOrKey: {
                    type: 'string',
                    description: 'The issue ID or key',
                },
                commentId: {
                    type: 'string',
                    description: 'The comment ID to update',
                },
                comment: {
                    type: 'string',
                    description: 'The updated comment text',
                },
            },
            required: ['issueIdOrKey', 'commentId', 'comment'],
        },
    },
    {
        name: 'jira_delete_comment',
        description: 'Delete a comment from a ticket',
        inputSchema: {
            type: 'object',
            properties: {
                issueIdOrKey: {
                    type: 'string',
                    description: 'The issue ID or key',
                },
                commentId: {
                    type: 'string',
                    description: 'The comment ID to delete',
                },
            },
            required: ['issueIdOrKey', 'commentId'],
        },
    },
    // Issue dependencies and linking
    {
        name: 'jira_get_issue_dependencies',
        description: 'Get all dependencies and links for a ticket (blocks, blocked by, relates to, etc.)',
        inputSchema: {
            type: 'object',
            properties: {
                issueIdOrKey: {
                    type: 'string',
                    description: 'The issue ID or key',
                },
            },
            required: ['issueIdOrKey'],
        },
    },
    {
        name: 'jira_create_issue_link',
        description: 'Create a dependency link between two tickets',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    description: 'Link type (e.g., "Blocks", "Relates", "Duplicates")',
                },
                inwardIssue: {
                    type: 'string',
                    description: 'The inward issue key (e.g., the issue that blocks)',
                },
                outwardIssue: {
                    type: 'string',
                    description: 'The outward issue key (e.g., the issue that is blocked)',
                },
                comment: {
                    type: 'string',
                    description: 'Optional comment for the link',
                },
            },
            required: ['type', 'inwardIssue', 'outwardIssue'],
        },
    },
    {
        name: 'jira_delete_issue_link',
        description: 'Remove a dependency link between tickets',
        inputSchema: {
            type: 'object',
            properties: {
                linkId: {
                    type: 'string',
                    description: 'The link ID to delete',
                },
            },
            required: ['linkId'],
        },
    },
    {
        name: 'jira_get_issue_link_types',
        description: 'Get available issue link types for creating dependencies',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: TOOLS,
    };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case 'jira_list_projects': {
                const projects = await jiraClient.listProjects();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(projects, null, 2),
                        },
                    ],
                };
            }

            case 'jira_get_project': {
                const { projectId } = args as { projectId: string };
                const project = await jiraClient.getProject(projectId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(project, null, 2),
                        },
                    ],
                };
            }

            case 'jira_list_issues': {
                const params = args as {
                    projectKey?: string;
                    jql?: string;
                    status?: string;
                    assignee?: string;
                    since?: string;
                };
                const issues = await jiraClient.listIssues(params);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(issues, null, 2),
                        },
                    ],
                };
            }

            case 'jira_get_issue': {
                const { issueIdOrKey } = args as { issueIdOrKey: string };
                const issue = await jiraClient.getIssue(issueIdOrKey);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(issue, null, 2),
                        },
                    ],
                };
            }

            case 'jira_create_issue': {
                const { projectKey, summary, description, type } = args as {
                    projectKey: string;
                    summary: string;
                    description: string;
                    type: string;
                };
                const newIssue = await jiraClient.createIssue({
                    projectKey,
                    summary,
                    description,
                    type,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(newIssue, null, 2),
                        },
                    ],
                };
            }

            case 'jira_transition_issue': {
                const { issueIdOrKey, transitionId } = args as {
                    issueIdOrKey: string;
                    transitionId: string;
                };
                await jiraClient.transitionIssue(issueIdOrKey, transitionId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Issue ${issueIdOrKey} transitioned successfully`,
                        },
                    ],
                };
            }

            case 'jira_add_comment': {
                const { issueIdOrKey, comment } = args as {
                    issueIdOrKey: string;
                    comment: string;
                };
                await jiraClient.addComment(issueIdOrKey, comment);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Comment added to issue ${issueIdOrKey} successfully`,
                        },
                    ],
                };
            }

            case 'jira_search_users': {
                const { query } = args as { query: string };
                const users = await jiraClient.listUsers(query);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(users, null, 2),
                        },
                    ],
                };
            }

            case 'jira_get_user': {
                const { accountId } = args as { accountId: string };
                const user = await jiraClient.getUser(accountId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(user, null, 2),
                        },
                    ],
                };
            }

            case 'jira_list_boards': {
                const { projectKey } = args as { projectKey?: string };
                const boards = await jiraClient.listBoards(projectKey);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(boards, null, 2),
                        },
                    ],
                };
            }

            case 'jira_list_sprints': {
                const { boardId, state } = args as { boardId: number; state?: string };
                const sprints = await jiraClient.listSprints(boardId, state);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(sprints, null, 2),
                        },
                    ],
                };
            }

            case 'jira_get_sprint_issues': {
                const { sprintId } = args as { sprintId: number };
                const issues = await jiraClient.listSprintIssues(sprintId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(issues, null, 2),
                        },
                    ],
                };
            }

            case 'jira_get_users_from_projects': {
                const accountIds = await jiraClient.getAllUsersFromProjects();
                const users = await jiraClient.getUsersBatch(Array.from(accountIds));
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                users,
                                totalUniqueUsers: users.length,
                                accountIds: Array.from(accountIds),
                            }, null, 2),
                        },
                    ],
                };
            }

            // Enhanced ticket operations
            case 'jira_update_issue_status': {
                const { issueIdOrKey, statusName } = args as {
                    issueIdOrKey: string;
                    statusName: string;
                };
                await jiraClient.updateIssueStatus(issueIdOrKey, statusName);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Issue ${issueIdOrKey} status updated to "${statusName}" successfully`,
                        },
                    ],
                };
            }

            case 'jira_close_issue': {
                const { issueIdOrKey, resolution } = args as {
                    issueIdOrKey: string;
                    resolution?: string;
                };
                await jiraClient.closeIssue(issueIdOrKey, resolution);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Issue ${issueIdOrKey} closed successfully${resolution ? ` with resolution: ${resolution}` : ''}`,
                        },
                    ],
                };
            }

            case 'jira_get_issue_transitions': {
                const { issueIdOrKey } = args as { issueIdOrKey: string };
                const transitions = await jiraClient.getIssueTransitions(issueIdOrKey);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(transitions, null, 2),
                        },
                    ],
                };
            }

            // Enhanced comment operations
            case 'jira_get_issue_comments': {
                const { issueIdOrKey } = args as { issueIdOrKey: string };
                const comments = await jiraClient.getIssueComments(issueIdOrKey);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(comments, null, 2),
                        },
                    ],
                };
            }

            case 'jira_update_comment': {
                const { issueIdOrKey, commentId, comment } = args as {
                    issueIdOrKey: string;
                    commentId: string;
                    comment: string;
                };
                await jiraClient.updateComment(issueIdOrKey, commentId, comment);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Comment ${commentId} on issue ${issueIdOrKey} updated successfully`,
                        },
                    ],
                };
            }

            case 'jira_delete_comment': {
                const { issueIdOrKey, commentId } = args as {
                    issueIdOrKey: string;
                    commentId: string;
                };
                await jiraClient.deleteComment(issueIdOrKey, commentId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Comment ${commentId} deleted from issue ${issueIdOrKey} successfully`,
                        },
                    ],
                };
            }

            // Issue dependencies and linking
            case 'jira_get_issue_dependencies': {
                const { issueIdOrKey } = args as { issueIdOrKey: string };
                const dependencies = await jiraClient.getIssueDependencies(issueIdOrKey);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(dependencies, null, 2),
                        },
                    ],
                };
            }

            case 'jira_create_issue_link': {
                const { type, inwardIssue, outwardIssue, comment } = args as {
                    type: string;
                    inwardIssue: string;
                    outwardIssue: string;
                    comment?: string;
                };
                await jiraClient.createIssueLink({
                    type,
                    inwardIssue,
                    outwardIssue,
                    comment,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Issue link created: ${inwardIssue} ${type} ${outwardIssue}`,
                        },
                    ],
                };
            }

            case 'jira_delete_issue_link': {
                const { linkId } = args as { linkId: string };
                await jiraClient.deleteIssueLink(linkId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Issue link ${linkId} deleted successfully`,
                        },
                    ],
                };
            }

            case 'jira_get_issue_link_types': {
                const linkTypes = await jiraClient.getIssueLinkTypes();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(linkTypes, null, 2),
                        },
                    ],
                };
            }

            default:
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${name}`
                );
        }
    } catch (error) {
        throw new McpError(
            ErrorCode.InternalError,
            `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
    }
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Jira MCP Server running on stdio');
}

if (require.main === module) {
    main().catch((error) => {
        console.error('Server error:', error);
        process.exit(1);
    });
}

export { server };
