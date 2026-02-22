'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface SupportTicket {
  id: string;
  userName: string;
  userEmail: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    messages: number;
  };
}

export default function AdminSupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      fetchTickets();
    }
  }, [status, session]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/admin/support');
      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/support/${ticketId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      toast({
        title: 'Status Updated ✅',
        description: `Ticket marked as ${newStatus.replace('_', ' ')}`,
      });

      fetchTickets();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      OPEN: 'bg-red-100 text-red-800',
      IN_PROGRESS: 'bg-orange-100 text-orange-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || colors.OPEN;
  };

  const filteredTickets = tickets.filter((ticket) =>
    filter === 'ALL' ? true : ticket.status === filter
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            Support Tickets
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and respond to user support requests
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((statusFilter) => (
            <Button
              key={statusFilter}
              variant={filter === statusFilter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(statusFilter)}
            >
              {statusFilter.replace('_', ' ')}
              {statusFilter !== 'ALL' && (
                <Badge variant="secondary" className="ml-2">
                  {tickets.filter((t) => t.status === statusFilter).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {filter !== 'ALL' && filter.toLowerCase().replace('_', ' ')} tickets
              </h3>
              <p className="text-gray-600">All caught up!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Ticket Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {ticket.subject}
                          </h3>
                          <Badge className={getStatusBadge(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{ticket.userName}</span>
                          <span>({ticket.userEmail})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          {ticket._count.messages} messages
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Updated: {new Date(ticket.updatedAt).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2">
                      <Link href={`/support/${ticket.id}`}>
                        <Button className="w-full" variant="default">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View & Reply
                        </Button>
                      </Link>

                      {ticket.status === 'OPEN' && (
                        <Button
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          onClick={() => handleStatusChange(ticket.id, 'IN_PROGRESS')}
                        >
                          Mark In Progress
                        </Button>
                      )}

                      {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusChange(ticket.id, 'RESOLVED')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Resolved
                        </Button>
                      )}

                      {ticket.status !== 'CLOSED' && (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handleStatusChange(ticket.id, 'CLOSED')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Close Ticket
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
