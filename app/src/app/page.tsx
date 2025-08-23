'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the ClaudeDemo component to avoid SSR issues
const ClaudeDemo = dynamic(() => import('../components/ClaudeDemo'), { ssr: false });

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Jira MCP API Testing Dashboard
          </h1>
          <p className="text-gray-600 mb-10">
            Use this dashboard to test your Jira MCP integration. Try different API calls and inspect
            responses below.
          </p>

          {/* API Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
            <button
              onClick={testEndpoints.health}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium shadow-md transition"
            >
              Health Check
            </button>
            <button
              onClick={testEndpoints.projects}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium shadow-md transition"
            >
              List Projects
            </button>
            <button
              onClick={testEndpoints.issues}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium shadow-md transition"
            >
              List Issues
            </button>
            <button
              onClick={testEndpoints.boards}
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium shadow-md transition"
            >
              List Boards
            </button>
          </div>

          {/* Search Input Fields */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Search Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* User Search Buttons */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">User Search Methods</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <button
                onClick={testEndpoints.users}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium shadow-md transition"
              >
                Search by Domain
              </button>
              <button
                onClick={testEndpoints.usersFromProjects}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium shadow-md transition"
              >
                Users from Projects
              </button>
              <button
                onClick={testEndpoints.usersByEmail}
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium shadow-md transition"
              >
                Search by Email
              </button>
              <button
                onClick={testEndpoints.usersAll}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium shadow-md transition"
              >
                Search All Users
              </button>
            </div>
          </div>

          {/* Other Actions */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Other Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button
                onClick={testEndpoints.createIssue}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium shadow-md transition"
              >
                Create Test Issue
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-700 font-medium">Making API call...</span>
            </div>
          )}

          {/* Response Display */}
          {response && !loading && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-inner">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-semibold text-gray-900">API Response</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${response.error
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                    }`}
                >
                  {response.error ? 'Error' : 'Success'}
                </span>
              </div>

              {/* Summary Metrics */}
              {response.success && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                  {response.count !== undefined && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">{response.count}</div>
                      <div className="text-sm text-gray-600">Items Returned</div>
                    </div>
                  )}
                  {response.total !== undefined && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="text-2xl font-bold text-green-600">{response.total}</div>
                      <div className="text-sm text-gray-600">Total Available</div>
                    </div>
                  )}
                  {response.data && Array.isArray(response.data as unknown[]) ? (
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">
                        {(response.data as unknown[]).length}
                      </div>
                      <div className="text-sm text-gray-600">Array Length</div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* JSON Panel */}
              <div className="bg-gray-900 text-green-300 p-5 rounded-lg overflow-auto max-h-96 text-sm font-mono">
                <pre>{JSON.stringify(response, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Claude NLP Demo */}
          <div className="mt-12 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Claude NLP Demo</h2>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <ClaudeDemo />
            </div>
          </div>

          {/* Documentation Links */}
          <div className="mt-12 bg-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation & Testing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Postman Testing</h4>
                <p className="text-gray-600 mb-2">
                  For comprehensive API testing, use the Postman documentation provided in the project root.
                </p>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                  POSTMAN_API_DOCUMENTATION.md
                </code>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Available Endpoints</h4>
                <ul className="text-gray-600 space-y-1">
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
          <div className="mt-10 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">
              Getting Employee Data Workflow
            </h3>
            <div className="space-y-4 text-sm text-yellow-800">
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                  1
                </span>
                <p><strong>List all projects</strong> to get project keys</p>
              </div>
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                  2
                </span>
                <p><strong>Get issues for each project</strong> to extract assignee and reporter data</p>
              </div>
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                  3
                </span>
                <p><strong>Search users</strong> with company domain to find all employees</p>
              </div>
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                  4
                </span>
                <p><strong>Get detailed user info</strong> for each unique account ID found</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
