import { tool, type ToolSet } from 'ai';
import { z } from 'zod';

// GitHub Repository Tools
const getRepositoryInfo = tool({
  description: 'Get detailed information about a GitHub repository including stats, description, and metadata',
  parameters: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name')
  }),
});

const searchRepositories = tool({
  description: 'Search for GitHub repositories based on query, language, stars, and other criteria',
  parameters: z.object({
    query: z.string().describe('Search query (e.g., "machine learning", "react app")'),
    language: z.string().optional().describe('Programming language filter'),
    stars: z.string().optional().describe('Minimum stars filter (e.g., ">100")'),
    sort: z.enum(['stars', 'forks', 'updated', 'help-wanted-issues']).optional().describe('Sort criteria'),
    order: z.enum(['desc', 'asc']).optional().describe('Sort order')
  }),
});

const getRepositoryIssues = tool({
  description: 'Get issues from a GitHub repository with filtering options',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    state: z.enum(['open', 'closed', 'all']).optional().describe('Issue state filter'),
    labels: z.string().optional().describe('Comma-separated label names'),
    assignee: z.string().optional().describe('Assignee username'),
    creator: z.string().optional().describe('Issue creator username'),
    per_page: z.number().optional().describe('Number of issues per page (max 100)')
  }),
});

const getRepositoryPullRequests = tool({
  description: 'Get pull requests from a GitHub repository with filtering options',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    state: z.enum(['open', 'closed', 'all']).optional().describe('PR state filter'),
    base: z.string().optional().describe('Base branch name'),
    head: z.string().optional().describe('Head branch name'),
    per_page: z.number().optional().describe('Number of PRs per page (max 100)')
  }),
});

const getRepositoryCommits = tool({
  description: 'Get commit history for a GitHub repository or specific branch',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    branch: z.string().optional().describe('Branch name (default: main/master)'),
    since: z.string().optional().describe('Start date (ISO 8601 format)'),
    until: z.string().optional().describe('End date (ISO 8601 format)'),
    author: z.string().optional().describe('Author username'),
    per_page: z.number().optional().describe('Number of commits per page (max 100)')
  }),
});

const getRepositoryContributors = tool({
  description: 'Get contributors to a GitHub repository with their contribution statistics',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    per_page: z.number().optional().describe('Number of contributors per page (max 100)')
  }),
});

const getRepositoryLanguages = tool({
  description: 'Get programming languages used in a GitHub repository with their byte counts',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name')
  }),
});

const getRepositoryTopics = tool({
  description: 'Get topics/tags associated with a GitHub repository',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name')
  }),
});

const getRepositoryReadme = tool({
  description: 'Get the README content of a GitHub repository',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    ref: z.string().optional().describe('Branch or commit reference (default: main/master)')
  }),
});

const getRepositoryFiles = tool({
  description: 'Get files and directories in a GitHub repository path',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    path: z.string().optional().describe('Directory path (default: root)'),
    ref: z.string().optional().describe('Branch or commit reference (default: main/master)')
  }),
});

const getRepositoryReleases = tool({
  description: 'Get releases for a GitHub repository',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    per_page: z.number().optional().describe('Number of releases per page (max 100)')
  }),
});

// GitHub User Tools
const getUserProfile = tool({
  description: 'Get detailed profile information for a GitHub user',
  parameters: z.object({
    username: z.string().describe('GitHub username')
  }),
});

const getUserRepositories = tool({
  description: 'Get repositories owned by a GitHub user',
  parameters: z.object({
    username: z.string().describe('GitHub username'),
    type: z.enum(['all', 'owner', 'member']).optional().describe('Repository type filter'),
    sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().describe('Sort criteria'),
    direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    per_page: z.number().optional().describe('Number of repositories per page (max 100)')
  }),
});

const getUserActivity = tool({
  description: 'Get recent activity and events for a GitHub user',
  parameters: z.object({
    username: z.string().describe('GitHub username'),
    per_page: z.number().optional().describe('Number of events per page (max 100)')
  }),
});

// GitHub Organization Tools
const getOrganizationInfo = tool({
  description: 'Get information about a GitHub organization',
  parameters: z.object({
    org: z.string().describe('Organization name')
  }),
});

const getOrganizationRepositories = tool({
  description: 'Get repositories owned by a GitHub organization',
  parameters: z.object({
    org: z.string().describe('Organization name'),
    type: z.enum(['all', 'public', 'private', 'forks', 'sources', 'member']).optional().describe('Repository type filter'),
    sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().describe('Sort criteria'),
    direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    per_page: z.number().optional().describe('Number of repositories per page (max 100)')
  }),
});

const getOrganizationMembers = tool({
  description: 'Get members of a GitHub organization',
  parameters: z.object({
    org: z.string().describe('Organization name'),
    per_page: z.number().optional().describe('Number of members per page (max 100)')
  }),
});

// GitHub Search Tools
const searchCode = tool({
  description: 'Search for code across GitHub repositories',
  parameters: z.object({
    query: z.string().describe('Search query for code'),
    language: z.string().optional().describe('Programming language filter'),
    user: z.string().optional().describe('Limit search to specific user/organization'),
    repo: z.string().optional().describe('Limit search to specific repository (format: owner/repo)'),
    filename: z.string().optional().describe('Filename filter'),
    extension: z.string().optional().describe('File extension filter'),
    per_page: z.number().optional().describe('Number of results per page (max 100)')
  }),
});

const searchIssues = tool({
  description: 'Search for issues and pull requests across GitHub',
  parameters: z.object({
    query: z.string().describe('Search query for issues/PRs'),
    state: z.enum(['open', 'closed']).optional().describe('Issue/PR state filter'),
    author: z.string().optional().describe('Author username'),
    assignee: z.string().optional().describe('Assignee username'),
    mentions: z.string().optional().describe('Mentioned username'),
    user: z.string().optional().describe('Limit search to specific user/organization'),
    repo: z.string().optional().describe('Limit search to specific repository'),
    label: z.string().optional().describe('Label filter'),
    language: z.string().optional().describe('Repository language filter'),
    is: z.enum(['pr', 'issue']).optional().describe('Type filter'),
    per_page: z.number().optional().describe('Number of results per page (max 100)')
  }),
});

const searchUsers = tool({
  description: 'Search for GitHub users',
  parameters: z.object({
    query: z.string().describe('Search query for users'),
    sort: z.enum(['followers', 'repositories', 'joined']).optional().describe('Sort criteria'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    per_page: z.number().optional().describe('Number of results per page (max 100)')
  }),
});

// Export all GitHub tools
export const githubTools: ToolSet = {
  // Repository tools
  getRepositoryInfo,
  searchRepositories,
  getRepositoryIssues,
  getRepositoryPullRequests,
  getRepositoryCommits,
  getRepositoryContributors,
  getRepositoryLanguages,
  getRepositoryTopics,
  getRepositoryReadme,
  getRepositoryFiles,
  getRepositoryReleases,

  // User tools
  getUserProfile,
  getUserRepositories,
  getUserActivity,

  // Organization tools
  getOrganizationInfo,
  getOrganizationRepositories,
  getOrganizationMembers,

  // Search tools
  searchCode,
  searchIssues,
  searchUsers,
};
