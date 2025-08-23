import { NextRequest, NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp-client';

export async function POST(request: NextRequest) {
  try {
    const { 
      owner, 
      repo, 
      username, 
      activityType = 'activity', 
      limit = 30,
      fromDate,
      toDate
    } = await request.json();

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
        result = await mcpClient.getUserActivity(username, limit, fromDate, toDate);
        break;
        
      case 'activity':
        if (!owner || !repo) {
          return NextResponse.json(
            { error: 'Owner and repo are required for repository activity' },
            { status: 400 }
          );
        }
        result = await mcpClient.getRepoActivity(owner, repo, limit, fromDate, toDate);
        break;
        
      case 'commits':
        if (!owner || !repo) {
          return NextResponse.json(
            { error: 'Owner and repo are required for commits' },
            { status: 400 }
          );
        }
        result = await mcpClient.getRepoCommits(owner, repo, limit, fromDate, toDate);
        break;
        
      case 'issues':
        if (!owner || !repo) {
          return NextResponse.json(
            { error: 'Owner and repo are required for issues' },
            { status: 400 }
          );
        }
        result = await mcpClient.getRepoIssues(owner, repo, 'all', limit, fromDate, toDate);
        break;
        
      case 'pulls':
        if (!owner || !repo) {
          return NextResponse.json(
            { error: 'Owner and repo are required for pull requests' },
            { status: 400 }
          );
        }
        result = await mcpClient.getRepoPullRequests(owner, repo, 'all', limit, fromDate, toDate);
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
    
    // Apply date filtering on our side since the MCP server doesn't support it
    if (parsedData) {
      // Date filtering
      if (fromDate || toDate) {
        const fromTimestamp = fromDate ? new Date(fromDate).getTime() : 0;
        const toTimestamp = toDate ? new Date(toDate).getTime() : Infinity;
        
        // Filter commits if present
        if (parsedData.commits && Array.isArray(parsedData.commits)) {
          const filteredCommits = parsedData.commits.filter((commit: { date: string }) => {
            const commitDate = new Date(commit.date).getTime();
            return commitDate >= fromTimestamp && commitDate <= toTimestamp;
          });
          
          parsedData.commits = filteredCommits;
          parsedData.total_commits = filteredCommits.length;
        }
        
        // Filter issues if present
        if (parsedData.issues && Array.isArray(parsedData.issues)) {
          const filteredIssues = parsedData.issues.filter((issue: { created_at: string }) => {
            const issueDate = new Date(issue.created_at).getTime();
            return issueDate >= fromTimestamp && issueDate <= toTimestamp;
          });
          
          parsedData.issues = filteredIssues;
          parsedData.total_issues = filteredIssues.length;
        }
        
        // Filter pull requests if present
        if (parsedData.pull_requests && Array.isArray(parsedData.pull_requests)) {
          const filteredPRs = parsedData.pull_requests.filter((pr: { created_at: string }) => {
            const prDate = new Date(pr.created_at).getTime();
            return prDate >= fromTimestamp && prDate <= toTimestamp;
          });
          
          parsedData.pull_requests = filteredPRs;
          parsedData.total_pull_requests = filteredPRs.length;
        }
        
        // Filter events if present
        if (parsedData.events && Array.isArray(parsedData.events)) {
          const filteredEvents = parsedData.events.filter((event: { created_at: string }) => {
            const eventDate = new Date(event.created_at).getTime();
            return eventDate >= fromTimestamp && eventDate <= toTimestamp;
          });
          
          parsedData.events = filteredEvents;
          parsedData.total_events = filteredEvents.length;
        }
      }
      
      // Username filtering when both username and repository info are provided
      if (username && (owner && repo) && activityType !== 'user_activity') {
        // Filter commits by username
        if (parsedData.commits && Array.isArray(parsedData.commits)) {
          const filteredCommits = parsedData.commits.filter((commit: { author: string }) => {
            return commit.author.toLowerCase() === username.toLowerCase();
          });
          
          parsedData.commits = filteredCommits;
          parsedData.total_commits = filteredCommits.length;
        }
        
        // Filter issues by username
        if (parsedData.issues && Array.isArray(parsedData.issues)) {
          const filteredIssues = parsedData.issues.filter((issue: { author: string }) => {
            return issue.author.toLowerCase() === username.toLowerCase();
          });
          
          parsedData.issues = filteredIssues;
          parsedData.total_issues = filteredIssues.length;
        }
        
        // Filter pull requests by username
        if (parsedData.pull_requests && Array.isArray(parsedData.pull_requests)) {
          const filteredPRs = parsedData.pull_requests.filter((pr: { author: string }) => {
            return pr.author.toLowerCase() === username.toLowerCase();
          });
          
          parsedData.pull_requests = filteredPRs;
          parsedData.total_pull_requests = filteredPRs.length;
        }
        
        // Add username to response data
        parsedData.user = username;
      }
    }

    // Add date range to response if provided
    const responseData: any = {
      success: true,
      data: parsedData,
      activityType,
      timestamp: new Date().toISOString()
    };
    
    if (fromDate || toDate) {
      responseData.date_range = {
        from: fromDate || 'not specified',
        to: toDate || 'not specified'
      };
    }
    
    return NextResponse.json(responseData);

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
