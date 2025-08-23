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
export declare class JiraMCPClient {
    private config;
    constructor(config: JiraConfig);
    private getAuthHeaders;
    private makeRequest;
    listProjects(): Promise<JiraProject[]>;
    getProject(projectId: string): Promise<JiraProject>;
    listIssues(params: {
        projectKey?: string;
        jql?: string;
        status?: string;
        assignee?: string;
        since?: string;
    }): Promise<{
        issues: JiraIssue[];
        total: number;
    }>;
    getIssue(issueIdOrKey: string): Promise<JiraIssue>;
    createIssue(params: {
        projectKey: string;
        summary: string;
        description: string;
        type: string;
    }): Promise<JiraIssue>;
    transitionIssue(issueIdOrKey: string, transitionId: string): Promise<void>;
    addComment(issueIdOrKey: string, comment: string): Promise<void>;
    listUsers(query: string): Promise<JiraUser[]>;
    searchUsersByEmail(emailQuery: string): Promise<JiraUser[]>;
    getAllUsersFromProjects(): Promise<Set<string>>;
    getUsersBatch(accountIds: string[]): Promise<JiraUser[]>;
    getUser(accountId: string): Promise<JiraUser>;
    listBoards(projectKey?: string): Promise<{
        values: JiraBoard[];
    }>;
    listSprints(boardId: number, state?: string): Promise<{
        values: JiraSprint[];
    }>;
    listSprintIssues(sprintId: number): Promise<{
        issues: JiraIssue[];
    }>;
    getIssueTransitions(issueIdOrKey: string): Promise<{
        transitions: Array<{
            id: string;
            name: string;
            to: {
                name: string;
                id: string;
            };
        }>;
    }>;
    updateIssueStatus(issueIdOrKey: string, statusName: string): Promise<void>;
    closeIssue(issueIdOrKey: string, resolution?: string): Promise<void>;
    getIssueComments(issueIdOrKey: string): Promise<{
        comments: Array<{
            id: string;
            body: any;
            author: {
                displayName: string;
                emailAddress: string;
            };
            created: string;
            updated: string;
        }>;
    }>;
    updateComment(issueIdOrKey: string, commentId: string, comment: string): Promise<void>;
    deleteComment(issueIdOrKey: string, commentId: string): Promise<void>;
    getIssueLinks(issueIdOrKey: string): Promise<{
        issueLinks: Array<{
            id: string;
            type: {
                name: string;
                inward: string;
                outward: string;
            };
            inwardIssue?: JiraIssue;
            outwardIssue?: JiraIssue;
        }>;
    }>;
    createIssueLink(params: {
        type: string;
        inwardIssue: string;
        outwardIssue: string;
        comment?: string;
    }): Promise<void>;
    deleteIssueLink(linkId: string): Promise<void>;
    getIssueLinkTypes(): Promise<{
        issueLinkTypes: Array<{
            id: string;
            name: string;
            inward: string;
            outward: string;
        }>;
    }>;
    getIssueDependencies(issueIdOrKey: string): Promise<{
        blockedBy: JiraIssue[];
        blocks: JiraIssue[];
        relatedTo: JiraIssue[];
        duplicates: JiraIssue[];
        duplicatedBy: JiraIssue[];
        allLinks: Array<{
            type: string;
            direction: string;
            issue: JiraIssue;
        }>;
    }>;
}
