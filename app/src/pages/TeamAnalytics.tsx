import { ArrowLeft, Users, TrendingUp, Target, Award, GitBranch, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const teamVelocityData = [
  { sprint: 'Sprint 1', velocity: 65, planned: 70, completed: 65 },
  { sprint: 'Sprint 2', velocity: 78, planned: 75, completed: 78 },
  { sprint: 'Sprint 3', velocity: 82, planned: 80, completed: 82 },
  { sprint: 'Sprint 4', velocity: 71, planned: 85, completed: 71 },
  { sprint: 'Sprint 5', velocity: 89, planned: 85, completed: 89 },
  { sprint: 'Sprint 6', velocity: 93, planned: 90, completed: 93 },
];

const teamPerformanceData = [
  { metric: 'Code Quality', score: 85, fullMark: 100 },
  { metric: 'Collaboration', score: 92, fullMark: 100 },
  { metric: 'Innovation', score: 78, fullMark: 100 },
  { metric: 'Delivery Speed', score: 88, fullMark: 100 },
  { metric: 'Problem Solving', score: 90, fullMark: 100 },
  { metric: 'Communication', score: 87, fullMark: 100 },
];

const memberContributions = [
  { name: 'Sarah J.', commits: 47, prs: 12, tickets: 23, score: 95 },
  { name: 'Michael C.', commits: 52, prs: 18, tickets: 19, score: 92 },
  { name: 'Jessica B.', commits: 38, prs: 9, tickets: 27, score: 88 },
  { name: 'Alex T.', commits: 43, prs: 15, tickets: 21, score: 89 },
  { name: 'David K.', commits: 29, prs: 7, tickets: 31, score: 85 },
];

const teamMembers = [
  { name: 'Sarah Johnson', role: 'Frontend Developer', status: 'Active', performance: 95 },
  { name: 'Michael Chen', role: 'Backend Developer', status: 'Active', performance: 92 },
  { name: 'Jessica Brown', role: 'QA Engineer', status: 'Active', performance: 88 },
  { name: 'Alex Thompson', role: 'DevOps Engineer', status: 'Active', performance: 89 },
  { name: 'David Kim', role: 'Product Manager', status: 'Active', performance: 85 },
];

export default function TeamAnalytics() {
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
            <h1 className="text-3xl font-bold">Engineering Team - Comprehensive Analytics</h1>
            <p className="text-muted-foreground">12 Members • Lead: Michael Chen</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                Total Commits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">234</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +22% from last sprint
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                Stories Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">67</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +15% from last sprint
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-warning" />
                Code Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">89</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                Consistent performance
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-success" />
                Team Velocity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">8.7/10</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                Excellent performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Team Velocity Trend */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Sprint Velocity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={teamVelocityData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="sprint" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="planned" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Team Performance Radar */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-success" />
                Team Performance Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={teamPerformanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" className="text-xs" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
                  <Radar
                    name="Performance"
                    dataKey="score"
                    stroke="hsl(var(--success))"
                    fill="hsl(var(--success) / 0.3)"
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Team Member Contributions */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Individual Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberContributions}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="commits" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="prs" fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="tickets" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Members Overview */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <Badge 
                      variant={member.status === 'Active' ? 'default' : 'secondary'}
                      className="bg-success text-success-foreground"
                    >
                      {member.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance Score</span>
                      <span className="font-medium">{member.performance}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-success h-2 rounded-full transition-all duration-300"
                        style={{ width: `${member.performance}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-primary">
                        {memberContributions.find(m => m.name.startsWith(member.name.split(' ')[0]))?.commits || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Commits</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-accent">
                        {memberContributions.find(m => m.name.startsWith(member.name.split(' ')[0]))?.prs || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">PRs</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-success">
                        {memberContributions.find(m => m.name.startsWith(member.name.split(' ')[0]))?.tickets || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Tickets</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}