'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDashboard } from '@/hooks/useDashboard';
import { 
  Users, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Loader2 
} from 'lucide-react';

export function TeamWorkloadCard() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Workload
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
            <Users className="h-5 w-5" />
            Team Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            Failed to load team data
          </div>
        </CardContent>
      </Card>
    );
  }

  const { jiraData } = dashboard;
  const teamInfo = jiraData.teamInfo;

  // Calculate workload levels
  const getWorkloadLevel = (workload: any) => {
    const totalActive = workload.inProgressTickets + workload.todoTickets;
    if (totalActive === 0) return 'low';
    if (totalActive <= 3) return 'low';
    if (totalActive <= 6) return 'medium';
    return 'high';
  };

  const getWorkloadColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getWorkloadProgress = (workload: any) => {
    const maxCapacity = 10; // Assume 10 tickets is 100% capacity
    return Math.min((workload.totalTickets / maxCapacity) * 100, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Workload
            </div>
            <Badge variant="outline">
              {teamInfo.activeUsers}/{teamInfo.totalUsers} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Team Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{teamInfo.totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{teamInfo.activeUsers}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {teamInfo.userWorkloads.reduce((sum, user) => sum + user.overdue, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Overdue</p>
            </div>
          </div>

          {/* Individual Workloads */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Individual Workloads</h3>
            <div className="space-y-3">
              {teamInfo.userWorkloads.map((workload, index) => {
                const level = getWorkloadLevel(workload);
                const progress = getWorkloadProgress(workload);
                
                return (
                  <motion.div
                    key={workload.accountId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{workload.displayName}</span>
                        <span className="text-sm text-muted-foreground">
                          @{workload.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {workload.overdue > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {workload.overdue} overdue
                          </Badge>
                        )}
                        <Badge 
                          variant={level === 'high' ? 'destructive' : level === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {level} load
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold">{workload.totalTickets}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-blue-600">{workload.todoTickets}</p>
                        <p className="text-xs text-muted-foreground">To Do</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-orange-600">{workload.inProgressTickets}</p>
                        <p className="text-xs text-muted-foreground">In Progress</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-purple-600">{workload.storyPoints}</p>
                        <p className="text-xs text-muted-foreground">Story Points</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Capacity</span>
                        <span className={getWorkloadColor(level)}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg border">
                <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-medium">
                  {teamInfo.userWorkloads.filter(u => getWorkloadLevel(u) === 'low').length}
                </p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg border">
                <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-sm font-medium">
                  {teamInfo.userWorkloads.filter(u => getWorkloadLevel(u) === 'medium').length}
                </p>
                <p className="text-xs text-muted-foreground">Busy</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border">
                <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <p className="text-sm font-medium">
                  {teamInfo.userWorkloads.filter(u => getWorkloadLevel(u) === 'high').length}
                </p>
                <p className="text-xs text-muted-foreground">Overloaded</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 