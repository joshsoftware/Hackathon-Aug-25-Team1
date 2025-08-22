# GitHub Activity Viewer - Claude MCP System

A comprehensive system that uses Claude Anthropic as a GitHub MCP (Model Context Protocol) client to fetch and display GitHub repository activity data.

## System Architecture

This system demonstrates a complete MCP implementation with the following components:

1. **GitHub MCP Server** - A custom MCP server that interfaces with GitHub's API
2. **Next.js Web Application** - A React-based frontend with API routes
3. **Claude API Integration** - Uses Claude as an MCP client to fetch GitHub data
4. **Real-time Data Display** - Interactive UI for viewing GitHub activity

## How It Works

```
User Input → Next.js Frontend → Claude API → GitHub MCP Server → GitHub API → Data Display
```

1. User enters repository owner and name in the web interface
2. Frontend sends request to Next.js API route
3. API route sends prompt to Claude Anthropic API
4. Claude acts as MCP client and uses GitHub MCP server tools
5. GitHub MCP server fetches data from GitHub API
6. Data flows back through the chain and is displayed in the UI

## Features

- **Multiple Activity Types**: Recent Activity, Commits, Issues, Pull Requests
- **Real-time Data**: Fetches live data from GitHub API
- **Interactive UI**: Clean, responsive interface built with Tailwind CSS
- **Raw Response View**: Shows Claude's complete response for transparency
- **Error Handling**: Comprehensive error handling throughout the system

## Project Structure

```
├── app/                          # Next.js application
│   ├── src/app/
│   │   ├── api/github-activity/  # API route for Claude integration
│   │   ├── page.tsx              # Main UI component
│   │   └── layout.tsx            # App layout
│   ├── .env.local                # Environment variables
│   └── package.json              # Dependencies
├── /home/sharyu/Documents/Cline/MCP/github-activity-server/
│   ├── src/index.ts              # GitHub MCP server implementation
│   ├── build/index.js            # Compiled MCP server
│   └── package.json              # MCP server dependencies
└── README.md                     # This documentation
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- GitHub Personal Access Token
- Anthropic API Key
- VSCode with Cline extension (for MCP server configuration)

### 1. GitHub Personal Access Token

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with these scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read user profile data)
   - `read:org` (Read organization data)

### 2. Anthropic API Key

1. Go to https://console.anthropic.com/
2. Navigate to "API Keys" and create a new key

### 3. Environment Variables

Create/update `app/.env.local`:

```env
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 4. MCP Server Configuration

The GitHub MCP server is automatically configured in:
`/home/sharyu/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "github-activity": {
      "command": "node",
      "args": ["/home/sharyu/Documents/Cline/MCP/github-activity-server/build/index.js"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### 5. Installation and Running

```bash
# Install dependencies
cd app
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3001` (or 3000 if available).

## GitHub MCP Server Details

### Available Tools

1. **get_repo_activity** - Get recent activity events for a repository
2. **get_user_activity** - Get recent public activity events for a user
3. **get_repo_commits** - Get recent commits for a repository
4. **get_repo_issues** - Get issues for a repository
5. **get_repo_pull_requests** - Get pull requests for a repository

### Tool Parameters

All tools support:
- `owner` (required): Repository owner (username or organization)
- `repo` (required): Repository name
- `limit` (optional): Number of items to fetch (default: 30, max: 100)
- `state` (optional, for issues/PRs): 'open', 'closed', or 'all'

## Usage Examples

### Testing the System

1. **Facebook React Repository**:
   - Owner: `facebook`
   - Repo: `react`
   - Activity Type: `Recent Activity`

2. **Microsoft VSCode Repository**:
   - Owner: `microsoft`
   - Repo: `vscode`
   - Activity Type: `Recent Commits`

3. **Any Public Repository**:
   - Owner: `owner-name`
   - Repo: `repo-name`
   - Activity Type: Choose from dropdown

### Expected Output

The system will display:
- **Structured Data**: Formatted activity, commits, issues, or PRs
- **Raw Response**: Claude's complete response showing MCP tool usage
- **Error Handling**: Clear error messages if something goes wrong

## Technical Implementation

### MCP Server (TypeScript)

- Built using `@modelcontextprotocol/sdk`
- Implements 5 GitHub API tools
- Handles authentication via GitHub token
- Provides structured JSON responses
- Includes comprehensive error handling

### Next.js API Route

- Receives user input from frontend
- Constructs prompts for Claude API
- Handles Claude API communication
- Extracts and parses JSON responses
- Returns structured data to frontend

### React Frontend

- Interactive form for user input
- Real-time loading states
- Responsive design with Tailwind CSS
- Multiple display formats for different data types
- Raw response viewer for transparency

## Troubleshooting

### Common Issues

1. **MCP Server Not Connected**:
   - Check MCP settings configuration
   - Verify GitHub token is valid
   - Ensure MCP server is built (`npm run build`)

2. **API Errors**:
   - Verify Anthropic API key is valid
   - Check GitHub token permissions
   - Ensure repository exists and is accessible

3. **No Data Displayed**:
   - Check browser console for errors
   - Verify API route is responding
   - Check Claude's raw response for debugging

### Debugging

- Check browser console for frontend errors
- Monitor Next.js terminal for API errors
- Review Claude's raw response for MCP tool usage
- Verify MCP server logs in VSCode

## Security Considerations

- API keys are stored in environment variables
- GitHub token has minimal required permissions
- No sensitive data is logged or exposed
- All API calls are server-side only

## Future Enhancements

- Add user authentication
- Implement data caching
- Add more GitHub API endpoints
- Create data visualization charts
- Add export functionality
- Implement real-time updates

## Dependencies

### Main Application
- Next.js 15.5.0
- React 19.1.0
- @anthropic-ai/sdk
- Tailwind CSS 4
- TypeScript 5

### MCP Server
- @modelcontextprotocol/sdk
- axios (for GitHub API calls)
- TypeScript compilation

## License

This project is created for demonstration purposes as part of a hackathon project.

## Support

For issues or questions, please refer to:
- GitHub API Documentation: https://docs.github.com/en/rest
- Anthropic API Documentation: https://docs.anthropic.com/
- MCP Documentation: https://modelcontextprotocol.io/
