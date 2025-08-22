import { ArrowLeft, Clock, AlertTriangle, TrendingDown, Calendar, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const idlePeriodsData = [
  { day: 'Monday', idleHours: 1.5, avgIdleTime: 2.1 },
  { day: 'Tuesday', idleHours: 2.8, avgIdleTime: 2.1 },
  { day: 'Wednesday', idleHours: 1.2, avgIdleTime: 2.1 },
  { day: 'Thursday', idleHours: 3.5, avgIdleTime: 2.1 },
  { day: 'Friday', idleHours: 4.2, avgIdleTime: 2.1 },
  { day: 'Saturday', idleHours: 0.8, avgIdleTime: 2.1 },
  { day: 'Sunday', idleHours: 0.3, avgIdleTime: 2.1 },
];

const hourlyIdleData = [
  { hour: '9 AM', idle: 15 },
  { hour: '10 AM', idle: 8 },
  { hour: '11 AM', idle: 12 },
  { hour: '12 PM', idle: 45 },
  { hour: '1 PM', idle: 52 },
  { hour: '2 PM', idle: 38 },
  { hour: '3 PM', idle: 42 },
  { hour: '4 PM', idle: 25 },
  { hour: '5 PM', idle: 18 },
  { hour: '6 PM', idle: 5 },
];

const idleReasons = [
  { reason: 'Lunch Break', percentage: 35, color: '#16a34a' },
  { reason: 'Meetings', percentage: 28, color: '#2563eb' },
  { reason: 'Personal Break', percentage: 20, color: '#f59e0b' },
  { reason: 'System Issues', percentage: 10, color: '#dc2626' },
  { reason: 'Training', percentage: 7, color: '#7c3aed' },
];

const employeeIdleRanking = [
  { name: 'Sarah Johnson', team: 'Engineering', idleHours: 1.2, rank: 'Low' },
  { name: 'Michael Chen', team: 'Engineering', idleHours: 1.8, rank: 'Low' },
  { name: 'Emily Rodriguez', team: 'Design', idleHours: 2.4, rank: 'Average' },
  { name: 'David Kim', team: 'Product', idleHours: 2.8, rank: 'Average' },
  { name: 'Jessica Brown', team: 'Engineering', idleHours: 3.5, rank: 'High' },
  { name: 'Alex Thompson', team: 'Engineering', idleHours: 4.1, rank: 'High' },
  { name: 'Lisa Wang', team: 'Analytics', idleHours: 2.1, rank: 'Average' },
  { name: 'James Wilson', team: 'Design', idleHours: 1.9, rank: 'Low' },
];

const weeklyTrend = [
  { week: 'Week 1', avgIdle: 2.8 },
  { week: 'Week 2', avgIdle: 2.4 },
  { week: 'Week 3', avgIdle: 2.1 },
  { week: 'Week 4', avgIdle: 2.3 },
];

export default function IdleAnalytics() {
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Low': return 'bg-success text-success-foreground';
      case 'Average': return 'bg-warning text-warning-foreground';
      case 'High': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

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
            <h1 className="text-3xl font-bold">Idle Periods Analysis</h1>
            <p className="text-muted-foreground">Comprehensive analysis of low-activity periods across teams</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Avg Daily Idle Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">2.3h</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingDown className="h-3 w-3" />
                -12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-destructive" />
                Peak Idle Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">2-4 PM</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Activity className="h-3 w-3" />
                Post-lunch period
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-accent" />
                Most Idle Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">Friday</div>
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <TrendingDown className="h-3 w-3" />
                +8% compared to weekdays
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                High-Idle Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">8/45</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingDown className="h-3 w-3" />
                -15% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Idle Patterns */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-warning" />
                Daily Idle Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={idlePeriodsData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" className="text-xs" />
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
                    dataKey="idleHours" 
                    stroke="hsl(var(--warning))" 
                    fill="hsl(var(--warning) / 0.3)" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgIdleTime" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hourly Idle Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-destructive" />
                Hourly Idle Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyIdleData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="idle" 
                    fill="hsl(var(--destructive))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Idle Reasons and Weekly Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Idle Reasons Breakdown */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
                Idle Period Reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={idleReasons}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="percentage"
                    label={({ reason, percentage }) => `${reason}: ${percentage}%`}
                    className="text-xs"
                  >
                    {idleReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Trend */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-success" />
                Weekly Improvement Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="week" className="text-xs" />
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
                    dataKey="avgIdle" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--success))', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Employee Idle Ranking */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Employee Idle Time Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {employeeIdleRanking.map((employee, index) => (
                <div key={index} className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.team}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Idle Time</span>
                    <span className="font-bold text-lg">{employee.idleHours}h</span>
                  </div>
                  
                  <Badge className={getRankColor(employee.rank)}>
                    {employee.rank} Activity
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}