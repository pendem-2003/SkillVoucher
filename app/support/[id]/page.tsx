'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  User,
  Shield,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export default function TicketConversationPage() {
  const params = useParams();
  const ticketId = params?.id as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchTicket();
    }
  }, [status]);

  const fetchTicket = async () => {
    if (!ticketId) return;
    
    try {
      const response = await fetch(`/api/support/${ticketId}`);
      const data = await response.json();
      if (data.success) {
        setTicket(data.ticket);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load ticket',
          variant: 'destructive',
        });
        router.push('/support');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ticket',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: 'Empty Message',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSending(true);

      const response = await fetch(`/api/support/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      toast({
        title: 'Message Sent ✅',
        description: 'Your message has been sent',
      });

      setMessage('');
      fetchTicket(); // Refresh conversation
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-orange-100 text-orange-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || colors.OPEN;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/support')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>

        {/* Ticket Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{ticket.subject}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <Badge className={getStatusBadge(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Created {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <div className="space-y-4 mb-6">
          {ticket.messages.map((msg) => {
            const isAdmin = msg.senderRole === 'ADMIN';
            return (
              <Card key={msg.id} className={isAdmin ? 'border-blue-200 bg-blue-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${isAdmin ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      {isAdmin ? (
                        <Shield className="h-5 w-5 text-white" />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{msg.senderName}</span>
                        <Badge variant="outline" className="text-xs">
                          {isAdmin ? 'Admin' : 'You'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reply Form */}
        {ticket.status !== 'CLOSED' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send a Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={5}
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !message.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {ticket.status === 'CLOSED' && (
          <Card className="bg-gray-100">
            <CardContent className="py-6 text-center">
              <p className="text-gray-600">
                This ticket has been closed. If you need further assistance, please create a new ticket.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
