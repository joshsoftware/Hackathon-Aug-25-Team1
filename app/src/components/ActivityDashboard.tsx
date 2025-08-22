'use client';

import React, { useState, useEffect } from 'react';

interface ActivityData {
  summary: {
    totalCommits: number;
    totalIssues: number;
    totalPullRequests: number;
    activeContributors: number;
    repositoryInfo: any;
  };
  details: {
    commits: any[];
    issues: any[];
    pullRequests: any[];
    codeReviews: any[];
  };
}

export default function ActivityDashboard() {
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/github-activity');
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity data');
      }

      const data = await response.json();
      setActivity(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!activity) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Commits</h3>
          <p className="text-2xl font-bold text-blue-600">{activity.summary.totalCommits}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Issues</h3>
          <p className="text-2xl font-bold text-green-600">{activity.summary.totalIssues}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pull Requests</h3>
          <p className="text-2xl font-bold text-purple-600">{activity.summary.totalPullRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Contributors</h3>
          <p className="text-2xl font-bold text-orange-600">{activity.summary.activeContributors}</p>
        </div>
      </div>

      {/* Repository Info */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Repository Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-500">Stars:</span>
            <p className="font-semibold">{activity.summary.repositoryInfo.stars}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Forks:</span>
            <p className="font-semibold">{activity.summary.repositoryInfo.forks}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Watchers:</span>
            <p className="font-semibold">{activity.summary.repositoryInfo.watchers}</p>
          </div>
        </div>
      </div>

      {/* Recent Commits */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Commits (Last 30 Days)</h2>
        <div className="space-y-3">
          {activity.details.commits.slice(0, 10).map((commit, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{commit.message.split('\n')[0]}</p>
                  <p className="text-sm text-gray-600">
                    by {commit.author?.name} • {new Date(commit.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {commit.sha.substring(0, 7)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issues and PRs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Recent Issues</h2>
          <div className="space-y-3">
            {activity.details.issues.slice(0, 5).map((issue, index) => (
              <div key={index} className="border-b pb-2 last:border-b-0">
                <p className="font-medium">#{issue.number}: {issue.title}</p>
                <p className="text-sm text-gray-600">
                  {issue.state} • {issue.comments} comments • 
                  {new Date(issue.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Recent Pull Requests</h2>
          <div className="space-y-3">
            {activity.details.pullRequests.slice(0, 5).map((pr, index) => (
              <div key={index} className="border-b pb-2 last:border-b-0">
                <p className="font-medium">#{pr.number}: {pr.title}</p>
                <p className="text-sm text-gray-600">
                  {pr.state} • by {pr.user?.login} • 
                  {new Date(pr.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
