'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTickets } from '@/hooks/useDashboard';
import { useOrganizationData } from '@/hooks/useOrganization';
import { JiraTicket, JiraAttachment } from '@/types/dashboard';
import { apiService } from '@/lib/api';
import { 
  Columns3, 
  Search, 
  RefreshCw, 
  Calendar, 
  User, 
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings,
  Plus,
  ExternalLink,
  Clock,
  Maximize2,
  X,
  Activity,
  Target,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  Download,
  FileText,
  Image,
  FileIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  title: string;
  tickets: JiraTicket[];
  status: string;
  color: string;
  jiraBaseUrl: string;
  onTicketClick: (ticket: JiraTicket) => void;
}

const KanbanColumn = ({ title, tickets, status, color, jiraBaseUrl, onTicketClick }: KanbanColumnProps) => {
  return (
    <div className="flex-1 min-w-60 max-w-72 h-full flex flex-col">
      <div className="mb-1.5">
        <div className="flex items-center justify-between p-1.5 bg-muted/40 rounded border">
          <div className="flex items-center gap-1.5">
            <div 
              className="w-1.5 h-1.5 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <h3 className="font-medium text-xs">{title}</h3>
          </div>
          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 min-w-[20px] justify-center">
            {tickets.length}
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence>
          {tickets.map((ticket, index) => (
            <motion.div
              key={ticket.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ 
                duration: 0.15, 
                delay: index * 0.02,
                ease: "easeOut"
              }}
              whileHover={{ scale: 1.005 }}
              className="cursor-pointer"
              onClick={() => onTicketClick(ticket)}
            >
              <TicketCard 
                ticket={ticket} 
                jiraBaseUrl={jiraBaseUrl} 
                onExpand={() => onTicketClick(ticket)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tickets.length === 0 && (
          <div className="text-center py-2 text-muted-foreground">
            <Columns3 className="h-3 w-3 mx-auto mb-1 text-muted-foreground/50" />
            <p className="text-xs">No tickets</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TicketCardProps {
  ticket: JiraTicket;
  jiraBaseUrl: string;
  onExpand: () => void;
}

const TicketCard = ({ ticket, jiraBaseUrl, onExpand }: TicketCardProps) => {
  const getPriorityIcon = (priority?: string) => {
    if (!priority) return null;
    switch (priority.toLowerCase()) {
      case 'highest':
      case 'high':
        return <ArrowUp className="h-2 w-2 text-red-500" />;
      case 'medium':
        return <Minus className="h-2 w-2 text-yellow-500" />;
      case 'low':
      case 'lowest':
        return <ArrowDown className="h-2 w-2 text-green-500" />;
      default:
        return <Minus className="h-2 w-2 text-muted-foreground" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      bug: 'bg-red-100 text-red-700',
      story: 'bg-blue-100 text-blue-700',
      task: 'bg-green-100 text-green-700',
      epic: 'bg-purple-100 text-purple-700',
      default: 'bg-muted text-muted-foreground'
    };
    return colors[type.toLowerCase() as keyof typeof colors] || colors.default;
  };

  const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date();

  const openInJira = (e: React.MouseEvent) => {
    e.stopPropagation();
    const jiraUrl = `${jiraBaseUrl}/browse/${ticket.key}`;
    window.open(jiraUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="py-2 hover:shadow-sm transition-all duration-150 border border-border/50 hover:border-border/80">
      <CardContent className="p-1.5">
        <div className="space-y-1">
          {/* Ultra Compact Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1">
              <Badge className={cn("text-[10px] px-1 py-0 h-3.5 leading-none", getTypeColor(ticket.issueType))}>
                {ticket.issueType.charAt(0)}
              </Badge>
              {getPriorityIcon(ticket.priority)}
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1 py-0 rounded">
                {ticket.key}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-3 w-3 p-0 hover:bg-blue-100 hover:text-blue-600" 
                onClick={openInJira}
                title={`Open in JIRA`}
              >
                <ExternalLink className="h-2 w-2" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-3 w-3 p-0 hover:bg-muted" 
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
                title="View details"
              >
                <Maximize2 className="h-2 w-2" />
              </Button>
            </div>
          </div>

          {/* Ultra Compact Title */}
          <h4 className="font-medium text-[11px] leading-tight line-clamp-2 text-foreground">
            {ticket.summary}
          </h4>

          {/* Ultra Compact Footer */}
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-0.5">
              {ticket.assignee && (
                <div className="flex items-center gap-0.5 bg-muted/60 px-1 py-0 rounded max-w-10">
                  <User className="h-1.5 w-1.5 flex-shrink-0" />
                  <span className="truncate">
                    {ticket.assignee.split('@')[0].substring(0, 4)}
                  </span>
                </div>
              )}
              {ticket.storyPoints && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-3.5 leading-none">
                  {ticket.storyPoints}
                </Badge>
              )}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="flex items-center gap-0.5 bg-blue-100 text-blue-700 px-1 py-0 rounded">
                  <Paperclip className="h-1.5 w-1.5 flex-shrink-0" />
                  <span>{ticket.attachments.length}</span>
                </div>
              )}
            </div>
            
            {isOverdue && (
              <div className="flex items-center gap-0.5 text-red-600">
                <AlertCircle className="h-1.5 w-1.5" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Ticket Details Modal
interface TicketDetailsProps {
  ticket: JiraTicket | null;
  jiraBaseUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const TicketDetails = ({ ticket, jiraBaseUrl, isOpen, onClose }: TicketDetailsProps) => {
  if (!ticket) return null;

  const openInJira = () => {
    const jiraUrl = `${jiraBaseUrl}/browse/${ticket.key}`;
    window.open(jiraUrl, '_blank', 'noopener,noreferrer');
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else {
      return <FileIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadAttachment = async (attachment: JiraAttachment) => {
    try {
      await apiService.getAttachmentDownloadUrl(attachment.id, attachment.filename);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      // You might want to show a toast notification here
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg">{ticket.key}</DialogTitle>
              <Badge variant="outline">{ticket.issueType}</Badge>
              {ticket.priority && (
                <Badge variant="secondary">{ticket.priority}</Badge>
              )}
            </div>
            <Button onClick={openInJira} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in JIRA
            </Button>
          </div>
          <DialogDescription className="text-left">
            {ticket.summary}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {ticket.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <h4 className="font-medium mb-2">Details</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{ticket.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assignee:</span>
                  <span>{ticket.assignee || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reporter:</span>
                  <span>{ticket.reporter || 'Unknown'}</span>
                </div>
                {ticket.storyPoints && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Story Points:</span>
                    <span>{ticket.storyPoints}</span>
                  </div>
                )}
                {ticket.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{new Date(ticket.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Timeline</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(ticket.created).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{new Date(ticket.updated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {ticket.labels && ticket.labels.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Labels</h4>
              <div className="flex flex-wrap gap-1">
                {ticket.labels.map((label) => (
                  <Badge key={label} variant="outline" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {ticket.components && ticket.components.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Components</h4>
              <div className="flex flex-wrap gap-1">
                {ticket.components.map((component) => (
                  <Badge key={component} variant="secondary" className="text-xs">
                    {component}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {ticket.attachments && ticket.attachments.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Attachments ({ticket.attachments.length})
              </h4>
              <div className="space-y-2">
                {ticket.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded border"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(attachment.mimeType)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" title={attachment.filename}>
                          {attachment.filename}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)} • {attachment.author} • {new Date(attachment.created).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => downloadAttachment(attachment)}
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function EnhancedKanban() {
  const [filters, setFilters] = useState({
    status: '',
    assignee: '',
    search: '',
    days: 30
  });
  const [selectedTicket, setSelectedTicket] = useState<JiraTicket | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: tickets, isLoading, error, refetch } = useTickets(filters);
  const { organization } = useOrganizationData();

  // Group tickets by status
  const groupedTickets = useMemo(() => {
    if (!tickets) return {};
    
    const groups = tickets.reduce((acc, ticket) => {
      const status = ticket.status || 'Unknown';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(ticket);
      return acc;
    }, {} as Record<string, JiraTicket[]>);

    // Sort tickets within each group by priority and due date
    Object.keys(groups).forEach(status => {
      groups[status].sort((a, b) => {
        const priorityOrder = { highest: 5, high: 4, medium: 3, low: 2, lowest: 1 };
        const aPriority = priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        
        return 0;
      });
    });

    return groups;
  }, [tickets]);

  // Column configuration
  const columns = [
    { key: 'To Do', title: 'To Do', color: '#6B7280' },
    { key: 'In Progress', title: 'In Progress', color: '#3B82F6' },
    { key: 'In Review', title: 'In Review', color: '#F59E0B' },
    { key: 'Done', title: 'Done', color: '#10B981' }
  ];

  const jiraBaseUrl = organization?.jira_base_url || 'https://yourcompany.atlassian.net';

  const handleTicketClick = (ticket: JiraTicket) => {
    setSelectedTicket(ticket);
    setIsDetailsOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4">
        <Card className="py-2 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-2">Error Loading Tickets</h3>
          <p className="text-sm text-muted-foreground mb-3">{error.message}</p>
          <Button onClick={handleRefresh} size="sm" disabled={isRefreshing}>
            <RefreshCw className={cn("h-3 w-3 mr-2", isRefreshing && "animate-spin")} />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 space-y-3">
      {/* Header with Quick Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Kanban Board</h1>
          <p className="text-xs text-muted-foreground">Manage JIRA tickets</p>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          size="sm"
          className="w-fit"
        >
          <RefreshCw className={cn("mr-2 h-3 w-3", (isLoading || isRefreshing) && "animate-spin")} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Quick Stats */}
      {tickets && tickets.length > 0 && (
        <Card className="py-2">
          <CardContent className="p-2">
            <div className="grid grid-cols-4 gap-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-blue-100 rounded">
                  <Activity className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{tickets.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-orange-100 rounded">
                  <Target className="h-3 w-3 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-600">
                    {groupedTickets['In Progress']?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-green-100 rounded">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-600">
                    {groupedTickets['Done']?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Done</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-red-100 rounded">
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-red-600">
                    {tickets.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Overdue</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compact Filters */}
      <Card className="py-2"> 
        <CardContent className="p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="space-y-1">
              <Label htmlFor="search" className="text-xs font-medium">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1.5 h-3 w-3 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-7 h-7 text-xs"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium">Status</Label>
              <Select value={filters.status || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {columns.map(col => (
                    <SelectItem key={col.key} value={col.key}>{col.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium">Assignee</Label>
              <Input
                placeholder="Filter assignee..."
                value={filters.assignee}
                onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
                className="h-7 text-xs"
              />
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium">Period</Label>
              <Select value={filters.days.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, days: parseInt(value) }))}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      {isLoading ? (
        <Card className="py-2 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading tickets...</p>
        </Card>
      ) : (
        <div className="h-[calc(100vh-300px)] overflow-hidden">
          <div className="flex gap-3 h-full overflow-x-auto pb-3">
            {columns.map(column => (
              <KanbanColumn
                key={column.key}
                title={column.title}
                tickets={groupedTickets[column.key] || []}
                status={column.key}
                color={column.color}
                jiraBaseUrl={jiraBaseUrl}
                onTicketClick={handleTicketClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      <TicketDetails
        ticket={selectedTicket}
        jiraBaseUrl={jiraBaseUrl}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
} 