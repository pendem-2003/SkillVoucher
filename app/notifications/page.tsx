'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  ArrowLeft,
  Image as ImageIcon,
} from 'lucide-react';
import Image from 'next/image';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    refundScreenshot?: string;
    refundOfferScreenshot?: string;
    adminMessage?: string;
    complaintId?: string;
    refundAmount?: number;
    refundPercentage?: number;
  };
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchNotifications();
    }
  }, [status]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT_APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PAYMENT_REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'PAYMENT_REFUND_OFFER':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PAYMENT_PENDING':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'REFUND_PROCESSED':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'COMPLAINT_REPLY':
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case 'BOOK_PAYMENT_APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'BOOK_PAYMENT_REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'BOOK_REFUND_OFFER':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'BOOK_PAYMENT_REFUNDED':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'BOOK_DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'BOOK_STATUS_UPDATE':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              Notifications
            </h1>
            <p className="text-gray-600 mt-2">
              {notifications.filter(n => !n.isRead).length} unread notifications
            </p>
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`${
                  !notification.isRead ? 'border-blue-200 bg-blue-50' : ''
                } hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {notification.title}
                            {!notification.isRead && (
                              <Badge variant="default" className="text-xs">New</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString('en-IN')}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>

                      <p className="text-gray-700 mt-3">{notification.message}</p>

                      {/* Refund Offer Screenshot (78% Cashback) */}
                      {notification.metadata?.refundOfferScreenshot && (
                        <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                          <p className="text-sm font-semibold text-green-900 flex items-center gap-2 mb-2">
                            <ImageIcon className="h-4 w-4" />
                            78% Cashback Proof
                            {notification.metadata?.refundAmount && (
                              <span className="ml-2 text-xs bg-green-200 px-2 py-1 rounded">
                                ₹{notification.metadata.refundAmount.toLocaleString()} refunded
                              </span>
                            )}
                          </p>
                          <Image
                            src={notification.metadata.refundOfferScreenshot}
                            alt="Cashback proof"
                            width={400}
                            height={400}
                            className="rounded border w-full max-w-md"
                          />
                        </div>
                      )}

                      {/* Refund Screenshot (For Rejected Payments) */}
                      {notification.metadata?.refundScreenshot && (
                        <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                          <p className="text-sm font-semibold text-orange-900 flex items-center gap-2 mb-2">
                            <ImageIcon className="h-4 w-4" />
                            Full Refund Proof
                          </p>
                          <Image
                            src={notification.metadata.refundScreenshot}
                            alt="Refund proof"
                            width={400}
                            height={400}
                            className="rounded border w-full max-w-md"
                          />
                        </div>
                      )}

                      {/* Admin Message */}
                      {notification.metadata?.adminMessage && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900 mb-1">Admin Response:</p>
                          <p className="text-sm text-blue-800">{notification.metadata.adminMessage}</p>
                        </div>
                      )}

                      {/* Complaint Link */}
                      {notification.metadata?.complaintId && (
                        <Button
                          size="sm"
                          variant="link"
                          className="mt-3 p-0"
                          onClick={() => router.push(`/support/${notification.metadata?.complaintId}`)}
                        >
                          View Conversation →
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
