import { 
  DashboardData, 
  SystemStats, 
  JiraTicket, 
  JiraUser, 
  UserWorkload, 
  SprintData, 
  QueueDetails, 
  HealthCheck,
  JiraAttachment 
} from '@/types/dashboard';

// Get API base URL from environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('jwt_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    // Prefix endpoint with /demo when in demo mode
    const finalEndpoint = isDemoMode ? `/demo${endpoint}` : endpoint;
    
    const headers: Record<string, string> = {
      ...this.getAuthHeaders(),
      ...options?.headers as Record<string, string>,
    };

    const response = await fetch(`${API_BASE}${finalEndpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        if (isDemoMode) {
          localStorage.removeItem('demo_mode');
        } else {
          localStorage.removeItem('jwt_token');
        }
        window.location.href = '/';
        throw new Error('Authentication required');
      }

      const errorText = await response.text();
      let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = Array.isArray(errorData.message) 
            ? errorData.message.join(', ') 
            : errorData.message;
        }
      } catch {
        // If error response is not JSON, use the response text
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Authentication methods
  async getCurrentUser(): Promise<any> {
    return this.fetchApi<any>('/auth/me');
  }

  async logout(): Promise<void> {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode) {
      localStorage.removeItem('demo_mode');
    } else {
      await this.fetchApi<void>('/auth/logout', { method: 'POST' });
      localStorage.removeItem('jwt_token');
    }
  }

  // Demo mode methods
  async loginWithDemo(): Promise<void> {
    localStorage.setItem('demo_mode', 'true');
    localStorage.removeItem('jwt_token'); // Clear any existing token
  }

  static isDemoMode(): boolean {
    return localStorage.getItem('demo_mode') === 'true';
  }

  static clearDemoMode(): void {
    localStorage.removeItem('demo_mode');
  }

  // Organization methods
  async createOrganization(data: {
    name: string;
    jiraBaseUrl: string;
    jiraProjectKey: string;
  }): Promise<any> {
    return this.fetchApi<any>('/auth/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserOrganizations(): Promise<any[]> {
    return this.fetchApi<any[]>('/auth/organizations');
  }

  async updateOrganization(organizationId: string, data: {
    name?: string;
    jiraBaseUrl?: string;
    jiraProjectKey?: string;
  }): Promise<any> {
    return this.fetchApi<any>(`/auth/organizations/${organizationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Domain verification methods
  async initiateDomainVerification(data: {
    domain: string;
    organizationId: string;
    email: string;
  }): Promise<any> {
    // Store the email locally for better UX in callbacks
    localStorage.setItem(`verification_email_${data.domain}`, data.email);
    
    return this.fetchApi<any>('/auth/verify-domain/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmDomainVerification(data: {
    domain: string;
    verificationCode: string;
  }): Promise<any> {
    const result = await this.fetchApi<any>('/auth/verify-domain/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Clean up stored email after successful verification
    localStorage.removeItem(`verification_email_${data.domain}`);
    
    return result;
  }

  // Get stored verification email for a domain
  getStoredVerificationEmail(domain: string): string | null {
    return localStorage.getItem(`verification_email_${domain}`);
  }

  async checkOrganizationDomainVerification(organizationId: string): Promise<{
    hasVerifiedDomain: boolean;
    primaryDomain?: string;
    verifiedAt?: string;
  }> {
    return this.fetchApi<{
      hasVerifiedDomain: boolean;
      primaryDomain?: string;
      verifiedAt?: string;
    }>(`/auth/organizations/${organizationId}/verified-domain`);
  }

  async getDomainStatus(): Promise<any> {
    return this.fetchApi<any>('/auth/domains/status');
  }

  // Dashboard data (now requires authentication)
  async getDashboard(): Promise<DashboardData> {
    return this.fetchApi<DashboardData>('/api/dashboard');
  }

  async getSystemStats(): Promise<SystemStats> {
    return this.fetchApi<SystemStats>('/api/dashboard/stats');
  }

  // JIRA data (now requires authentication)
  async getTickets(params?: {
    days?: number;
    status?: string;
    assignee?: string;
    search?: string;
  }): Promise<JiraTicket[]> {
    const searchParams = new URLSearchParams();
    if (params?.days) searchParams.append('days', params.days.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.assignee) searchParams.append('assignee', params.assignee);
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    return this.fetchApi<JiraTicket[]>(`/api/dashboard/tickets${query ? `?${query}` : ''}`);
  }

  async getUsers(params?: { role?: string; activeOnly?: boolean }): Promise<JiraUser[]> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append('role', params.role);
    if (params?.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

    const query = searchParams.toString();
    return this.fetchApi<JiraUser[]>(`/api/dashboard/users${query ? `?${query}` : ''}`);
  }

  async getUserWorkloads(userIds?: string[]): Promise<Record<string, UserWorkload>> {
    const params = userIds ? `?userIds=${userIds.join(',')}` : '';
    return this.fetchApi<Record<string, UserWorkload>>(`/api/dashboard/workloads${params}`);
  }

  // Sprint data
  async getSprints(): Promise<SprintData> {
    return this.fetchApi<SprintData>('/api/dashboard/sprints');
  }

  // Queue data
  async getQueueDetails(): Promise<QueueDetails> {
    return this.fetchApi<QueueDetails>('/api/dashboard/queue');
  }

  // Health check (public endpoint)
  async getHealth(): Promise<HealthCheck> {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    const endpoint = isDemoMode ? '/demo/api/dashboard/health' : '/api/dashboard/health';
    
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  // System configuration
  async getConfig(): Promise<any> {
    return this.fetchApi<any>('/api/dashboard/config');
  }

  // Assignee suggestions
  async suggestAssignee(params: {
    type: string;
    technologies?: string;
    priority?: string;
    component?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    searchParams.append('type', params.type);
    if (params.technologies) searchParams.append('technologies', params.technologies);
    if (params.priority) searchParams.append('priority', params.priority);
    if (params.component) searchParams.append('component', params.component);

    const query = searchParams.toString();
    return this.fetchApi<any>(`/api/dashboard/suggest-assignee?${query}`);
  }

  // Refresh caches
  async refreshCaches(): Promise<{ success: boolean; message: string }> {
    return this.fetchApi<{ success: boolean; message: string }>('/api/dashboard/refresh', {
      method: 'POST',
    });
  }

  // Attachment methods
  async downloadAttachment(attachmentId: string): Promise<Blob> {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    const finalEndpoint = isDemoMode ? `/demo/api/dashboard/attachments/${attachmentId}` : `/api/dashboard/attachments/${attachmentId}`;
    
    const headers = this.getAuthHeaders();
    delete headers['Content-Type']; // Remove content-type for blob downloads
    
    const response = await fetch(`${API_BASE}${finalEndpoint}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.statusText}`);
    }

    return response.blob();
  }

  async getAttachmentDownloadUrl(attachmentId: string, filename: string): Promise<void> {
    try {
      const blob = await this.downloadAttachment(attachmentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      throw error;
    }
  }

  // Utility methods
  static getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  static isAuthenticated(): boolean {
    return !!this.getToken() || this.isDemoMode();
  }

  static setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  static clearToken(): void {
    localStorage.removeItem('jwt_token');
  }
}

export const apiService = new ApiService(); 