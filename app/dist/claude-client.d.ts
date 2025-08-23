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
export declare class ClaudeMCPClient {
    private config;
    constructor(config: ClaudeConfig);
    private makeRequest;
    /**
     * Send a prompt to Claude and get a completion
     */
    createCompletion(prompt: string, options?: ClaudePromptOptions): Promise<ClaudeCompletionResponse>;
    /**
     * Send a conversation to Claude and get a response
     */
    createChatCompletion(messages: ClaudeMessage[], options?: ClaudePromptOptions): Promise<ClaudeCompletionResponse>;
    /**
     * Extract structured data from text using Claude
     */
    extractData<T>(text: string, schema: Record<string, any>, instructions: string): Promise<T>;
    /**
     * Summarize text using Claude
     */
    summarize(text: string, options?: {
        maxLength?: number;
        format?: 'paragraph' | 'bullets';
        focus?: string;
    }): Promise<string>;
    /**
     * Analyze sentiment of text using Claude
     */
    analyzeSentiment(text: string): Promise<{
        sentiment: 'positive' | 'negative' | 'neutral';
        score: number;
        explanation: string;
    }>;
    /**
     * Generate content based on a prompt using Claude
     */
    generateContent(prompt: string, options?: ClaudePromptOptions & {
        format?: 'text' | 'html' | 'markdown';
    }): Promise<string>;
}
