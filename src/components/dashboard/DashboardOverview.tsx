'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SystemStatsCard } from './SystemStatsCard';
import { JiraStatsCard } from './JiraStatsCard';
import { TeamWorkloadCard } from './TeamWorkloadCard';
import { HealthIndicator } from './HealthIndicator';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Calendar,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data - replace with real data from your hooks
const mockMetrics = {
  totalTickets: 127,
  activeTickets: 45,
  completedThisWeek: 18,
  overdueTickets: 7,
  avgResolutionTime: '3.2 days',
  teamVelocity: 42,
  sprintProgress: 68,
  burndownRate: 85
};

const priorities = [
  { level: 'Critical', count: 3, color: 'bg-red-500', textColor: 'text-red-700' },
  { level: 'High', count: 12, color: 'bg-orange-500', textColor: 'text-orange-700' },
  { level: 'Medium', count: 23, color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  { level: 'Low', count: 7, color: 'bg-green-500', textColor: 'text-green-700' }
];

const recentActivity = [
  { 
    type: 'completed', 
    ticket: 'PROJ-123', 
    title: 'Fix login authentication bug', 
    user: 'John Doe', 
    time: '2 hours ago',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  { 
    type: 'started', 
    ticket: 'PROJ-124', 
    title: 'Implement new dashboard feature', 
    user: 'Jane Smith', 
    time: '4 hours ago',
    icon: Clock,
    color: 'text-blue-600'
  },
  { 
    type: 'overdue', 
    ticket: 'PROJ-119', 
    title: 'Database optimization task', 
    user: 'Mike Johnson', 
    time: '1 day overdue',
    icon: AlertTriangle,
    color: 'text-red-600'
  }
];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  icon: React.ElementType;
}

const MetricCard = ({ title, value, change, changeType, description, icon: Icon }: MetricCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold">{value}</p>
              {change && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  changeType === 'positive' && "text-green-600",
                  changeType === 'negative' && "text-red-600",
                  changeType === 'neutral' && "text-muted-foreground"
                )}>
                  {changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
                  {changeType === 'negative' && <TrendingDown className="h-3 w-3" />}
                  {change}
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="h-8 w-8 text-muted-foreground">
            <Icon className="h-full w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function DashboardOverview() {
  const handleSwaggerClick = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    window.open(`${apiBase}/api/docs`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your JIRA tickets, team performance, and system health
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSwaggerClick}>
            <ExternalLink className="mr-2 h-4 w-4" />
            API Docs
          </Button>
          <Button size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Indicator */}
      <HealthIndicator />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Tickets"
          value={mockMetrics.totalTickets}
          change="+12%"
          changeType="positive"
          description="from last month"
          icon={BarChart3}
        />
        
        <MetricCard
          title="Active Tickets"
          value={mockMetrics.activeTickets}
          change="-5%"
          changeType="negative"
          description="currently in progress"
          icon={Activity}
        />
        
        <MetricCard
          title="Completed This Week"
          value={mockMetrics.completedThisWeek}
          change="+18%"
          changeType="positive"
          description="great progress!"
          icon={CheckCircle}
        />
        
        <MetricCard
          title="Overdue"
          value={mockMetrics.overdueTickets}
          change="2 less"
          changeType="positive"
          description="needs attention"
          icon={AlertTriangle}
        />
      </div>

      {/* System Stats and JIRA Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemStatsCard />
        <JiraStatsCard />
      </div>

      {/* Priority Breakdown and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
            <CardDescription>
              Current distribution of ticket priorities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {priorities.map((priority, index) => (
              <div key={priority.level} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", priority.color)} />
                  <span className="text-sm font-medium">{priority.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{priority.count}</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", priority.color)}
                      style={{ width: `${Math.min((priority.count / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className={cn("h-2 w-2 rounded-full", activity.color)}>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                      {activity.ticket}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                  <p className="font-medium line-clamp-1 mt-1">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {activity.user}
                  </p>
                </div>
              </div>
            ))}
            
            <Button variant="outline" size="sm" className="w-full mt-4">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sprint Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Sprint Progress</CardTitle>
          <CardDescription>
            Current sprint performance and velocity metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Sprint Progress</span>
                <span className="text-muted-foreground">{mockMetrics.sprintProgress}%</span>
              </div>
              <Progress value={mockMetrics.sprintProgress} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {mockMetrics.sprintProgress}% of planned work completed
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Team Velocity</span>
                <span className="text-muted-foreground">{mockMetrics.teamVelocity} SP</span>
              </div>
              <Progress value={mockMetrics.teamVelocity} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                Story points completed per sprint
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Burndown Rate</span>
                <span className="text-muted-foreground">{mockMetrics.burndownRate}%</span>
              </div>
              <Progress value={mockMetrics.burndownRate} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                On track for sprint completion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Workload */}
      <TeamWorkloadCard />
    </div>
  );
} 