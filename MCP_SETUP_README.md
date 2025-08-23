# Jira MCP Server Setup and Usage

This project now includes a proper Model Context Protocol (MCP) server that provides Jira integration tools. This allows you to use MCP clients to interact with Jira through standardized tools.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that enables AI assistants to securely connect to external data sources and tools. This project provides a Jira MCP server that exposes Jira functionality as MCP tools.

## Setup

### 1. Dependencies

The required MCP dependencies are already installed:

- `@modelcontextprotocol/sdk` - Core MCP SDK
- `tsx` - TypeScript execution for development

### 2. Environment Configuration

Your Jira credentials are configured in `app/.env.local`:

```
JIRA_BASE_URL=https://qrorder.atlassian.net
JIRA_EMAIL=shubham.bayas@joshsoftware.com
JIRA_API_TOKEN=ATATT3xFfGF0plHMWlnxXBZrKcH2VXFLi9i5ljyHg4P2GoZ_G8W3lsXzhKWh8jIQJ_Wqsmdht67ycuV7w1FhuGy8Q9QqPrXZNFn8Mz1ctP6aZlMaFbanyEYuv5qD9vxw1G9AvHBqsIQrVQ4VHAn-yehcUw0tRfYVDP2ZZzuGK2HgwDtBmhELw5w=9D4156DA
```

## Available MCP Tools

The Jira MCP server provides the following tools:

### Project Management

- `jira_list_projects` - List all Jira projects
- `jira_get_project` - Get details of a specific project

### Issue Management

- `jira_list_issues` - List issues with optional filters (project, status, assignee, etc.)
- `jira_get_issue` - Get details of a specific issue
- `jira_create_issue` - Create a new issue
- `jira_transition_issue` - Change issue status
- `jira_add_comment` - Add comments to issues

### User Management

- `jira_search_users` - Search for users by name, email, or domain
- `jira_get_user` - Get details of a specific user
- `jira_get_users_from_projects` - Extract all unique users from project issues

### Agile/Sprint Management

- `jira_list_boards` - List Jira boards
- `jira_list_sprints` - List sprints for a board
- `jira_get_sprint_issues` - Get issues in a specific sprint

## Running the MCP Server

### Development Mode (TypeScript)

```bash
# From the root directory
npx tsx app/src/mcp/jira-mcp-server.ts

# Or from the app directory
cd app
npx tsx src/mcp/jira-mcp-server.ts
```

### Using npm script

```bash
cd app
npm run mcp:jira
```

## MCP Configuration Files

Two configuration files are provided:

### 1. `mcp-config-dev.json` (Development - TypeScript)

```json
{
    "mcpServers": {
        "jira": {
            "command": "npx",
            "args": ["tsx", "app/src/mcp/jira-mcp-server.ts"],
            "cwd": ".",
            "env": {
                "JIRA_BASE_URL": "https://qrorder.atlassian.net",
                "JIRA_EMAIL": "shubham.bayas@joshsoftware.com",
                "JIRA_API_TOKEN": "..."
            }
        }
    }
}
```

### 2. `mcp-config.json` (Production - Compiled JavaScript)

```json
{
    "mcpServers": {
        "jira": {
            "command": "node",
            "args": ["app/dist/mcp/jira-mcp-server.js"],
            "env": {
                "JIRA_BASE_URL": "https://qrorder.atlassian.net",
                "JIRA_EMAIL": "shubham.bayas@joshsoftware.com",
                "JIRA_API_TOKEN": "..."
            }
        }
    }
}
```

## Using with MCP Clients

### Claude Desktop

1. Add the configuration to your Claude Desktop MCP settings
2. Use the development config (`mcp-config-dev.json`) for immediate use
3. The tools will be available in Claude Desktop conversations

### Other MCP Clients

Use the configuration files with any MCP-compatible client by:

1. Copying the server configuration
2. Adjusting paths as needed for your environment
3. Ensuring environment variables are properly set

## Example Tool Usage

Once connected to an MCP client, you can use tools like:

```
List all projects:
- Tool: jira_list_projects
- Arguments: {}

Get project details:
- Tool: jira_get_project  
- Arguments: {"projectId": "PROJ"}

Search for users:
- Tool: jira_search_users
- Arguments: {"query": "joshsoftware.com"}

Create an issue:
- Tool: jira_create_issue
- Arguments: {
    "projectKey": "PROJ",
    "summary": "New feature request",
    "description": "Detailed description",
    "type": "Task"
  }
```

## File Structure

```
├── app/
│   ├── src/
│   │   ├── mcp/
│   │   │   ├── client.ts          # Jira API client
│   │   │   └── jira-mcp-server.ts # MCP server implementation
│   │   └── app/
│   │       ├── api/mcp/route.ts   # Next.js API routes (existing)
│   │       └── page.tsx           # Frontend dashboard (existing)
│   ├── package.json               # Updated with MCP dependencies
│   └── .env.local                 # Jira credentials
├── mcp-config.json                # Production MCP config
├── mcp-config-dev.json            # Development MCP config
└── MCP_SETUP_README.md            # This file
```

## Benefits of MCP Integration

1. **Standardized Interface**: Use the same tools across different AI clients
2. **Security**: Credentials are managed securely through environment variables
3. **Extensibility**: Easy to add new Jira operations as MCP tools
4. **Interoperability**: Works with any MCP-compatible client
5. **Type Safety**: Full TypeScript support with proper error handling

## Troubleshooting

### Server Won't Start

- Ensure you're in the correct directory
- Check that all dependencies are installed: `npm install`
- Verify environment variables are set correctly

### Connection Issues

- Verify Jira credentials in `.env.local`
- Test API connectivity using the existing Next.js dashboard
- Check network connectivity to your Jira instance

### Tool Errors

- Check the server logs for detailed error messages
- Verify the tool arguments match the expected schema
- Ensure you have proper permissions for the requested operations

## Next Steps

1. **Connect to Claude Desktop**: Use `mcp-config-dev.json` in your Claude Desktop settings
2. **Test Tools**: Try listing projects and users to verify connectivity
3. **Extend Functionality**: Add more Jira operations as needed
4. **Production Deployment**: Build and use the compiled version for production

The MCP server provides a robust, standardized way to interact with Jira from AI assistants while maintaining security and type safety.
