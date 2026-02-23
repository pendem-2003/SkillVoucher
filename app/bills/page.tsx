'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Calendar, CreditCard, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  courseDetails: any[];
  createdAt: string;
  paymentMethod?: string;
  payment?: {
    status: string;
    paymentMethod: string;
  } | null;
}

export default function BillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/bills');
      return;
    }

    if (status === 'authenticated') {
      fetchInvoices();
    }
  }, [status, router]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();

      if (data.success) {
        setInvoices(data.invoices);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/bills/${invoiceId}`);
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            My Bills & Invoices
          </h1>
          <p className="text-gray-600 mt-2">
            Download your invoices as proof of purchase and learning. You can use these for company reimbursement if required.
          </p>
        </div>

        {/* Invoices List */}
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No invoices yet</h3>
                <p className="mt-2 text-gray-600">
                  Your invoices will appear here after you make a purchase
                </p>
                <Button onClick={() => router.push('/courses')} className="mt-6">
                  Browse Courses
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Section - Invoice Details */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {invoice.invoiceNumber}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CreditCard className="h-4 w-4" />
                              {invoice.payment?.paymentMethod || invoice.paymentMethod || 'Manual'}
                            </div>
                            {invoice.customerCompany && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Building2 className="h-4 w-4" />
                                {invoice.customerCompany}
                              </div>
                            )}
                          </div>

                          {/* Course Details */}
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                              Courses Purchased
                            </p>
                            <div className="space-y-1">
                              {invoice.courseDetails.map((course: any, idx: number) => (
                                <div key={idx} className="text-sm text-gray-700">
                                  • {course.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Amount & Actions */}
                    <div className="lg:text-right">
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{invoice.totalAmount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          (including ₹{invoice.taxAmount.toLocaleString('en-IN')} GST)
                        </p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${(invoice.payment?.status || 'COMPLETED') === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {invoice.payment?.status || 'COMPLETED'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleViewInvoice(invoice.id)}
                          variant="default"
                          className="w-full lg:w-auto"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Invoice
                        </Button>
                        <Button
                          onClick={() => handleViewInvoice(invoice.id)}
                          variant="outline"
                          className="w-full lg:w-auto"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              📝 Download Your Learning Invoice
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>Download your invoice for any course or book purchase.</li>
              <li>Invoices are for your personal records and learning progress.</li>
              <li>Use invoices to track your growth and achievements.</li>
              <li>Contact support for any questions or custom requests.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
