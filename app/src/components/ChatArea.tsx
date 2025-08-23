import React, { useMemo , useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Message } from '@ai-sdk/react';
import Link from 'next/link';
import {
  UserIcon,
  BotIcon,
  AlertCircleIcon,
  TerminalIcon,
  ArrowRightIcon,
  FileTextIcon,
  TableIcon,
  GithubIcon,
  GitPullRequestIcon,
  GitBranchIcon,
  GitCommitIcon,
  CheckCircleIcon,
  XCircleIcon,
  Clock3Icon,
  ExternalLinkIcon
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

// Helper function to render GitHub PR widget with timeseries data
const GitHubPRWidget = ({ data }: { data: any }) => {
  // Format the timestamp or use placeholder
  const startTime = data.createdAt ? new Date(data.createdAt).toLocaleTimeString() : '00:00:00';
  const endTime = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : 'In progress';

  return (
    <Card className="mt-3 overflow-hidden">
      <div className="bg-muted px-3 py-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GithubIcon size={14} className="text-primary" />
          <span className="text-xs font-medium">Pull Request</span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3Icon size={10} />
            {startTime} - {endTime}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <GitPullRequestIcon size={14} className="text-primary" />
          <a href={data.url || '#'} className="text-sm font-medium hover:underline flex items-center gap-1 text-primary">
            {data.title}
            <ExternalLinkIcon size={12} className="inline-block ml-1" />
          </a>
        </div>
        <div className="flex justify-between items-center text-xs mb-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Repo: {data.repo || 'Unknown'}</span>
          </div>
          <Badge variant="outline">
            {data.state || 'unknown'}
          </Badge>
        </div>
        {data.description && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md mt-2">
            {data.description.length > 100 ? data.description.substring(0, 100) + '...' : data.description}
          </div>
        )}
      </div>
    </Card>
  );
};

// Helper function to render Jira issue widget with timeseries data
const JiraIssueWidget = ({ data }: { data: any }) => {
  // Format the timestamp or use placeholder
  const startTime = data.created ? new Date(data.created).toLocaleTimeString() : '00:00:00';
  const endTime = data.updated ? new Date(data.updated).toLocaleTimeString() : 'In progress';

  return (
    <Card className="mt-3 overflow-hidden">
      <div className="bg-muted px-3 py-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          <span className="text-xs font-medium">Jira Issue</span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3Icon size={10} />
            {startTime} - {endTime}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="font-mono">{data.key || 'ISSUE-1'}</Badge>
          <a href={data.url || '#'} className="text-sm font-medium hover:underline flex items-center gap-1 text-primary">
            {data.summary || 'Issue title'}
            <ExternalLinkIcon size={12} className="inline-block ml-1" />
          </a>
        </div>
        <div className="flex flex-wrap gap-3 text-xs mb-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Status:</span>
            <Badge variant="outline">
              {data.status || 'In Progress'}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Priority:</span>
            <Badge variant="outline">{data.priority || 'Medium'}</Badge>
          </div>
          {data.assignee && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>Assignee:</span>
              <span className="font-medium">{data.assignee}</span>
            </div>
          )}
        </div>
        {data.description && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md mt-2">
            {data.description.length > 100 ? data.description.substring(0, 100) + '...' : data.description}
          </div>
        )}
      </div>
    </Card>
  );
};

// Helper function to render Jira sprint widget
const JiraSprintWidget = ({ data }: { data: any }) => {
  // Format the timestamp or use placeholder
  const startTime = data.startDate ? new Date(data.startDate).toLocaleTimeString() : '00:00:00';
  const endTime = data.endDate ? new Date(data.endDate).toLocaleTimeString() : 'In progress';

  // Calculate progress percentage
  const completedIssues = data.completedIssues || 0;
  const totalIssues = data.totalIssues || 1; // Avoid division by zero
  const progressPercentage = Math.min(100, Math.round((completedIssues / totalIssues) * 100));

  return (
    <Card className="mt-3 overflow-hidden">
      <div className="bg-muted px-3 py-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          </svg>
          <span className="text-xs font-medium">Jira Sprint</span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3Icon size={10} />
            {startTime} - {endTime}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">{data.name || 'Sprint'}</span>
          <Badge variant="outline">
            {data.state || 'Unknown'}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground mb-2">
          <div className="flex justify-between mb-1">
            <span>Progress: {progressPercentage}%</span>
            <span>{completedIssues}/{totalIssues} issues</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-muted p-2 rounded-md text-center">
            <div className="font-medium">{data.completedIssues || 0}</div>
            <div className="text-muted-foreground">Done</div>
          </div>
          <div className="bg-muted p-2 rounded-md text-center">
            <div className="font-medium">{data.inProgressIssues || 0}</div>
            <div className="text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-muted p-2 rounded-md text-center">
            <div className="font-medium">{data.toDoIssues || 0}</div>
            <div className="text-muted-foreground">To Do</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Helper function to render Jira worklog widget
const JiraWorklogWidget = ({ data }: { data: any }) => {
  // Format the timestamp or use placeholder
  const startTime = data.started ? new Date(data.started).toLocaleTimeString() : '00:00:00';
  const endTime = data.ended ? new Date(data.ended).toLocaleTimeString() : 'In progress';

  const worklogs = Array.isArray(data.worklogs) ? data.worklogs : [];

  return (
    <Card className="mt-3 overflow-hidden">
      <div className="bg-muted px-3 py-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-xs font-medium">Jira Worklog</span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3Icon size={10} />
            {startTime} - {endTime}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">{data.issueKey || 'ISSUE-1'}</Badge>
            <span className="text-sm font-medium">{data.issueSummary || 'Work logged'}</span>
          </div>
          <Badge variant="outline">{data.totalTime || '0h'}</Badge>
        </div>

        <div className="max-h-40 overflow-y-auto">
          {worklogs.length > 0 ? (
            <div className="divide-y">
              {worklogs.map((log: any, index: number) => (
                <div key={index} className="py-2 flex justify-between text-xs">
                  <div>
                    <div className="font-medium">{log.author || 'Unknown'}</div>
                    <div className="text-muted-foreground">{log.comment || 'No comment'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{log.timeSpent || '0h'}</div>
                    <div className="text-muted-foreground">{log.created ? new Date(log.created).toLocaleTimeString() : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-xs text-muted-foreground py-2">No work logs found</div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Helper function to render GitHub commits widget with timeseries data
const GitHubCommitsWidget = ({ data }: { data: any }) => {
  const commits = Array.isArray(data.commits) ? data.commits : [];

  // Format the timestamp or use placeholder for the activity timeframe
  const firstCommitTime = commits.length > 0 && commits[0].date ?
    new Date(commits[0].date).toLocaleTimeString() : '00:00:00';
  const lastCommitTime = commits.length > 0 && commits[commits.length-1].date ?
    new Date(commits[commits.length-1].date).toLocaleTimeString() : 'Now';

  return (
    <Card className="mt-3 overflow-hidden">
      <div className="bg-muted px-3 py-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GithubIcon size={14} className="text-primary" />
          <span className="text-xs font-medium">Recent Commits</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{commits.length}</Badge>
          <div className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock3Icon size={10} />
              {firstCommitTime} - {lastCommitTime}
            </span>
          </div>
        </div>
      </div>
      <div className="divide-y max-h-48 overflow-y-auto">
        {commits.length > 0 ? (
          commits.map((commit: any, index: number) => (
            <div key={index} className="p-2 hover:bg-muted">
              <div className="flex items-center gap-2">
                <GitCommitIcon size={14} className="text-primary" />
                <span className="text-xs font-medium truncate">{commit.message || 'Commit message'}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>{commit.author || 'Unknown author'}</span>
                <span>·</span>
                <span>{commit.date ? new Date(commit.date).toLocaleTimeString() : 'Unknown time'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 text-center text-xs text-muted-foreground">No commits found</div>
        )}
      </div>
    </Card>
  );
};

const ChatArea = (props: Props) => {
  const {messages, openAgentSidebar, isLoading} = props

  // Function to determine if a result might contain GitHub PR data
  const detectGitHubPR = (toolName: string, result: any): boolean => {
    return (toolName.toLowerCase().includes('pull') || toolName.toLowerCase().includes('pr')) &&
           result && typeof result === 'object' && (result.title || result.state || result.url);
  }

  // Function to determine if a result might contain Jira issue data
  const detectJiraIssue = (toolName: string, result: any): boolean => {
    return toolName.toLowerCase().includes('issue') &&
           result && typeof result === 'object' && (result.key || result.summary || result.status);
  }

  // Function to determine if a result might contain Jira sprint data
  const detectJiraSprint = (toolName: string, result: any): boolean => {
    return toolName.toLowerCase().includes('sprint') &&
           result && typeof result === 'object';
  }

  // Function to determine if a result might contain Jira worklog data
  const detectJiraWorklog = (toolName: string, result: any): boolean => {
    return (toolName.toLowerCase().includes('worklog') || toolName.toLowerCase().includes('work log')) &&
           result && typeof result === 'object';
  }

  // Function to determine if a result might contain GitHub commits data
  const detectGitHubCommits = (toolName: string, result: any): boolean => {
    return toolName.toLowerCase().includes('commit') &&
           result && typeof result === 'object' && result.commits;
  }

  // If no messages, show initial empty state
  if (messages.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 mb-3">
            <BotIcon size={28} className="text-primary" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-1">GitHub & Jira Assistant</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Ask about GitHub issues, Jira tickets, code activity, or anything related to your projects.
          </p>
        </div>
      </div>
    );
  }

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
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {messages?.map((m: Message) => (
          <div
            key={m.id}
            className="flex gap-3 items-start"
          >
            {/* Avatar - Always on left side */}
            <Avatar className="h-8 w-8 border shadow-sm bg-card">
              <AvatarFallback className={m.role === 'user' ? "bg-blue-100" : "bg-primary/10"}>
                {m.role === 'user' ? (
                  <UserIcon size={16} className="text-blue-500" />
                ) : (
                  <BotIcon size={16} className="text-primary" />
                )}
              </AvatarFallback>
            </Avatar>

            {/* Message Content */}
            <div className="flex flex-col max-w-[85%] min-w-0">
              {m.role === 'user' ? (
                <div className="mb-3">
                  <span className="text-xs font-medium text-blue-600 block mb-1">You</span>
                  <div className="pl-3 border-l border-blue-200">
                    {m.parts?.map((part, i: number) => (
                      <div
                        key={`${m.id}-text-${i}`}
                        className="whitespace-pre-wrap text-sm"
                      >
                        <MemoizedMarkdown id={i.toString()} content={(part as any).text || ''} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Split assistant messages into multiple bubbles
                <div className="mb-4">
                  <span className="text-xs font-medium text-primary block mb-1">GitHub & Jira Assistant</span>
                  <div className="pl-3 border-l border-primary/30">
                  {(() => {
                    // Group text by sections and tool calls
                    const messageBubbles: React.ReactNode[] = [];
                    let currentTextBubble: string[] = [];

                    m.parts?.forEach((part, i: number) => {
                      if (part.type === 'text') {
                        // Split text into paragraphs
                        // Format text in a more factual, report-like style
                        const rawText = (part as any).text || '';
                        // Use regex to detect and format citations [1], [2], etc.
                        const textWithCitations = rawText.replace(/\[([0-9]+)\]/g, '<sup class="text-primary">[$1]</sup>');
                        const paragraphs = textWithCitations.split('\n\n').filter(p => p.trim());

                        if (paragraphs.length > 1) {
                          // If there are existing texts, add them as a bubble first
                          if (currentTextBubble.length > 0) {
                            messageBubbles.push(
                              <div key={`text-bubble-${messageBubbles.length}`} className="whitespace-pre-wrap text-sm mb-2">
                                <MemoizedMarkdown id={`text-combined-${i}`} content={currentTextBubble.join('\n\n')} />
                              </div>
                            );
                            currentTextBubble = [];
                          }

                          // Add each paragraph as a separate bubble
                          paragraphs.forEach((paragraph, pIndex) => {
                            messageBubbles.push(
                              <div key={`text-para-${i}-${pIndex}`} className="whitespace-pre-wrap text-sm mb-2">
                                <MemoizedMarkdown id={`text-para-${i}-${pIndex}`} content={paragraph} />
                              </div>
                            );
                          });
                        } else {
                          // Single paragraph, add to current bubble with factual formatting
                          const rawText = (part as any).text || '';
                          const textWithCitations = rawText.replace(/\[([0-9]+)\]/g, '<sup class="text-primary">[$1]</sup>');
                          currentTextBubble.push(textWithCitations);
                        }
                      } else if (part.type === 'tool-invocation') {
                        const toolInvocation = part.toolInvocation;
                        const toolCallId = toolInvocation.toolCallId;

                        // Before adding tool invocation, flush any pending text bubbles
                        if (currentTextBubble.length > 0) {
                          messageBubbles.push(
                            <div key={`text-bubble-${messageBubbles.length}`} className="whitespace-pre-wrap text-sm mb-2">
                              <MemoizedMarkdown id={`text-combined-${i}`} content={currentTextBubble.join('\n\n')} />
                            </div>
                          );
                          currentTextBubble = [];
                        }

                        if (toolInvocation.state === 'result') {
                          // Check if this is a map-related tool
                          const isMapTool = toolInvocation.toolName.startsWith('maps_')

                          if (isMapTool) {
                            return null;
                          } else {
                            // Identify the tool type to render appropriate widget
                            const toolName = toolInvocation.toolName;
                            const result = toolInvocation.result;
                            const hasPRData = detectGitHubPR(toolName, result);
                            const hasJiraIssueData = detectJiraIssue(toolName, result);
                            const hasJiraSprintData = detectJiraSprint(toolName, result);
                            const hasJiraWorklogData = detectJiraWorklog(toolName, result);
                            const hasCommitsData = detectGitHubCommits(toolName, result);

                            messageBubbles.push(
                              <div key={`tool-${i}-${toolCallId}`}>
                                <div className="mb-2">
                                  <div
                                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 cursor-pointer hover:text-foreground hover:underline mb-1.5"
                                    onClick={() => openAgentSidebar({
                                      toolName: toolInvocation.toolName,
                                      result: toolInvocation.result,
                                      args: toolInvocation.args
                                    })}
                                  >
                                    <TerminalIcon size={12} className="text-primary/70" />
                                    <span>Source: {toolInvocation.toolName}</span>
                                    <ArrowRightIcon size={10} className="ml-0.5" />
                                  </div>
                                </div>

                                {/* Render citation references instead of full widgets */}
                                {hasPRData && (
                                  <div className="text-xs mb-3 pl-3 border-l border-primary/20 py-0.5 bg-primary/5 rounded-r">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <GitPullRequestIcon size={10} className="text-primary" />
                                      <a href={result.url || '#'} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline flex items-center gap-0.5 text-primary">
                                        {result.title || 'Pull Request'}
                                        <ExternalLinkIcon size={8} className="inline-block ml-0.5" />
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground/90">
                                      <span>Source:</span>
                                      <span className="font-mono">{result.repo || 'Unknown repo'}</span>
                                      <span>•</span>
                                      <span className="text-xs italic">
                                        {result.state || 'unknown'}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {hasJiraIssueData && (
                                  <div className="text-xs mb-3 pl-3 border-l border-primary/20 py-0.5 bg-primary/5 rounded-r">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="font-mono text-xs">{result.key || 'ISSUE-1'}</span>
                                      <a href={result.url || '#'} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline flex items-center gap-0.5 text-primary">
                                        {result.summary || 'Issue title'}
                                        <ExternalLinkIcon size={8} className="inline-block ml-0.5" />
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground/90">
                                      <span>Source:</span>
                                      <span className="text-xs italic">
                                        {result.status || 'In Progress'}
                                      </span>
                                      <span>•</span>
                                      <span>{result.assignee || 'Unassigned'}</span>
                                    </div>
                                  </div>
                                )}
                                {hasJiraSprintData && (
                                  <div className="text-xs mb-3 pl-3 border-l border-primary/20 py-0.5 bg-primary/5 rounded-r">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="font-medium">{result.name || 'Sprint'}</span>
                                      <span className="text-xs italic">
                                        {result.state || 'Unknown'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground/90">
                                      <span>Source:</span>
                                      <span>{(result.completedIssues || 0)}/{(result.totalIssues || 0)} issues completed</span>
                                      <span>•</span>
                                      <span>{Math.min(100, Math.round(((result.completedIssues || 0) / (result.totalIssues || 1)) * 100))}% progress</span>
                                    </div>
                                  </div>
                                )}
                                {hasJiraWorklogData && (
                                  <div className="text-xs mb-3 pl-3 border-l border-primary/20 py-0.5 bg-primary/5 rounded-r">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="font-mono text-xs">{result.issueKey || 'ISSUE-1'}</span>
                                      <span className="font-medium">{result.issueSummary || 'Work logged'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground/90">
                                      <span>Source:</span>
                                      <span>Total time: {result.totalTime || '0h'}</span>
                                      <span>•</span>
                                      <span>{(Array.isArray(result.worklogs) ? result.worklogs.length : 0)} entries</span>
                                    </div>
                                  </div>
                                )}
                                {hasCommitsData && (
                                  <div className="text-xs mb-3 pl-3 border-l border-primary/20 py-0.5 bg-primary/5 rounded-r">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <GithubIcon size={10} className="text-primary" />
                                      <span className="font-medium">Recent Commits</span>
                                      <span className="text-xs">({Array.isArray(result.commits) ? result.commits.length : 0})</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground/90">
                                      <span>Source:</span>
                                      <span>{result.repo || 'Unknown repo'}</span>
                                      {Array.isArray(result.commits) && result.commits.length > 0 && (
                                        <>
                                          <span>•</span>
                                          <span>Latest: {result.commits[0]?.message?.substring(0, 20) || 'Unknown'}...</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        } else if (toolInvocation.state === 'call') {
                          messageBubbles.push(
                            <div key={`tool-call-${i}-${toolCallId}`} className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></span>
                                Processing: {toolInvocation.toolName}
                              </span>
                            </div>
                          );
                        }
                      }
                    });

                    // Add any remaining text as the final bubble
                    if (currentTextBubble.length > 0) {
                      messageBubbles.push(
                        <div key={`text-bubble-${messageBubbles.length}`} className="whitespace-pre-wrap text-sm mb-2">
                          <MemoizedMarkdown id={`text-final`} content={currentTextBubble.join('\n\n')} />
                        </div>
                      );
                    }

                    return messageBubbles.length > 0 ? messageBubbles : [
                      <div key="empty-response" className="text-sm text-muted-foreground mb-2">
                        No response
                      </div>
                    ];
                  })()}
                  </div>
                </div>
              )}
            </div>

            {/* No avatar at the end - all avatars are on the left */}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-3 bg-card shadow-sm border border-border rounded-full px-4 py-2">
              <div className="h-3 w-3 bg-primary/70 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">AI is thinking...</span>
            </div>
          </div>
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
