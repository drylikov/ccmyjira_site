'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useOrganizationData } from '@/hooks/useOrganization';
import { apiService } from '@/lib/api';
import { 
  Building2, 
  ExternalLink, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Mail,
  Shield,
  Settings as SettingsIcon,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Settings() {
  const { organization, loading, updateOrganization, refetch } = useOrganizationData();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDomainVerifying, setIsDomainVerifying] = useState(false);
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    jiraBaseUrl: organization?.jira_base_url || '',
    jiraProjectKey: organization?.jira_project_key || ''
  });

  // Update form data when organization loads
  React.useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        jiraBaseUrl: organization.jira_base_url,
        jiraProjectKey: organization.jira_project_key
      });
    }
  }, [organization]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!organization) return;

    setIsUpdating(true);
    try {
      await updateOrganization({
        name: formData.name,
        jiraBaseUrl: formData.jiraBaseUrl,
        jiraProjectKey: formData.jiraProjectKey
      });
      // Show success message (you could use a toast library here)
      console.log('✅ Organization settings updated successfully');
    } catch (error) {
      console.error('❌ Failed to update organization:', error);
      alert('Failed to update settings. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRedoDomainVerification = async () => {
    if (!organization) return;

    setIsDomainVerifying(true);
    try {
      // Trigger domain verification flow
      // This could redirect to the domain verification flow or open a modal
      window.location.href = '/dashboard?domain_verification=true';
    } catch (error) {
      console.error('❌ Failed to initiate domain verification:', error);
      alert('Failed to start domain verification. Please try again.');
    } finally {
      setIsDomainVerifying(false);
    }
  };

  const isFormDirty = organization && (
    formData.name !== organization.name ||
    formData.jiraBaseUrl !== organization.jira_base_url ||
    formData.jiraProjectKey !== organization.jira_project_key
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Organization Found</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load organization settings.
            </p>
            <Button onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-5 w-5" />
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Organization Settings</CardTitle>
          </div>
          <CardDescription>
            Manage your organization details and JIRA integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Acme Corporation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jiraBaseUrl">JIRA Base URL</Label>
              <Input
                id="jiraBaseUrl"
                type="url"
                value={formData.jiraBaseUrl}
                onChange={(e) => handleInputChange('jiraBaseUrl', e.target.value)}
                placeholder="https://acme.atlassian.net"
              />
              <p className="text-xs text-muted-foreground">
                Your Atlassian domain URL (e.g., https://yourcompany.atlassian.net)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jiraProjectKey">JIRA Project Key</Label>
              <Input
                id="jiraProjectKey"
                type="text"
                value={formData.jiraProjectKey}
                onChange={(e) => handleInputChange('jiraProjectKey', e.target.value.toUpperCase())}
                placeholder="PROJ"
              />
              <p className="text-xs text-muted-foreground">
                The project key from your JIRA project settings (usually 3-10 uppercase letters)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button 
              onClick={handleSave}
              disabled={!isFormDirty || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            
            {organization.jira_base_url && (
              <Button 
                variant="outline"
                onClick={() => window.open(organization.jira_base_url, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open JIRA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Domain Verification */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Domain Verification</CardTitle>
          </div>
          <CardDescription>
            Manage your domain verification status for security and access control.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Domain Verified</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Your domain has been verified and is active
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Domain Verification Management</h4>
            <p className="text-sm text-muted-foreground">
              If you need to verify a different domain or re-verify your current domain, 
              you can start the verification process again.
            </p>
            
            <Button 
              variant="outline"
              onClick={handleRedoDomainVerification}
              disabled={isDomainVerifying}
            >
              {isDomainVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Verification...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Verify New Domain
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>
            View your organization details and usage information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Organization ID:</span>
              <p className="font-mono text-xs bg-muted px-2 py-1 rounded mt-1">
                {organization.id}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p className="mt-1">
                {new Date(organization.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Plan Type:</span>
              <p className="mt-1 capitalize">{organization.plan_type}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email Limit:</span>
              <p className="mt-1">
                {organization.emails_processed_this_month} / {organization.monthly_email_limit}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 