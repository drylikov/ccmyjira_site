'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated (including demo mode)
    const existingToken = localStorage.getItem('jwt_token');
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    if (existingToken || isDemoMode) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    window.location.href = `${apiBase}/auth/atlassian`;
  };

  const handleDemoLogin = async () => {
    await apiService.loginWithDemo();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to CCMyJIRA</CardTitle>
          <CardDescription>
            Real-time JIRA dashboard for monitoring tickets, system performance, and team workload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogin}
            className="w-full"
            size="lg"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.4 3.8H8.8C6.3 3.8 4.2 5.9 4.2 8.4V12C4.2 14.5 6.3 16.6 8.8 16.6H12.4C14.9 16.6 17 14.5 17 12V8.4C17 5.9 14.9 3.8 12.4 3.8ZM12.4 12C12.4 12.9 11.7 13.6 10.8 13.6C9.9 13.6 9.2 12.9 9.2 12V8.4C9.2 7.5 9.9 6.8 10.8 6.8C11.7 6.8 12.4 7.5 12.4 8.4V12Z"/>
              <path d="M20.2 7.6H16.6V3.8C16.6 2.2 15.4 1 13.8 1H3.8C2.2 1 1 2.2 1 3.8V13.8C1 15.4 2.2 16.6 3.8 16.6H7.6V20.2C7.6 21.8 8.8 23 10.4 23H20.4C22 23 23.2 21.8 23.2 20.2V10.2C23.2 8.6 22 7.4 20.4 7.4H20.2V7.6Z"/>
            </svg>
            Login with Atlassian
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button 
            onClick={handleDemoLogin}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Try with Demo Account
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            <p>Connect your Atlassian account to access your JIRA dashboard</p>
            <p className="text-xs text-muted-foreground mt-1">
              Or explore the demo to see the dashboard in action
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
