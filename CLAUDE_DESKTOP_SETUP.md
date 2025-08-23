# Claude Desktop MCP Setup - Step by Step Guide

## Prerequisites

- Claude Desktop app installed on your computer
- This Jira MCP server project

## Step-by-Step Setup

### 1. Locate Claude Desktop Configuration Directory

**Windows:**

```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**

```
~/.config/Claude/claude_desktop_config.json
```

### 2. Open/Create Configuration File

If the file doesn't exist, create it. If it exists, you'll add to it.

### 3. Add Jira MCP Server Configuration

Copy the content from `mcp-config-dev.json` and add it to Claude Desktop config:

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": [
        "tsx",
        "C:/Users/Josh-/Hackathon-Aug-25-Team1/app/src/mcp/jira-mcp-server.ts"
      ],
      "cwd": "C:/Users/Josh-/Hackathon-Aug-25-Team1",
      "env": {
        "JIRA_BASE_URL": "https://qrorder.atlassian.net",
        "JIRA_EMAIL": "shubham.bayas@joshsoftware.com",
        "JIRA_API_TOKEN": "ATATT3xFfGF0plHMWlnxXBZrKcH2VXFLi9i5ljyHg4P2GoZ_G8W3lsXzhKWh8jIQJ_Wqsmdht67ycuV7w1FhuGy8Q9QqPrXZNFn8Mz1ctP6aZlMaFbanyEYuv5qD9vxw1G9AvHBqsIQrVQ4VHAn-yehcUw0tRfYVDP2ZZzuGK2HgwDtBmhELw5w=9D4156DA"
      }
    }
  }
}
```

**Important Notes:**

- Use **absolute paths** for the TypeScript file
- Set `cwd` to your project root directory
- Include all environment variables

### 4. Complete Configuration Example

If you have other MCP servers, your config might look like:

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": [
        "tsx",
        "C:/Users/Josh-/Hackathon-Aug-25-Team1/app/src/mcp/jira-mcp-server.ts"
      ],
      "cwd": "C:/Users/Josh-/Hackathon-Aug-25-Team1",
      "env": {
        "JIRA_BASE_URL": "https://qrorder.atlassian.net",
        "JIRA_EMAIL": "shubham.bayas@joshsoftware.com",
        "JIRA_API_TOKEN": "ATATT3xFfGF0plHMWlnxXBZrKcH2VXFLi9i5ljyHg4P2GoZ_G8W3lsXzhKWh8jIQJ_Wqsmdht67ycuV7w1FhuGy8Q9QqPrXZNFn8Mz1ctP6aZlMaFbanyEYuv5qD9vxw1G9AvHBqsIQrVQ4VHAn-yehcUw0tRfYVDP2ZZzuGK2HgwDtBmhELw5w=9D4156DA"
      }
    },
    "other-server": {
      "command": "...",
      "args": ["..."]
    }
  }
}
```

### 5. Restart Claude Desktop

After saving the configuration file:

1. **Quit Claude Desktop completely**
2. **Restart Claude Desktop**
3. Wait for it to load completely

### 6. Verify MCP Tools Are Available

In a new Claude Desktop conversation, try:

**Test Commands:**

- "List all Jira projects"
- "Show me the available Jira tools"
- "Search for users in Jira with domain joshsoftware.com"

**Expected Behavior:**

- Claude should automatically use the Jira MCP tools
- You'll see responses with actual Jira data
- No manual API calls needed

### 7. Troubleshooting

#### Tools Not Available

1. Check Claude Desktop logs (usually in the same config directory)
2. Verify absolute paths are correct
3. Ensure `npx` and `tsx` are available in your PATH
4. Test the MCP server manually: `node test-mcp-client.js`

#### Connection Errors

1. Verify Jira credentials in the config
2. Check network connectivity to Jira
3. Ensure the project directory exists and has dependencies installed

#### Permission Issues

1. Make sure Claude Desktop has permission to execute commands
2. Try running Claude Desktop as administrator (Windows) if needed

### 8. Using the Tools

Once configured, you can use natural language:

**Examples:**

- "What Jira projects do we have?"
- "Create a new task in project QTOS with title 'Fix login bug'"
- "Show me all open issues assigned to <john@joshsoftware.com>"
- "List all users from our Jira projects"
- "What sprints are active in our boards?"

Claude will automatically:

1. Understand your request
2. Call the appropriate MCP tool
3. Return formatted results
4. Handle errors gracefully

### 9. Production Setup (Optional)

For better performance, use the compiled version:

1. Build the project: `cd app && npm run build`
2. Update Claude config to use compiled JS:

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": [
        "C:/Users/Josh-/Hackathon-Aug-25-Team1/app/dist/jira-mcp-server.js"
      ],
      "cwd": "C:/Users/Josh-/Hackathon-Aug-25-Team1",
      "env": { ... }
    }
  }
}
```

## Success Indicators

✅ **Working correctly when:**

- Claude responds to Jira queries with actual data
- No "I don't have access to Jira" messages
- Tools execute without errors
- Real project/user/issue data is returned

❌ **Not working if:**

- Claude says it can't access Jira
- Generic responses without real data
- Error messages about missing tools
- Connection timeouts

You now have Claude Desktop directly connected to your Jira instance via MCP!
