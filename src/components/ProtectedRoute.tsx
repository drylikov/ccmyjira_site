'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  accountType: string;
  organizations?: {
    id: string;
    name: string;
    jiraBaseUrl: string;
    jiraProjectKey: string;
  }[];
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('jwt_token');
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (!token && !isDemoMode) {
        router.push('/');
        return;
      }

      try {
        if (isDemoMode) {
          // For demo mode, set a mock user
          setUser({
            id: 'demo-user',
            name: 'Demo User',
            email: 'demo@example.com',
            accountType: 'atlassian',
            organizations: [{
              id: 'demo-org',
              name: 'Demo Organization',
              jiraBaseUrl: 'https://demo.atlassian.net',
              jiraProjectKey: 'DEMO'
            }]
          });
        } else {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        if (isDemoMode) {
          localStorage.removeItem('demo_mode');
        } else {
          localStorage.removeItem('jwt_token');
        }
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
} 