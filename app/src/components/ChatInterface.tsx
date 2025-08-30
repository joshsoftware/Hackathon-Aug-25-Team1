import { useState, useRef, useEffect } from "react";
import { MessageCircle, Users, UserCheck, Send, Download, TrendingUp, Activity, User, Bot, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmployeeActivityModal } from "@/components/EmployeeActivityModal";
import { TeamActivityModal } from "@/components/TeamActivityModal";
import { AgentLogo } from "@/components/AgentLogo";

const quickActions = [
  {
    id: "employee",
    title: "Employee Activity",
    description: "Track individual employee performance",
    icon: UserCheck,
    color: "primary",
  },
  {
    id: "team", 
    title: "Team Performance",
    description: "Monitor team-wide activities and metrics",
    icon: Users,
    color: "accent",
  },
];

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  data?: ActivityData;
}

interface ActivityData {
  type: 'employee' | 'team' | 'jira' | 'github';
  title: string;
  summary: string;
  metrics: Array<{ label: string; value: string; trend?: 'up' | 'down' | 'stable' }>;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "👋 Hello! I'm your WorkFlow Agent, ready to help you analyze employee activity and team performance. You can ask me about specific employees, team metrics, Jira tickets, GitHub activity, or use the quick actions below to get started:",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleActionClick = (actionId: string) => {
    if (actionId === 'employee') {
      setShowEmployeeModal(true);
    } else if (actionId === 'team') {
      setShowTeamModal(true);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Process the message and generate response
    setTimeout(() => {
      const response = processUserQuery(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response.content,
        timestamp: new Date(),
        data: response.data,
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const processUserQuery = (query: string): { content: string; data?: ActivityData } => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('jira') && !lowerQuery.includes('github')) {
      return {
        content: "Here's the Jira activity analysis for your team:",
        data: {
          type: 'jira',
          title: 'Jira Activity Analysis',
          summary: 'Comprehensive analysis of Jira tickets and workflow from the last 30 days. Strong velocity with good completion rates.',
          metrics: [
            { label: 'Tickets Completed', value: '67', trend: 'up' },
            { label: 'In Progress', value: '12', trend: 'stable' },
            { label: 'Avg Completion Time', value: '4.2 days', trend: 'down' },
            { label: 'Sprint Velocity', value: '28 pts', trend: 'up' }
          ]
        }
      };
    }

    if (lowerQuery.includes('github') && !lowerQuery.includes('jira')) {
      return {
        content: "Here's the GitHub activity analysis for your development team:",
        data: {
          type: 'github',
          title: 'GitHub Activity Analysis',
          summary: 'Development metrics and code contribution analysis from the last 30 days. Excellent collaboration and code quality.',
          metrics: [
            { label: 'Total Commits', value: '234', trend: 'up' },
            { label: 'Pull Requests', value: '45', trend: 'up' },
            { label: 'Code Reviews', value: '89', trend: 'stable' },
            { label: 'Lines Added', value: '12.5k', trend: 'up' }
          ]
        }
      };
    }

    // Default response for other queries
    return {
      content: "I can help you analyze employee and team performance. Try asking about specific platforms like 'Show me Jira data' or 'GitHub activity', or use the quick actions below.",
    };
  };

  const handleEmployeeDataReceived = (data: ActivityData) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content: "Here's the employee activity analysis:",
      timestamp: new Date(),
      data: data,
    };
    setMessages(prev => [...prev, botMessage]);
    setShowEmployeeModal(false);
  };

  const handleTeamDataReceived = (data: ActivityData) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content: "Here's the team performance analysis:",
      timestamp: new Date(),
      data: data,
    };
    setMessages(prev => [...prev, botMessage]);
    setShowTeamModal(false);
  };

  const handleDownloadReport = (data: ActivityData) => {
    const element = document.createElement('a');
    const file = new Blob([`Activity Report - ${data.title}\n\nGenerated: ${new Date().toLocaleString()}\n\nSummary: ${data.summary}`], 
      { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `activity-report-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleViewMore = (data: ActivityData) => {
    if (data.type === 'employee') {
      window.location.href = '/employee-analytics';
    } else if (data.type === 'team') {
      window.location.href = '/team-analytics';
    } else if (data.type === 'jira') {
      window.location.href = '/employee-analytics?view=jira';
    } else if (data.type === 'github') {
      window.location.href = '/employee-analytics?view=github';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-muted p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-4">
            <AgentLogo size="lg" animated={true} />
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                WorkFlow Agent
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground font-medium">AI-Powered Analytics</span>
              </div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your intelligent assistant for tracking, analyzing, and optimizing team productivity with real-time insights and comprehensive activity monitoring.
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="glass-card flex flex-col h-[600px]">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-primary" />
                    ) : (
                      <Bot className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`chat-response rounded-2xl p-4 ${message.type === 'user' ? 'bg-primary/10 ml-auto' : ''}`}>
                      <p className="text-sm">{message.content}</p>
                      {message.data && (
                        <div className="mt-4">
                          <h3 className="font-semibold mb-2">{message.data.title}</h3>
                          <p className="mb-4 text-sm opacity-90">{message.data.summary}</p>
                          
                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {message.data.metrics.map((metric, index) => (
                              <div key={index} className="text-center p-3 bg-card rounded-lg border">
                                <p className="text-xl font-bold text-primary">{metric.value}</p>
                                <p className="text-xs text-muted-foreground">{metric.label}</p>
                                {metric.trend && (
                                  <div className={`text-xs mt-1 ${
                                    metric.trend === 'up' ? 'text-success' : 
                                    metric.trend === 'down' ? 'text-destructive' : 
                                    'text-muted-foreground'
                                  }`}>
                                    {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} 
                                    {metric.trend}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Button onClick={() => handleViewMore(message.data!)} className="flex-1">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              View Detailed Analytics
                            </Button>
                            <Button onClick={() => handleDownloadReport(message.data!)} variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download Report
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent/10 rounded-full">
                    <Bot className="h-4 w-4 text-accent" />
                  </div>
                  <div className="chat-response rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="border-t p-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Quick Actions:</p>
              <div className="grid gap-2 md:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      onClick={() => handleActionClick(action.id)}
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {action.title}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                placeholder="💬 Ask me anything: 'Show Sarah's Jira activity', 'Team performance this week', 'GitHub commits today'..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[40px] max-h-[120px] resize-none bg-gradient-to-r from-background to-secondary/20 border-2 border-transparent focus:border-blue-500/30 transition-all duration-200"
                rows={1}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <EmployeeActivityModal 
        open={showEmployeeModal}
        onOpenChange={setShowEmployeeModal}
        onDataReceived={handleEmployeeDataReceived}
      />
      
      <TeamActivityModal 
        open={showTeamModal}
        onOpenChange={setShowTeamModal}
        onDataReceived={handleTeamDataReceived}
      />
    </div>
  );
}
