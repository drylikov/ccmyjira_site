'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/useDashboard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TicketIcon, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function JiraStatsCard() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            JIRA Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error || !dashboard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            JIRA Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            Failed to load JIRA stats
          </div>
        </CardContent>
      </Card>
    );
  }

  const { jiraData } = dashboard;
  const stats = jiraData.statistics;

  // Prepare data for charts
  const ticketTypeData = Object.entries(stats.ticketsByType).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const overviewData = [
    { name: 'Open', value: stats.openTickets, color: '#0088FE' },
    { name: 'Closed', value: stats.closedTickets, color: '#00C49F' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              JIRA Statistics
            </div>
            <Badge variant="outline">
              {jiraData.projectInfo.key}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.totalTickets}</p>
              <p className="text-sm text-muted-foreground">Total Tickets</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.openTickets}</p>
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600">{stats.closedTickets}</p>
              <p className="text-sm text-muted-foreground">Closed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.averageResolutionTime.toFixed(1)}d</p>
              <p className="text-sm text-muted-foreground">Avg Resolution</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ticket Types Pie Chart */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Tickets by Type</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {ticketTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2">
                {ticketTypeData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Open vs Closed Bar Chart */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Open vs Closed</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Project: {jiraData.projectInfo.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{jiraData.projectInfo.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium mb-1">Issue Types</p>
                <div className="flex flex-wrap gap-1">
                  {jiraData.projectInfo.issueTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium mb-1">Priorities</p>
                <div className="flex flex-wrap gap-1">
                  {jiraData.projectInfo.priorities.map((priority) => (
                    <Badge key={priority} variant="outline" className="text-xs">
                      {priority}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium mb-1">Statuses</p>
                <div className="flex flex-wrap gap-1">
                  {jiraData.projectInfo.statuses.map((status) => (
                    <Badge key={status} variant="default" className="text-xs">
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 