"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraMCPClient = void 0;
class JiraMCPClient {
    constructor(config) {
        this.config = config;
    }
    getAuthHeaders() {
        const auth = Buffer.from(`${this.config.email}:${this.config.apiToken}`).toString('base64');
        return {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
    }
    async makeRequest(endpoint, options = {}) {
        const url = `${this.config.baseUrl}/rest/api/3${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers,
            },
        });
        if (!response.ok) {
            throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    // Projects
    async listProjects() {
        return this.makeRequest('/project');
    }
    async getProject(projectId) {
        return this.makeRequest(`/project/${projectId}`);
    }
    // Issues / Tickets
    async listIssues(params) {
        let jql = params.jql || '';
        if (params.projectKey && !jql.includes('project')) {
            jql = jql ? `${jql} AND project = ${params.projectKey}` : `project = ${params.projectKey}`;
        }
        if (params.status && !jql.includes('status')) {
            jql = jql ? `${jql} AND status = "${params.status}"` : `status = "${params.status}"`;
        }
        if (params.assignee && !jql.includes('assignee')) {
            jql = jql ? `${jql} AND assignee = "${params.assignee}"` : `assignee = "${params.assignee}"`;
        }
        if (params.since && !jql.includes('updated')) {
            jql = jql ? `${jql} AND updated >= "${params.since}"` : `updated >= "${params.since}"`;
        }
        const queryParams = new URLSearchParams({
            jql: jql || 'order by created DESC',
            maxResults: '50',
            fields: 'summary,description,status,assignee,reporter,created,updated,issuetype,project',
        });
        return this.makeRequest(`/search?${queryParams}`);
    }
    async getIssue(issueIdOrKey) {
        return this.makeRequest(`/issue/${issueIdOrKey}?fields=summary,description,status,assignee,reporter,created,updated,issuetype,project`);
    }
    async createIssue(params) {
        const body = {
            fields: {
                project: { key: params.projectKey },
                summary: params.summary,
                description: {
                    type: 'doc',
                    version: 1,
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: params.description,
                                },
                            ],
                        },
                    ],
                },
                issuetype: { name: params.type },
            },
        };
        return this.makeRequest('/issue', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }
    async transitionIssue(issueIdOrKey, transitionId) {
        const body = {
            transition: { id: transitionId },
        };
        await this.makeRequest(`/issue/${issueIdOrKey}/transitions`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }
    async addComment(issueIdOrKey, comment) {
        const body = {
            body: {
                type: 'doc',
                version: 1,
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: comment,
                            },
                        ],
                    },
                ],
            },
        };
        await this.makeRequest(`/issue/${issueIdOrKey}/comment`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }
    // Users
    async listUsers(query) {
        const queryParams = new URLSearchParams({
            query,
            maxResults: '50',
        });
        return this.makeRequest(`/user/search?${queryParams}`);
    }
    // Alternative user search methods for better results
    async searchUsersByEmail(emailQuery) {
        const queryParams = new URLSearchParams({
            query: emailQuery,
            maxResults: '50',
        });
        return this.makeRequest(`/user/search?${queryParams}`);
    }
    async getAllUsersFromProjects() {
        const accountIds = new Set();
        try {
            // Get all projects
            const projects = await this.listProjects();
            // Get issues from each project to extract user account IDs
            for (const project of projects) {
                const issues = await this.listIssues({ projectKey: project.key });
                issues.issues.forEach(issue => {
                    if (issue.fields.assignee?.accountId) {
                        accountIds.add(issue.fields.assignee.accountId);
                    }
                    if (issue.fields.reporter?.accountId) {
                        accountIds.add(issue.fields.reporter.accountId);
                    }
                });
            }
        }
        catch (error) {
            console.error('Error extracting users from projects:', error);
        }
        return accountIds;
    }
    async getUsersBatch(accountIds) {
        const users = [];
        for (const accountId of accountIds) {
            try {
                const user = await this.getUser(accountId);
                users.push(user);
            }
            catch (error) {
                console.error(`Error fetching user ${accountId}:`, error);
            }
        }
        return users;
    }
    async getUser(accountId) {
        return this.makeRequest(`/user?accountId=${accountId}`);
    }
    // Boards / Sprints (Agile API)
    async listBoards(projectKey) {
        const queryParams = new URLSearchParams({
            maxResults: '50',
        });
        if (projectKey) {
            queryParams.append('projectKeyOrId', projectKey);
        }
        // Note: This uses the Agile API endpoint
        const url = `${this.config.baseUrl}/rest/agile/1.0/board?${queryParams}`;
        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Jira Agile API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    async listSprints(boardId, state) {
        const queryParams = new URLSearchParams({
            maxResults: '50',
        });
        if (state) {
            queryParams.append('state', state);
        }
        const url = `${this.config.baseUrl}/rest/agile/1.0/board/${boardId}/sprint?${queryParams}`;
        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Jira Agile API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    async listSprintIssues(sprintId) {
        const queryParams = new URLSearchParams({
            maxResults: '50',
            fields: 'summary,description,status,assignee,reporter,created,updated,issuetype,project',
        });
        const url = `${this.config.baseUrl}/rest/agile/1.0/sprint/${sprintId}/issue?${queryParams}`;
        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Jira Agile API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    // Enhanced ticket operations
    async getIssueTransitions(issueIdOrKey) {
        return this.makeRequest(`/issue/${issueIdOrKey}/transitions`);
    }
    async updateIssueStatus(issueIdOrKey, statusName) {
        // Get available transitions
        const transitions = await this.getIssueTransitions(issueIdOrKey);
        const transition = transitions.transitions.find(t => t.to.name.toLowerCase() === statusName.toLowerCase() ||
            t.name.toLowerCase() === statusName.toLowerCase());
        if (!transition) {
            throw new Error(`No transition found to status "${statusName}". Available transitions: ${transitions.transitions.map(t => t.to.name).join(', ')}`);
        }
        await this.transitionIssue(issueIdOrKey, transition.id);
    }
    async closeIssue(issueIdOrKey, resolution) {
        // Try common close transitions
        const closeTransitions = ['Close', 'Done', 'Closed', 'Complete', 'Resolve'];
        const transitions = await this.getIssueTransitions(issueIdOrKey);
        let closeTransition = null;
        for (const transitionName of closeTransitions) {
            closeTransition = transitions.transitions.find(t => t.to.name.toLowerCase() === transitionName.toLowerCase() ||
                t.name.toLowerCase() === transitionName.toLowerCase());
            if (closeTransition)
                break;
        }
        if (!closeTransition) {
            throw new Error(`No close transition found. Available transitions: ${transitions.transitions.map(t => t.to.name).join(', ')}`);
        }
        const body = {
            transition: { id: closeTransition.id },
        };
        // Add resolution if provided
        if (resolution) {
            body.fields = {
                resolution: { name: resolution }
            };
        }
        await this.makeRequest(`/issue/${issueIdOrKey}/transitions`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }
    async getIssueComments(issueIdOrKey) {
        return this.makeRequest(`/issue/${issueIdOrKey}/comment`);
    }
    async updateComment(issueIdOrKey, commentId, comment) {
        const body = {
            body: {
                type: 'doc',
                version: 1,
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: comment,
                            },
                        ],
                    },
                ],
            },
        };
        await this.makeRequest(`/issue/${issueIdOrKey}/comment/${commentId}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }
    async deleteComment(issueIdOrKey, commentId) {
        await this.makeRequest(`/issue/${issueIdOrKey}/comment/${commentId}`, {
            method: 'DELETE',
        });
    }
    // Issue dependencies (issue links)
    async getIssueLinks(issueIdOrKey) {
        const issue = await this.makeRequest(`/issue/${issueIdOrKey}?fields=issuelinks`);
        return { issueLinks: issue.fields.issuelinks || [] };
    }
    async createIssueLink(params) {
        const body = {
            type: { name: params.type },
            inwardIssue: { key: params.inwardIssue },
            outwardIssue: { key: params.outwardIssue },
        };
        if (params.comment) {
            body.comment = {
                body: {
                    type: 'doc',
                    version: 1,
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: params.comment,
                                },
                            ],
                        },
                    ],
                },
            };
        }
        await this.makeRequest('/issueLink', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }
    async deleteIssueLink(linkId) {
        await this.makeRequest(`/issueLink/${linkId}`, {
            method: 'DELETE',
        });
    }
    async getIssueLinkTypes() {
        return this.makeRequest('/issueLinkType');
    }
    // Get issue dependencies with detailed information
    async getIssueDependencies(issueIdOrKey) {
        const links = await this.getIssueLinks(issueIdOrKey);
        const dependencies = {
            blockedBy: [],
            blocks: [],
            relatedTo: [],
            duplicates: [],
            duplicatedBy: [],
            allLinks: [],
        };
        for (const link of links.issueLinks) {
            const linkType = link.type.name.toLowerCase();
            if (link.inwardIssue) {
                const direction = 'inward';
                const issue = link.inwardIssue;
                dependencies.allLinks.push({ type: link.type.inward, direction, issue });
                if (linkType.includes('block')) {
                    dependencies.blockedBy.push(issue);
                }
                else if (linkType.includes('duplicate')) {
                    dependencies.duplicatedBy.push(issue);
                }
                else {
                    dependencies.relatedTo.push(issue);
                }
            }
            if (link.outwardIssue) {
                const direction = 'outward';
                const issue = link.outwardIssue;
                dependencies.allLinks.push({ type: link.type.outward, direction, issue });
                if (linkType.includes('block')) {
                    dependencies.blocks.push(issue);
                }
                else if (linkType.includes('duplicate')) {
                    dependencies.duplicates.push(issue);
                }
                else {
                    dependencies.relatedTo.push(issue);
                }
            }
        }
        return dependencies;
    }
}
exports.JiraMCPClient = JiraMCPClient;
//# sourceMappingURL=client.js.map