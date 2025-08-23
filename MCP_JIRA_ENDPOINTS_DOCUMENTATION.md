# Jira MCP Integration - Complete Endpoint Documentation

This document provides comprehensive documentation on how the Model Context Protocol (MCP) is used to implement Jira integration endpoints in this project.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [MCP Tools Reference](#mcp-tools-reference)
3. [HTTP API Endpoints](#http-api-endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [Authentication & Configuration](#authentication--configuration)
6. [Client Integration](#client-integration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Architecture Overview

### MCP Implementation Structure

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   MCP Clients       │    │   Next.js API      │    │   MCP Server        │
│   (Claude Desktop,  │◄──►│   Routes            │◄──►│   (Jira Tools)      │
│   Custom Apps)      │    │   /api/mcp          │    │   stdio transport   │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                      │                          │
                                      ▼                          ▼
                           ┌─────────────────────┐    ┌─────────────────────┐
                           │   HTTP Responses    │    │   Jira REST API     │
                           │   (JSON)            │    │   (atlassian.net)   │
                           └─────────────────────┘    └─────────────────────┘
```

### Component Breakdown

1. **MCP Server** (`app/src/mcp/jira-mcp-server.ts`)
   - Implements 13 standardized MCP tools
   - Communicates via stdio transport
   - Handles Jira API authentication and requests

2. **Next.js API Routes** (`app/src/app/api/mcp/route.ts`)
   - Acts as MCP client
   - Exposes HTTP endpoints
   - Translates HTTP requests to MCP tool calls

3. **Jira Client** (`app/src/mcp/client.ts`)
   - Handles Jira REST API communication
   - Manages authentication and request formatting
   - Provides TypeScript interfaces

## MCP Tools Reference

### Project Management Tools

#### `jira_list_projects`

**Description**: List all accessible Jira projects
**Parameters**: None
**Returns**: Array of project objects

```typescript
// MCP Tool Call
{
  name: "jira_list_projects",
  arguments: {}
}

// Response
[
  {
    "id": "10000",
    "key": "PROJ",
    "name": "Sample Project",
    "projectTypeKey": "software",
    "lead": {
      "accountId": "123456",
      "displayName": "John Doe"
    }
  }
]
```

#### `jira_get_project`

**Description**: Get detailed information about a specific project
**Parameters**:

- `projectId` (string, required): Project ID or key

```typescript
// MCP Tool Call
{
  name: "jira_get_project",
  arguments: {
    "projectId": "PROJ"
  }
}
```

### Issue Management Tools

#### `jira_list_issues`

**Description**: List issues with optional filtering
**Parameters**:

- `projectKey` (string, optional): Filter by project
- `jql` (string, optional): JQL query string
- `status` (string, optional): Filter by status
- `assignee` (string, optional): Filter by assignee
- `since` (string, optional): Filter by updated date (YYYY-MM-DD)

```typescript
// MCP Tool Call
{
  name: "jira_list_issues",
  arguments: {
    "projectKey": "PROJ",
    "status": "In Progress",
    "assignee": "john.doe@company.com"
  }
}

// Response
{
  "issues": [
    {
      "id": "10001",
      "key": "PROJ-123",
      "fields": {
        "summary": "Fix login bug",
        "status": {
          "name": "In Progress",
          "id": "3"
        },
        "assignee": {
          "accountId": "123456",
          "displayName": "John Doe",
          "emailAddress": "john.doe@company.com"
        }
      }
    }
  ],
  "total": 1
}
```

#### `jira_get_issue`

**Description**: Get detailed information about a specific issue
**Parameters**:

- `issueIdOrKey` (string, required): Issue ID or key

#### `jira_create_issue`

**Description**: Create a new Jira issue
**Parameters**:

- `projectKey` (string, required): Target project key
- `summary` (string, required): Issue title
- `description` (string, required): Issue description
- `type` (string, required): Issue type (Task, Bug, Story, etc.)

```typescript
// MCP Tool Call
{
  name: "jira_create_issue",
  arguments: {
    "projectKey": "PROJ",
    "summary": "Implement new feature",
    "description": "Add user authentication system",
    "type": "Task"
  }
}
```

#### `jira_transition_issue`

**Description**: Change issue status/workflow state
**Parameters**:

- `issueIdOrKey` (string, required): Issue ID or key
- `transitionId` (string, required): Transition ID

#### `jira_add_comment`

**Description**: Add a comment to an issue
**Parameters**:

- `issueIdOrKey` (string, required): Issue ID or key
- `comment` (string, required): Comment text

### User Management Tools

#### `jira_search_users`

**Description**: Search for users by name, email, or domain
**Parameters**:

- `query` (string, required): Search query

```typescript
// MCP Tool Call
{
  name: "jira_search_users",
  arguments: {
    "query": "joshsoftware.com"
  }
}

// Response
[
  {
    "accountId": "123456",
    "displayName": "John Doe",
    "emailAddress": "john.doe@joshsoftware.com",
    "active": true
  }
]
```

#### `jira_get_user`

**Description**: Get detailed user information
**Parameters**:

- `accountId` (string, required): User account ID

#### `jira_get_users_from_projects`

**Description**: Extract all unique users from project issues
**Parameters**: None

```typescript
// Response
{
  "users": [...],
  "totalUniqueUsers": 25,
  "accountIds": ["123456", "789012", ...]
}
```

### Agile/Sprint Management Tools

#### `jira_list_boards`

**Description**: List Jira boards (Scrum/Kanban)
**Parameters**:

- `projectKey` (string, optional): Filter by project

#### `jira_list_sprints`

**Description**: List sprints for a specific board
**Parameters**:

- `boardId` (number, required): Board ID
- `state` (string, optional): Sprint state (active, closed, future)

#### `jira_get_sprint_issues`

**Description**: Get all issues in a specific sprint
**Parameters**:

- `sprintId` (number, required): Sprint ID

## HTTP API Endpoints

The Next.js API routes provide HTTP access to MCP tools:

### GET Endpoints

#### Health Check

```http
GET /api/mcp?action=health
```

**Response**:

```json
{
  "status": "ok",
  "message": "Jira MCP API is running",
  "config": {
    "baseUrl": "https://qrorder.atlassian.net",
    "email": "user@company.com",
    "hasToken": true
  }
}
```

#### List Projects

```http
GET /api/mcp?action=projects
```

**MCP Tool Used**: `jira_list_projects`

#### Get Project

```http
GET /api/mcp?action=project&projectId=PROJ
```

**MCP Tool Used**: `jira_get_project`

#### List Issues

```http
GET /api/mcp?action=issues&projectKey=PROJ&status=Done&assignee=john.doe
```

**MCP Tool Used**: `jira_list_issues`

#### Get Issue

```http
GET /api/mcp?action=issue&issueIdOrKey=PROJ-123
```

**MCP Tool Used**: `jira_get_issue`

#### Search Users

```http
GET /api/mcp?action=users&query=joshsoftware.com
```

**MCP Tool Used**: `jira_search_users`

#### Get Users from Projects

```http
GET /api/mcp?action=users-from-projects
```

**MCP Tool Used**: `jira_get_users_from_projects`

#### Get User

```http
GET /api/mcp?action=user&accountId=123456
```

**MCP Tool Used**: `jira_get_user`

#### List Boards

```http
GET /api/mcp?action=boards&projectKey=PROJ
```

**MCP Tool Used**: `jira_list_boards`

#### List Sprints

```http
GET /api/mcp?action=sprints&boardId=1&state=active
```

**MCP Tool Used**: `jira_list_sprints`

#### Get Sprint Issues

```http
GET /api/mcp?action=sprint-issues&sprintId=123
```

**MCP Tool Used**: `jira_get_sprint_issues`

### POST Endpoints

#### Create Issue

```http
POST /api/mcp?action=create-issue
Content-Type: application/json

{
  "projectKey": "PROJ",
  "summary": "New feature request",
  "description": "Implement user dashboard",
  "type": "Task"
}
```

**MCP Tool Used**: `jira_create_issue`

#### Transition Issue

```http
POST /api/mcp?action=transition-issue
Content-Type: application/json

{
  "issueIdOrKey": "PROJ-123",
  "transitionId": "31"
}
```

**MCP Tool Used**: `jira_transition_issue`

#### Add Comment

```http
POST /api/mcp?action=add-comment
Content-Type: application/json

{
  "issueIdOrKey": "PROJ-123",
  "comment": "Work completed and ready for review"
}
```

**MCP Tool Used**: `jira_add_comment`

## Request/Response Examples

### Complete Example: Creating and Managing an Issue

#### 1. List Projects (to get project key)

```bash
curl "http://localhost:3000/api/mcp?action=projects"
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "10000",
      "key": "PROJ",
      "name": "Sample Project"
    }
  ],
  "count": 1
}
```

#### 2. Create Issue

```bash
curl -X POST "http://localhost:3000/api/mcp?action=create-issue" \
  -H "Content-Type: application/json" \
  -d '{
    "projectKey": "PROJ",
    "summary": "Fix authentication bug",
    "description": "Users cannot log in with valid credentials",
    "type": "Bug"
  }'
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "10001",
    "key": "PROJ-124",
    "self": "https://qrorder.atlassian.net/rest/api/3/issue/10001"
  },
  "message": "Issue created successfully"
}
```

#### 3. Add Comment

```bash
curl -X POST "http://localhost:3000/api/mcp?action=add-comment" \
  -H "Content-Type: application/json" \
  -d '{
    "issueIdOrKey": "PROJ-124",
    "comment": "Investigation started. Checking authentication service logs."
  }'
```

#### 4. Transition Issue

```bash
curl -X POST "http://localhost:3000/api/mcp?action=transition-issue" \
  -H "Content-Type: application/json" \
  -d '{
    "issueIdOrKey": "PROJ-124",
    "transitionId": "21"
  }'
```

### Error Handling Examples

#### Missing Parameters

```bash
curl "http://localhost:3000/api/mcp?action=project"
```

**Response** (400 Bad Request):

```json
{
  "error": "projectId parameter is required"
}
```

#### Invalid Action

```bash
curl "http://localhost:3000/api/mcp?action=invalid"
```

**Response** (400 Bad Request):

```json
{
  "error": "Invalid action",
  "availableActions": [
    "health",
    "projects",
    "project",
    "issues",
    "issue",
    "users",
    "users-from-projects",
    "users-by-email",
    "user",
    "boards",
    "sprints",
    "sprint-issues"
  ]
}
```

#### MCP Server Error

**Response** (500 Internal Server Error):

```json
{
  "error": "Internal server error",
  "message": "Jira API error: 401 Unauthorized"
}
```

## Authentication & Configuration

### Environment Variables

Create `app/.env.local` with your Jira credentials:

```env
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
```

### Generating Jira API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a descriptive name
4. Copy the generated token
5. Add it to your `.env.local` file

### MCP Server Configuration

#### Development (TypeScript)

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["tsx", "app/src/mcp/jira-mcp-server.ts"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@company.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

#### Production (Compiled)

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["app/dist/mcp/jira-mcp-server.js"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@company.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Client Integration

### Claude Desktop Integration

1. **Install Claude Desktop** from Anthropic
2. **Configure MCP Server**:
   - Open Claude Desktop settings
   - Navigate to "Developer" tab
   - Add the MCP server configuration
   - Use `mcp-config-dev.json` for immediate setup

3. **Test Connection**:

   ```
   Can you list all Jira projects using the jira_list_projects tool?
   ```

4. **Example Usage in Claude**:

   ```
   Please create a new issue in project PROJ with the summary "Fix login bug" 
   and description "Users report they cannot log in with valid credentials"
   ```

### Custom MCP Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({
  name: 'custom-jira-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['tsx', 'app/src/mcp/jira-mcp-server.ts'],
  env: {
    JIRA_BASE_URL: 'https://your-domain.atlassian.net',
    JIRA_EMAIL: 'your-email@company.com',
    JIRA_API_TOKEN: 'your-api-token'
  }
});

await client.connect(transport);

// List projects
const result = await client.callTool({
  name: 'jira_list_projects',
  arguments: {}
});

console.log(JSON.parse(result.content[0].text));
```

### HTTP Client Integration

```javascript
// Using fetch API
async function listProjects() {
  const response = await fetch('http://localhost:3000/api/mcp?action=projects');
  const data = await response.json();
  return data.data;
}

// Using axios
import axios from 'axios';

const jiraApi = axios.create({
  baseURL: 'http://localhost:3000/api/mcp'
});

// List issues
const issues = await jiraApi.get('/', {
  params: {
    action: 'issues',
    projectKey: 'PROJ',
    status: 'In Progress'
  }
});

// Create issue
const newIssue = await jiraApi.post('/?action=create-issue', {
  projectKey: 'PROJ',
  summary: 'New feature',
  description: 'Feature description',
  type: 'Task'
});
```

## Troubleshooting

### Common Issues

#### 1. MCP Server Won't Start

**Symptoms**:

- "Cannot find module" errors
- Server connection timeouts

**Solutions**:

```bash
# Ensure dependencies are installed
cd app
npm install

# Check TypeScript compilation
npx tsc --noEmit

# Test server directly
npx tsx src/mcp/jira-mcp-server.ts
```

#### 2. Authentication Errors

**Symptoms**:

- 401 Unauthorized responses
- "Invalid credentials" messages

**Solutions**:

- Verify `.env.local` file exists and has correct values
- Test credentials with curl:

```bash
curl -u "email@company.com:api-token" \
  "https://your-domain.atlassian.net/rest/api/3/myself"
```

- Regenerate API token if needed

#### 3. Connection Timeouts

**Symptoms**:

- MCP client connection failures
- HTTP 500 errors

**Solutions**:

- Check network connectivity to Jira instance
- Verify firewall settings
- Test with health endpoint:

```bash
curl "http://localhost:3000/api/mcp?action=health"
```

#### 4. Tool Call Failures

**Symptoms**:

- "Tool not found" errors
- Invalid argument errors

**Solutions**:

- Check tool name spelling
- Verify required parameters are provided
- Review tool schemas in server code

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=mcp:* npm run dev
```

### Log Analysis

Check server logs for detailed error information:

```bash
# Next.js development logs
npm run dev

# MCP server logs (when run directly)
npx tsx src/mcp/jira-mcp-server.ts 2>&1 | tee mcp-server.log
```

## Best Practices

### Performance Optimization

#### 1. Connection Pooling

The MCP client maintains a single connection to the server:

```typescript
// Singleton pattern used in route.ts
let mcpClient: Client | null = null;

async function getMCPClient(): Promise<Client> {
  if (!mcpClient) {
    // Initialize once
    mcpClient = new Client(/* ... */);
    await mcpClient.connect(transport);
  }
  return mcpClient;
}
```

#### 2. Efficient Queries

Use specific filters to reduce data transfer:

```typescript
// Good: Specific query
await client.callTool({
  name: 'jira_list_issues',
  arguments: {
    projectKey: 'PROJ',
    status: 'In Progress',
    since: '2024-01-01'
  }
});

// Avoid: Fetching all issues
await client.callTool({
  name: 'jira_list_issues',
  arguments: {}
});
```

#### 3. Batch Operations

For multiple operations, consider batching:

```typescript
// Get multiple users efficiently
const accountIds = await client.callTool({
  name: 'jira_get_users_from_projects',
  arguments: {}
});
// This internally batches user lookups
```

### Security Best Practices

#### 1. Environment Variables

- Never commit credentials to version control
- Use different tokens for different environments
- Rotate API tokens regularly

#### 2. Input Validation

The API routes include parameter validation:

```typescript
if (!projectId) {
  return NextResponse.json(
    { error: 'projectId parameter is required' },
    { status: 400 }
  );
}
```

#### 3. Error Handling

Avoid exposing sensitive information in error messages:

```typescript
catch (error) {
  console.error('Jira MCP Error:', error);
  return NextResponse.json(
    {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    },
    { status: 500 }
  );
}
```

### Development Workflow

#### 1. Local Development

```bash
# Start Next.js development server
cd app
npm run dev

# Test MCP server directly
npx tsx src/mcp/jira-mcp-server.ts

# Run specific MCP tool
npm run mcp:jira
```

#### 2. Testing

```bash
# Test health endpoint
curl "http://localhost:3000/api/mcp?action=health"

# Test MCP tools via HTTP API
curl "http://localhost:3000/api/mcp?action=projects"

# Test with Claude Desktop using development config
```

#### 3. Production Deployment

```bash
# Build the application
npm run build

# Compile TypeScript for MCP server
npx tsc src/mcp/jira-mcp-server.ts --outDir dist

# Use production MCP config
# Update mcp-config.json with correct paths
```

### Monitoring and Logging

#### 1. Request Logging

Monitor API usage:

```typescript
console.log(`MCP Tool Called: ${name} with args:`, args);
```

#### 2. Performance Monitoring

Track response times:

```typescript
const startTime = Date.now();
const result = await client.callTool(/* ... */);
console.log(`Tool ${name} took ${Date.now() - startTime}ms`);
```

#### 3. Error Tracking

Implement proper error tracking:

```typescript
catch (error) {
  // Log to monitoring service
  console.error('MCP Error:', {
    tool: name,
    args,
    error: error.message,
    timestamp: new Date().toISOString()
  });
}
```

## Conclusion

This MCP integration provides a robust, standardized way to interact with Jira through both direct MCP clients and HTTP APIs. The architecture ensures:

- **Standardization**: Consistent tool interface across clients
- **Security**: Proper credential management and validation
- **Flexibility**: Multiple access methods (MCP tools, HTTP API)
- **Scalability**: Efficient connection management and batching
- **Maintainability**: Clear separation of concerns and comprehensive error handling

The implementation serves as a solid foundation for building AI-powered Jira integrations while maintaining security and performance best practices.
