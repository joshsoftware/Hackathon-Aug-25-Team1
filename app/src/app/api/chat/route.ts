import { anthropic } from '@ai-sdk/anthropic';
import { appendClientMessage, appendResponseMessages, createDataStreamResponse, createIdGenerator, streamText } from 'ai';
import { getAllTools } from '@/lib/ai/tools';
import { loadChat, saveChat } from '@/lib/ai/chat-store';
import { SYSTEM_PROMPT } from '@/constants/prompt';

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
            system: SYSTEM_PROMPT,
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