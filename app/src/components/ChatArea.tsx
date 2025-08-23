import React, { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Message } from '@ai-sdk/react';
import {
  UserIcon,
  BotIcon,
  AlertCircleIcon,
  TerminalIcon,
  ArrowRightIcon,
  FileTextIcon,
  TableIcon
} from 'lucide-react';
import { MemoizedMarkdown } from '@/components/memoised-markdown';
import ChatLoader from '@/components/ChatLoader';
import { AgentModeData } from '@/types';
import { Button } from '@/components/ui/button';

type Props = {
  messages: Message[]
  openAgentSidebar: (data: AgentModeData) => void
  isLoading: boolean
}

const ChatArea = (props: Props) => {
  const {messages, openAgentSidebar, isLoading} = props
  const [reportGenerated, setReportGenerated] = useState(false);
  
  const generateReport = () => {
    if (messages.length === 0) return;
    
    // Create a timestamp for the report
    const timestamp = new Date().toLocaleString();
    
    // Generate CSV data for Excel
    const csvRows = [];
    
    // Add header row
    csvRows.push(['User ID', 'Timestamp', 'Role', 'Activity', 'Content']);
    
    // Process each message to extract user activity
    messages.forEach((message, index) => {
      const role = message.role;
      const userId = role === 'user' ? 'User' : 'Assistant';
      const messageTime = timestamp; // Using current timestamp as we don't have message timestamps
      
      // Extract text from message parts
      const textParts = message.parts
        ?.filter(part => part.type === 'text')
        .map(part => (part.type === 'text' ? part.text : ''))
        .join(' ') || '';
      
      // Determine activity type
      let activity = role === 'user' ? 'User Message' : 'Assistant Response';
      
      // Check if the message contains tool invocations
      const hasToolInvocation = message.parts?.some(part => part.type === 'tool-invocation');
      if (hasToolInvocation) {
        activity = 'Tool Usage';
      }
      
      // Add the row to CSV data
      // Escape quotes in content to prevent CSV issues
      const escapedContent = textParts.replace(/"/g, '""');
      csvRows.push([userId, messageTime, role, activity, `"${escapedContent}"`]);
      
      // We're not including tool details as per user request
    });
    
    // Convert CSV rows to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Add BOM for Excel to recognize UTF-8
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    
    // Create a blob and download link
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-activity-report-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setReportGenerated(true);
    setTimeout(() => setReportGenerated(false), 3000);
  };
  
  return (
    <ScrollArea className="flex-grow w-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {messages?.map((m: Message) => (
          <div
            key={m.id}
            className={`flex gap-3 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Avatar */}
            {m.role !== 'user' && (
              <Avatar className="h-10 w-10 border bg-background">
                <AvatarFallback className="bg-primary/10">
                  <BotIcon size={20} className="text-primary" />
                </AvatarFallback>
              </Avatar>
            )}

            {/* Message Content */}
            <Card
              className={`max-w-[80%] shadow-sm border-0 ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <CardContent className="space-y-2 py-3 px-4">
                {m.parts?.map((part, i: number) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <div
                          key={`${m.id}-text-${i}`}
                          className="whitespace-pre-wrap text-sm"
                        >
                          <MemoizedMarkdown id={i.toString()} content={part.text} />
                        </div>
                      );
                    case 'tool-invocation':
                      const toolInvocation = part.toolInvocation;
                      const toolCallId = toolInvocation.toolCallId;

                      if (toolInvocation.state === 'result') {
                        // Check if this is a map-related tool
                        const isMapTool = toolInvocation.toolName.startsWith('maps_')

                        if (isMapTool) {
                          return
                        } else {
                          // Render traditional tool result for non-map tools
                          return (
                            <div
                              key={`${m.id}-tool-${i}-${toolCallId}`}
                              className="mt-2 pt-2 border-t border-border text-xs"
                            >
                              <div
                                className="flex items-center gap-2 p-2 rounded-md bg-background/50 cursor-pointer hover:bg-muted/60"
                                onClick={() => openAgentSidebar({
                                  toolName: toolInvocation.toolName,
                                  result: toolInvocation.result,
                                  args: toolInvocation.args
                                })}
                              >
                                <TerminalIcon size={14} className="text-primary" />
                                <span className="font-medium">{toolInvocation.toolName}</span>
                                <ArrowRightIcon size={12} className="ml-auto" />
                              </div>
                            </div>
                          )
                        }
                      } else if (toolInvocation.state === 'call') {
                         // Optional: Render a non-interactive pending state indicator
                         // if needed, but the main indicator is the disabled input/loader below
                         // Example:
                         return (
                           <div key={`${m.id}-tool-call-${i}-${toolCallId}`} className="mt-2 pt-2 border-t text-xs italic text-muted-foreground">
                             <span className="flex items-center gap-1"><AlertCircleIcon size={12}/>Pending: {toolInvocation.toolName}</span>
                           </div>
                         );
                        //  return null; // Or return null if no specific indicator needed here
                      }
                      return null;
                    default:
                      return null;
                  }
                })}
              </CardContent>
            </Card>

            {/* User Avatar */}
            {m.role === 'user' && (
              <Avatar className="h-10 w-10 border">
                <AvatarFallback className="bg-background">
                  <UserIcon size={20} className="text-foreground" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {/* Loading Indicator - considers pending confirmation */}
        {isLoading && (
          <ChatLoader/>
        )}
        
        {/* Generate Report Button */}
        {messages.length > 0 && !isLoading && (
          <div className="flex justify-center mt-6 mb-4 sticky bottom-2">
            <Button 
              onClick={generateReport}
              className={`flex items-center gap-2 ${reportGenerated ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'}`}
              variant={reportGenerated ? "outline" : "default"}
              size="lg"
            >
              <TableIcon size={16} />
              {reportGenerated ? 'Excel Report Downloaded!' : 'Generate Excel Report'}
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>

  )
}

export default ChatArea
