import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getMCPClient } from '@/lib/mcp-client';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // First, use Claude to understand the user's intent and extract parameters
    const analysisMessage = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Analyze this GitHub activity request and extract the parameters needed to call the appropriate MCP server tool. 

User prompt: "${prompt}"

Available MCP tools:
- get_user_activity: requires username, optional limit
- get_repo_activity: requires owner and repo, optional limit  
- get_repo_commits: requires owner and repo, optional limit
- get_repo_issues: requires owner and repo, optional state and limit
- get_repo_pull_requests: requires owner and repo, optional state and limit

Respond with a JSON object containing:
{
  "tool": "tool_name",
  "parameters": { "param1": "value1", "param2": "value2" },
  "explanation": "Brief explanation of what you understood from the prompt"
}

If the prompt is unclear or missing required information, set "tool" to "clarification_needed" and explain what's missing in the explanation field.`
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

    switch (analysis.tool) {
      case 'get_user_activity':
        mcpResult = await mcpClient.getUserActivity(
          analysis.parameters.username,
          analysis.parameters.limit || 30
        );
        break;
      case 'get_repo_activity':
        mcpResult = await mcpClient.getRepoActivity(
          analysis.parameters.owner,
          analysis.parameters.repo,
          analysis.parameters.limit || 30
        );
        break;
      case 'get_repo_commits':
        mcpResult = await mcpClient.getRepoCommits(
          analysis.parameters.owner,
          analysis.parameters.repo,
          analysis.parameters.limit || 30
        );
        break;
      case 'get_repo_issues':
        mcpResult = await mcpClient.getRepoIssues(
          analysis.parameters.owner,
          analysis.parameters.repo,
          analysis.parameters.state || 'all',
          analysis.parameters.limit || 30
        );
        break;
      case 'get_repo_pull_requests':
        mcpResult = await mcpClient.getRepoPullRequests(
          analysis.parameters.owner,
          analysis.parameters.repo,
          analysis.parameters.state || 'all',
          analysis.parameters.limit || 30
        );
        break;
      default:
        throw new Error(`Unknown tool: ${analysis.tool}`);
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

    return NextResponse.json({
      success: true,
      userPrompt: prompt,
      claudeAnalysis: analysis,
      mcpData: mcpResult,
      claudeSummary: summaryContent.text,
      timestamp: new Date().toISOString()
    });

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
