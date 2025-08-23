'use client';

import { useEffect, useState } from 'react';
import { Message, useChat } from '@ai-sdk/react';
import { createIdGenerator } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizontalIcon } from 'lucide-react';
import { AgentModeData } from '@/types';
import AgentSidebar from '@/components/AgentSidebar';
import ChatArea from '@/components/ChatArea';
import ChatSidebar from './ChatSidebar';

export default function Chat({id,initialMessages,chatIds}: { id?: string | undefined; initialMessages?: Message[]; chatIds?: string[] } = {}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [agentModeData, setAgentModeData] = useState<AgentModeData | null>(null);

  const { messages, input, handleInputChange, handleSubmit, addToolResult, status } =
    useChat({
      id,
      maxSteps: 5,
      experimental_throttle: 50,
      initialMessages,
      sendExtraMessageFields: true,
      generateId: createIdGenerator({
        prefix: 'msgc',
        size: 16,
      }),
      experimental_prepareRequestBody({ messages, id }) {
        return { message: messages[messages.length - 1], id };
      },
    });

  const isLoading = status === 'streaming';

  const openAgentSidebar = (data: AgentModeData) => {
    setAgentModeData(data);
    setSidebarOpen(true);
  };

  return (
    <div className="flex flex-col h-screen justify-between items-center bg-background">
      {/* Minimalist Header */}
      <div className="w-full border-b bg-background px-4 py-3 flex justify-center items-center">
        <h1 className="text-lg font-medium">GitHub & Jira Assistant</h1>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 w-full overflow-hidden">
        <ChatSidebar chatIds={chatIds || []} />
        <div className={`flex flex-col flex-1 overflow-y-auto max-w-4xl mx-auto w-full ${messages.length === 0 ? 'justify-center' : ''}`}>
          <ChatArea
            isLoading={isLoading}
            messages={messages}
            openAgentSidebar={openAgentSidebar}
          />
        </div>
        <AgentSidebar
          agentModeData={agentModeData}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
        />
      </div>

      {/* Clean Input Area */}
      <div className="w-full border-t bg-background">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-4 flex items-center gap-3 relative">
          <Input
            disabled={isLoading}
            className="flex w-full rounded-full border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 px-4 py-6"
            value={input}
            placeholder={isLoading ? "AI is processing..." : "Ask about GitHub issues, Jira tickets, or code activity..."}
            onChange={handleInputChange}
            name="prompt"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full h-12 w-12 bg-primary shadow-md flex items-center justify-center" 
            disabled={isLoading || !input.trim()}
          >
            <SendHorizontalIcon size={18} className="text-primary-foreground" />
          </Button>
        </form>
      </div>
    </div>
  );
}