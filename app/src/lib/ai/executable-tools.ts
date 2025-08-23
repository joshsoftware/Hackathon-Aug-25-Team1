import { z } from 'zod';
import * as githubExecutor from './github-executor';
import * as jiraExecutor from './jira-executor';

// Helper function to wrap executor functions with error handling
function createSafeExecutor<T extends any[], R>(fn: (...args: T) => Promise<R>) {
  return async (...args: T): Promise<R | { error: string; success: false }> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      console.error(`Tool execution error:`, error);
      return {
        error: error instanceof Error ? error.message : String(error),
        success: false
      } as any;
    }
  };
}

// GitHub Repository Tools
const getRepositoryInfo = {
  name: 'getRepositoryInfo',
  description: 'Get detailed information about a GitHub repository including stats, description, and metadata',
  parameters: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name')
  }),
  execute: createSafeExecutor(githubExecutor.getRepositoryInfo),
};

const searchRepositories = {
  name: 'searchRepositories',
  description: 'Search for GitHub repositories based on query, language, stars, and other criteria',
  parameters: z.object({
    query: z.string().describe('Search query (e.g., "machine learning", "react app")'),
    language: z.string().optional().describe('Programming language filter'),
    stars: z.string().optional().describe('Minimum stars filter (e.g., ">100")'),
    sort: z.enum(['stars', 'forks', 'updated', 'help-wanted-issues']).optional().describe('Sort criteria'),
    order: z.enum(['desc', 'asc']).optional().describe('Sort order')
  }),
  execute: createSafeExecutor(githubExecutor.searchRepositories),
};

const getRepositoryIssues = {
  name: 'getRepositoryIssues',
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
  execute: createSafeExecutor(githubExecutor.getRepositoryIssues),
};

const getRepositoryPullRequests = {
  name: 'getRepositoryPullRequests',
  description: 'Get pull requests from a GitHub repository with filtering options',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    state: z.enum(['open', 'closed', 'all']).optional().describe('PR state filter'),
    base: z.string().optional().describe('Base branch name'),
    head: z.string().optional().describe('Head branch name'),
    per_page: z.number().optional().describe('Number of PRs per page (max 100)')
  }),
  execute: createSafeExecutor(githubExecutor.getRepositoryPullRequests),
};

const getRepositoryCommits = {
  name: 'getRepositoryCommits',
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
  execute: createSafeExecutor(githubExecutor.getRepositoryCommits),
};

const getRepositoryContributors = {
  name: 'getRepositoryContributors',
  description: 'Get contributors to a GitHub repository with their contribution statistics',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    per_page: z.number().optional().describe('Number of contributors per page (max 100)')
  }),
  execute: createSafeExecutor(githubExecutor.getRepositoryContributors),
};

const getRepositoryLanguages = {
  name: 'getRepositoryLanguages',
  description: 'Get programming languages used in a GitHub repository with their byte counts',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name')
  }),
  execute: createSafeExecutor(githubExecutor.getRepositoryLanguages),
};

const getRepositoryTopics = {
  name: 'getRepositoryTopics',
  description: 'Get topics/tags associated with a GitHub repository',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name')
  }),
  execute: createSafeExecutor(githubExecutor.getRepositoryTopics),
};

const getRepositoryReadme = {
  name: 'getRepositoryReadme',
  description: 'Get the README content of a GitHub repository',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    ref: z.string().optional().describe('Branch or commit reference (default: main/master)')
  }),
  execute: createSafeExecutor(githubExecutor.getRepositoryReadme),
};

const getRepositoryFiles = {
  name: 'getRepositoryFiles',
  description: 'Get files and directories in a GitHub repository path',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    path: z.string().optional().describe('Directory path (default: root)'),
    ref: z.string().optional().describe('Branch or commit reference (default: main/master)')
  }),
  execute: createSafeExecutor(githubExecutor.getRepositoryFiles),
};

const getRepositoryReleases = {
  name: 'getRepositoryReleases',
  description: 'Get releases for a GitHub repository',
  parameters: z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    per_page: z.number().optional().describe('Number of releases per page (max 100)')
  }),
  execute: createSafeExecutor(githubExecutor.getRepositoryReleases),
};

// GitHub User Tools
const getUserProfile = {
  name: 'getUserProfile',
  description: 'Get detailed profile information for a GitHub user',
  parameters: z.object({
    username: z.string().describe('GitHub username')
  }),
  execute: createSafeExecutor(githubExecutor.getUserProfile),
};

const getUserRepositories = {
  name: 'getUserRepositories',
  description: 'Get repositories owned by a GitHub user',
  parameters: z.object({
    username: z.string().describe('GitHub username'),
    type: z.enum(['all', 'owner', 'member']).optional().describe('Repository type filter'),
    sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().describe('Sort criteria'),
    direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    per_page: z.number().optional().describe('Number of repositories per page (max 100)')
  }),
  execute: createSafeExecutor(githubExecutor.getUserRepositories),
};

const getUserActivity = {
  name: 'getUserActivity',
  description: 'Get recent activity and events for a GitHub user',
  parameters: z.object({
    username: z.string().describe('GitHub username'),
    per_page: z.number().optional().describe('Number of events per page (max 100)')
  }),
  execute: createSafeExecutor(githubExecutor.getUserActivity),
};

// GitHub Organization Tools
const getOrganizationInfo = {
  name: 'getOrganizationInfo',
  description: 'Get information about a GitHub organization',
  parameters: z.object({
    org: z.string().describe('Organization name')
  }),
  execute: createSafeExecutor(githubExecutor.getOrganizationInfo),
};

const getOrganizationRepositories = {
  name: 'getOrganizationRepositories',
  description: 'Get repositories owned by a GitHub organization',
  parameters: z.object({
    org: z.string().describe('Organization name'),
    type: z.enum(['all', 'public', 'private', 'forks', 'sources', 'member']).optional().describe('Repository type filter'),
    sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().describe('Sort criteria'),
    direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    per_page: z.number().optional().describe('Number of repositories per page (max 100)')
  }),
  execute: createSafeExecutor(githubExecutor.getOrganizationRepositories),
};

const getOrganizationMembers = {
  name: 'getOrganizationMembers',
  description: 'Get members of a GitHub organization',
  parameters: z.object({
    org: z.string().describe('Organization name'),
    per_page: z.number().optional().describe('Number of members per page (max 100)')
  }),
  execute: createSafeExecutor(githubExecutor.getOrganizationMembers),
};

// GitHub Search Tools
const searchCode = {
  name: 'searchCode',
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
  execute: createSafeExecutor(githubExecutor.searchCode),
};

const searchIssues = {
  name: 'searchIssues',
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
  execute: createSafeExecutor(githubExecutor.searchIssues),
};

const searchUsers = {
  name: 'searchUsers',
  description: 'Search for GitHub users',
  parameters: z.object({
    query: z.string().describe('Search query for users'),
    sort: z.enum(['followers', 'repositories', 'joined']).optional().describe('Sort criteria'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    per_page: z.number().optional().describe('Number of results per page (max 100)')
  }),
  execute: createSafeExecutor(githubExecutor.searchUsers),
};

// Jira Project Tools
const getProjectInfo = {
  name: 'getProjectInfo',
  description: 'Get detailed information about a Jira project including key, name, description, and lead',
  parameters: z.object({
    projectKey: z.string().describe('Jira project key (e.g., "PROJ")'),
    expand: z.string().optional().describe('Additional fields to expand (e.g., "lead,description,url")')
  }),
  execute: createSafeExecutor(jiraExecutor.getProjectInfo),
};

const getProjectComponents = {
  name: 'getProjectComponents',
  description: 'Get all components for a Jira project',
  parameters: z.object({
    projectKey: z.string().describe('Jira project key')
  }),
  execute: createSafeExecutor(jiraExecutor.getProjectComponents),
};

const getProjectVersions = {
  name: 'getProjectVersions',
  description: 'Get all versions for a Jira project',
  parameters: z.object({
    projectKey: z.string().describe('Jira project key'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: createSafeExecutor(jiraExecutor.getProjectVersions),
};

const getProjectRoles = {
  name: 'getProjectRoles',
  description: 'Get all project roles for a Jira project',
  parameters: z.object({
    projectKey: z.string().describe('Jira project key')
  }),
  execute: createSafeExecutor(jiraExecutor.getProjectRoles),
};

const getProjectPermissions = {
  name: 'getProjectPermissions',
  description: 'Get user permissions for a Jira project',
  parameters: z.object({
    projectKey: z.string().describe('Jira project key'),
    username: z.string().describe('Username to check permissions for')
  }),
  execute: createSafeExecutor(jiraExecutor.getProjectPermissions),
};

// Jira Issue Tools
const getIssue = {
  name: 'getIssue',
  description: 'Get detailed information about a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key (e.g., "PROJ-123")'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
    expand: z.string().optional().describe('Additional fields to expand (e.g., "renderedFields,names,schema,transitions,operations,editmeta,changelog,versionedRepresentations")')
  }),
  execute: createSafeExecutor(jiraExecutor.getIssue),
};

const searchJiraIssues = {
  name: 'searchJiraIssues',
  description: 'Search for Jira issues using JQL (Jira Query Language)',
  parameters: z.object({
    jql: z.string().describe('JQL query string (e.g., "project = PROJ AND status = Open")'),
    startAt: z.number().optional().describe('Starting index (0-based)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: createSafeExecutor(jiraExecutor.searchIssues),
};

const createIssue = {
  name: 'createIssue',
  description: 'Create a new Jira issue',
  parameters: z.object({
    projectKey: z.string().describe('Jira project key'),
    summary: z.string().describe('Issue summary/title'),
    description: z.string().describe('Issue description'),
    issueType: z.string().describe('Issue type (e.g., "Bug", "Task", "Story")'),
    priority: z.string().optional().describe('Priority level (e.g., "High", "Medium", "Low")'),
    assignee: z.string().optional().describe('Assignee username'),
    reporter: z.string().optional().describe('Reporter username'),
    labels: z.string().optional().describe('Comma-separated list of labels'),
    components: z.string().optional().describe('Comma-separated list of component names'),
    fixVersions: z.string().optional().describe('Comma-separated list of fix version names'),
    customFields: z.string().optional().describe('JSON string of custom field values')
  }),
  execute: createSafeExecutor(jiraExecutor.createIssue),
};

const updateIssue = {
  name: 'updateIssue',
  description: 'Update an existing Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key to update'),
    summary: z.string().optional().describe('New issue summary'),
    description: z.string().optional().describe('New issue description'),
    priority: z.string().optional().describe('New priority level'),
    assignee: z.string().optional().describe('New assignee username'),
    labels: z.string().optional().describe('Comma-separated list of new labels'),
    components: z.string().optional().describe('Comma-separated list of new component names'),
    fixVersions: z.string().optional().describe('Comma-separated list of new fix version names'),
    customFields: z.string().optional().describe('JSON string of custom field values to update')
  }),
  execute: createSafeExecutor(jiraExecutor.updateIssue),
};

const transitionIssue = {
  name: 'transitionIssue',
  description: 'Transition a Jira issue to a different status',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key to transition'),
    transitionId: z.string().describe('Transition ID (use getIssueTransitions to find available transitions)'),
    comment: z.string().optional().describe('Comment to add with the transition'),
    fields: z.string().optional().describe('JSON string of field values to set during transition')
  }),
  execute: createSafeExecutor(jiraExecutor.transitionIssue),
};

const getIssueTransitions = {
  name: 'getIssueTransitions',
  description: 'Get available transitions for a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: createSafeExecutor(jiraExecutor.getIssueTransitions),
};

const addIssueComment = {
  name: 'addIssueComment',
  description: 'Add a comment to a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key'),
    body: z.string().describe('Comment text'),
    visibility: z.string().optional().describe('Comment visibility (e.g., "role:Developers")')
  }),
  execute: createSafeExecutor(jiraExecutor.addIssueComment),
};

const getIssueComments = {
  name: 'getIssueComments',
  description: 'Get all comments for a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key'),
    startAt: z.number().optional().describe('Starting index (0-based)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)'),
    orderBy: z.string().optional().describe('Order by field (e.g., "created")'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: createSafeExecutor(jiraExecutor.getIssueComments),
};

const getIssueChangelog = {
  name: 'getIssueChangelog',
  description: 'Get changelog for a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key'),
    startAt: z.number().optional().describe('Starting index (0-based)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)')
  }),
  execute: createSafeExecutor(jiraExecutor.getIssueChangelog),
};

const getIssueWorklog = {
  name: 'getIssueWorklog',
  description: 'Get worklog entries for a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key'),
    startAt: z.number().optional().describe('Starting index (0-based)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: createSafeExecutor(jiraExecutor.getIssueWorklog),
};

const addWorklogEntry = {
  name: 'addWorklogEntry',
  description: 'Add a worklog entry to a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key'),
    timeSpent: z.string().describe('Time spent (e.g., "1h 30m", "90m")'),
    comment: z.string().optional().describe('Worklog comment'),
    started: z.string().optional().describe('Start date/time (ISO 8601 format)'),
    author: z.string().optional().describe('Author username (if different from current user)')
  }),
  execute: createSafeExecutor(jiraExecutor.addWorklogEntry),
};

// Jira User Tools
const getUserInfo = {
  name: 'getUserInfo',
  description: 'Get information about a Jira user',
  parameters: z.object({
    username: z.string().describe('Jira username'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: createSafeExecutor(jiraExecutor.getUserInfo),
};

const searchJiraUsers = {
  name: 'searchJiraUsers',
  description: 'Search for Jira users',
  parameters: z.object({
    query: z.string().describe('Search query (username, display name, or email)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)'),
    includeInactive: z.boolean().optional().describe('Include inactive users')
  }),
  execute: createSafeExecutor(jiraExecutor.searchUsers),
};

const getUserGroups = {
  name: 'getUserGroups',
  description: 'Get groups that a user belongs to',
  parameters: z.object({
    username: z.string().describe('Jira username'),
    includeInactiveUsers: z.boolean().optional().describe('Include inactive users')
  }),
  execute: createSafeExecutor(jiraExecutor.getUserGroups),
};

// Jira Workflow Tools
const getWorkflowSchemes = {
  name: 'getWorkflowSchemes',
  description: 'Get workflow schemes for projects',
  parameters: z.object({
    projectIds: z.string().optional().describe('Comma-separated list of project IDs'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: createSafeExecutor(jiraExecutor.getWorkflowSchemes),
};

const getWorkflowStatuses = {
  name: 'getWorkflowStatuses',
  description: 'Get all workflow statuses',
  parameters: z.object({
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: createSafeExecutor(jiraExecutor.getWorkflowStatuses),
};

const getWorkflowTransitions = {
  name: 'getWorkflowTransitions',
  description: 'Get workflow transitions for a workflow',
  parameters: z.object({
    workflowName: z.string().describe('Workflow name'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: createSafeExecutor(jiraExecutor.getWorkflowTransitions),
};

// Jira Dashboard Tools
const getDashboards = {
  name: 'getDashboards',
  description: 'Get dashboards for the current user',
  parameters: z.object({
    startAt: z.number().optional().describe('Starting index (0-based)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)'),
    filter: z.string().optional().describe('Filter by dashboard name'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: createSafeExecutor(jiraExecutor.getDashboards),
};

const getDashboard = {
  name: 'getDashboard',
  description: 'Get a specific dashboard by ID',
  parameters: z.object({
    dashboardId: z.string().describe('Dashboard ID'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: createSafeExecutor(jiraExecutor.getDashboard),
};

// Jira Filter Tools
const getFilters = {
  name: 'getFilters',
  description: 'Get filters for the current user',
  parameters: z.object({
    startAt: z.number().optional().describe('Starting index (0-based)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: jiraExecutor.getFilters,
};

const getFilter = {
  name: 'getFilter',
  description: 'Get a specific filter by ID',
  parameters: z.object({
    filterId: z.string().describe('Filter ID'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
  execute: jiraExecutor.getFilter,
};

// Export all executable tools
export const executableTools = {
  // GitHub Repository tools
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

  // GitHub User tools
  getUserProfile,
  getUserRepositories,
  getUserActivity,

  // GitHub Organization tools
  getOrganizationInfo,
  getOrganizationRepositories,
  getOrganizationMembers,

  // GitHub Search tools
  searchCode,
  searchIssues,
  searchUsers,

  // Jira Project tools
  getProjectInfo,
  getProjectComponents,
  getProjectVersions,
  getProjectRoles,
  getProjectPermissions,

  // Jira Issue tools
  getIssue,
  searchJiraIssues,
  createIssue,
  updateIssue,
  transitionIssue,
  getIssueTransitions,
  addIssueComment,
  getIssueComments,
  getIssueChangelog,
  getIssueWorklog,
  addWorklogEntry,

  // Jira User tools
  getUserInfo,
  searchJiraUsers,
  getUserGroups,

  // Jira Workflow tools
  getWorkflowSchemes,
  getWorkflowStatuses,
  getWorkflowTransitions,

  // Jira Dashboard tools
  getDashboards,
  getDashboard,

  // Jira Filter tools
  getFilters,
  getFilter,
};
