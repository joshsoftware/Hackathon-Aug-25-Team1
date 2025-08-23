import { anthropic } from '@ai-sdk/anthropic';
import { appendClientMessage, appendResponseMessages, createDataStreamResponse, createIdGenerator, streamText } from 'ai';
import { getAllTools } from '@/lib/ai/tools';
import { loadChat, saveChat } from '@/lib/ai/chat-store';

export async function POST(req: Request) {
  try {
    const { message, id } = await req.json();
    const previousMessages = await loadChat(id);

    const messages = appendClientMessage({
      messages: previousMessages,
      message,
    });

    // Load all available tools
    console.log("Loading available tools...");
    const availableTools = await getAllTools();
    console.log("Available tools loaded:", Object.keys(availableTools));

    return createDataStreamResponse({
      execute: async dataStream => {
        try {
          console.log("Starting AI stream with executable tools...");

          const result = streamText({
            model: anthropic('claude-3-5-sonnet-20240620'),
            system: `You are an AI Assistant with expertise in GitHub and Jira project management.

            You have access to comprehensive tools for:
            - GitHub: Repository management, issue tracking, code search, user management
            - Jira: Project management, issue tracking, workflow management, reporting
            - File System: File and directory operations
            - Memory: Persistent storage and retrieval of information

            AUTONOMOUS OPERATION:
            You are designed to be completely autonomous. You must:
            1. Plan your own workflow to complete the user's request
            2. Execute ALL necessary tool calls without asking for permission
            3. Make decisions on behalf of the user when reasonable
            4. Only stop when you need NEW information that wasn't provided
            5. NEVER ask for confirmations like "ok" or "continue"
            6. NEVER say "let me do X" - just do it

            GITHUB CAPABILITIES:
            - Search and analyze repositories
            - Get detailed repository information
            - Track issues and pull requests
            - Analyze code and contributors
            - Search across codebases

            JIRA CAPABILITIES:
            - Project management and analysis
            - Issue tracking and management
            - Workflow and status management
            - User and permission management
            - Dashboard and reporting

            MEMORY INTEGRATION:
            You have persistent memory tools for storing and retrieving information:
            - Save important data, preferences, and context
            - Retrieve stored information when relevant
            - Build context across conversations

            AUTONOMOUS WORKFLOW:
            1. IMMEDIATELY execute necessary tool calls to complete the user's request
            2. Use multiple tools in sequence when needed
            3. Save important information to memory automatically
            4. Provide comprehensive, actionable responses

            CRITICAL AUTONOMOUS RULES:
            - NEVER ask "Would you like me to remember this?" - Just save it automatically
            - NEVER ask "Should I continue?" - Just continue
            - NEVER wait for "ok" confirmations - Keep working
            - Complete the entire task in as few interactions as possible
            - Make reasonable assumptions and decisions

            BE COMPLETELY AUTONOMOUS - NO CONFIRMATIONS NEEDED!

            IMPORTANT: All tools are now executable directly. When you call a tool, it will execute immediately and return results. Use the tools to gather information and complete tasks autonomously.

            Always use the appropriate tools to get accurate, real-time data and provide helpful, actionable responses.`,
            messages,
            tools: availableTools, // Pass the tools to the LLM
            async onFinish({ response }) {
              console.log("LLM stream finished. Saving chat...");
              await saveChat({
                id,
                messages: appendResponseMessages({
                  messages, // Pass the original messages
                  responseMessages: response.messages,
                }),
              });
              console.log("Chat saved.");
            },
            // id format for server-side messages:
            experimental_generateMessageId: createIdGenerator({
              prefix: 'msgs',
              size: 16,
            }),
          });

          // consume the stream to ensure it runs to completion & triggers onFinish
          // even when the client response is aborted:
          result.consumeStream().catch(error => {
              console.error("Error consuming stream:", error);
          });
          console.log("Merging result into data stream.");
          result.mergeIntoDataStream(dataStream);

        } catch (error) {
           console.error("Error during data stream execution:", error);
        }
      },
    });
  } catch (error) {
     console.error("Error in POST /api/chat:", error);
     // Return a generic error response
     return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
       status: 500,
       headers: { 'Content-Type': 'application/json' },
     });
  }
}