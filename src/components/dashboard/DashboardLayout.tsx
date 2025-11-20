'use client';

import { useState } from 'react';
import { Navigation } from './Navigation';
import { DashboardOverview } from './DashboardOverview';
import { EnhancedKanban } from './EnhancedKanban';
import { TeamWorkloadCard } from './TeamWorkloadCard';
import { Settings } from './Settings';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  className?: string;
}

export function DashboardLayout({ className }: DashboardLayoutProps) {
  const [currentView, setCurrentView] = useState('kanban'); // Default to kanban

  const handleLogout = async () => {
    try {
      await apiService.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout anyway
      localStorage.removeItem('jwt_token');
      window.location.href = '/';
    }
  };

  const renderContent = () => {
    const pageTransition = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.3, ease: "easeInOut" }
    };

    switch (currentView) {
      case 'kanban':
        return (
          <motion.div key="kanban" {...pageTransition}>
            <EnhancedKanban />
          </motion.div>
        );
      case 'overview':
        return (
          <motion.div key="overview" {...pageTransition}>
            <DashboardOverview />
          </motion.div>
        );
      case 'team':
        return (
          <motion.div key="team" {...pageTransition}>
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="text-xl font-semibold tracking-tight">Team Workload</h1>
                <p className="text-sm text-muted-foreground">
                  Monitor team performance and workload distribution
                </p>
              </div>
              <div className="max-w-4xl">
                <TeamWorkloadCard />
              </div>
            </div>
          </motion.div>
        );
      case 'analytics':
        return (
          <motion.div key="analytics" {...pageTransition}>
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
                <p className="text-sm text-muted-foreground">
                  Detailed performance metrics and insights
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="font-medium mb-1">
                    Advanced Analytics
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Detailed analytics and reporting features coming soon.
                  </p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="font-medium mb-1">
                    Performance Insights
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Team performance trends and productivity metrics.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div key="settings" {...pageTransition}>
            <Settings />
          </motion.div>
        );
      default:
        return (
          <motion.div key="kanban" {...pageTransition}>
            <EnhancedKanban />
          </motion.div>
        );
    }
  };

  return (
    <div className={cn("min-h-screen bg-background flex", className)}>
      {/* Navigation Sidebar */}
      <Navigation 
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-0">
        {/* Mobile spacing for header */}
        <div className="lg:hidden h-16" />
        
        {/* Content container - reduced padding for kanban focus */}
        <div className={cn(
          "p-4 lg:p-6",
          currentView === 'kanban' && "p-3 lg:p-4" // Even less padding for kanban
        )}>
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>

        {/* Compact Footer */}
        <footer className="border-t bg-muted/30 mt-8">
          <div className="container mx-auto px-4 lg:px-6 py-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                <span>System operational</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span>Updates every 30s</span>
                <span>•</span>
                <span>CCMyJIRA v1.0</span>
                <span>•</span>
                <button 
                  onClick={() => {
                    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
                    window.open(`${apiBase}/api/docs`, '_blank');
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  API Docs
                </button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
} 