import { tool, type ToolSet } from 'ai';
import { z } from 'zod';

// Jira Project Tools
const getProjectInfo = tool({
  description: 'Get detailed information about a Jira project including key, name, description, and lead',
  parameters: z.object({
    projectKey: z.string().describe('Jira project key (e.g., "PROJ")'),
    expand: z.string().optional().describe('Additional fields to expand (e.g., "lead,description,url")')
  }),
});

const getProjectComponents = tool({
  description: 'Get all components for a Jira project',
  parameters: z.object({
    projectKey: z.string().describe('Jira project key')
  }),
});

const getProjectVersions = tool({
  description: 'Get all versions for a Jira project',
  parameters: z.object({
    projectKey: z.string().describe('Jira project key'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

const getProjectRoles = tool({
  description: 'Get all project roles for a Jira project',
  parameters: z.object({
    projectKey: z.string().describe('Jira project key')
  }),
});

const getProjectPermissions = tool({
  description: 'Get user permissions for a Jira project',
  parameters: z.object({
    projectKey: z.string().describe('Jira project key'),
    username: z.string().describe('Username to check permissions for')
  }),
});

// Jira Issue Tools
const getIssue = tool({
  description: 'Get detailed information about a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key (e.g., "PROJ-123")'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
    expand: z.string().optional().describe('Additional fields to expand (e.g., "renderedFields,names,schema,transitions,operations,editmeta,changelog,versionedRepresentations")')
  }),
});

const searchIssues = tool({
  description: 'Search for Jira issues using JQL (Jira Query Language)',
  parameters: z.object({
    jql: z.string().describe('JQL query string (e.g., "project = PROJ AND status = Open")'),
    startAt: z.number().optional().describe('Starting index (0-based)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)'),
    fields: z.string().optional().describe('Comma-separated list of fields to return'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

const createIssue = tool({
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
});

const updateIssue = tool({
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
});

const transitionIssue = tool({
  description: 'Transition a Jira issue to a different status',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key to transition'),
    transitionId: z.string().describe('Transition ID (use getIssueTransitions to find available transitions)'),
    comment: z.string().optional().describe('Comment to add with the transition'),
    fields: z.string().optional().describe('JSON string of field values to set during transition')
  }),
});

const getIssueTransitions = tool({
  description: 'Get available transitions for a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

const addIssueComment = tool({
  description: 'Add a comment to a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key'),
    body: z.string().describe('Comment text'),
    visibility: z.string().optional().describe('Comment visibility (e.g., "role:Developers")')
  }),
});

const getIssueComments = tool({
  description: 'Get all comments for a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key'),
    startAt: z.number().optional().describe('Starting index (0-based)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)'),
    orderBy: z.string().optional().describe('Order by field (e.g., "created")'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

const getIssueChangelog = tool({
  description: 'Get changelog for a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key'),
    startAt: z.number().optional().describe('Starting index (0-based)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)')
  }),
});

const getIssueWorklog = tool({
  description: 'Get worklog entries for a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key'),
    startAt: z.number().optional().describe('Starting index (0-based)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

const addWorklogEntry = tool({
  description: 'Add a worklog entry to a Jira issue',
  parameters: z.object({
    issueKey: z.string().describe('Jira issue key'),
    timeSpent: z.string().describe('Time spent (e.g., "1h 30m", "90m")'),
    comment: z.string().optional().describe('Worklog comment'),
    started: z.string().optional().describe('Start date/time (ISO 8601 format)'),
    author: z.string().optional().describe('Author username (if different from current user)')
  }),
});

// Jira User Tools
const getUserInfo = tool({
  description: 'Get information about a Jira user',
  parameters: z.object({
    username: z.string().describe('Jira username'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

const searchUsers = tool({
  description: 'Search for Jira users',
  parameters: z.object({
    query: z.string().describe('Search query (username, display name, or email)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)'),
    includeInactive: z.boolean().optional().describe('Include inactive users')
  }),
});

const getUserGroups = tool({
  description: 'Get groups that a user belongs to',
  parameters: z.object({
    username: z.string().describe('Jira username'),
    includeInactiveUsers: z.boolean().optional().describe('Include inactive users')
  }),
});

// Jira Workflow Tools
const getWorkflowSchemes = tool({
  description: 'Get workflow schemes for projects',
  parameters: z.object({
    projectIds: z.string().optional().describe('Comma-separated list of project IDs'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

const getWorkflowStatuses = tool({
  description: 'Get all workflow statuses',
  parameters: z.object({
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

const getWorkflowTransitions = tool({
  description: 'Get workflow transitions for a workflow',
  parameters: z.object({
    workflowName: z.string().describe('Workflow name'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

// Jira Dashboard Tools
const getDashboards = tool({
  description: 'Get dashboards for the current user',
  parameters: z.object({
    startAt: z.number().optional().describe('Starting index (0-based)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)'),
    filter: z.string().optional().describe('Filter by dashboard name'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

const getDashboard = tool({
  description: 'Get a specific dashboard by ID',
  parameters: z.object({
    dashboardId: z.string().describe('Dashboard ID'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

// Jira Filter Tools
const getFilters = tool({
  description: 'Get filters for the current user',
  parameters: z.object({
    startAt: z.number().optional().describe('Starting index (0-based)'),
    maxResults: z.number().optional().describe('Maximum number of results (max 100)'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

const getFilter = tool({
  description: 'Get a specific filter by ID',
  parameters: z.object({
    filterId: z.string().describe('Filter ID'),
    expand: z.string().optional().describe('Additional fields to expand')
  }),
});

// Export all Jira tools
export const jiraTools: ToolSet = {
  // Project tools
  getProjectInfo,
  getProjectComponents,
  getProjectVersions,
  getProjectRoles,
  getProjectPermissions,

  // Issue tools
  getIssue,
  searchIssues,
  createIssue,
  updateIssue,
  transitionIssue,
  getIssueTransitions,
  addIssueComment,
  getIssueComments,
  getIssueChangelog,
  getIssueWorklog,
  addWorklogEntry,

  // User tools
  getUserInfo,
  searchUsers,
  getUserGroups,

  // Workflow tools
  getWorkflowSchemes,
  getWorkflowStatuses,
  getWorkflowTransitions,

  // Dashboard tools
  getDashboards,
  getDashboard,

  // Filter tools
  getFilters,
  getFilter,
};
