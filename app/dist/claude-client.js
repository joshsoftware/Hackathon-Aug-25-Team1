"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeMCPClient = void 0;
class ClaudeMCPClient {
    constructor(config) {
        this.config = {
            baseUrl: 'https://api.anthropic.com',
            model: 'claude-3-opus-20240229',
            ...config
        };
    }
    async makeRequest(endpoint, body, options = {}) {
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
    async createCompletion(prompt, options = {}) {
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
    async createChatCompletion(messages, options = {}) {
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
    async extractData(text, schema, instructions) {
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
            return JSON.parse(jsonStr);
        }
        catch (error) {
            throw new Error(`Failed to parse Claude's response as JSON: ${error}`);
        }
    }
    /**
     * Summarize text using Claude
     */
    async summarize(text, options = {}) {
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
    async analyzeSentiment(text) {
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
        }
        catch (error) {
            throw new Error(`Failed to parse Claude's sentiment analysis response: ${error}`);
        }
    }
    /**
     * Generate content based on a prompt using Claude
     */
    async generateContent(prompt, options = {}) {
        const { format = 'text', ...promptOptions } = options;
        let fullPrompt = prompt;
        if (format !== 'text') {
            fullPrompt += `\n\nPlease format your response in ${format}.`;
        }
        const response = await this.createCompletion(fullPrompt, promptOptions);
        return response.content[0].text;
    }
}
exports.ClaudeMCPClient = ClaudeMCPClient;
//# sourceMappingURL=claude-client.js.map