import { z } from 'zod';

// Jira API configuration - these would typically come from environment variables
const JIRA_BASE_URL = process.env.JIRA_URL || 'https://your-domain.atlassian.net';
const JIRA_USERNAME = process.env.JIRA_USERNAME || '';
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || '';

// Helper function to make Jira API calls
async function jiraApiCall(endpoint: string, options: RequestInit = {}) {
  if (!JIRA_USERNAME || !JIRA_API_TOKEN) {
    console.error('Jira credentials not configured:', {
      hasUsername: !!JIRA_USERNAME,
      hasToken: !!JIRA_API_TOKEN,
      baseUrl: JIRA_BASE_URL
    });
    throw new Error('Jira credentials not configured. Please set JIRA_USERNAME and JIRA_API_TOKEN environment variables.');
  }

  const url = `${JIRA_BASE_URL}/rest/api/3${endpoint}`;
  const auth = Buffer.from(`${JIRA_USERNAME}:${JIRA_API_TOKEN}`).toString('base64');

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`,
    ...options.headers,
  };

  console.log(`Making Jira API call to: ${url}`);

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Jira API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Jira API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`Jira API call successful for: ${endpoint}`);
    return result;
  } catch (error) {
    console.error(`Jira API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Jira Project Tools
export async function getProjectInfo(args: { projectKey: string; expand?: string }) {
  const { projectKey, expand } = args;
  const params = expand ? `?expand=${expand}` : '';
  return await jiraApiCall(`/project/${projectKey}${params}`);
}

export async function getProjectComponents(args: { projectKey: string }) {
  const { projectKey } = args;
  return await jiraApiCall(`/project/${projectKey}/components`);
}

export async function getProjectVersions(args: { projectKey: string; expand?: string }) {
  const { projectKey, expand } = args;
  const params = expand ? `?expand=${expand}` : '';
  return await jiraApiCall(`/project/${projectKey}/versions${params}`);
}

export async function getProjectRoles(args: { projectKey: string }) {
  const { projectKey } = args;
  return await jiraApiCall(`/project/${projectKey}/role`);
}

export async function getProjectPermissions(args: { projectKey: string; username: string }) {
  const { projectKey, username } = args;
  return await jiraApiCall(`/project/${projectKey}/permissions?username=${username}`);
}

// Jira Issue Tools
export async function getIssue(args: { issueKey: string; fields?: string; expand?: string }) {
  const { issueKey, fields, expand } = args;
  const params = new URLSearchParams();

  if (fields) params.append('fields', fields);
  if (expand) params.append('expand', expand);

  const queryString = params.toString();
  return await jiraApiCall(`/issue/${issueKey}${queryString ? `?${queryString}` : ''}`);
}

export async function searchIssues(args: {
  jql: string;
  startAt?: number;
  maxResults?: number;
  fields?: string;
  expand?: string;
}) {
  const { jql, startAt, maxResults, fields, expand } = args;
  const params = new URLSearchParams({ jql });

  if (startAt !== undefined) params.append('startAt', startAt.toString());
  if (maxResults !== undefined) params.append('maxResults', maxResults.toString());
  if (fields) params.append('fields', fields);
  if (expand) params.append('expand', expand);

  return await jiraApiCall(`/search?${params}`);
}

export async function createIssue(args: {
  projectKey: string;
  summary: string;
  description: string;
  issueType: string;
  priority?: string;
  assignee?: string;
  reporter?: string;
  labels?: string;
  components?: string;
  fixVersions?: string;
  customFields?: string;
}) {
  const { projectKey, summary, description, issueType, priority, assignee, reporter, labels, components, fixVersions, customFields } = args;

  const issueData: any = {
    fields: {
      project: { key: projectKey },
      summary,
      description: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: description }] }] },
      issuetype: { name: issueType }
    }
  };

  if (priority) issueData.fields.priority = { name: priority };
  if (assignee) issueData.fields.assignee = { name: assignee };
  if (reporter) issueData.fields.reporter = { name: reporter };
  if (labels) issueData.fields.labels = labels.split(',').map((l: string) => l.trim());
  if (components) issueData.fields.components = components.split(',').map((c: string) => ({ name: c.trim() }));
  if (fixVersions) issueData.fields.fixVersions = fixVersions.split(',').map((v: string) => ({ name: v.trim() }));
  if (customFields) {
    try {
      const customFieldsData = JSON.parse(customFields);
      Object.assign(issueData.fields, customFieldsData);
    } catch (error) {
      console.warn('Invalid custom fields JSON, skipping custom fields');
    }
  }

  return await jiraApiCall('/issue', {
    method: 'POST',
    body: JSON.stringify(issueData)
  });
}

export async function updateIssue(args: {
  issueKey: string;
  summary?: string;
  description?: string;
  priority?: string;
  assignee?: string;
  labels?: string;
  components?: string;
  fixVersions?: string;
  customFields?: string;
}) {
  const { issueKey, summary, description, priority, assignee, labels, components, fixVersions, customFields } = args;

  const updateData: any = {
    fields: {}
  };

  if (summary !== undefined) updateData.fields.summary = summary;
  if (description !== undefined) updateData.fields.description = { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: description }] }] };
  if (priority !== undefined) updateData.fields.priority = { name: priority };
  if (assignee !== undefined) updateData.fields.assignee = { name: assignee };
  if (labels !== undefined) updateData.fields.labels = labels.split(',').map((l: string) => l.trim());
  if (components !== undefined) updateData.fields.components = components.split(',').map((c: string) => ({ name: c.trim() }));
  if (fixVersions !== undefined) updateData.fields.fixVersions = fixVersions.split(',').map((v: string) => ({ name: v.trim() }));
  if (customFields !== undefined) {
    try {
      const customFieldsData = JSON.parse(customFields);
      Object.assign(updateData.fields, customFieldsData);
    } catch (error) {
      console.warn('Invalid custom fields JSON, skipping custom fields');
    }
  }

  return await jiraApiCall(`/issue/${issueKey}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
}

export async function transitionIssue(args: {
  issueKey: string;
  transitionId: string;
  comment?: string;
  fields?: string;
}) {
  const { issueKey, transitionId, comment, fields } = args;

  const transitionData: any = {
    transition: { id: transitionId }
  };

  if (comment) {
    transitionData.update = {
      comment: [{
        add: { body: comment }
      }]
    };
  }

  if (fields) {
    try {
      const fieldsData = JSON.parse(fields);
      transitionData.fields = fieldsData;
    } catch (error) {
      console.warn('Invalid fields JSON, skipping fields update');
    }
  }

  return await jiraApiCall(`/issue/${issueKey}/transitions`, {
    method: 'POST',
    body: JSON.stringify(transitionData)
  });
}

export async function getIssueTransitions(args: { issueKey: string; expand?: string }) {
  const { issueKey, expand } = args;
  const params = expand ? `?expand=${expand}` : '';
  return await jiraApiCall(`/issue/${issueKey}/transitions${params}`);
}

export async function addIssueComment(args: { issueKey: string; body: string; visibility?: string }) {
  const { issueKey, body, visibility } = args;

  const commentData: any = {
    body: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: body }] }] }
  };

  if (visibility) {
    commentData.visibility = { type: 'role', value: visibility };
  }

  return await jiraApiCall(`/issue/${issueKey}/comment`, {
    method: 'POST',
    body: JSON.stringify(commentData)
  });
}

export async function getIssueComments(args: {
  issueKey: string;
  startAt?: number;
  maxResults?: number;
  orderBy?: string;
  expand?: string;
}) {
  const { issueKey, startAt, maxResults, orderBy, expand } = args;
  const params = new URLSearchParams();

  if (startAt !== undefined) params.append('startAt', startAt.toString());
  if (maxResults !== undefined) params.append('maxResults', maxResults.toString());
  if (orderBy) params.append('orderBy', orderBy);
  if (expand) params.append('expand', expand);

  return await jiraApiCall(`/issue/${issueKey}/comment${params.toString() ? `?${params.toString()}` : ''}`);
}

export async function getIssueChangelog(args: { issueKey: string; startAt?: number; maxResults?: number }) {
  const { issueKey, startAt, maxResults } = args;
  const params = new URLSearchParams();

  if (startAt !== undefined) params.append('startAt', startAt.toString());
  if (maxResults !== undefined) params.append('maxResults', maxResults.toString());

  return await jiraApiCall(`/issue/${issueKey}/changelog${params.toString() ? `?${params.toString()}` : ''}`);
}

export async function getIssueWorklog(args: { issueKey: string; startAt?: number; maxResults?: number; expand?: string }) {
  const { issueKey, startAt, maxResults, expand } = args;
  const params = new URLSearchParams();

  if (startAt !== undefined) params.append('startAt', startAt.toString());
  if (maxResults !== undefined) params.append('maxResults', maxResults.toString());
  if (expand) params.append('expand', expand);

  return await jiraApiCall(`/issue/${issueKey}/worklog${params.toString() ? `?${params.toString()}` : ''}`);
}

export async function addWorklogEntry(args: {
  issueKey: string;
  timeSpent: string;
  comment?: string;
  started?: string;
  author?: string;
}) {
  const { issueKey, timeSpent, comment, started, author } = args;

  const worklogData: any = {
    timeSpent
  };

  if (comment) worklogData.comment = comment;
  if (started) worklogData.started = started;
  if (author) worklogData.author = { name: author };

  return await jiraApiCall(`/issue/${issueKey}/worklog`, {
    method: 'POST',
    body: JSON.stringify(worklogData)
  });
}

// Jira User Tools
export async function getUserInfo(args: { username: string; expand?: string }) {
  const { username, expand } = args;
  const params = expand ? `?expand=${expand}` : '';
  return await jiraApiCall(`/user?username=${username}${params}`);
}

export async function searchUsers(args: {
  query: string;
  maxResults?: number;
  includeInactive?: boolean;
}) {
  const { query, maxResults, includeInactive } = args;
  const params = new URLSearchParams({ query });

  if (maxResults !== undefined) params.append('maxResults', maxResults.toString());
  if (includeInactive !== undefined) params.append('includeInactive', includeInactive.toString());

  return await jiraApiCall(`/user/search?${params}`);
}

export async function getUserGroups(args: { username: string; includeInactiveUsers?: boolean }) {
  const { username, includeInactiveUsers } = args;
  const params = new URLSearchParams({ username });

  if (includeInactiveUsers !== undefined) params.append('includeInactiveUsers', includeInactiveUsers.toString());

  return await jiraApiCall(`/user/groups?${params}`);
}

// Jira Workflow Tools
export async function getWorkflowSchemes(args: { projectIds?: string; expand?: string }) {
  const { projectIds, expand } = args;
  const params = new URLSearchParams();

  if (projectIds) params.append('projectIds', projectIds);
  if (expand) params.append('expand', expand);

  return await jiraApiCall(`/workflowscheme${params.toString() ? `?${params.toString()}` : ''}`);
}

export async function getWorkflowStatuses(args: { expand?: string }) {
  const { expand } = args;
  const params = expand ? `?expand=${expand}` : '';
  return await jiraApiCall(`/status${params}`);
}

export async function getWorkflowTransitions(args: { workflowName: string; expand?: string }) {
  const { workflowName, expand } = args;
  const params = expand ? `?expand=${expand}` : '';
  return await jiraApiCall(`/workflow/transitions?workflowName=${workflowName}${params}`);
}

// Jira Dashboard Tools
export async function getDashboards(args: { startAt?: number; maxResults?: number; filter?: string; expand?: string }) {
  const { startAt, maxResults, filter, expand } = args;
  const params = new URLSearchParams();

  if (startAt !== undefined) params.append('startAt', startAt.toString());
  if (maxResults !== undefined) params.append('maxResults', maxResults.toString());
  if (filter) params.append('filter', filter);
  if (expand) params.append('expand', expand);

  return await jiraApiCall(`/dashboard${params.toString() ? `?${params.toString()}` : ''}`);
}

export async function getDashboard(args: { dashboardId: string; expand?: string }) {
  const { dashboardId, expand } = args;
  const params = expand ? `?expand=${expand}` : '';
  return await jiraApiCall(`/dashboard/${dashboardId}${params}`);
}

// Jira Filter Tools
export async function getFilters(args: { startAt?: number; maxResults?: number; expand?: string }) {
  const { startAt, maxResults, expand } = args;
  const params = new URLSearchParams();

  if (startAt !== undefined) params.append('startAt', startAt.toString());
  if (maxResults !== undefined) params.append('maxResults', maxResults.toString());
  if (expand) params.append('expand', expand);

  return await jiraApiCall(`/filter${params.toString() ? `?${params.toString()}` : ''}`);
}

export async function getFilter(args: { filterId: string; expand?: string }) {
  const { filterId, expand } = args;
  const params = expand ? `?expand=${expand}` : '';
  return await jiraApiCall(`/filter/${filterId}${params}`);
}
