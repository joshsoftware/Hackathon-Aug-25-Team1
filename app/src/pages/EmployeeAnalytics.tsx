import { ArrowLeft, Github, FileText, Clock, TrendingUp, GitBranch, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Last 5 days data
const commitData = [
  { date: 'Aug 18', commits: 5, additions: 234, deletions: 45 },
  { date: 'Aug 19', commits: 8, additions: 456, deletions: 123 },
  { date: 'Aug 20', commits: 3, additions: 123, deletions: 34 },
  { date: 'Aug 21', commits: 12, additions: 678, deletions: 234 },
  { date: 'Aug 22', commits: 6, additions: 345, deletions: 67 },
];

const jiraData = [
  { status: 'Completed', count: 23, color: '#16a34a' },
  { status: 'In Progress', count: 8, color: '#2563eb' },
  { status: 'In Review', count: 5, color: '#f59e0b' },
  { status: 'Blocked', count: 2, color: '#dc2626' },
];

const jiraStatusLegend = [
  { status: 'Completed', description: 'Tasks that have been finished and delivered', color: '#16a34a' },
  { status: 'In Progress', description: 'Currently active tasks being worked on', color: '#2563eb' },
  { status: 'In Review', description: 'Tasks waiting for review or approval', color: '#f59e0b' },
  { status: 'Blocked', description: 'Tasks that are blocked by dependencies or issues', color: '#dc2626' },
];

const activityData = [
  { time: '09:00', activity: 85 },
  { time: '10:00', activity: 92 },
  { time: '11:00', activity: 78 },
  { time: '12:00', activity: 45 },
  { time: '13:00', activity: 38 },
  { time: '14:00', activity: 82 },
  { time: '15:00', activity: 95 },
  { time: '16:00', activity: 88 },
  { time: '17:00', activity: 72 },
];

export default function EmployeeAnalytics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-muted p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Sarah Johnson - Detailed Analytics</h1>
            <p className="text-muted-foreground">Frontend Developer • Engineering Team</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Github className="h-4 w-4 text-primary" />
                Total Commits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">47</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +18% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-accent" />
                Pull Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">12</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +25% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-warning" />
                Jira Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">23</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                Stable performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* GitHub Activity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5 text-primary" />
                GitHub Activity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={commitData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="commits" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Jira Ticket Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-warning" />
                Jira Ticket Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={jiraData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="count"
                    label={({ name, value }) => `${name}: ${value}`}
                    className="text-xs"
                  >
                    {jiraData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Status Legend */}
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm mb-2">Status Indicators:</h4>
                {jiraStatusLegend.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium min-w-[80px]">{item.status}:</span>
                    <span className="text-muted-foreground">{item.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Activity Pattern */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-success" />
              Daily Activity Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="activity" 
                  fill="hsl(var(--success))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity - Last 5 Days */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Commits */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5 text-primary" />
                Recent Commits (Last 5 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { message: "Implement user authentication flow", time: "Aug 22, 2 hours ago", additions: 145, deletions: 23 },
                { message: "Fix responsive design issues", time: "Aug 22, 5 hours ago", additions: 67, deletions: 34 },
                { message: "Add unit tests for API endpoints", time: "Aug 21, 1 day ago", additions: 234, deletions: 12 },
                { message: "Update documentation", time: "Aug 20, 2 days ago", additions: 89, deletions: 5 },
                { message: "Refactor component structure", time: "Aug 19, 3 days ago", additions: 156, deletions: 78 },
              ].map((commit, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{commit.message}</p>
                    <p className="text-xs text-muted-foreground">{commit.time}</p>
                  </div>
                  <div className="text-xs space-x-2">
                    <Badge variant="outline" className="text-success border-success/20">
                      +{commit.additions}
                    </Badge>
                    <Badge variant="outline" className="text-destructive border-destructive/20">
                      -{commit.deletions}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Jira Activities */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-warning" />
                Recent Jira Activities (Last 5 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { ticket: "FE-234", title: "Implement dark mode toggle", status: "Completed", time: "Aug 22, 3 hours ago" },
                { ticket: "FE-235", title: "Optimize image loading", status: "In Review", time: "Aug 22, 6 hours ago" },
                { ticket: "FE-236", title: "Add search functionality", status: "In Progress", time: "Aug 21, 1 day ago" },
                { ticket: "FE-237", title: "Fix mobile navigation", status: "Completed", time: "Aug 20, 2 days ago" },
                { ticket: "FE-238", title: "Update user profile page", status: "In Progress", time: "Aug 18, 4 days ago" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{activity.ticket}</Badge>
                      {activity.status === 'Completed' && <CheckCircle className="h-4 w-4 text-success" />}
                      {activity.status === 'In Progress' && <Clock className="h-4 w-4 text-warning" />}
                      {activity.status === 'In Review' && <AlertCircle className="h-4 w-4 text-accent" />}
                    </div>
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge 
                    variant={activity.status === 'Completed' ? 'default' : 'secondary'}
                    className={
                      activity.status === 'Completed' ? 'bg-success text-success-foreground' :
                      activity.status === 'In Progress' ? 'bg-warning text-warning-foreground' :
                      'bg-accent text-accent-foreground'
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}