'use client';

import { useState } from 'react';

interface GitHubActivity {
  repository?: string;
  user?: string;
  total_events?: number;
  total_commits?: number;
  total_issues?: number;
  total_pull_requests?: number;
  date_range?: {
    from: string;
    to: string;
  };
  events?: Array<{
    id: string;
    type: string;
    actor?: string;
    repo: string;
    created_at: string;
    payload: any;
  }>;
  commits?: Array<{
    sha: string;
    author: string;
    message: string;
    date: string;
  }>;
  issues?: Array<{
    number: number;
    title: string;
    author: string;
    state: string;
    created_at: string;
    updated_at: string;
    body: string;
  }>;
  pull_requests?: Array<{
    number: number;
    title: string;
    author: string;
    state: string;
    created_at: string;
    updated_at: string;
    merged_at: string | null;
    body: string;
  }>;
}

export default function Home() {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [activityType, setActivityType] = useState('activity');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GitHubActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  
  // Date range state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [useDateRange, setUseDateRange] = useState(false);
  
  // New state for Claude-MCP integration
  const [prompt, setPrompt] = useState('');
  const [claudeLoading, setClaudeLoading] = useState(false);
  const [claudeResponse, setClaudeResponse] = useState<any>(null);
  const [claudeError, setClaudeError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'prompt'>('prompt');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    setRawResponse(null);

    try {
      // Prepare request payload
      const payload: any = { owner, repo, activityType };
      
      // Add date range if enabled
      if (useDateRange) {
        if (fromDate) payload.fromDate = fromDate;
        if (toDate) payload.toDate = toDate;
      }
      
      const response = await fetch('/api/github-mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setData(result.data);
      setRawResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaudeLoading(true);
    setClaudeError(null);
    setClaudeResponse(null);

    try {
      // Prepare request payload
      const payload: any = { prompt };
      
      // Add date range if enabled
      if (useDateRange) {
        if (fromDate) payload.fromDate = fromDate;
        if (toDate) payload.toDate = toDate;
      }
      
      const response = await fetch('/api/claude-mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process prompt');
      }

      setClaudeResponse(result);
    } catch (err) {
      setClaudeError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setClaudeLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderActivityEvents = (events: any[]) => (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id || index} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-semibold text-blue-600">{event.type}</span>
              {event.actor && <span className="ml-2 text-gray-600">by {event.actor}</span>}
            </div>
            <span className="text-sm text-gray-500">{formatDate(event.created_at)}</span>
          </div>
          <div className="text-sm text-gray-700">
            <strong>Repository:</strong> {event.repo}
          </div>
          {event.payload && Object.keys(event.payload).length > 0 && (
            <div className="mt-2 text-sm">
              <strong>Details:</strong>
              <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderCommits = (commits: any[]) => (
    <div className="space-y-4">
      {commits.map((commit, index) => (
        <div key={commit.sha || index} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">{commit.sha}</span>
              <span className="ml-2 text-gray-600">by {commit.author}</span>
            </div>
            <span className="text-sm text-gray-500">{formatDate(commit.date)}</span>
          </div>
          <div className="text-sm font-medium">{commit.message}</div>
        </div>
      ))}
    </div>
  );

  const renderIssues = (issues: any[]) => (
    <div className="space-y-4">
      {issues.map((issue, index) => (
        <div key={issue.number || index} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-semibold">#{issue.number}</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                issue.state === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {issue.state}
              </span>
            </div>
            <span className="text-sm text-gray-500">{formatDate(issue.created_at)}</span>
          </div>
          <div className="font-medium mb-2">{issue.title}</div>
          <div className="text-sm text-gray-600 mb-2">by {issue.author}</div>
          {issue.body && (
            <div className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
              {issue.body}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderPullRequests = (prs: any[]) => (
    <div className="space-y-4">
      {prs.map((pr, index) => (
        <div key={pr.number || index} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-semibold">#{pr.number}</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                pr.state === 'open' ? 'bg-green-100 text-green-800' : 
                pr.merged_at ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
              }`}>
                {pr.merged_at ? 'merged' : pr.state}
              </span>
            </div>
            <span className="text-sm text-gray-500">{formatDate(pr.created_at)}</span>
          </div>
          <div className="font-medium mb-2">{pr.title}</div>
          <div className="text-sm text-gray-600 mb-2">by {pr.author}</div>
          {pr.body && (
            <div className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
              {pr.body}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            GitHub Activity Viewer with Claude & MCP
          </h1>
          <p className="text-gray-600 mb-6">
            This system uses Claude Anthropic to process natural language prompts and fetch GitHub data via MCP server with stdio communication.
          </p>

          {/* Tab Navigation */}
          <div className="flex mb-6 border-b">
            <button
              type="button"
              onClick={() => setActiveTab('prompt')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'prompt'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Natural Language Prompt
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'form'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Structured Form
            </button>
          </div>

          {/* Natural Language Prompt Tab */}
          {activeTab === 'prompt' && (
            <div>
              <form onSubmit={handlePromptSubmit} className="space-y-4">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Ask about GitHub activity in natural language
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Examples:
• Show me recent activity for facebook/react
• What are the latest commits in microsoft/vscode?
• Get the open issues for torvalds/linux
• Show pull requests for vercel/next.js
• What has octocat been up to lately?
• Show me commits for facebook/react from last month
• Get issues for microsoft/vscode created in the past week"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-vertical"
                    required
                  />
                </div>
                
                {/* Date Range Controls for Prompt Tab */}
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="useDateRangePrompt"
                      checked={useDateRange}
                      onChange={(e) => setUseDateRange(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="useDateRangePrompt" className="ml-2 block text-sm font-medium text-gray-700">
                      Add Specific Date Range (overrides dates in prompt)
                    </label>
                  </div>
                  
                  {useDateRange && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label htmlFor="fromDatePrompt" className="block text-sm font-medium text-gray-700 mb-1">
                          From Date
                        </label>
                        <input
                          type="date"
                          id="fromDatePrompt"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="toDatePrompt" className="block text-sm font-medium text-gray-700 mb-1">
                          To Date
                        </label>
                        <input
                          type="date"
                          id="toDatePrompt"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={claudeLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {claudeLoading ? 'Processing with Claude & MCP...' : 'Ask Claude to Fetch GitHub Data'}
                </button>
              </form>
            </div>
          )}

          {/* Structured Form Tab */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
                  Repository Owner
                </label>
                <input
                  type="text"
                  id="owner"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g., facebook, microsoft"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="repo" className="block text-sm font-medium text-gray-700 mb-1">
                  Repository Name
                </label>
                <input
                  type="text"
                  id="repo"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="e.g., react, vscode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

              <div>
                <label htmlFor="activityType" className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Type
                </label>
                <select
                  id="activityType"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activity">Recent Activity</option>
                  <option value="commits">Recent Commits</option>
                  <option value="issues">Issues</option>
                  <option value="pulls">Pull Requests</option>
                </select>
              </div>
              
              {/* Date Range Controls */}
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="useDateRange"
                    checked={useDateRange}
                    onChange={(e) => setUseDateRange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useDateRange" className="ml-2 block text-sm font-medium text-gray-700">
                    Specify Date Range
                  </label>
                </div>
                
                {useDateRange && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        id="fromDate"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        id="toDate"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Fetching Data...' : 'Fetch GitHub Activity'}
              </button>
            </form>
          )}
        </div>

        {/* Claude Response */}
        {claudeError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {claudeError}
          </div>
        )}

        {claudeResponse && (
          <div className="space-y-6">
            {claudeResponse.needsClarification ? (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                <strong>Need Clarification:</strong> {claudeResponse.explanation}
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Claude's Analysis & Summary
                  </h2>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Your Request:</h3>
                    <p className="text-blue-800">"{claudeResponse.userPrompt}"</p>
                  </div>
                  <div className="mb-4 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Claude's Understanding:</h3>
                    <p className="text-green-800">{claudeResponse.claudeAnalysis.explanation}</p>
                    <p className="text-sm text-green-600 mt-2">
                      Tool used: {claudeResponse.claudeAnalysis.tool} with parameters: {JSON.stringify(claudeResponse.claudeAnalysis.parameters)}
                    </p>
                  </div>
                  <div className="prose max-w-none">
                    <h3 className="font-semibold text-gray-900 mb-2">Summary & Insights:</h3>
                    <div className="whitespace-pre-wrap text-gray-700">
                      {claudeResponse.claudeSummary}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Raw MCP Server Data
                  </h3>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto max-h-96">
                    {JSON.stringify(claudeResponse.mcpData, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}

        {/* Form-based results */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {data && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {data.repository && `${data.repository} - `}
              {activityType.charAt(0).toUpperCase() + activityType.slice(1)}
            </h2>
            
            <div className="mb-4 text-sm text-gray-600">
              {data.total_events && `Total Events: ${data.total_events}`}
              {data.total_commits && `Total Commits: ${data.total_commits}`}
              {data.total_issues && `Total Issues: ${data.total_issues}`}
              {data.total_pull_requests && `Total Pull Requests: ${data.total_pull_requests}`}
            </div>

            {data.events && renderActivityEvents(data.events)}
            {data.commits && renderCommits(data.commits)}
            {data.issues && renderIssues(data.issues)}
            {data.pull_requests && renderPullRequests(data.pull_requests)}
          </div>
        )}

        {rawResponse && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Claude's Raw Response
            </h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {rawResponse.type === 'text' ? rawResponse.text : JSON.stringify(rawResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
