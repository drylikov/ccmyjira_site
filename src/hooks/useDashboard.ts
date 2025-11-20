import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { 
  DashboardData, 
  SystemStats, 
  JiraTicket, 
  JiraUser, 
  UserWorkload, 
  SprintData, 
  QueueDetails, 
  HealthCheck 
} from '@/types/dashboard';

// Query keys
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  systemStats: ['systemStats'] as const,
  tickets: (params?: any) => ['tickets', params] as const,
  users: (params?: any) => ['users', params] as const,
  workloads: (userIds?: string[]) => ['workloads', userIds] as const,
  sprints: ['sprints'] as const,
  queue: ['queue'] as const,
  health: ['health'] as const,
};

// Polling intervals (in milliseconds)
const POLLING_INTERVALS = {
  FAST: 5000,    // 5 seconds - for critical real-time data
  MEDIUM: 30000, // 30 seconds - for regular updates
  SLOW: 60000,   // 1 minute - for less critical data
};

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiService.getDashboard(),
    refetchInterval: POLLING_INTERVALS.MEDIUM,
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: queryKeys.systemStats,
    queryFn: () => apiService.getSystemStats(),
    refetchInterval: POLLING_INTERVALS.FAST,
    staleTime: 2000,
  });
}

export function useTickets(params?: {
  days?: number;
  status?: string;
  assignee?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.tickets(params),
    queryFn: () => apiService.getTickets(params),
    refetchInterval: POLLING_INTERVALS.MEDIUM,
    staleTime: 15000,
  });
}

export function useUsers(params?: { role?: string; activeOnly?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: () => apiService.getUsers(params),
    refetchInterval: POLLING_INTERVALS.SLOW,
    staleTime: 30000,
  });
}

export function useUserWorkloads(userIds?: string[]) {
  return useQuery({
    queryKey: queryKeys.workloads(userIds),
    queryFn: () => apiService.getUserWorkloads(userIds),
    refetchInterval: POLLING_INTERVALS.MEDIUM,
    staleTime: 20000,
  });
}

export function useSprints() {
  return useQuery({
    queryKey: queryKeys.sprints,
    queryFn: () => apiService.getSprints(),
    refetchInterval: POLLING_INTERVALS.SLOW,
    staleTime: 30000,
  });
}

export function useQueueDetails() {
  return useQuery({
    queryKey: queryKeys.queue,
    queryFn: () => apiService.getQueueDetails(),
    refetchInterval: POLLING_INTERVALS.FAST,
    staleTime: 3000,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiService.getHealth(),
    refetchInterval: POLLING_INTERVALS.FAST,
    staleTime: 5000,
  });
}

// Custom hook to refresh all caches
export function useRefreshCaches() {
  const queryClient = useQueryClient();

  const refreshAll = async () => {
    try {
      await apiService.refreshCaches();
      // Invalidate all queries to trigger refetch
      await queryClient.invalidateQueries();
      return { success: true };
    } catch (error) {
      console.error('Failed to refresh caches:', error);
      throw error;
    }
  };

  return { refreshAll };
} 