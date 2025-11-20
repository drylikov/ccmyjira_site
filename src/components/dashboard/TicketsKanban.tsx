'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTickets } from '@/hooks/useDashboard';
import { JiraTicket } from '@/types/dashboard';
import { 
  Columns3, 
  Filter, 
  Search, 
  RefreshCw, 
  Calendar, 
  User, 
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  tickets: JiraTicket[];
  status: string;
  color: string;
}

const KanbanColumn = ({ title, tickets, status, color }: KanbanColumnProps) => {
  return (
    <div className="flex-1 min-w-80 max-w-md">
      <div className="mb-4">
        <div className={`flex items-center justify-between p-3 rounded-lg border-l-4`} style={{ borderLeftColor: color }}>
          <h3 className="font-medium text-sm">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {tickets.length}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence>
          {tickets.map((ticket, index) => (
            <motion.div
              key={ticket.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
            >
              <TicketCard ticket={ticket} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tickets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Columns3 className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm">No tickets</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TicketCardProps {
  ticket: JiraTicket;
}

const TicketCard = ({ ticket }: TicketCardProps) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'highest':
      case 'high':
        return <ArrowUp className="h-3 w-3 text-red-500" />;
      case 'medium':
        return <Minus className="h-3 w-3 text-yellow-500" />;
      case 'low':
      case 'lowest':
        return <ArrowDown className="h-3 w-3 text-green-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bug':
        return 'destructive';
      case 'story':
        return 'default';
      case 'task':
        return 'secondary';
      case 'epic':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date();
  const formattedDate = ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : '';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={getTypeColor(ticket.issueType)} className="text-xs">
                {ticket.issueType}
              </Badge>
              {getPriorityIcon(ticket.priority || 'medium')}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {ticket.key}
            </span>
          </div>

          {/* Title */}
          <h4 className="font-medium text-sm leading-tight line-clamp-2">
            {ticket.summary}
          </h4>

          {/* Description */}
          {ticket.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {ticket.description}
            </p>
          )}

          {/* Labels */}
          {ticket.labels && ticket.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {ticket.labels.slice(0, 3).map((label) => (
                <Badge key={label} variant="outline" className="text-xs px-1 py-0">
                  {label}
                </Badge>
              ))}
              {ticket.labels.length > 3 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{ticket.labels.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {ticket.assignee && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate max-w-20">
                    {ticket.assignee.split('@')[0]}
                  </span>
                </div>
              )}
              {ticket.storyPoints && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {ticket.storyPoints} SP
                </Badge>
              )}
            </div>
            
            {ticket.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
                {isOverdue && <AlertCircle className="h-3 w-3" />}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function TicketsKanban() {
  const [filters, setFilters] = useState({
    status: '',
    assignee: '',
    search: '',
    days: 30
  });

  const { data: tickets, isLoading, error, refetch } = useTickets(filters);

  // Group tickets by status
  const groupedTickets = useMemo(() => {
    if (!tickets) return {};
    
    return tickets.reduce((acc, ticket) => {
      if (!acc[ticket.status]) {
        acc[ticket.status] = [];
      }
      acc[ticket.status].push(ticket);
      return acc;
    }, {} as Record<string, JiraTicket[]>);
  }, [tickets]);

  // Define column configuration
  const columns = [
    { key: 'To Do', title: 'To Do', color: '#6B7280' },
    { key: 'In Progress', title: 'In Progress', color: '#F59E0B' },
    { key: 'In Review', title: 'In Review', color: '#8B5CF6' },
    { key: 'Done', title: 'Done', color: '#10B981' },
    { key: 'Closed', title: 'Closed', color: '#059669' },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Columns3 className="h-5 w-5" />
            Tickets Board
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Columns3 className="h-5 w-5" />
            Tickets Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            Failed to load tickets
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Columns3 className="h-5 w-5" />
              Tickets Board
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {tickets?.length || 0} tickets
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Kanban Board */}
          <div className="flex gap-6 overflow-x-auto pb-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.key}
                title={column.title}
                tickets={groupedTickets[column.key] || []}
                status={column.key}
                color={column.color}
              />
            ))}
            
            {/* Other statuses not in predefined columns */}
            {Object.keys(groupedTickets)
              .filter(status => !columns.some(col => col.key === status))
              .map((status) => (
                <KanbanColumn
                  key={status}
                  title={status}
                  tickets={groupedTickets[status] || []}
                  status={status}
                  color="#6B7280"
                />
              ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 