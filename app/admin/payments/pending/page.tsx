'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Building2,
  IndianRupee,
  Eye,
  MessageSquare,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface PendingPayment {
  id: string;
  status: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  paymentProofUrl: string;
  upiId: string;
  userNote: string;
  refundOfferSent: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  course: {
    id: string;
    title: string;
    price: number;
  };
}

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [refundScreenshots, setRefundScreenshots] = useState<Record<string, string>>({});
  const [refundOfferScreenshots, setRefundOfferScreenshots] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

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
      fetchPendingPayments();
    }
  }, [status, session]);

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments/pending');
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !adminNote) {
      toast({
        title: 'Note Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch(`/api/admin/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          adminNote,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify payment');
      }

      toast({
        title: action === 'approve' ? 'Payment Approved ✅' : 'Payment Rejected ❌',
        description: data.message,
      });

      // Refresh list
      fetchPendingPayments();
      setSelectedPayment(null);
      setAdminNote('');
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSendRefund = async (paymentId: string) => {
    const refundScreenshot = refundScreenshots[paymentId];
    
    if (!refundScreenshot) {
      toast({
        title: 'Screenshot Required',
        description: 'Please upload refund screenshot',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refundScreenshot,
          adminMessage: selectedPayment === paymentId ? adminNote : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send refund');
      }

      toast({
        title: 'Refund Sent ✅',
        description: 'Refund screenshot has been sent to user',
      });

      // Refresh list
      fetchPendingPayments();
      setSelectedPayment(null);
      setAdminNote('');
      setRefundScreenshots(prev => {
        const updated = { ...prev };
        delete updated[paymentId];
        return updated;
      });
    } catch (error: any) {
      console.error('Error sending refund:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSendRefundOffer = async (paymentId: string) => {
    const refundOfferScreenshot = refundOfferScreenshots[paymentId];
    
    if (!refundOfferScreenshot) {
      toast({
        title: 'Screenshot Required',
        description: 'Please upload 78% refund offer screenshot',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch(`/api/admin/payments/${paymentId}/refund-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refundOfferScreenshot,
          adminMessage: selectedPayment === paymentId ? adminNote : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send refund offer');
      }

      toast({
        title: '78% Refund Offer Sent ✅',
        description: 'Cashback screenshot has been sent to user',
      });

      // Refresh list
      fetchPendingPayments();
      setSelectedPayment(null);
      setAdminNote('');
      setRefundOfferScreenshots(prev => {
        const updated = { ...prev };
        delete updated[paymentId];
        return updated;
      });
    } catch (error: any) {
      console.error('Error sending refund offer:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRefundOfferScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>, paymentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRefundOfferScreenshots(prev => ({
        ...prev,
        [paymentId]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRefundScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>, paymentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRefundScreenshots(prev => ({
        ...prev,
        [paymentId]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-600" />
            Payment Actions Required
          </h1>
          <p className="text-gray-600 mt-2">
            Review payments, approve/reject, and send 78% cashback offers
          </p>
        </div>

        {payments.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No pending payments</h3>
                <p className="mt-2 text-gray-600">All payments have been processed</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {payments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: User & Order Details */}
                    <div className="lg:col-span-1 space-y-4">
                      <div>
                        <Badge 
                          variant="outline" 
                          className={`mb-3 ${
                            payment.status === 'PENDING_REFUND' 
                              ? 'bg-orange-50 text-orange-700 border-orange-300' 
                              : payment.status === 'COMPLETED' && !payment.refundOfferSent
                              ? 'bg-green-50 text-green-700 border-green-300'
                              : ''
                          }`}
                        >
                          {payment.status === 'PENDING_REFUND' 
                            ? 'Awaiting Refund Screenshot' 
                            : payment.status === 'COMPLETED' && !payment.refundOfferSent
                            ? '✅ Approved - Send 78% Cashback'
                            : 'Pending Verification'}
                        </Badge>
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {payment.course.title}
                        </h3>
                        <div className="text-2xl font-bold text-blue-600">
                          ₹{payment.amount.toLocaleString()}
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{payment.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {payment.customerEmail}
                        </div>
                        {payment.customerPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {payment.customerPhone}
                          </div>
                        )}
                        {payment.customerCompany && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {payment.customerCompany}
                          </div>
                        )}
                        {payment.upiId && (
                          <div className="mt-3 p-2 bg-purple-50 rounded border border-purple-200">
                            <p className="text-xs font-semibold text-purple-900">UPI ID (for refunds):</p>
                            <p className="text-sm font-mono text-purple-700 mt-1">{payment.upiId}</p>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 pt-2">
                        Submitted: {new Date(payment.createdAt).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Middle: Payment Proof */}
                    <div className="lg:col-span-1">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Payment Proof</p>
                      <div className="border rounded-lg p-2 bg-gray-50">
                        <Image
                          src={payment.paymentProofUrl}
                          alt="Payment proof"
                          width={400}
                          height={400}
                          className="w-full h-auto rounded"
                        />
                      </div>
                      {payment.userNote && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-semibold text-blue-900 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            User's Note:
                          </p>
                          <p className="text-sm text-blue-800 mt-1">{payment.userNote}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="lg:col-span-1">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Admin Action</p>
                      
                      {payment.status === 'COMPLETED' && !payment.refundOfferSent ? (
                        <>
                          {/* For approved payments awaiting 60% refund offer */}
                          <div className="mb-3 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                            <p className="text-sm font-semibold text-green-900 mb-2">✅ Payment Approved - Course Activated</p>
                            <p className="text-xs text-green-800 mb-2">
                              User already has course access. Now send 78% cashback offer (₹{Math.round(payment.amount * 0.78).toLocaleString()}) to build customer loyalty.
                            </p>
                          </div>

                          <Textarea
                            value={selectedPayment === payment.id ? adminNote : ''}
                            onChange={(e) => {
                              setSelectedPayment(payment.id);
                              setAdminNote(e.target.value);
                            }}
                            placeholder="Add a message for the user (optional)..."
                            rows={3}
                            className="mb-3"
                          />

                          <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <label className="text-xs font-semibold text-purple-900 block mb-2">
                              Upload 78% Refund Screenshot (Required) *
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleRefundOfferScreenshotUpload(e, payment.id)}
                              className="text-xs w-full"
                            />
                            {refundOfferScreenshots[payment.id] && (
                              <p className="text-xs text-purple-700 mt-2 flex items-center gap-1">
                                <Upload className="h-3 w-3" />
                                Screenshot uploaded ✓
                              </p>
                            )}
                          </div>

                          <Button
                            onClick={() => handleSendRefundOffer(payment.id)}
                            disabled={processing || !refundOfferScreenshots[payment.id]}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Send 78% Cashback Offer
                          </Button>
                        </>
                      ) : payment.status === 'PENDING_REFUND' ? (
                        <>
                          {/* For payments awaiting refund */}
                          <div className="mb-3 p-3 bg-orange-50 border-2 border-orange-300 rounded-lg">
                            <p className="text-sm font-semibold text-orange-900 mb-2">⚠️ Awaiting Refund Screenshot</p>
                            <p className="text-xs text-orange-800">
                              This payment was rejected. Please upload the refund screenshot to complete the process.
                            </p>
                          </div>

                          <Textarea
                            value={selectedPayment === payment.id ? adminNote : ''}
                            onChange={(e) => {
                              setSelectedPayment(payment.id);
                              setAdminNote(e.target.value);
                            }}
                            placeholder="Add a message for the user (optional)..."
                            rows={3}
                            className="mb-3"
                          />

                          <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <label className="text-xs font-semibold text-purple-900 block mb-2">
                              Upload Refund Proof (Required) *
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleRefundScreenshotUpload(e, payment.id)}
                              className="text-xs w-full"
                            />
                            {refundScreenshots[payment.id] && (
                              <p className="text-xs text-purple-700 mt-2 flex items-center gap-1">
                                <Upload className="h-3 w-3" />
                                Screenshot uploaded ✓
                              </p>
                            )}
                          </div>

                          <Button
                            onClick={() => handleSendRefund(payment.id)}
                            disabled={processing || !refundScreenshots[payment.id]}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Send Refund Screenshot
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* For new pending payments */}
                          <Textarea
                            value={selectedPayment === payment.id ? adminNote : ''}
                            onChange={(e) => {
                              setSelectedPayment(payment.id);
                              setAdminNote(e.target.value);
                            }}
                            placeholder="Add a note (required for rejection)..."
                            rows={4}
                            className="mb-3"
                          />

                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleVerifyPayment(payment.id, 'approve')}
                              disabled={processing}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve & Activate Course
                            </Button>
                            
                            <Button
                              onClick={() => handleVerifyPayment(payment.id, 'reject')}
                              disabled={processing || (selectedPayment === payment.id && !adminNote)}
                              variant="destructive"
                              className="w-full"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Payment
                            </Button>
                          </div>
                        </>
                      )}

                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          <strong>Note:</strong> Approved payments create enrollments and invoices automatically. Rejected payments will move to "Awaiting Refund Screenshot" status - you'll need to upload the refund screenshot separately (within 1-2 hours).
                        </p>
                      </div>
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
