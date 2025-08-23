import { ClaudeMessage } from '../mcp/claude-client';

/**
 * Utility for fetching and processing data using Claude API
 */
export class ClaudeDataFetcher {
    private baseUrl: string;
    private jiraBaseUrl: string;

    constructor(baseUrl?: string, jiraBaseUrl?: string) {
        this.baseUrl = baseUrl || '/api/claude';
        this.jiraBaseUrl = jiraBaseUrl || '/api/mcp';
    }

    /**
     * Send a prompt to Claude
     */
    async prompt(
        prompt: string,
        options?: {
            temperature?: number;
            maxTokens?: number;
            system?: string;
        }
    ): Promise<string> {
        const response = await fetch(`${this.baseUrl}?action=prompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                ...options,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Claude API error: ${error.message || response.statusText}`);
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Send a conversation to Claude
     */
    async chat(
        messages: ClaudeMessage[],
        options?: {
            temperature?: number;
            maxTokens?: number;
            system?: string;
        }
    ): Promise<string> {
        const response = await fetch(`${this.baseUrl}?action=chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                ...options,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Claude API error: ${error.message || response.statusText}`);
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Extract structured data from text using Claude
     */
    async extractData<T>(
        text: string,
        schema: Record<string, any>,
        instructions?: string
    ): Promise<T> {
        const response = await fetch(`${this.baseUrl}?action=extract-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                schema,
                instructions,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Claude API error: ${error.message || response.statusText}`);
        }

        const result = await response.json();
        return result.data as T;
    }

    /**
     * Summarize text using Claude
     */
    async summarize(
        text: string,
        options?: {
            maxLength?: number;
            format?: 'paragraph' | 'bullets';
            focus?: string;
        }
    ): Promise<string> {
        const response = await fetch(`${this.baseUrl}?action=summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                ...options,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Claude API error: ${error.message || response.statusText}`);
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Analyze sentiment of text using Claude
     */
    async analyzeSentiment(text: string): Promise<{
        sentiment: 'positive' | 'negative' | 'neutral';
        score: number;
        explanation: string;
    }> {
        const response = await fetch(`${this.baseUrl}?action=analyze-sentiment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Claude API error: ${error.message || response.statusText}`);
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Generate content based on a prompt using Claude
     */
    async generateContent(
        prompt: string,
        options?: {
            format?: 'text' | 'html' | 'markdown';
            temperature?: number;
            maxTokens?: number;
            system?: string;
        }
    ): Promise<string> {
        const response = await fetch(`${this.baseUrl}?action=generate-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                ...options,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Claude API error: ${error.message || response.statusText}`);
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Extract entities from text (people, organizations, locations, etc.)
     */
    async extractEntities(text: string): Promise<{
        people: string[];
        organizations: string[];
        locations: string[];
        dates: string[];
        events: string[];
        products: string[];
        other: string[];
    }> {
        const schema = {
            type: 'object',
            properties: {
                people: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Names of people mentioned in the text'
                },
                organizations: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Names of organizations mentioned in the text'
                },
                locations: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Names of locations mentioned in the text'
                },
                dates: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Dates mentioned in the text'
                },
                events: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Events mentioned in the text'
                },
                products: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Products mentioned in the text'
                },
                other: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Other notable entities mentioned in the text'
                }
            }
        };

        const instructions = 'Extract all named entities from the text. Include each entity only once in the most appropriate category. If a category has no entities, return an empty array.';

        return this.extractData(text, schema, instructions);
    }

    /**
     * Extract key information from a webpage
     */
    async extractWebpageInfo(html: string): Promise<{
        title: string;
        description: string;
        mainContent: string;
        topics: string[];
        links: Array<{ text: string; url: string }>;
    }> {
        const schema = {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'The title of the webpage'
                },
                description: {
                    type: 'string',
                    description: 'A brief description of the webpage content'
                },
                mainContent: {
                    type: 'string',
                    description: 'The main content of the webpage, summarized'
                },
                topics: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Main topics covered in the webpage'
                },
                links: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            text: { type: 'string' },
                            url: { type: 'string' }
                        }
                    },
                    description: 'Important links found in the webpage'
                }
            }
        };

        const instructions = 'Extract key information from this HTML webpage. Focus on the most important content and links. Limit to the 5 most important links.';

        return this.extractData(html, schema, instructions);
    }

    /**
     * Extract structured data from a PDF text
     */
    async extractPdfData(pdfText: string, schema: Record<string, any>, instructions: string): Promise<any> {
        return this.extractData(pdfText, schema, instructions);
    }

    /**
     * Extract key points from a meeting transcript
     */
    async extractMeetingPoints(transcript: string): Promise<{
        summary: string;
        keyPoints: string[];
        decisions: string[];
        actionItems: Array<{ task: string; assignee?: string; dueDate?: string }>;
        participants: string[];
    }> {
        const schema = {
            type: 'object',
            properties: {
                summary: {
                    type: 'string',
                    description: 'A brief summary of the meeting'
                },
                keyPoints: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Key points discussed in the meeting'
                },
                decisions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Decisions made during the meeting'
                },
                actionItems: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            task: { type: 'string' },
                            assignee: { type: 'string' },
                            dueDate: { type: 'string' }
                        },
                        required: ['task']
                    },
                    description: 'Action items assigned during the meeting'
                },
                participants: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'People who participated in the meeting'
                }
            }
        };

        const instructions = 'Extract key information from this meeting transcript. Identify the main points discussed, decisions made, and action items assigned. For action items, include the assignee and due date if mentioned.';

        return this.extractData(transcript, schema, instructions);
    }

    /**
     * Analyze and categorize customer feedback
     */
    async analyzeFeedback(feedbackText: string): Promise<{
        sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
        categories: string[];
        keyIssues: string[];
        suggestions: string[];
        urgency: 'low' | 'medium' | 'high';
        summary: string;
    }> {
        const schema = {
            type: 'object',
            properties: {
                sentiment: {
                    type: 'string',
                    enum: ['positive', 'negative', 'neutral', 'mixed'],
                    description: 'Overall sentiment of the feedback'
                },
                categories: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Categories the feedback falls into (e.g., UI/UX, Performance, Features)'
                },
                keyIssues: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Key issues mentioned in the feedback'
                },
                suggestions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Suggestions or improvements mentioned in the feedback'
                },
                urgency: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                    description: 'How urgent the feedback issues seem to be'
                },
                summary: {
                    type: 'string',
                    description: 'A brief summary of the feedback'
                }
            }
        };

        const instructions = 'Analyze this customer feedback and categorize it according to the schema. Identify the sentiment, key issues, and any suggestions for improvement. Assess the urgency based on the tone and content.';

        return this.extractData(feedbackText, schema, instructions);
    }

    /**
     * Process a Jira-related prompt using Claude
     * Claude will interpret the prompt and trigger the appropriate Jira MCP action
     */
    async processJiraPrompt(prompt: string): Promise<{
        response: string;
        action?: string;
        data?: any;
    }> {
        // First, use Claude to interpret the prompt and determine the Jira action
        const interpretationPrompt = `
You are an assistant that helps users interact with Jira. Analyze the following prompt and determine:
1. What Jira action the user wants to perform
2. What parameters are needed for that action

Available Jira actions:
- list_projects: List all Jira projects
- get_project: Get details of a specific project (requires projectId)
- list_issues: List issues with optional filters (can filter by projectKey, status, assignee, or use JQL)
- get_issue: Get details of a specific issue (requires issueIdOrKey)
- create_issue: Create a new issue (requires projectKey, summary, description, type)
- add_comment: Add a comment to an issue (requires issueIdOrKey, comment)
- list_users: Search for users (requires query)
- list_boards: List Jira boards (can filter by projectKey)
- list_sprints: List sprints for a board (requires boardId)
- get_sprint_issues: Get issues in a sprint (requires sprintId)

User prompt: "${prompt}"

Respond with a JSON object containing:
{
  "action": "the_jira_action",
  "parameters": {
    // parameters needed for the action
  },
  "explanation": "brief explanation of what the user wants"
}
`;

        const interpretationResponse = await this.prompt(interpretationPrompt, {
            temperature: 0.1,
        });

        try {
            // Extract the JSON from the response
            const jsonMatch = interpretationResponse.match(/```json\n([\s\S]*?)\n```/) ||
                interpretationResponse.match(/```\n([\s\S]*?)\n```/) ||
                [null, interpretationResponse];

            const jsonStr = jsonMatch[1].trim();
            const interpretation = JSON.parse(jsonStr);

            // Now execute the appropriate Jira action
            const { action, parameters } = interpretation;

            let data;
            let response;

            switch (action) {
                case 'list_projects':
                    const projectsResponse = await fetch(`${this.jiraBaseUrl}?action=projects`);
                    data = await projectsResponse.json();
                    break;

                case 'get_project':
                    const projectResponse = await fetch(`${this.jiraBaseUrl}?action=project&projectId=${parameters.projectId}`);
                    data = await projectResponse.json();
                    break;

                case 'list_issues':
                    let issuesUrl = `${this.jiraBaseUrl}?action=issues`;
                    if (parameters.projectKey) issuesUrl += `&projectKey=${parameters.projectKey}`;
                    if (parameters.jql) issuesUrl += `&jql=${encodeURIComponent(parameters.jql)}`;
                    if (parameters.status) issuesUrl += `&status=${parameters.status}`;
                    if (parameters.assignee) issuesUrl += `&assignee=${parameters.assignee}`;
                    if (parameters.since) issuesUrl += `&since=${parameters.since}`;

                    const issuesResponse = await fetch(issuesUrl);
                    data = await issuesResponse.json();
                    break;

                case 'get_issue':
                    const issueResponse = await fetch(`${this.jiraBaseUrl}?action=issue&issueIdOrKey=${parameters.issueIdOrKey}`);
                    data = await issueResponse.json();
                    break;

                case 'create_issue':
                    const createIssueResponse = await fetch(`${this.jiraBaseUrl}?action=create-issue`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            projectKey: parameters.projectKey,
                            summary: parameters.summary,
                            description: parameters.description,
                            type: parameters.type,
                        }),
                    });
                    data = await createIssueResponse.json();
                    break;

                case 'add_comment':
                    const addCommentResponse = await fetch(`${this.jiraBaseUrl}?action=add-comment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            issueIdOrKey: parameters.issueIdOrKey,
                            comment: parameters.comment,
                        }),
                    });
                    data = await addCommentResponse.json();
                    break;

                case 'list_users':
                    const usersResponse = await fetch(`${this.jiraBaseUrl}?action=users&query=${encodeURIComponent(parameters.query)}`);
                    data = await usersResponse.json();
                    break;

                case 'list_boards':
                    let boardsUrl = `${this.jiraBaseUrl}?action=boards`;
                    if (parameters.projectKey) boardsUrl += `&projectKey=${parameters.projectKey}`;

                    const boardsResponse = await fetch(boardsUrl);
                    data = await boardsResponse.json();
                    break;

                case 'list_sprints':
                    const sprintsResponse = await fetch(`${this.jiraBaseUrl}?action=sprints&boardId=${parameters.boardId}`);
                    data = await sprintsResponse.json();
                    break;

                case 'get_sprint_issues':
                    const sprintIssuesResponse = await fetch(`${this.jiraBaseUrl}?action=sprint-issues&sprintId=${parameters.sprintId}`);
                    data = await sprintIssuesResponse.json();
                    break;

                default:
                    throw new Error(`Unsupported Jira action: ${action}`);
            }

            // Now use Claude to format a nice response based on the data
            const formatPrompt = `
You are an assistant that helps users interact with Jira. The user asked: "${prompt}"

I executed the Jira action "${action}" with parameters ${JSON.stringify(parameters)} and got the following result:
${JSON.stringify(data, null, 2)}

Please format a helpful, concise response that answers the user's question based on this data. 
Include the most relevant information and format it in a readable way.
`;

            response = await this.prompt(formatPrompt, {
                temperature: 0.7,
            });

            return {
                response,
                action,
                data: data.data,
            };

        } catch (error) {
            console.error('Error processing Jira prompt:', error);
            return {
                response: `I'm sorry, I couldn't process your Jira request. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`,
            };
        }
    }
}

export default ClaudeDataFetcher;
