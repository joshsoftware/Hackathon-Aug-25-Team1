
export interface JiraConfig {
    baseUrl: string;
    email: string;
    apiToken: string;
}

export interface JiraProject {
    id: string;
    key: string;
    name: string;
    projectTypeKey: string;
    lead: {
        accountId: string;
        displayName: string;
    };
}

export interface JiraIssue {
    id: string;
    key: string;
    fields: {
        summary: string;
        description?: string;
        status: {
            name: string;
            id: string;
        };
        assignee?: {
            accountId: string;
            displayName: string;
            emailAddress: string;
        };
        reporter: {
            accountId: string;
            displayName: string;
            emailAddress: string;
        };
        created: string;
        updated: string;
        issuetype: {
            name: string;
            id: string;
        };
        project: {
            key: string;
            name: string;
        };
    };
}

export interface JiraUser {
    accountId: string;
    displayName: string;
    emailAddress: string;
    active: boolean;
}

export interface JiraBoard {
    id: number;
    name: string;
    type: string;
    location: {
        projectKey: string;
        projectName: string;
    };
}

export interface JiraSprint {
    id: number;
    name: string;
    state: string;
    startDate?: string;
    endDate?: string;
    completeDate?: string;
    boardId: number;
}

export class JiraMCPClient {
    private config: JiraConfig;

    constructor(config: JiraConfig) {
        this.config = config;
    }

    private getAuthHeaders() {
        const auth = Buffer.from(`${this.config.email}:${this.config.apiToken}`).toString('base64');
        return {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
    }

    private async makeRequest(endpoint: string, options: RequestInit = {}) {
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
    async listProjects(): Promise<JiraProject[]> {
        return this.makeRequest('/project');
    }

    async getProject(projectId: string): Promise<JiraProject> {
        return this.makeRequest(`/project/${projectId}`);
    }

    // Issues / Tickets
    async listIssues(params: {
        projectKey?: string;
        jql?: string;
        status?: string;
        assignee?: string;
        since?: string;
    }): Promise<{ issues: JiraIssue[]; total: number }> {
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

    async getIssue(issueIdOrKey: string): Promise<JiraIssue> {
        return this.makeRequest(`/issue/${issueIdOrKey}?fields=summary,description,status,assignee,reporter,created,updated,issuetype,project`);
    }

    async createIssue(params: {
        projectKey: string;
        summary: string;
        description: string;
        type: string;
    }): Promise<JiraIssue> {
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

    async transitionIssue(issueIdOrKey: string, transitionId: string): Promise<void> {
        const body = {
            transition: { id: transitionId },
        };

        await this.makeRequest(`/issue/${issueIdOrKey}/transitions`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async addComment(issueIdOrKey: string, comment: string): Promise<void> {
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
    async listUsers(query: string): Promise<JiraUser[]> {
        const queryParams = new URLSearchParams({
            query,
            maxResults: '50',
        });

        return this.makeRequest(`/user/search?${queryParams}`);
    }

    // Alternative user search methods for better results
    async searchUsersByEmail(emailQuery: string): Promise<JiraUser[]> {
        const queryParams = new URLSearchParams({
            query: emailQuery,
            maxResults: '50',
        });

        return this.makeRequest(`/user/search?${queryParams}`);
    }

    async getAllUsersFromProjects(): Promise<Set<string>> {
        const accountIds = new Set<string>();

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
        } catch (error) {
            console.error('Error extracting users from projects:', error);
        }

        return accountIds;
    }

    async getUsersBatch(accountIds: string[]): Promise<JiraUser[]> {
        const users: JiraUser[] = [];

        for (const accountId of accountIds) {
            try {
                const user = await this.getUser(accountId);
                users.push(user);
            } catch (error) {
                console.error(`Error fetching user ${accountId}:`, error);
            }
        }

        return users;
    }

    async getUser(accountId: string): Promise<JiraUser> {
        return this.makeRequest(`/user?accountId=${accountId}`);
    }

    // Boards / Sprints (Agile API)
    async listBoards(projectKey?: string): Promise<{ values: JiraBoard[] }> {
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

    async listSprints(boardId: number, state?: string): Promise<{ values: JiraSprint[] }> {
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

    async listSprintIssues(sprintId: number): Promise<{ issues: JiraIssue[] }> {
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
    async getIssueTransitions(issueIdOrKey: string): Promise<{ transitions: Array<{ id: string; name: string; to: { name: string; id: string } }> }> {
        return this.makeRequest(`/issue/${issueIdOrKey}/transitions`);
    }

    async updateIssueStatus(issueIdOrKey: string, statusName: string): Promise<void> {
        // Get available transitions
        const transitions = await this.getIssueTransitions(issueIdOrKey);
        const transition = transitions.transitions.find(t =>
            t.to.name.toLowerCase() === statusName.toLowerCase() ||
            t.name.toLowerCase() === statusName.toLowerCase()
        );

        if (!transition) {
            throw new Error(`No transition found to status "${statusName}". Available transitions: ${transitions.transitions.map(t => t.to.name).join(', ')}`);
        }

        await this.transitionIssue(issueIdOrKey, transition.id);
    }

    async closeIssue(issueIdOrKey: string, resolution?: string): Promise<void> {
        // Try common close transitions
        const closeTransitions = ['Close', 'Done', 'Closed', 'Complete', 'Resolve'];

        const transitions = await this.getIssueTransitions(issueIdOrKey);
        let closeTransition = null;

        for (const transitionName of closeTransitions) {
            closeTransition = transitions.transitions.find(t =>
                t.to.name.toLowerCase() === transitionName.toLowerCase() ||
                t.name.toLowerCase() === transitionName.toLowerCase()
            );
            if (closeTransition) break;
        }

        if (!closeTransition) {
            throw new Error(`No close transition found. Available transitions: ${transitions.transitions.map(t => t.to.name).join(', ')}`);
        }

        const body: any = {
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

    async getIssueComments(issueIdOrKey: string): Promise<{ comments: Array<{ id: string; body: any; author: { displayName: string; emailAddress: string }; created: string; updated: string }> }> {
        return this.makeRequest(`/issue/${issueIdOrKey}/comment`);
    }

    async updateComment(issueIdOrKey: string, commentId: string, comment: string): Promise<void> {
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

    async deleteComment(issueIdOrKey: string, commentId: string): Promise<void> {
        await this.makeRequest(`/issue/${issueIdOrKey}/comment/${commentId}`, {
            method: 'DELETE',
        });
    }

    // Issue dependencies (issue links)
    async getIssueLinks(issueIdOrKey: string): Promise<{ issueLinks: Array<{ id: string; type: { name: string; inward: string; outward: string }; inwardIssue?: JiraIssue; outwardIssue?: JiraIssue }> }> {
        const issue = await this.makeRequest(`/issue/${issueIdOrKey}?fields=issuelinks`);
        return { issueLinks: issue.fields.issuelinks || [] };
    }

    async createIssueLink(params: {
        type: string;
        inwardIssue: string;
        outwardIssue: string;
        comment?: string;
    }): Promise<void> {
        const body: any = {
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

    async deleteIssueLink(linkId: string): Promise<void> {
        await this.makeRequest(`/issueLink/${linkId}`, {
            method: 'DELETE',
        });
    }

    async getIssueLinkTypes(): Promise<{ issueLinkTypes: Array<{ id: string; name: string; inward: string; outward: string }> }> {
        return this.makeRequest('/issueLinkType');
    }

    // Get issue dependencies with detailed information
    async getIssueDependencies(issueIdOrKey: string): Promise<{
        blockedBy: JiraIssue[];
        blocks: JiraIssue[];
        relatedTo: JiraIssue[];
        duplicates: JiraIssue[];
        duplicatedBy: JiraIssue[];
        allLinks: Array<{ type: string; direction: string; issue: JiraIssue }>;
    }> {
        const links = await this.getIssueLinks(issueIdOrKey);

        const dependencies = {
            blockedBy: [] as JiraIssue[],
            blocks: [] as JiraIssue[],
            relatedTo: [] as JiraIssue[],
            duplicates: [] as JiraIssue[],
            duplicatedBy: [] as JiraIssue[],
            allLinks: [] as Array<{ type: string; direction: string; issue: JiraIssue }>,
        };

        for (const link of links.issueLinks) {
            const linkType = link.type.name.toLowerCase();

            if (link.inwardIssue) {
                const direction = 'inward';
                const issue = link.inwardIssue;

                dependencies.allLinks.push({ type: link.type.inward, direction, issue });

                if (linkType.includes('block')) {
                    dependencies.blockedBy.push(issue);
                } else if (linkType.includes('duplicate')) {
                    dependencies.duplicatedBy.push(issue);
                } else {
                    dependencies.relatedTo.push(issue);
                }
            }

            if (link.outwardIssue) {
                const direction = 'outward';
                const issue = link.outwardIssue;

                dependencies.allLinks.push({ type: link.type.outward, direction, issue });

                if (linkType.includes('block')) {
                    dependencies.blocks.push(issue);
                } else if (linkType.includes('duplicate')) {
                    dependencies.duplicates.push(issue);
                } else {
                    dependencies.relatedTo.push(issue);
                }
            }
        }

        return dependencies;
    }
}
