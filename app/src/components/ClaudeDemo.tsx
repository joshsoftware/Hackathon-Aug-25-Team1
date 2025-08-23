'use client';

import { useState } from 'react';
import ClaudeDataFetcher from '../utils/claude-data-fetcher';

const claudeDataFetcher = new ClaudeDataFetcher();

export default function ClaudeDemo() {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [demoType, setDemoType] = useState<'prompt' | 'sentiment' | 'entities' | 'summarize' | 'jira'>('prompt');
    const [text, setText] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult('');

        try {
            let response;

            switch (demoType) {
                case 'prompt':
                    response = await claudeDataFetcher.prompt(prompt);
                    setResult(response);
                    break;
                case 'sentiment':
                    response = await claudeDataFetcher.analyzeSentiment(text);
                    setResult(JSON.stringify(response, null, 2));
                    break;
                case 'entities':
                    response = await claudeDataFetcher.extractEntities(text);
                    setResult(JSON.stringify(response, null, 2));
                    break;
                case 'summarize':
                    response = await claudeDataFetcher.summarize(text);
                    setResult(response);
                    break;
                case 'jira':
                    response = await claudeDataFetcher.processJiraPrompt(prompt);
                    setResult(response.response);
                    break;
            }
        } catch (error) {
            setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Claude NLP Demo</h1>

            {/* Demo Type Selector */}
            <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Demo Type
                </label>
                <div className="flex flex-wrap gap-3">
                    {[
                        { key: 'prompt', label: 'Prompt' },
                        { key: 'sentiment', label: 'Sentiment Analysis' },
                        { key: 'entities', label: 'Entity Extraction' },
                        { key: 'summarize', label: 'Summarize' },
                        { key: 'jira', label: 'Jira Assistant' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition ${demoType === key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                            onClick={() => setDemoType(key as typeof demoType)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mb-8">
                {demoType === 'prompt' || demoType === 'jira' ? (
                    <div className="mb-5">
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                            {demoType === 'jira' ? 'Jira Request' : 'Prompt'}
                        </label>
                        <textarea
                            id="prompt"
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={
                                demoType === 'jira'
                                    ? "Enter your Jira request (e.g., 'List all open tickets', 'Show me issues assigned to John', 'Create a bug ticket for login issue')..."
                                    : 'Enter your prompt for Claude...'
                            }
                            required
                        />
                        {demoType === 'jira' && (
                            <p className="mt-2 text-sm text-gray-500">
                                Ask Claude to interact with Jira. Examples: "List all projects", "Show me open tickets", "Create a bug ticket for login issue".
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="mb-5">
                        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                            {demoType === 'sentiment'
                                ? 'Text to Analyze'
                                : demoType === 'entities'
                                    ? 'Text to Extract Entities From'
                                    : 'Text to Summarize'}
                        </label>
                        <textarea
                            id="text"
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={`Enter text to ${demoType}...`}
                            required
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
                >
                    {loading ? 'Processing...' : 'Submit'}
                </button>
            </form>

            {/* Result */}
            {result && (
                <div className="mt-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Result</h2>
                    <div className="bg-gray-900 text-green-300 p-5 rounded-xl overflow-auto max-h-96 text-sm font-mono shadow-inner">
                        <pre className="whitespace-pre-wrap">{result}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}
