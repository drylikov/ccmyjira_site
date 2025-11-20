'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHealth, useRefreshCaches } from '@/hooks/useDashboard';
import { apiService } from '@/lib/api';
import { 
  Heart, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Loader2,
  LogOut
} from 'lucide-react';

export function HealthIndicator() {
  const { data: health, isLoading, error } = useHealth();
  const { refreshAll } = useRefreshCaches();

  const handleRefreshCaches = async () => {
    try {
      await refreshAll();
    } catch (error) {
      console.error('Failed to refresh caches:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, clear local token and redirect
      localStorage.removeItem('jwt_token');
      window.location.href = '/';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error || !health) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">System Offline</span>
          </div>
          <Badge variant="destructive">Error</Badge>
        </CardContent>
      </Card>
    );
  }

  const isHealthy = health.status === 'healthy';
  const allChecksHealthy = health.checks.queue.healthy && health.checks.jira.healthy;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`w-full transition-colors ${
        isHealthy && allChecksHealthy 
          ? 'border-green-200 bg-green-50' 
          : 'border-yellow-200 bg-yellow-50'
      }`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  scale: isHealthy && allChecksHealthy ? [1, 1.1, 1] : 1 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {isHealthy && allChecksHealthy ? (
                  <Heart className="h-5 w-5 text-green-500 fill-current" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
              </motion.div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    System {isHealthy && allChecksHealthy ? 'Healthy' : 'Warning'}
                  </span>
                  <Badge 
                    variant={isHealthy && allChecksHealthy ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {health.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {health.checks.queue.healthy ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span>Queue</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {health.checks.jira.healthy ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span>JIRA</span>
                  </div>
                  
                  <span>•</span>
                  <span>
                    Updated {new Date(health.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshCaches}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 