'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, CheckCircle, AlertCircle, Building2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

// Organization Setup Component
function OrganizationSetup({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1); // 1: org details, 2: domain verification
  const [loading, setLoading] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
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

  const createOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const organization = await apiService.createOrganization(formData);
      console.log('✅ Organization created:', organization);
      setOrganizationId(organization.id);
      setStep(2); // Always move to domain verification
    } catch (error) {
      console.error('Failed to create organization:', error);
      alert('Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-lg">
        <div className="space-y-8">
          {/* Professional Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to CCMyJIRA
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {step === 1 
                ? "Set up your organization to connect your JIRA project and start managing tickets."
                : "Domain verification is required to complete your setup."
              }
            </p>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Organization Setup</CardTitle>
                <CardDescription>
                  Configure your JIRA integration to connect your project data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createOrganization} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Acme Corporation"
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
                      placeholder="https://acme.atlassian.net"
                      value={formData.jiraBaseUrl}
                      onChange={(e) => handleInputChange('jiraBaseUrl', e.target.value)}
                      required
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
                      placeholder="PROJ"
                      value={formData.jiraProjectKey}
                      onChange={(e) => handleInputChange('jiraProjectKey', e.target.value.toUpperCase())}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      The project key from your JIRA project settings (usually 3-10 uppercase letters)
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Organization...
                      </>
                    ) : (
                      'Continue to Verification'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && organizationId && (
            <DomainVerification 
              organizationId={organizationId}
              onComplete={onComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Domain Verification Component
function DomainVerification({ 
  organizationId, 
  onComplete
}: { 
  organizationId: string; 
  onComplete: () => void; 
}) {
  const [domain, setDomain] = useState('');
  const [emailUsername, setEmailUsername] = useState('');
  const [status, setStatus] = useState<'domain' | 'email' | 'sending' | 'sent' | 'verified'>('domain');
  const [verificationCode, setVerificationCode] = useState('');
  const [domainError, setDomainError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check for verification code in URL on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    const domainFromUrl = urlParams.get('domain');
    
    if (codeFromUrl && domainFromUrl) {
      console.log('🔗 Verification code detected in URL:', codeFromUrl);
      setVerificationCode(codeFromUrl);
      setDomain(domainFromUrl);
      setStatus('sent');
      
      // Try to get the stored email from previous verification attempt
      const storedEmail = apiService.getStoredVerificationEmail(domainFromUrl);
      if (storedEmail) {
        const emailParts = storedEmail.split('@');
        if (emailParts.length === 2) {
          setEmailUsername(emailParts[0]);
          console.log('📧 Using stored email username:', emailParts[0]);
        }
      } else {
        // Fallback to a reasonable default
        const defaultUsername = 'support';
        setEmailUsername(defaultUsername);
        console.log('📧 Using default email username:', defaultUsername);
      }
      
      // Clean the URL
      window.history.replaceState({}, '', '/dashboard');
      
      console.log('✅ Auto-filled verification form with URL parameters');
    }
  }, []);

  // Countdown timer for resend cooldown
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // List of generic domains that shouldn't be allowed
  const genericDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'protonmail.com', 'yandex.com', 'zoho.com', 'mail.com',
    'gmx.com', 'tutanota.com', 'fastmail.com', 'hey.com', 'mailbox.org',
    'live.com', 'msn.com', 'yahoo.co.uk', 'googlemail.com', 'me.com',
    'mac.com', 'rediffmail.com', 'inbox.com', 'mail.ru', 'qq.com',
    '163.com', '126.com', 'sina.com', 'naver.com', 'daum.net'
  ];

  const validateDomain = (inputDomain: string) => {
    const cleanDomain = inputDomain.toLowerCase().trim();
    
    if (!cleanDomain) {
      setDomainError('');
      return false;
    }

    // Check if it's a generic domain
    if (genericDomains.includes(cleanDomain)) {
      setDomainError('Please use your company domain, not a personal email provider');
      return false;
    }

    // Basic domain format validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})+$/;
    if (!domainRegex.test(cleanDomain)) {
      setDomainError('Please enter a valid domain (e.g., yourcompany.com)');
      return false;
    }

    setDomainError('');
    return true;
  };

  const validateEmailUsername = (username: string) => {
    const cleanUsername = username.toLowerCase().trim();
    
    if (!cleanUsername) {
      setEmailError('');
      return false;
    }

    // Check for invalid characters (no @, spaces, or other special chars except dots, hyphens, underscores)
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      setEmailError('Only letters, numbers, dots, hyphens, and underscores allowed');
      return false;
    }

    // Check minimum length
    if (cleanUsername.length < 2) {
      setEmailError('Email username must be at least 2 characters');
      return false;
    }

    // Check maximum length
    if (cleanUsername.length > 64) {
      setEmailError('Email username must be less than 64 characters');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleDomainChange = (value: string) => {
    setDomain(value);
    validateDomain(value);
  };

  const handleEmailUsernameChange = (value: string) => {
    // Remove @ symbol if user tries to type it
    const cleanValue = value.replace('@', '');
    setEmailUsername(cleanValue);
    validateEmailUsername(cleanValue);
  };

  const proceedToEmailStep = () => {
    if (validateDomain(domain)) {
      setStatus('email');
    }
  };

  const goBackToDomain = () => {
    setStatus('domain');
    setEmailUsername('');
    setEmailError('');
  };

  const sendVerificationEmail = async (isResend = false) => {
    if (!validateDomain(domain) || !validateEmailUsername(emailUsername)) {
      return;
    }

    const fullEmail = `${emailUsername.toLowerCase().trim()}@${domain.toLowerCase().trim()}`;
    
    setStatus('sending');
    try {
      await apiService.initiateDomainVerification({
        domain: domain.toLowerCase().trim(),
        organizationId,
        email: fullEmail
      });
      setStatus('sent');
      
      // Set cooldown for resend (60 seconds)
      if (isResend) {
        setResendCooldown(60);
      }
    } catch (error) {
      console.error('Failed to send verification email:', error);
      alert('Failed to send verification email. Please try again.');
      setStatus('email');
    }
  };

  const resendVerificationEmail = () => {
    sendVerificationEmail(true);
  };

  const verifyCode = async () => {
    try {
      await apiService.confirmDomainVerification({
        domain: domain.toLowerCase().trim(),
        verificationCode
      });
      setStatus('verified');
      setTimeout(() => onComplete(), 2000);
    } catch (error) {
      console.error('Failed to verify code:', error);
      alert('Invalid verification code. Please try again.');
    }
  };

  const isValidDomain = domain && !domainError;
  const isValidEmailUsername = emailUsername && !emailError;
  const fullEmail = emailUsername ? `${emailUsername.toLowerCase().trim()}@${domain.toLowerCase().trim()}` : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Verify Domain Ownership
        </CardTitle>
        <CardDescription>
          {status === 'domain' && 'Enter your company domain to get started.'}
          {status === 'email' && 'Choose an email address to receive the verification code.'}
          {(status === 'sending' || status === 'sent') && 'We\'ll send a verification code to your email.'}
          {status === 'verified' && 'Domain verification complete!'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1: Domain Input */}
        {status === 'domain' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Company Domain</Label>
              <Input
                id="domain"
                type="text"
                placeholder="yourcompany.com"
                value={domain}
                onChange={(e) => handleDomainChange(e.target.value)}
                className={domainError ? 'border-red-500' : ''}
              />
              {domainError ? (
                <p className="text-xs text-red-600">{domainError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enter your company domain (without https:// or www)
                </p>
              )}
            </div>
            
            <Button 
              onClick={proceedToEmailStep}
              disabled={!isValidDomain}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Email Input */}
        {status === 'email' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center">
                <Input
                  id="email"
                  type="text"
                  placeholder="support"
                  value={emailUsername}
                  onChange={(e) => handleEmailUsernameChange(e.target.value)}
                  className={cn(
                    "rounded-r-none border-r-0",
                    emailError ? 'border-red-500' : ''
                  )}
                />
                <div className="px-3 py-2 border border-l-0 rounded-r-md bg-muted text-muted-foreground text-sm">
                  @{domain.toLowerCase().trim()}
                </div>
              </div>
              {emailError ? (
                <p className="text-xs text-red-600">{emailError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enter the username part of your email address
                </p>
              )}
              {isValidEmailUsername && (
                <p className="text-xs text-blue-600">
                  Verification email will be sent to: <strong>{fullEmail}</strong>
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={goBackToDomain}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={() => sendVerificationEmail(false)}
                disabled={!isValidEmailUsername}
                className="flex-1"
              >
                Send Verification Email
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Sending */}
        {status === 'sending' && (
          <div className="flex flex-col items-center justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Sending verification email...</p>
          </div>
        )}

        {/* Step 4: Code Input */}
        {status === 'sent' && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Check Your Email</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                We sent a verification email to <strong>{fullEmail}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter verification code or click the link in your email"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You can either enter the code manually or click the verification link in your email
                </p>
              </div>
              
              <Button 
                onClick={verifyCode}
                className="w-full"
                disabled={!verificationCode}
              >
                Verify Code
              </Button>

              {/* Resend Email */}
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Didn't receive the email?
                </p>
                <Button 
                  onClick={resendVerificationEmail}
                  disabled={resendCooldown > 0}
                  variant="outline"
                  size="sm"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {status === 'verified' && (
          <div className="flex flex-col items-center justify-center py-2">
            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="text-sm font-medium text-green-900 mb-1">
              Domain Verified!
            </h3>
            <p className="text-xs text-green-700">
              Redirecting to dashboard...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Dashboard Content Component - now using the new layout
function DashboardContent() {
  return (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  );
}

// Main Dashboard Component with User Detection
function DashboardWithTokenExtraction() {
  const searchParams = useSearchParams();
  const [tokenProcessed, setTokenProcessed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsDomainVerification, setNeedsDomainVerification] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in demo mode first
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode) {
      console.log('🎯 Demo mode detected, setting up demo user...');
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
      setTokenProcessed(true);
      setLoading(false);
      return;
    }

    // Extract token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      console.log('🔑 Token received:', token);
      // Store the token
      localStorage.setItem('jwt_token', token);
      // Clean the URL (remove the token from URL bar)
      window.history.replaceState({}, '', '/dashboard');
      console.log('✅ Token stored successfully');
    } else {
      // Check if we already have a token stored
      const existingToken = localStorage.getItem('jwt_token');
      if (!existingToken) {
        console.log('❌ No token found, redirecting to login');
        window.location.href = '/';
        return;
      }
    }
    
    setTokenProcessed(true);
    loadUserData();
  }, [searchParams]);

  const loadUserData = async () => {
    try {
      console.log('📡 Loading user data...');
      // Get current user
      const userData = await apiService.getCurrentUser();
      console.log('👤 User data loaded:', userData);
      setUser(userData);

      // If user has organizations, check domain verification
      if (userData.organizations && userData.organizations.length > 0) {
        const orgId = userData.organizations[0].id;
        setOrganizationId(orgId);
        
        try {
          console.log('🔍 Checking domain verification for organization:', orgId);
          const domainStatus = await apiService.checkOrganizationDomainVerification(orgId);
          console.log('🌐 Domain verification status:', domainStatus);
          
          if (!domainStatus.hasVerifiedDomain) {
            console.log('⚠️ Organization needs domain verification');
            setNeedsDomainVerification(true);
          } else {
            console.log('✅ Organization has verified domain:', domainStatus.primaryDomain);
          }
        } catch (error: any) {
          console.error('❌ Error checking domain verification:', error);
          
          // If we get a 403 (access denied), it means domain verification is required
          if (error.message && (error.message.includes('403') || error.message.includes('Access denied'))) {
            console.log('🔒 Access denied to organization - domain verification required');
            setNeedsDomainVerification(true);
          } else {
            console.log('🤷 Unknown error checking domain verification, proceeding to dashboard');
            // For other errors (network issues, etc.), proceed to dashboard
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      localStorage.removeItem('jwt_token');
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    console.log('✅ Setup completed, reloading user data...');
    setNeedsDomainVerification(false);
    loadUserData();
  };

  const handleDomainVerificationComplete = () => {
    console.log('✅ Domain verification completed');
    setNeedsDomainVerification(false);
  };

  // Show loading while processing token or loading user data
  if (!tokenProcessed || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium">
              {!tokenProcessed ? 'Processing authentication...' : 'Loading user data...'}
            </p>
            <p className="text-xs text-muted-foreground">
              Please wait while we set up your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show organization setup if user has no organizations
  if (!user?.organizations || user.organizations.length === 0) {
    console.log('🏢 No organizations found, showing setup flow');
    return <OrganizationSetup onComplete={handleSetupComplete} />;
  }

  // Show domain verification if organization exists but needs domain verification
  if (needsDomainVerification && organizationId) {
    console.log('🌐 Showing domain verification for existing organization');
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-lg">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Verify Your Domain
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Complete your setup by verifying your domain ownership.
              </p>
            </div>
            <DomainVerification 
              organizationId={organizationId}
              onComplete={handleDomainVerificationComplete}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard if user has organizations and verified domain
  console.log('🎉 User has organizations with verified domain, showing dashboard');
  return <DashboardContent />;
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium">Loading dashboard...</p>
            <p className="text-xs text-muted-foreground">
              Preparing your JIRA management experience
            </p>
          </div>
        </div>
      </div>
    }>
      <DashboardWithTokenExtraction />
    </Suspense>
  );
} 