'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizontalIcon } from 'lucide-react';

// Define the message interface
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  // State for messages and input
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  
  // Reference for scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Effect for scrolling to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage?.content]);
  
  // Clean up event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);
  
  // Handle sending a message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Create a new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    
    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInput('');
    
    // Set loading state
    setIsLoading(true);
    
    // Clear any previous errors
    setError(null);
    
    try {
      // Use streaming by default with fetch API
      await handleStreamingRequest([...messages, userMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setIsLoading(false);
    }
  };
  
  // Handle streaming request
  const handleStreamingRequest = async (messagesList: Message[]) => {
    try {
      // Create an empty streaming message
      const newStreamingMessage: Message = {
        id: `streaming-${Date.now()}`,
        role: 'assistant',
        content: ''
      };
      
      setStreamingMessage(newStreamingMessage);
      
      // Use fetch with ReadableStream instead of EventSource
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          messages: messagesList
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('Response body is null');
      }
      
      // Get a reader from the response body
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // Function to process the stream
      const processStream = async () => {
        let buffer = '';
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('Stream complete');
              break;
            }
            
            // Decode the chunk and add it to our buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Process events in the buffer
            const events = buffer.split('\n\n');
            buffer = events.pop() || ''; // Keep the last incomplete event in the buffer
            
            for (const event of events) {
              if (!event.trim()) continue;
              
              const eventLines = event.split('\n');
              const eventType = eventLines[0].replace(/^event: /, '');
              const eventData = eventLines[1]?.replace(/^data: /, '');
              
              if (!eventType || !eventData) continue;
              
              try {
                const data = JSON.parse(eventData);
                
                // Handle different event types
                switch (eventType) {
                  case 'text':
                    setStreamingMessage(prev => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        content: prev.content + (data.text || '')
                      };
                    });
                    break;
                    
                  case 'message_start':
                    if (data.id) {
                      setStreamingMessage(prev => prev ? { ...prev, id: data.id } : null);
                    }
                    break;
                    
                  case 'message_stop':
                    // Add the final message to the messages list
                    setMessages(prev => [...prev, {
                      id: data.id || `assistant-${Date.now()}`,
                      role: 'assistant',
                      content: data.content || (streamingMessage?.content || '')
                    }]);
                    
                    // Clean up
                    setStreamingMessage(null);
                    setIsLoading(false);
                    reader.cancel();
                    return;
                    
                  case 'error':
                    throw new Error(data.error || 'Unknown streaming error');
                    
                  default:
                    console.log(`Unhandled event type: ${eventType}`, data);
                }
              } catch (err) {
                console.error(`Error processing ${eventType} event:`, err, eventData);
              }
            }
          }
          
          // If we get here without a message_stop event, finalize anyway
          setMessages(prev => {
            if (!streamingMessage) return prev;
            return [...prev, {
              id: `auto-completed-${Date.now()}`,
              role: 'assistant',
              content: streamingMessage.content
            }];
          });
          
        } catch (err) {
          console.error('Error processing stream:', err);
          setError(err instanceof Error ? err : new Error('Error processing stream'));
          reader.cancel();
        } finally {
          setStreamingMessage(null);
          setIsLoading(false);
        }
      };
      
      // Start processing the stream
      processStream();
      
    } catch (err) {
      console.error('Error setting up streaming:', err);
      setError(err instanceof Error ? err : new Error('Failed to set up streaming'));
      setIsLoading(false);
      setStreamingMessage(null);
    }
  };
  

  return (
    <div className="flex flex-col h-screen justify-between items-center">
      {/* Header */}
      <div className="w-full border-b bg-background px-4 py-2 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Claude Chat</h1>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 w-full overflow-hidden">
        <div className="flex flex-col flex-1 overflow-y-scroll bg-background p-4">
          {/* Error display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error.message || "An unknown error occurred"}</p>
            </div>
          )}
          
          {/* Welcome message if no messages */}
          {messages.length === 0 && !streamingMessage && (
            <div className="text-center text-gray-500 my-8">
              <p className="text-lg mb-2">Welcome to Claude Chat!</p>
              <p>Send a message to start chatting with Claude.</p>
            </div>
          )}
          
          {/* Messages */}
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-4 p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-100 ml-auto max-w-[80%]' 
                  : 'bg-gray-100 max-w-[80%]'
              }`}
            >
              <div className="font-medium mb-1">{message.role === 'user' ? 'You' : 'Claude'}</div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}
          
          {/* Streaming message (shows as it's being generated) */}
          {streamingMessage && (
            <div className="mb-4 p-3 rounded-lg bg-gray-100 max-w-[80%]">
              <div className="font-medium mb-1">Claude</div>
              <div className="whitespace-pre-wrap">{streamingMessage.content}</div>
              <div className="h-4 mt-1">
                <div className="animate-pulse bg-gray-300 rounded-full h-2 w-8 inline-block"></div>
              </div>
            </div>
          )}
          
          {/* Loading indicator (only show if not streaming) */}
          {isLoading && !streamingMessage && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-pulse bg-gray-200 rounded-full h-2 w-16"></div>
            </div>
          )}
          
          {/* Invisible div at the end for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex justify-center items-center w-full bg-background border-t">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-4 flex items-center gap-2">
          <Input
            disabled={isLoading}
            className="flex w-full rounded-2xl border-input bg-background px-4 py-6"
            value={input}
            placeholder={isLoading ? "Claude is thinking..." : "Ask something..."}
            onChange={(e) => setInput(e.target.value)}
            name="prompt"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full h-12 w-12 flex items-center justify-center" 
            disabled={isLoading || !input.trim()}
          >
            <SendHorizontalIcon size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}