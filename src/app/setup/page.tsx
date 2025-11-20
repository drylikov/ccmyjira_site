'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function OrganizationSetupContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    jiraBaseUrl: '',
    jiraProjectKey: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const organization = await apiService.createOrganization(formData);
      // Redirect to dashboard - domain verification will be handled there
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create organization:', error);
      alert('Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Setup Your Organization</CardTitle>
          <CardDescription>
            Configure your JIRA integration to get started with CCMyJIRA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Company Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jiraBaseUrl">JIRA Base URL</Label>
              <Input
                id="jiraBaseUrl"
                type="url"
                placeholder="https://company.atlassian.net"
                value={formData.jiraBaseUrl}
                onChange={(e) => handleInputChange('jiraBaseUrl', e.target.value)}
                required
              />
              <p className="text-sm text-gray-600">
                Your Atlassian domain URL (e.g., https://yourcompany.atlassian.net)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jiraProjectKey">JIRA Project Key</Label>
              <Input
                id="jiraProjectKey"
                type="text"
                placeholder="PROJECT"
                value={formData.jiraProjectKey}
                onChange={(e) => handleInputChange('jiraProjectKey', e.target.value.toUpperCase())}
                required
              />
              <p className="text-sm text-gray-600">
                The project key from your JIRA project settings (usually 3-10 uppercase letters)
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Organization...' : 'Create Organization'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrganizationSetup() {
  return (
    <ProtectedRoute>
      <OrganizationSetupContent />
    </ProtectedRoute>
  );
} 