# Jira Activity Tracker

This application allows users to track team activity in Jira using natural language queries. It uses the Model Context Protocol (MCP) to connect Claude to Jira data.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Jira account with API token
- Anthropic API key

### Configuration

1. Create a `.env.local` file with the following variables:

```
# Anthropic API Key
ANTHROPIC_API_KEY=your_anthropic_api_key

# MCP Server Configuration
MCP_ATLASSIAN_ENDPOINT=http://localhost:3001

# Jira Configuration
JIRA_URL=https://your-company.atlassian.net
JIRA_USERNAME=your.email@company.com
JIRA_API_TOKEN=your_jira_api_token
```

2. Install dependencies:

```bash
npm install
```

### Starting the MCP Server

Start the MCP Atlassian server using Docker Compose:

```bash
docker-compose up -d
```

This will start the MCP server on port 3001.

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

- Natural language interface for querying Jira data
- Real-time activity tracking for teams
- Insights about team progress and performance
- Integration with Jira via Model Context Protocol

## Usage

After starting the application, you can:

1. Navigate to the main page
2. Ask questions about team activity in Jira, such as:
   - "What's the progress of my team this week?"
   - "Show me all activity in the PROJ project in the last 3 days"
   - "How many tickets were closed yesterday?"
   - "What's the status of PROJ-123?"

## Model Context Protocol (MCP)

This application uses the [Model Context Protocol](https://modelcontextprotocol.io/) to connect Claude to Jira data. MCP allows AI assistants to access external tools and data sources in a standardized way.

The MCP server used in this application is [sooperset/mcp-atlassian](https://github.com/sooperset/mcp-atlassian), which provides MCP-compatible access to Atlassian products like Jira.

## Learn More

- [Anthropic MCP Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector)
- [Atlassian API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
