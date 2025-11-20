'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSystemStats } from '@/hooks/useDashboard';
import { 
  Server, 
  Activity, 
  MemoryStick, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

const formatMemory = (mb: number) => {
  return `${(mb / 1024).toFixed(1)} GB`;
};

export function SystemStatsCard() {
  const { data: stats, isLoading, error } = useSystemStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            Failed to load system stats
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const memoryPercentage = (stats.memory.used / stats.memory.total) * 100;
  const isHealthy = stats.processing.successRate > 95 && memoryPercentage < 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Statistics
            </div>
            <Badge variant={isHealthy ? "default" : "destructive"}>
              {isHealthy ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
              {isHealthy ? 'Healthy' : 'Warning'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Server Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Uptime
              </div>
              <p className="text-2xl font-bold">{formatUptime(stats.server.uptime)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4" />
                Environment
              </div>
              <Badge variant={stats.server.environment === 'production' ? 'default' : 'secondary'}>
                {stats.server.environment}
              </Badge>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MemoryStick className="h-4 w-4" />
                Memory Usage
              </div>
              <span className="text-sm text-muted-foreground">
                {formatMemory(stats.memory.used)} / {formatMemory(stats.memory.total)}
              </span>
            </div>
            <Progress value={memoryPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {memoryPercentage.toFixed(1)}% used
            </p>
          </div>

          {/* Queue Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.queue.waiting}</p>
              <p className="text-xs text-muted-foreground">Waiting</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.queue.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.queue.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.queue.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </div>

          {/* Processing Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-lg font-semibold">{stats.processing.totalJobsProcessed}</p>
              <p className="text-xs text-muted-foreground">Total Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{(stats.processing.averageProcessingTime / 1000).toFixed(1)}s</p>
              <p className="text-xs text-muted-foreground">Avg Time</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600">{stats.processing.successRate}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 