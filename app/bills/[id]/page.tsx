'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, ArrowLeft, FileText, Building2, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { downloadInvoiceAsPDF } from '@/lib/htmlToPdf';

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  customerAddress: string;
  courseDetails: any[];
  companyName: string;
  companyAddress: string;
  companyGSTIN: string;
  companyEmail: string;
  companyPhone: string;
  paymentMethod: string;
  transactionId: string;
  notes: string;
  createdAt: string;
  payment: {
    status: string;
    paymentMethod: string;
    razorpayPaymentId: string;
  };
}

export default function InvoiceDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && params.id) {
      fetchInvoice();
    }
  }, [status, params.id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setInvoice(data.invoice);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error fetching invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoice',
        variant: 'destructive',
      });
      router.push('/bills');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!invoice) return;
    await downloadInvoiceAsPDF('invoice-html-container', `${invoice.invoiceNumber}.pdf`);
    toast({
      title: 'Invoice Downloaded',
      description: 'Your invoice has been downloaded successfully',
    });
  };

  // Helper function to convert number to words (simplified)
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    const convertTwoDigit = (n: number): string => {
      if (n < 10) return ones[n];
      if (n >= 10 && n < 20) return teens[n - 10];
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    };

    const convertThreeDigit = (n: number): string => {
      if (n === 0) return '';
      if (n < 100) return convertTwoDigit(n);
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertTwoDigit(n % 100) : '');
    };

    let integer = Math.floor(num);
    let result = '';

    if (integer >= 10000000) {
      result += convertThreeDigit(Math.floor(integer / 10000000)) + ' Crore ';
      integer %= 10000000;
    }
    if (integer >= 100000) {
      result += convertThreeDigit(Math.floor(integer / 100000)) + ' Lakh ';
      integer %= 100000;
    }
    if (integer >= 1000) {
      result += convertThreeDigit(Math.floor(integer / 1000)) + ' Thousand ';
      integer %= 1000;
    }
    if (integer > 0) {
      result += convertThreeDigit(integer);
    }

    return result.trim();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Invoice not found</h2>
          <Button onClick={() => router.push('/bills')} className="mt-4">
            Back to Bills
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Actions (not included in PDF) */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push('/bills')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bills
          </Button>
          <Button onClick={downloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
        {/* Invoice HTML container for PDF rendering */}
        <div id="invoice-html-container">

        {/* Invoice Card */}
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">SkillUpdate</h1>
                <p className="text-blue-100 mt-1">Learning Platform for Professional Growth</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold">TAX INVOICE</h2>
                <p className="text-blue-100 mt-1">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Company & Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">From</h3>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{invoice.companyName}</p>
                  <p className="text-sm text-gray-600">{invoice.companyAddress}</p>
                  <p className="text-sm text-gray-600">GSTIN: {invoice.companyGSTIN}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-3 w-3" />
                    {invoice.companyEmail}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    {invoice.companyPhone === '+91 22 9115 7332' ? '+91 22 9115 7332' : invoice.companyPhone}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Bill To</h3>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{invoice.customerName}</p>
                  {invoice.customerCompany && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-3 w-3" />
                      {invoice.customerCompany}
                    </div>
                  )}
                  {invoice.customerAddress && (
                    <p className="text-sm text-gray-600">{invoice.customerAddress}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-3 w-3" />
                    {invoice.customerEmail}
                  </div>
                  {invoice.customerPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      {invoice.customerPhone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Invoice Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase">Invoice Date</p>
                <p className="font-medium">
                  {new Date(invoice.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Payment Method</p>
                <p className="font-medium">{invoice.payment?.paymentMethod || invoice.paymentMethod || 'Manual'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Transaction ID</p>
                <p className="font-medium text-sm">{invoice.transactionId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Status</p>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${(invoice.payment?.status || 'COMPLETED') === 'COMPLETED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {invoice.payment?.status || 'COMPLETED'}
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Course Details Table */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Course Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Instructor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoice.courseDetails.map((course: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{course.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{course.instructor || 'SkillVoucher Instructor'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{course.duration || '90 days'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          ₹{course.price.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Summary */}
            <div className="flex justify-end">
              <div className="w-full md:w-1/2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST ({invoice.taxRate}%)</span>
                  <span className="font-medium">₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span>₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-500 italic">
                  Amount in Words: {numberToWords(invoice.totalAmount)} Rupees Only
                </p>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Notes</p>
                <p className="text-sm text-gray-700">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
              <p>This is a computer-generated invoice and does not require a signature.</p>
              <p className="mt-1">For any queries, please contact us at billing@skillupdate.com</p>
              <p className="mt-1">Visit us: <a href="https://skill-voucher-all.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://skill-voucher-all.vercel.app/</a></p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
