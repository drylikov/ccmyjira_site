'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function CallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const domain = searchParams.get('domain');
    
    console.log('🔗 Email verification callback received:', { code, domain });
    
    if (code && domain) {
      // Redirect to dashboard with the verification parameters
      const dashboardUrl = `/dashboard?code=${encodeURIComponent(code)}&domain=${encodeURIComponent(domain)}`;
      console.log('↗️ Redirecting to dashboard with verification data');
      window.location.href = dashboardUrl;
    } else {
      console.error('❌ Missing verification parameters in callback');
      // Redirect to dashboard without parameters after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
    }
  }, [searchParams]);

  const code = searchParams.get('code');
  const domain = searchParams.get('domain');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4 max-w-md text-center">
        {code && domain ? (
          <>
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-xl font-semibold mb-2">Email Verification Received</h1>
              <p className="text-sm text-muted-foreground mb-4">
                Processing your domain verification for <strong>{domain}</strong>
              </p>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Redirecting to dashboard...</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div>
              <h1 className="text-xl font-semibold mb-2">Invalid Verification Link</h1>
              <p className="text-sm text-muted-foreground mb-4">
                This verification link appears to be invalid or expired.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Redirecting to dashboard...</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyDomainCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm text-muted-foreground">Processing verification...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
} 