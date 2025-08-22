import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, activityType = 'activity' } = await request.json();

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repo are required' },
        { status: 400 }
      );
    }

    // Create a prompt for Claude to use the GitHub MCP server
    let prompt = '';
    switch (activityType) {
      case 'activity':
        prompt = `Please use the GitHub MCP server to get recent activity for the repository ${owner}/${repo}. Use the get_repo_activity tool with owner="${owner}" and repo="${repo}".`;
        break;
      case 'commits':
        prompt = `Please use the GitHub MCP server to get recent commits for the repository ${owner}/${repo}. Use the get_repo_commits tool with owner="${owner}" and repo="${repo}".`;
        break;
      case 'issues':
        prompt = `Please use the GitHub MCP server to get recent issues for the repository ${owner}/${repo}. Use the get_repo_issues tool with owner="${owner}" and repo="${repo}".`;
        break;
      case 'pulls':
        prompt = `Please use the GitHub MCP server to get recent pull requests for the repository ${owner}/${repo}. Use the get_repo_pull_requests tool with owner="${owner}" and repo="${repo}".`;
        break;
      default:
        prompt = `Please use the GitHub MCP server to get recent activity for the repository ${owner}/${repo}. Use the get_repo_activity tool with owner="${owner}" and repo="${repo}".`;
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the response content
    const responseContent = message.content[0];
    let githubData = null;

    if (responseContent.type === 'text') {
      // Try to extract JSON from Claude's response
      const text = responseContent.text;
      
      // Look for JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          githubData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('Failed to parse JSON from Claude response:', parseError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: githubData,
      rawResponse: message.content[0],
    });

  } catch (error) {
    console.error('Error calling Claude API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub activity' },
      { status: 500 }
    );
  }
}
