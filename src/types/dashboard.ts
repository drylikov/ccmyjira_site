export interface SystemStats {
  server: {
    uptime: number;
    timestamp: string;
    nodeVersion: string;
    environment: string;
  };
  queue: {
    name: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  };
  memory: {
    used: number;
    free: number;
    total: number;
    percentage: number;
  };
  processing: {
    totalJobsProcessed: number;
    averageProcessingTime: number;
    successRate: number;
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  jira_base_url: string;
  jira_project_key: string;
  jira_cloud_id?: string;
  plan_type: string;
  monthly_email_limit: number;
  emails_processed_this_month: number;
  created_at: string;
  updated_at: string;
  features: {
    smart_assignment: boolean;
    sprints_enabled: boolean;
    custom_prompts: boolean;
  };
}

export interface JiraAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  created: string;
  author: string;
}

export interface JiraTicket {
  key: string;
  id: string;
  summary: string;
  description?: string;
  status: string;
  issueType: string;
  assignee?: string;
  assigneeAccountId?: string;
  priority?: string;
  created: string;
  updated: string;
  sprint?: JiraSprint;
  labels?: string[];
  components?: string[];
  storyPoints?: number;
  dueDate?: string;
  reporter?: string;
  attachments?: JiraAttachment[];
}

export interface JiraSprint {
  id: number;
  name: string;
  state: 'future' | 'active' | 'closed';
  startDate?: string;
  endDate?: string;
  goal?: string;
}

export interface JiraUser {
  accountId: string;
  username: string;
  emailAddress: string;
  displayName: string;
  active: boolean;
  avatarUrls: {
    '48x48': string;
  };
  roles: string[];
}

export interface UserWorkload {
  accountId: string;
  username: string;
  displayName: string;
  totalTickets: number;
  inProgressTickets: number;
  todoTickets: number;
  storyPoints: number;
  overdue: number;
}

export interface JiraProjectInfo {
  key: string;
  name: string;
  description: string;
  issueTypes: string[];
  priorities: string[];
  statuses: string[];
}

export interface JiraStatistics {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  ticketsByType: Record<string, number>;
  averageResolutionTime: number;
}

export interface TeamInfo {
  totalUsers: number;
  activeUsers: number;
  userWorkloads: UserWorkload[];
}

export interface JiraData {
  projectInfo: JiraProjectInfo;
  statistics: JiraStatistics;
  teamInfo: TeamInfo;
}

export interface DashboardData {
  systemStats: SystemStats;
  jiraData: JiraData;
  lastUpdated: string;
}

export interface Sprint {
  id: number;
  name: string;
  state: 'future' | 'active' | 'closed';
  startDate: string;
  endDate: string;
  goal?: string;
}

export interface SprintData {
  activeSprints: Sprint[];
  upcomingSprints: Sprint[];
  completedSprints: Sprint[];
}

export interface QueueJob {
  id: string;
  name: string;
  data?: any;
  timestamp: number;
  processedOn?: number;
}

export interface QueueDetails {
  stats: SystemStats['queue'];
  recentJobs: {
    waiting: QueueJob[];
    active: QueueJob[];
    completed: QueueJob[];
    failed: QueueJob[];
  };
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    queue: { healthy: boolean };
    jira: { healthy: boolean };
  };
} 