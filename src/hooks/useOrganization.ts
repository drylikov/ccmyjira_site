'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { apiService } from '@/lib/api';
import { Organization } from '@/types/dashboard';

interface OrganizationContextType {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateOrganization: (data: {
    name?: string;
    jiraBaseUrl?: string;
    jiraProjectKey?: string;
  }) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

export function useOrganizationData() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      setError(null);
      const organizations = await apiService.getUserOrganizations();
      
      // Use the first organization for now (could be enhanced to support multiple)
      if (organizations && organizations.length > 0) {
        setOrganization(organizations[0]);
      } else {
        setOrganization(null);
      }
    } catch (err) {
      console.error('Failed to fetch organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organization');
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  const updateOrganizationData = async (data: {
    name?: string;
    jiraBaseUrl?: string;
    jiraProjectKey?: string;
  }) => {
    if (!organization) {
      throw new Error('No organization found');
    }

    try {
      const updatedOrg = await apiService.updateOrganization(organization.id, data);
      setOrganization(updatedOrg);
    } catch (err) {
      console.error('Failed to update organization:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, []);

  return {
    organization,
    loading,
    error,
    refetch: fetchOrganization,
    updateOrganization: updateOrganizationData,
  };
} 