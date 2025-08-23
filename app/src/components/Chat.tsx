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
    <div className="flex flex-col h-screen justify-between items-center">
      {/* Header */}
      <div className="w-full border-b bg-background px-4 py-2 flex justify-center items-center">
        <h1 className="text-lg font-semibold">AI Assistant - GitHub & Jira Tools</h1>
      </div>

       {/* Main Area */}
      <div className="flex flex-1 w-full overflow-hidden">
        <ChatSidebar chatIds={chatIds || []} />
        <div className="flex flex-col flex-1 overflow-y-scroll bg-background">
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


      {/* Input Area */}
      <div className="flex justify-center items-center w-full bg-background border-t">
          <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-4 flex items-center gap-2">
            <Input
              disabled={isLoading}
              className="flex w-full rounded-2xl border-input bg-background px-4 py-6"
              value={input}
              placeholder={isLoading ? "AI is thinking..." : "Ask about GitHub, Jira, or anything else..."}
              onChange={handleInputChange}
              name="prompt"
            />
            <Button type="submit" size="icon" className="rounded-full h-12 w-12 flex items-center justify-center" disabled={isLoading || !input.trim()}>
              <SendHorizontalIcon size={18} />
            </Button>
          </form>
      </div>
    </div>
  );
}