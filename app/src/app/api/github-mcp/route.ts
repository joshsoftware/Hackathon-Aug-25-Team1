import { NextRequest, NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp-client';

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, username, activityType = 'activity', limit = 30 } = await request.json();

    // Get the MCP client instance
    const mcpClient = await getMCPClient();

    let result;
    
    switch (activityType) {
      case 'user_activity':
        if (!username) {
          return NextResponse.json(
            { error: 'Username is required for user activity' },
            { status: 400 }
          );
        }
        result = await mcpClient.getUserActivity(username, limit);
        break;
        
      case 'activity':
        if (!owner || !repo) {
          return NextResponse.json(
            { error: 'Owner and repo are required for repository activity' },
            { status: 400 }
          );
        }
        result = await mcpClient.getRepoActivity(owner, repo, limit);
        break;
        
      case 'commits':
        if (!owner || !repo) {
          return NextResponse.json(
            { error: 'Owner and repo are required for commits' },
            { status: 400 }
          );
        }
        result = await mcpClient.getRepoCommits(owner, repo, limit);
        break;
        
      case 'issues':
        if (!owner || !repo) {
          return NextResponse.json(
            { error: 'Owner and repo are required for issues' },
            { status: 400 }
          );
        }
        result = await mcpClient.getRepoIssues(owner, repo, 'all', limit);
        break;
        
      case 'pulls':
        if (!owner || !repo) {
          return NextResponse.json(
            { error: 'Owner and repo are required for pull requests' },
            { status: 400 }
          );
        }
        result = await mcpClient.getRepoPullRequests(owner, repo, 'all', limit);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid activity type' },
          { status: 400 }
        );
    }

    // Parse the result if it's in text format
    let parsedData = result;
    if (result && result.content && Array.isArray(result.content)) {
      for (const item of result.content) {
        if (item.type === 'text' && item.text) {
          try {
            // Try to parse the text as JSON
            parsedData = JSON.parse(item.text);
            break;
          } catch (e) {
            console.error('Failed to parse JSON from text content:', e);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      activityType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calling MCP server:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch GitHub data from MCP server',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get available tools from MCP server
    const mcpClient = await getMCPClient();
    const tools = await mcpClient.listTools();
    
    return NextResponse.json({
      success: true,
      tools,
      message: 'MCP server is connected and available'
    });
  } catch (error) {
    console.error('Error connecting to MCP server:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to MCP server',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
