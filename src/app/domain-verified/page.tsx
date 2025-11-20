'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

function DomainVerifiedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  const success = searchParams.get('success') === 'true';
  const domain = searchParams.get('domain');
  const error = searchParams.get('error');

  useEffect(() => {
    if (success) {
      setRedirecting(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  }, [success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {success ? (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-green-900">✅ Domain Verified!</CardTitle>
              <CardDescription>
                Your domain verification was successful
              </CardDescription>
            </>
          ) : (
            <>
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-red-900">❌ Verification Failed</CardTitle>
              <CardDescription>
                There was an issue verifying your domain
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {success ? (
            <div>
              <p className="text-green-800 mb-4">
                Domain <strong>{domain}</strong> has been verified successfully.
              </p>
              {redirecting ? (
                <div>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-600">Redirecting to dashboard...</p>
                </div>
              ) : (
                <Button onClick={() => router.push('/dashboard')} className="w-full">
                  Go to Dashboard
                </Button>
              )}
            </div>
          ) : (
            <div>
              <p className="text-red-800 mb-4">
                Error: {error || 'Unknown verification error'}
              </p>
              <Button 
                onClick={() => router.push('/dashboard')} 
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DomainVerifiedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <DomainVerifiedContent />
    </Suspense>
  );
} 