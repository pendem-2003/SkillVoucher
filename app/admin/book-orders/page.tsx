'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Upload, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function AdminBookOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [bookOrders, setBookOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [refundScreenshots, setRefundScreenshots] = useState<Record<string, string>>({});
  const [refundOfferScreenshots, setRefundOfferScreenshots] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'payments' | 'fulfillment'>('payments');

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchBookOrders();
  }, [session, router]);

  const fetchBookOrders = async () => {
    try {
      const response = await fetch('/api/admin/book-orders');
      if (response.ok) {
        const data = await response.json();
        console.log('Book Orders:', data.bookOrders);
        data.bookOrders?.forEach((order: any) => {
          console.log(`Order ${order.id}:`, {
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            book: order.book?.title
          });
        });
        setBookOrders(data.bookOrders || []);
      }
    } catch (error) {
      console.error('Failed to fetch book orders:', error);
      toast.error('Failed to fetch book orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (orderId: string, action: string, data?: any) => {
    console.log('🔵 handleAction called:', { orderId, action, data });
    setProcessingOrder(orderId);

    try {
      console.log('🔵 Sending request to:', `/api/admin/book-orders/${orderId}`);
      const response = await fetch(`/api/admin/book-orders/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });

      console.log('🔵 Response status:', response.status);
      const result = await response.json();
      console.log('🔵 Response data:', result);

      if (response.ok) {
        toast.success('Action completed successfully!');
        await fetchBookOrders();
        if (action === 'send-refund') {
          setRefundScreenshots({ ...refundScreenshots, [orderId]: '' });
        }
        if (action === 'send-refund-offer') {
          setRefundOfferScreenshots({ ...refundOfferScreenshots, [orderId]: '' });
        }
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (error) {
      console.error('❌ Action error:', error);
      toast.error('Failed to process action');
    } finally {
      setProcessingOrder(null);
    }
  };

  const updateOrderStatus = async (orderId: string, orderStatus: string) => {
    setProcessingOrder(orderId);

    try {
      const response = await fetch(`/api/admin/book-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus }),
      });

      if (response.ok) {
        toast.success('Order status updated!');
        fetchBookOrders();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update status');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, orderId: string, type: 'refund' | 'refund-offer') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'refund') {
        setRefundScreenshots({ ...refundScreenshots, [orderId]: base64String });
      } else {
        setRefundOfferScreenshots({ ...refundOfferScreenshots, [orderId]: base64String });
      }
      toast.success('Screenshot uploaded!');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter orders based on payment status (like courses)
  const pendingPayments = bookOrders.filter(o => 
    o.paymentStatus === 'PENDING' ||
    o.paymentStatus === 'COMPLETED' && !o.refundOfferSent || // Approved, awaiting cashback
    o.paymentStatus === 'PENDING_REFUND' // Rejected, awaiting refund
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Package className="h-8 w-8 text-blue-600" />
          Book Orders Management
        </h1>
        <p className="text-gray-600 mt-2">{bookOrders.length} total orders</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'payments'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          💳 Payment Actions ({pendingPayments.length})
        </button>
      </div>

      {/* Payment Actions Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {pendingPayments.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                All payments processed!
              </h3>
              <p className="text-gray-600">
                No pending actions at the moment.
              </p>
            </Card>
          ) : (
            pendingPayments.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left: Order Details */}
                  <div className="lg:col-span-1">
                    <Badge 
                      variant="outline" 
                      className={`mb-3 ${
                        order.paymentStatus === 'PENDING_REFUND' 
                          ? 'bg-orange-50 text-orange-700 border-orange-300' 
                          : order.paymentStatus === 'COMPLETED' && !order.refundOfferSent
                          ? 'bg-green-50 text-green-700 border-green-300'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-300'
                      }`}
                    >
                      {order.paymentStatus === 'PENDING_REFUND' 
                        ? 'Awaiting Refund Screenshot' 
                        : order.paymentStatus === 'COMPLETED' && !order.refundOfferSent
                        ? '✅ Approved - Send 78% Cashback'
                        : 'Pending Verification'}
                    </Badge>
                    <h3 className="font-bold text-lg">{order.book.title}</h3>
                    <p className="text-gray-600 mb-3">by {order.book.author}</p>
                    <div className="text-2xl font-bold text-blue-600 mb-4">
                      ₹{order.totalAmount}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Customer:</strong> {order.user.name}</p>
                      <p className="text-sm text-gray-600">{order.user.email}</p>
                      {order.upiId && (
                        <div className="mt-3 p-2 bg-purple-50 rounded border border-purple-200">
                          <p className="text-xs font-semibold text-purple-900">UPI ID (for cashback/refund):</p>
                          <p className="text-sm font-mono text-purple-700 mt-1">{order.upiId}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: Payment Screenshot */}
                  <div className="lg:col-span-1">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Payment Proof</p>
                    {order.paymentScreenshot && (
                      <Image
                        src={order.paymentScreenshot}
                        alt="Payment"
                        width={300}
                        height={300}
                        className="rounded-lg border"
                      />
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:col-span-1">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Admin Action</p>
                    
                    {order.paymentStatus === 'COMPLETED' && !order.refundOfferSent ? (
                      <>
                        {/* Approved - Send 78% Cashback */}
                        <div className="mb-3 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                          <p className="text-sm font-semibold text-green-900 mb-2">✅ Payment Approved - Invoice Generated</p>
                          <p className="text-xs text-green-800 mb-2">
                            User can download their invoice. Now send 78% cashback (₹{Math.round(order.totalAmount * 0.78)}) to complete the process.
                          </p>
                        </div>

                        <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <label className="text-xs font-semibold text-purple-900 block mb-2">
                            Upload 78% Cashback Screenshot (Required) *
                          </label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, order.id, 'refund-offer')}
                            className="text-xs w-full"
                          />
                          {refundOfferScreenshots[order.id] && (
                            <p className="text-xs text-purple-700 mt-2 flex items-center gap-1">
                              <Upload className="h-3 w-3" />
                              Screenshot uploaded ✓
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={() => handleAction(order.id, 'send-cashback', {
                            refundOfferScreenshot: refundOfferScreenshots[order.id]
                          })}
                          disabled={!refundOfferScreenshots[order.id] || processingOrder === order.id}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Send 78% Cashback
                        </Button>
                      </>
                    ) : order.paymentStatus === 'PENDING_REFUND' ? (
                      <>
                        {/* Rejected - Send Refund */}
                        <div className="mb-3 p-3 bg-orange-50 border-2 border-orange-300 rounded-lg">
                          <p className="text-sm font-semibold text-orange-900 mb-2">⚠️ Awaiting Refund Screenshot</p>
                          <p className="text-xs text-orange-800">
                            This payment was rejected. Please upload the refund screenshot.
                          </p>
                        </div>

                        <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <label className="text-xs font-semibold text-purple-900 block mb-2">
                            Upload Refund Proof (Required) *
                          </label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, order.id, 'refund')}
                            className="text-xs w-full"
                          />
                          {refundScreenshots[order.id] && (
                            <p className="text-xs text-purple-700 mt-2 flex items-center gap-1">
                              <Upload className="h-3 w-3" />
                              Screenshot uploaded ✓
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={() => handleAction(order.id, 'send-refund', {
                            refundScreenshot: refundScreenshots[order.id]
                          })}
                          disabled={!refundScreenshots[order.id] || processingOrder === order.id}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Send Refund Screenshot
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Pending - Approve/Reject */}
                        <div className="flex flex-col gap-2 mb-3">
                          <Button
                            onClick={() => handleAction(order.id, 'approve')}
                            disabled={processingOrder === order.id}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve & Generate Invoice
                          </Button>
                          
                          <Button
                            onClick={() => handleAction(order.id, 'reject')}
                            disabled={processingOrder === order.id}
                            variant="destructive"
                            className="w-full"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Payment
                          </Button>
                        </div>

                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-xs text-yellow-800">
                            <strong>Note:</strong> Approved payments generate invoices and then require 78% cashback screenshot. Rejected payments require refund screenshot.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
