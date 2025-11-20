import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard,
  KanbanSquare,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/lib/api';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  className?: string;
}

const navigation = [
  {
    id: 'kanban',
    name: 'Kanban Board',
    icon: KanbanSquare,
    description: 'Ticket management'
  },
  {
    id: 'overview',
    name: 'Overview',
    icon: LayoutDashboard,
    description: 'Dashboard overview'
  }
];

export function Navigation({ currentView, onViewChange, onLogout, className }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isDemoMode = localStorage.getItem('demo_mode') === 'true';

  const handleSwaggerClick = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    window.open(`${apiBase}/api/docs`, '_blank');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <KanbanSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold">CCMyJIRA</h1>
                {isDemoMode && (
                  <Badge variant="secondary" className="text-xs">
                    Demo
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isDemoMode ? 'Demo Dashboard' : 'Dashboard'}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-10",
              isCollapsed && "justify-center"
            )}
            onClick={() => {
              onViewChange(item.id);
              setIsMobileOpen(false);
            }}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{item.name}</span>
                {currentView !== item.id && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </div>
            )}
          </Button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t space-y-1">
        <Button
          variant={currentView === 'settings' ? "default" : "ghost"}
          size="sm"
          className={cn(
            "w-full justify-start gap-3 h-10",
            isCollapsed && "justify-center"
          )}
          onClick={() => {
            onViewChange('settings');
            setIsMobileOpen(false);
          }}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Settings</span>}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-start gap-3 h-10",
            isCollapsed && "justify-center"
          )}
          onClick={handleSwaggerClick}
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-sm">API Docs</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start gap-3 h-10 text-muted-foreground hover:text-foreground",
            isCollapsed && "justify-center"
          )}
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <KanbanSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">CCMyJIRA</h1>
              {isDemoMode && (
                <Badge variant="secondary" className="text-xs">
                  Demo
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isDemoMode ? 'Demo Dashboard' : 'Dashboard'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <motion.div
        className={cn(
          "hidden lg:flex flex-col bg-background border-r h-screen sticky top-0",
          isCollapsed ? "w-20" : "w-64",
          className
        )}
        animate={{
          width: isCollapsed ? 80 : 256
        }}
        transition={{ duration: 0.2 }}
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
          <motion.div
            className="lg:hidden fixed left-0 top-0 h-full w-64 bg-background border-r z-50"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <KanbanSquare className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-semibold">CCMyJIRA</h1>
                    {isDemoMode && (
                      <Badge variant="secondary" className="text-xs">
                        Demo
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isDemoMode ? 'Demo Dashboard' : 'Dashboard'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SidebarContent />
            </div>
          </motion.div>
        </>
      )}
    </>
  );
} 