# Jira MCP API - Postman Testing Guide

This document provides comprehensive instructions for testing the Jira MCP API endpoints using Postman.

## Setup

### 1. Environment Configuration

First, create a `.env.local` file in the `app/` directory with your Jira credentials:

```env
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
```

### 2. Start the Development Server

```bash
cd app
npm run dev
```

The API will be available at: `http://localhost:3000/api/mcp`

## API Endpoints

### Base URL

```
http://localhost:3000/api/mcp
```

---

## GET Endpoints

### 1. Health Check

**Endpoint:** `GET /api/mcp?action=health`

**Description:** Check if the API is running and view configuration status.

**Postman Setup:**

- Method: GET
- URL: `http://localhost:3000/api/mcp?action=health`

**Expected Response:**

```json
{
  "status": "ok",
  "message": "Jira MCP API is running",
  "config": {
    "baseUrl": "https://your-domain.atlassian.net",
    "email": "your-email@example.com",
    "hasToken": true
  }
}
```

---

### 2. List All Projects

**Endpoint:** `GET /api/mcp?action=projects`

**Description:** Get all accessible Jira projects.

**Postman Setup:**

- Method: GET
- URL: `http://localhost:3000/api/mcp?action=projects`

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "10000",
      "key": "PROJ",
      "name": "Project Name",
      "projectTypeKey": "software",
      "lead": {
        "accountId": "123456",
        "displayName": "John Doe"
      }
    }
  ],
  "count": 1
}
```

---

### 3. Get Specific Project

**Endpoint:** `GET /api/mcp?action=project&projectId={projectId}`

**Description:** Get details of a specific project.

**Postman Setup:**

- Method: GET
- URL: `http://localhost:3000/api/mcp?action=project&projectId=PROJ`

**Parameters:**

- `projectId` (required): Project key or ID

---

### 4. List Issues

**Endpoint:** `GET /api/mcp?action=issues`

**Description:** Get issues with optional filtering.

**Postman Setup:**

- Method: GET
- URL: `http://localhost:3000/api/mcp?action=issues&projectKey=PROJ&status=Open`

**Optional Parameters:**

- `projectKey`: Filter by project key
- `jql`: Custom JQL query
- `status`: Filter by status
- `assignee`: Filter by assignee
- `since`: Filter by update date (YYYY-MM-DD)

**Example URLs:**

```
# All issues in a project
http://localhost:3000/api/mcp?action=issues&projectKey=PROJ

# Issues with specific status
http://localhost:3000/api/mcp?action=issues&projectKey=PROJ&status=In Progress

# Issues assigned to specific user
http://localhost:3000/api/mcp?action=issues&assignee=john.doe@example.com

# Issues updated since specific date
http://localhost:3000/api/mcp?action=issues&since=2024-01-01

# Custom JQL query
http://localhost:3000/api/mcp?action=issues&jql=project=PROJ AND status="To Do"
```

---

### 5. Get Specific Issue

**Endpoint:** `GET /api/mcp?action=issue&issueIdOrKey={issueKey}`

**Description:** Get details of a specific issue.

**Postman Setup:**

- Method: GET
- URL: `http://localhost:3000/api/mcp?action=issue&issueIdOrKey=PROJ-123`

**Parameters:**

- `issueIdOrKey` (required): Issue key (e.g., PROJ-123) or ID

---

### 6. Search Users

**Endpoint:** `GET /api/mcp?action=users&query={searchQuery}`

**Description:** Search for users in Jira.

**Postman Setup:**

- Method: GET
- URL: `http://localhost:3000/api/mcp?action=users&query=john`

**Parameters:**

- `query` (required): Search term for user names or emails

---

### 7. Get Specific User

**Endpoint:** `GET /api/mcp?action=user&accountId={accountId}`

**Description:** Get details of a specific user.

**Postman Setup:**

- Method: GET
- URL: `http://localhost:3000/api/mcp?action=user&accountId=123456789`

**Parameters:**

- `accountId` (required): User's account ID

---

### 8. List Boards

**Endpoint:** `GET /api/mcp?action=boards`

**Description:** Get all boards, optionally filtered by project.

**Postman Setup:**

- Method: GET
- URL: `http://localhost:3000/api/mcp?action=boards&projectKey=PROJ`

**Optional Parameters:**

- `projectKey`: Filter boards by project key

---

### 9. List Sprints

**Endpoint:** `GET /api/mcp?action=sprints&boardId={boardId}`

**Description:** Get sprints for a specific board.

**Postman Setup:**

- Method: GET
- URL: `http://localhost:3000/api/mcp?action=sprints&boardId=1&state=active`

**Parameters:**

- `boardId` (required): Board ID
- `state` (optional): Sprint state (active, closed, future)

---

### 10. List Sprint Issues

**Endpoint:** `GET /api/mcp?action=sprint-issues&sprintId={sprintId}`

**Description:** Get all issues in a specific sprint.

**Postman Setup:**

- Method: GET
- URL: `http://localhost:3000/api/mcp?action=sprint-issues&sprintId=123`

**Parameters:**

- `sprintId` (required): Sprint ID

---

## POST Endpoints

### 1. Create Issue

**Endpoint:** `POST /api/mcp?action=create-issue`

**Description:** Create a new issue in Jira.

**Postman Setup:**

- Method: POST
- URL: `http://localhost:3000/api/mcp?action=create-issue`
- Headers: `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "projectKey": "PROJ",
  "summary": "Test issue created via API",
  "description": "This is a test issue created through the MCP API",
  "type": "Task"
}
```

**Required Fields:**

- `projectKey`: Project key where issue will be created
- `summary`: Issue title
- `description`: Issue description
- `type`: Issue type (Task, Bug, Story, etc.)

---

### 2. Transition Issue

**Endpoint:** `POST /api/mcp?action=transition-issue`

**Description:** Move an issue from one status to another.

**Postman Setup:**

- Method: POST
- URL: `http://localhost:3000/api/mcp?action=transition-issue`
- Headers: `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "issueIdOrKey": "PROJ-123",
  "transitionId": "31"
}
```

**Required Fields:**

- `issueIdOrKey`: Issue key or ID
- `transitionId`: ID of the transition to perform

**Note:** To find available transitions, you can use Jira's REST API: `/rest/api/3/issue/{issueIdOrKey}/transitions`

---

### 3. Add Comment

**Endpoint:** `POST /api/mcp?action=add-comment`

**Description:** Add a comment to an issue.

**Postman Setup:**

- Method: POST
- URL: `http://localhost:3000/api/mcp?action=add-comment`
- Headers: `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "issueIdOrKey": "PROJ-123",
  "comment": "This is a test comment added via the MCP API"
}
```

**Required Fields:**

- `issueIdOrKey`: Issue key or ID
- `comment`: Comment text

---

## Testing Workflow for Employee Data

To get data from every employee as mentioned in your requirements, follow this workflow:

### 1. Get All Projects

```
GET /api/mcp?action=projects
```

### 2. For Each Project, Get All Issues

```
GET /api/mcp?action=issues&projectKey={PROJECT_KEY}
```

### 3. Extract User Information from Issues

From the issues response, collect unique users from:

- `assignee` field
- `reporter` field

### 4. Get Detailed User Information

For each unique user account ID found:

```
GET /api/mcp?action=user&accountId={ACCOUNT_ID}
```

### 5. Search for Additional Users

```
GET /api/mcp?action=users&query=@yourcompany.com
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

Common HTTP status codes:

- `200`: Success
- `400`: Bad Request (missing parameters)
- `401`: Unauthorized (invalid Jira credentials)
- `404`: Not Found
- `500`: Internal Server Error

---

## Postman Collection

You can create a Postman collection with all these endpoints. Here's a sample collection structure:

```
Jira MCP API
├── Health Check
├── Projects
│   ├── List Projects
│   └── Get Project
├── Issues
│   ├── List Issues
│   ├── Get Issue
│   ├── Create Issue
│   ├── Transition Issue
│   └── Add Comment
├── Users
│   ├── Search Users
│   └── Get User
└── Boards & Sprints
    ├── List Boards
    ├── List Sprints
    └── List Sprint Issues
```

---

## Environment Variables for Postman

Create a Postman environment with these variables:

- `baseUrl`: `http://localhost:3000`
- `projectKey`: Your test project key
- `issueKey`: A test issue key
- `boardId`: A test board ID
- `sprintId`: A test sprint ID
- `accountId`: A test user account ID

This allows you to easily switch between different test data sets.
