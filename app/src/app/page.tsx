'use client';

import { useState } from 'react';

interface ApiResponse {
  success?: boolean;
  data?: unknown;
  count?: number;
  total?: number;
  error?: string;
  message?: string;
}

export default function Home() {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailQuery, setEmailQuery] = useState('');
  const [domainQuery, setDomainQuery] = useState('joshsoftware.com');

  const makeApiCall = async (endpoint: string, method: 'GET' | 'POST' = 'GET', body?: unknown) => {
    setLoading(true);
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && method === 'POST') {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(endpoint, options);
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const testEndpoints = {
    health: () => makeApiCall('/api/mcp?action=health'),
    projects: () => makeApiCall('/api/mcp?action=projects'),
    issues: () => makeApiCall('/api/mcp?action=issues'),
    users: () => makeApiCall(`/api/mcp?action=users&query=${encodeURIComponent(domainQuery)}`),
    usersFromProjects: () => makeApiCall('/api/mcp?action=users-from-projects'),
    usersByEmail: () => {
      if (!emailQuery.trim()) {
        setResponse({
          error: 'Validation error',
          message: 'Please enter an email query to search',
        });
        return;
      }
      makeApiCall(`/api/mcp?action=users-by-email&emailQuery=${encodeURIComponent(emailQuery)}`);
    },
    usersAll: () => makeApiCall('/api/mcp?action=users&query=.'),
    boards: () => makeApiCall('/api/mcp?action=boards'),
    createIssue: () =>
      makeApiCall('/api/mcp?action=create-issue', 'POST', {
        projectKey: 'TEST',
        summary: 'Test Issue from Frontend',
        description: 'This is a test issue created from the frontend',
        type: 'Task',
      }),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Jira MCP API Testing Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Test your Jira MCP integration with this interactive dashboard. Make sure to configure your
            environment variables first.
          </p>

          {/* Configuration Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Configuration</h2>
            <p className="text-blue-700 text-sm">
              Create a <code className="bg-blue-100 px-1 rounded">.env.local</code> file in the app
              directory with your Jira credentials:
            </p>
            <pre className="bg-blue-100 p-2 rounded mt-2 text-xs text-blue-800">
              {`JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token`}
            </pre>
          </div>

          {/* API Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={testEndpoints.health}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Health Check
            </button>
            <button
              onClick={testEndpoints.projects}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              List Projects
            </button>
            <button
              onClick={testEndpoints.issues}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              List Issues
            </button>
            <button
              onClick={testEndpoints.boards}
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              List Boards
            </button>
          </div>

          {/* Search Input Fields */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Search Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emailQuery" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Search Query
                </label>
                <input
                  id="emailQuery"
                  type="text"
                  value={emailQuery}
                  onChange={(e) => setEmailQuery(e.target.value)}
                  placeholder="Enter email or partial email (e.g., john.doe, @company.com)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Search for users by email address or partial match
                </p>
              </div>
              <div>
                <label htmlFor="domainQuery" className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Search Query
                </label>
                <input
                  id="domainQuery"
                  type="text"
                  value={domainQuery}
                  onChange={(e) => setDomainQuery(e.target.value)}
                  placeholder="Enter domain (e.g., company.com)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Search for users by company domain
                </p>
              </div>
            </div>
          </div>

          {/* User Search Buttons */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">User Search Methods</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={testEndpoints.users}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Search by Domain
              </button>
              <button
                onClick={testEndpoints.usersFromProjects}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Users from Projects
              </button>
              <button
                onClick={testEndpoints.usersByEmail}
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Search by Email
              </button>
              <button
                onClick={testEndpoints.usersAll}
                disabled={loading}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Search All Users
              </button>
            </div>
          </div>

          {/* Other Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Other Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={testEndpoints.createIssue}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Test Issue
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Making API call...</span>
            </div>
          )}

          {/* Response Display */}
          {response && !loading && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">API Response</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${response.error
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                    }`}
                >
                  {response.error ? 'Error' : 'Success'}
                </span>
              </div>

              {/* Response Summary */}
              {response.success && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {response.count !== undefined && (
                    <div className="bg-white p-3 rounded border">
                      <div className="text-2xl font-bold text-blue-600">{response.count}</div>
                      <div className="text-sm text-gray-600">Items Returned</div>
                    </div>
                  )}
                  {response.total !== undefined && (
                    <div className="bg-white p-3 rounded border">
                      <div className="text-2xl font-bold text-green-600">{response.total}</div>
                      <div className="text-sm text-gray-600">Total Available</div>
                    </div>
                  )}
                  {response.data && Array.isArray(response.data as unknown[]) ? (
                    <div className="bg-white p-3 rounded border">
                      <div className="text-2xl font-bold text-purple-600">
                        {(response.data as unknown[]).length}
                      </div>
                      <div className="text-sm text-gray-600">Array Length</div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Raw JSON Response */}
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Documentation Links */}
          <div className="mt-8 bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation & Testing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Postman Testing</h4>
                <p className="text-sm text-gray-600 mb-2">
                  For comprehensive API testing, use the Postman documentation provided in the project
                  root.
                </p>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                  POSTMAN_API_DOCUMENTATION.md
                </code>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Available Endpoints</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• GET /api/mcp?action=health</li>
                  <li>• GET /api/mcp?action=projects</li>
                  <li>• GET /api/mcp?action=issues</li>
                  <li>• GET /api/mcp?action=users&query=search</li>
                  <li>• POST /api/mcp?action=create-issue</li>
                  <li>• And more...</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Employee Data Workflow */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">
              Getting Employee Data Workflow
            </h3>
            <div className="space-y-3 text-sm text-yellow-800">
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  1
                </span>
                <div>
                  <strong>List all projects</strong> to get project keys
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  2
                </span>
                <div>
                  <strong>Get issues for each project</strong> to extract assignee and reporter data
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  3
                </span>
                <div>
                  <strong>Search users</strong> with company domain to find all employees
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  4
                </span>
                <div>
                  <strong>Get detailed user info</strong> for each unique account ID found
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
