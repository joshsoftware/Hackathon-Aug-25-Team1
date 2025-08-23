export interface ClaudeConfig {
    apiKey: string;
    baseUrl?: string;
    model?: string;
}

export interface ClaudeMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ClaudePromptOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    system?: string;
}

export interface ClaudeCompletionResponse {
    id: string;
    type: string;
    role: string;
    content: Array<{
        type: string;
        text: string;
    }>;
    model: string;
    stop_reason: string;
    stop_sequence: string | null;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

export class ClaudeMCPClient {
    private config: ClaudeConfig;

    constructor(config: ClaudeConfig) {
        this.config = {
            baseUrl: 'https://api.anthropic.com',
            model: 'claude-3-haiku-20240307',
            ...config
        };
    }

    private async makeRequest(endpoint: string, body: any, options: RequestInit = {}) {
        const url = `${this.config.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01',
                ...options.headers,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
    }

    /**
     * Send a prompt to Claude and get a completion
     */
    async createCompletion(
        prompt: string,
        options: ClaudePromptOptions = {}
    ): Promise<ClaudeCompletionResponse> {
        const body = {
            model: this.config.model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1024,
            top_p: options.topP ?? 1,
            top_k: options.topK ?? 5,
            ...(options.system && { system: options.system }),
        };

        return this.makeRequest('/v1/messages', body);
    }

    /**
     * Send a conversation to Claude and get a response
     */
    async createChatCompletion(
        messages: ClaudeMessage[],
        options: ClaudePromptOptions = {}
    ): Promise<ClaudeCompletionResponse> {
        const body = {
            model: this.config.model,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1024,
            top_p: options.topP ?? 1,
            top_k: options.topK ?? 5,
            ...(options.system && { system: options.system }),
        };

        return this.makeRequest('/v1/messages', body);
    }

    /**
     * Extract structured data from text using Claude
     */
    async extractData<T>(
        text: string,
        schema: Record<string, any>,
        instructions: string
    ): Promise<T> {
        const prompt = `
${instructions}

Extract the following information from the text below according to this JSON schema:
\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

Text to extract from:
\`\`\`
${text}
\`\`\`

Respond ONLY with the extracted JSON data and nothing else.
`;

        const response = await this.createCompletion(prompt, {
            temperature: 0.1,
            maxTokens: 2000
        });

        try {
            // Extract JSON from the response
            const responseText = response.content[0].text;
            const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                responseText.match(/```\n([\s\S]*?)\n```/) ||
                [null, responseText];

            const jsonStr = jsonMatch[1].trim();
            return JSON.parse(jsonStr) as T;
        } catch (error) {
            throw new Error(`Failed to parse Claude's response as JSON: ${error}`);
        }
    }

    /**
     * Summarize text using Claude
     */
    async summarize(
        text: string,
        options: {
            maxLength?: number;
            format?: 'paragraph' | 'bullets';
            focus?: string;
        } = {}
    ): Promise<string> {
        const { maxLength = 200, format = 'paragraph', focus } = options;

        let prompt = `Summarize the following text in ${format} format`;
        if (maxLength) {
            prompt += ` with a maximum of ${maxLength} words`;
        }
        if (focus) {
            prompt += `, focusing on ${focus}`;
        }

        prompt += `:\n\n${text}`;

        const response = await this.createCompletion(prompt, {
            temperature: 0.3,
            maxTokens: 1000
        });

        return response.content[0].text;
    }

    /**
     * Analyze sentiment of text using Claude
     */
    async analyzeSentiment(text: string): Promise<{
        sentiment: 'positive' | 'negative' | 'neutral';
        score: number;
        explanation: string;
    }> {
        const prompt = `
Analyze the sentiment of the following text. Respond with a JSON object containing:
1. "sentiment": either "positive", "negative", or "neutral"
2. "score": a number from -1 (very negative) to 1 (very positive)
3. "explanation": a brief explanation of your analysis

Text to analyze:
"""
${text}
"""

Respond ONLY with the JSON object and nothing else.
`;

        const response = await this.createCompletion(prompt, {
            temperature: 0.1,
            maxTokens: 500
        });

        try {
            // Extract JSON from the response
            const responseText = response.content[0].text;
            const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                responseText.match(/```\n([\s\S]*?)\n```/) ||
                [null, responseText];

            const jsonStr = jsonMatch[1].trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            throw new Error(`Failed to parse Claude's sentiment analysis response: ${error}`);
        }
    }

    /**
     * Generate content based on a prompt using Claude
     */
    async generateContent(
        prompt: string,
        options: ClaudePromptOptions & {
            format?: 'text' | 'html' | 'markdown';
        } = {}
    ): Promise<string> {
        const { format = 'text', ...promptOptions } = options;

        let fullPrompt = prompt;
        if (format !== 'text') {
            fullPrompt += `\n\nPlease format your response in ${format}.`;
        }

        const response = await this.createCompletion(fullPrompt, promptOptions);
        return response.content[0].text;
    }
}
