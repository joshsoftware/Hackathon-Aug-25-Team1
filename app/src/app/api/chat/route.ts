import Anthropic from '@anthropic-ai/sdk';

// Set the runtime to nodejs
export const runtime = 'nodejs';

// Define CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Define SSE headers
const SSE_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive'
};

// Regular JSON response headers
const JSON_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json',
};

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

// Helper function to format SSE messages
function formatSSE(event: string, data: string) {
  return `event: ${event}\ndata: ${data}\n\n`;
}

// Handle GET requests for SSE
export async function GET(req: Request) {
  try {
    // For SSE requests, we need to get messages from URL parameters or from the server state
    // Since we can't include a request body in GET requests with EventSource

    // Set up SSE headers
    const headers = new Headers(SSE_HEADERS);

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Send an initial event to establish the connection
        controller.enqueue(formatSSE('error', JSON.stringify({
          error: "Use POST request with stream parameter to initiate streaming"
        })));
        controller.close();
      }
    });

    // Return the streaming response
    return new Response(stream, {
      headers
    });
  } catch (error) {
    console.error('Error processing GET request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process streaming request', details: String(error) }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

// Handle chat POST requests
export async function POST(req: Request) {
  try {
    console.log('API route called');

    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: JSON_HEADERS }
      );
    }

    // Parse request body
    const body = await req.json();

    // Get the raw messages from the request
    const rawMessages = body.messages || [];
    // Always use streaming for all requests
    const streaming = true;

    // Strip out any fields that the Anthropic API doesn't expect
    const messages = rawMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No messages provided' }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    console.log(`Processing ${messages.length} messages with streaming: ${streaming}`);

    // Extract the last user message
    const lastMessage = messages[messages.length - 1];
    console.log('Last message:', lastMessage.content);

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    console.log('Creating message with Anthropic client');

    // Handle streaming response
    if (streaming) {
      try {
        // Create a ReadableStream for SSE
        const stream = new ReadableStream({
          async start(controller) {
            try {
              // Initialize empty response text
              let responseText = '';
              let messageId = '';

              // Send an initial event to establish the connection
              controller.enqueue(formatSSE('open', ''));

              // Create a streaming request to Anthropic
              const stream = await anthropic.messages.stream({
                model: 'claude-opus-4-1-20250805',
                max_tokens: 1024,
                messages: messages,
              });

              // Initialize message start
              controller.enqueue(formatSSE('message_start', JSON.stringify({
                role: 'assistant',
                content: ''
              })));

              // Process all stream events using for-await
              // This avoids TypeScript issues with event names
              try {
                for await (const streamEvent of stream) {
                  // Process different event types
                  if (streamEvent.type === 'content_block_delta') {
                    if (streamEvent.delta.type === 'text_delta') {
                      responseText += streamEvent.delta.text;
                      controller.enqueue(formatSSE('text', JSON.stringify({ text: streamEvent.delta.text })));
                    }
                  } else if (streamEvent.type === 'message_start') {
                    messageId = streamEvent.message.id;
                  } else if (streamEvent.type === 'message_delta') {
                    // Use type assertion to access stop_reason property
                    const delta = streamEvent.delta as any;
                    if (delta.stop_reason) {
                      // Message is complete
                      controller.enqueue(formatSSE('message_stop', JSON.stringify({
                        id: messageId,
                        role: 'assistant',
                        content: responseText
                      })));

                      // We're done
                      break;
                    }
                  }
                }
              } catch (streamError: any) {
                console.error('Error in stream processing:', streamError);
                controller.enqueue(formatSSE('error', JSON.stringify({
                  error: streamError.message || 'Stream processing error'
                })));
              }

              // Close the controller when done
              controller.close();

              // Handle any errors
              stream.on('error', (error) => {
                console.error('Streaming error:', error);
                controller.enqueue(formatSSE('error', JSON.stringify({
                  error: error.message || 'Streaming error occurred'
                })));
                controller.close();
              });

              // Wait for the stream to complete
              await stream.finalMessage();

            } catch (error: any) {
              console.error('Error in stream controller:', error);
              controller.enqueue(formatSSE('error', JSON.stringify({
                error: error.message || 'Stream controller error'
              })));
              controller.close();
            }
          }
        });

        // Return the streaming response
        return new Response(stream, {
          headers: SSE_HEADERS
        });
      } catch (error: any) {
        console.error('Error setting up streaming:', error);
        return new Response(
          JSON.stringify({
            error: 'Failed to set up streaming',
            details: error.toString()
          }),
          { status: 500, headers: JSON_HEADERS }
        );
      }
    }

    // Always use streaming for simplicity and better UX
    console.log('Using streaming API for all requests');
    return new Response(
      JSON.stringify({
        error: 'This endpoint now only supports streaming responses. Please set stream=true in your request.'
      }),
      { status: 400, headers: JSON_HEADERS }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request', details: String(error) }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
}