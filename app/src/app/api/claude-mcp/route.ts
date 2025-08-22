import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getMCPClient } from '@/lib/mcp-client';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, fromDate, toDate } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // First, use Claude to understand the user's intent and extract parameters
    let promptContent = `Analyze this GitHub activity request and extract the parameters needed to call the appropriate MCP server tool. 

User prompt: "${prompt}"

Available MCP tools:
- get_user_activity: requires username, optional limit
- get_repo_activity: requires owner and repo, optional limit  
- get_repo_commits: requires owner and repo, optional limit
- get_repo_issues: requires owner and repo, optional state and limit
- get_repo_pull_requests: requires owner and repo, optional state and limit

All tools support date range parameters:
- since: ISO date string for start date (e.g., "2025-01-01")
- until: ISO date string for end date (e.g., "2025-08-22")`;

    // Add date range information if provided
    if (fromDate || toDate) {
      promptContent += `\n\nIMPORTANT: The user has explicitly specified a date range that should override any dates mentioned in the prompt:`;
      if (fromDate) promptContent += `\n- From date: ${fromDate}`;
      if (toDate) promptContent += `\n- To date: ${toDate}`;
    }

    promptContent += `\n\nRespond with a JSON object containing:
{
  "tool": "tool_name",
  "parameters": { "param1": "value1", "param2": "value2" },
  "explanation": "Brief explanation of what you understood from the prompt"
}

If the prompt is unclear or missing required information, set "tool" to "clarification_needed" and explain what's missing in the explanation field.`;

    const analysisMessage = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: promptContent
        }
      ]
    });

    const analysisContent = analysisMessage.content[0];
    if (analysisContent.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Extract JSON from Claude's response
    const jsonMatch = analysisContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Claude analysis');
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error('Failed to parse Claude analysis JSON');
    }

    // If clarification is needed, return early
    if (analysis.tool === 'clarification_needed') {
      return NextResponse.json({
        success: false,
        needsClarification: true,
        explanation: analysis.explanation,
        claudeAnalysis: analysis
      });
    }

    // Get the MCP client and call the appropriate tool
    const mcpClient = await getMCPClient();
    let mcpResult;

    // Use explicit date parameters if provided, otherwise use dates from Claude's analysis
    const since = fromDate || analysis.parameters.since;
    const until = toDate || analysis.parameters.until;
    
    switch (analysis.tool) {
      case 'get_user_activity':
        mcpResult = await mcpClient.getUserActivity(
          analysis.parameters.username,
          analysis.parameters.limit || 30,
          since,
          until
        );
        break;
      case 'get_repo_activity':
        mcpResult = await mcpClient.getRepoActivity(
          analysis.parameters.owner,
          analysis.parameters.repo,
          analysis.parameters.limit || 30,
          since,
          until
        );
        break;
      case 'get_repo_commits':
        mcpResult = await mcpClient.getRepoCommits(
          analysis.parameters.owner,
          analysis.parameters.repo,
          analysis.parameters.limit || 30,
          since,
          until
        );
        break;
      case 'get_repo_issues':
        mcpResult = await mcpClient.getRepoIssues(
          analysis.parameters.owner,
          analysis.parameters.repo,
          analysis.parameters.state || 'all',
          analysis.parameters.limit || 30,
          since,
          until
        );
        break;
      case 'get_repo_pull_requests':
        mcpResult = await mcpClient.getRepoPullRequests(
          analysis.parameters.owner,
          analysis.parameters.repo,
          analysis.parameters.state || 'all',
          analysis.parameters.limit || 30,
          since,
          until
        );
        break;
      default:
        throw new Error(`Unknown tool: ${analysis.tool}`);
    }
    
    // Parse the result if it's in text format
    let parsedMcpResult = mcpResult;
    if (mcpResult && mcpResult.content && Array.isArray(mcpResult.content)) {
      for (const item of mcpResult.content) {
        if (item.type === 'text' && item.text) {
          try {
            // Try to parse the text as JSON
            parsedMcpResult = JSON.parse(item.text);
            break;
          } catch (e) {
            console.error('Failed to parse JSON from text content:', e);
          }
        }
      }
    }
    
    // Apply date filtering on our side since the MCP server doesn't support it properly
    if (parsedMcpResult && (fromDate || toDate || since || until)) {
      const fromTimestamp = fromDate || since ? new Date(fromDate || since).getTime() : 0;
      const toTimestamp = toDate || until ? new Date(toDate || until).getTime() : Infinity;
      
      // Filter commits if present
      if (parsedMcpResult.commits && Array.isArray(parsedMcpResult.commits)) {
        const filteredCommits = parsedMcpResult.commits.filter((commit: { date: string }) => {
          const commitDate = new Date(commit.date).getTime();
          return commitDate >= fromTimestamp && commitDate <= toTimestamp;
        });
        
        parsedMcpResult.commits = filteredCommits;
        if (parsedMcpResult.total_commits !== undefined) {
          parsedMcpResult.total_commits = filteredCommits.length;
        }
      }
      
      // Filter issues if present
      if (parsedMcpResult.issues && Array.isArray(parsedMcpResult.issues)) {
        const filteredIssues = parsedMcpResult.issues.filter((issue: { created_at: string }) => {
          const issueDate = new Date(issue.created_at).getTime();
          return issueDate >= fromTimestamp && issueDate <= toTimestamp;
        });
        
        parsedMcpResult.issues = filteredIssues;
        if (parsedMcpResult.total_issues !== undefined) {
          parsedMcpResult.total_issues = filteredIssues.length;
        }
      }
      
      // Filter pull requests if present
      if (parsedMcpResult.pull_requests && Array.isArray(parsedMcpResult.pull_requests)) {
        const filteredPRs = parsedMcpResult.pull_requests.filter((pr: { created_at: string }) => {
          const prDate = new Date(pr.created_at).getTime();
          return prDate >= fromTimestamp && prDate <= toTimestamp;
        });
        
        parsedMcpResult.pull_requests = filteredPRs;
        if (parsedMcpResult.total_pull_requests !== undefined) {
          parsedMcpResult.total_pull_requests = filteredPRs.length;
        }
      }
      
      // Filter events if present
      if (parsedMcpResult.events && Array.isArray(parsedMcpResult.events)) {
        const filteredEvents = parsedMcpResult.events.filter((event: { created_at: string }) => {
          const eventDate = new Date(event.created_at).getTime();
          return eventDate >= fromTimestamp && eventDate <= toTimestamp;
        });
        
        parsedMcpResult.events = filteredEvents;
        if (parsedMcpResult.total_events !== undefined) {
          parsedMcpResult.total_events = filteredEvents.length;
        }
      }
    }

    // Now use Claude to format and summarize the results
    const summaryMessage = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `The user asked: "${prompt}"

I used the MCP server to fetch GitHub data using the ${analysis.tool} tool with parameters: ${JSON.stringify(analysis.parameters)}

Here's the raw data from the MCP server:
${JSON.stringify(mcpResult, null, 2)}

Please provide a helpful summary and analysis of this GitHub activity data. Format your response in a user-friendly way that directly addresses what the user was asking for. Include key insights, statistics, and any notable patterns you observe.`
        }
      ]
    });

    const summaryContent = summaryMessage.content[0];
    if (summaryContent.type !== 'text') {
      throw new Error('Unexpected response format from Claude summary');
    }

    // Prepare response data
    const responseData: any = {
      success: true,
      userPrompt: prompt,
      claudeAnalysis: analysis,
      mcpData: parsedMcpResult,
      claudeSummary: summaryContent.text,
      timestamp: new Date().toISOString()
    };
    
    // Add date range to response if provided
    if (fromDate || toDate || analysis.parameters.since || analysis.parameters.until) {
      responseData.date_range = {
        from: fromDate || analysis.parameters.since || 'not specified',
        to: toDate || analysis.parameters.until || 'not specified'
      };
    }
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in Claude-MCP integration:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
