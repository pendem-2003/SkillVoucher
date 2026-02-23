'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/lib/cart-store';
import { ArrowLeft, Upload, CheckCircle2, Clock, QrCode, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

function ManualPaymentPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { items, clearCart } = useCart();

    const [loading, setLoading] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState<any>(null);
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [userNote, setUserNote] = useState('');
    const [upiId, setUpiId] = useState('');
    const [courses, setCourses] = useState<any[]>([]);
    const [billingInfo, setBillingInfo] = useState<any>({});

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }

        if (status === 'authenticated') {
            fetchPaymentSettings();
            loadCheckoutData();
        }
    }, [status]);

    const loadCheckoutData = () => {
        const courseIds = searchParams.get('courses')?.split(',') || [];
        const billing = searchParams.get('billing');

        if (billing) {
            try {
                setBillingInfo(JSON.parse(decodeURIComponent(billing)));
            } catch (e) { }
        }

        // Get courses from cart
        const cartCourses = items.filter(item => courseIds.includes(item.id));
        setCourses(cartCourses);
    };

    const fetchPaymentSettings = async () => {
        try {
            const response = await fetch('/api/payment/settings');
            const data = await response.json();
            if (data.success) {
                setPaymentSettings(data.settings);
            }
        } catch (error) {
            console.error('Error fetching payment settings:', error);
        }
    };

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'Please upload an image smaller than 5MB',
                    variant: 'destructive',
                });
                return;
            }

            setScreenshot(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied!',
            description: 'UPI ID copied to clipboard',
        });
    };

    const handleSubmit = async () => {
        if (!screenshot) {
            toast({
                title: 'Payment Proof Required',
                description: 'Please upload a screenshot of your payment',
                variant: 'destructive',
            });
            return;
        }

        if (!upiId || !upiId.includes('@')) {
            toast({
                title: 'UPI ID Required',
                description: 'Please provide a valid UPI ID for refund purposes',
                variant: 'destructive',
            });
            return;
        }

        try {
            setLoading(true);

            // In a real app, upload screenshot to cloud storage (Cloudinary, S3, etc.)
            // For now, we'll use the data URL
            const paymentProofUrl = previewUrl;

            const response = await fetch('/api/payment/manual/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    courseIds: courses.map(c => c.id),
                    billingInfo,
                    paymentProofUrl,
                    userNote,
                    upiId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit payment');
            }

            clearCart();

            toast({
                title: 'Payment Proof Submitted Successfully! ✅',
                description: 'Your payment is under review. You will receive a notification once verified (within 1-2 hours). Check your notifications for updates.',
                duration: 5000,
            });

            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);
        } catch (error: any) {
            console.error('Error submitting payment:', error);
            toast({
                title: 'Submission Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const totalAmount = courses.reduce((sum, course) => sum + course.price, 0);
    const taxAmount = Math.round(totalAmount * 0.18);
    const finalAmount = totalAmount + taxAmount;

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

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
                <p className="text-gray-600 mb-8">
                    Follow the steps below to complete your purchase
                </p>

                {/* Order Summary */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {courses.map((course) => (
                                <div key={course.id} className="flex justify-between">
                                    <span className="text-sm">{course.title}</span>
                                    <span className="text-sm font-medium">₹{course.price.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>₹{totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>GST (18%)</span>
                                    <span>₹{taxAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg mt-2">
                                    <span>Total Amount</span>
                                    <span className="text-blue-600">₹{finalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Instructions */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            Step 1: Make Payment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* QR Code */}
                            <div className="text-center">
                                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                                    {paymentSettings?.qrCodeUrl ? (
                                        <Image
                                            src={paymentSettings.qrCodeUrl}
                                            alt="Payment QR Code"
                                            width={200}
                                            height={200}
                                            className="w-48 h-48"
                                        />
                                    ) : (
                                        <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                                            <QrCode className="h-16 w-16 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">Scan QR code with any UPI app</p>
                            </div>

                            {/* UPI Details */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-semibold">UPI ID</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            value={paymentSettings?.upiId || 'Loading...'}
                                            readOnly
                                            className="font-mono"
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(paymentSettings?.upiId)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {paymentSettings?.bankName && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-xs font-semibold text-blue-900 mb-2">Bank Details (Alternative)</p>
                                        <div className="space-y-1 text-xs text-blue-800">
                                            <p><span className="font-medium">Bank:</span> {paymentSettings.bankName}</p>
                                            <p><span className="font-medium">Account:</span> {paymentSettings.accountNo}</p>
                                            <p><span className="font-medium">IFSC:</span> {paymentSettings.ifscCode}</p>
                                            <p><span className="font-medium">Name:</span> {paymentSettings.accountName}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-sm font-medium text-green-900">💡 Payment Tips</p>
                                    <ul className="text-xs text-green-800 mt-2 space-y-1">
                                        <li>• Pay exactly ₹{finalAmount.toLocaleString()}</li>
                                        <li>• Take a clear screenshot after payment</li>
                                        <li>• Keep transaction ID visible</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Upload Screenshot */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Step 2: Upload Payment Proof
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="screenshot">Payment Screenshot *</Label>
                            <Input
                                id="screenshot"
                                type="file"
                                accept="image/*"
                                onChange={handleScreenshotChange}
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Upload a clear screenshot showing transaction details (Max 5MB)
                            </p>
                        </div>

                        {previewUrl && (
                            <div className="border rounded-lg p-4">
                                <p className="text-sm font-medium mb-2">Preview:</p>
                                <Image
                                    src={previewUrl}
                                    alt="Payment proof preview"
                                    width={300}
                                    height={300}
                                    className="max-w-sm rounded border"
                                />
                            </div>
                        )}

                        <div>
                            <Label htmlFor="upiId">Your UPI ID (for refunds if needed) *</Label>
                            <Input
                                id="upiId"
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="yourname@paytm or 9876543210@ybl"
                                className="mt-1"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Provide your UPI ID in case a refund is needed (e.g., if payment verification fails)
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="note">Add a Note (Optional)</Label>
                            <Textarea
                                id="note"
                                value={userNote}
                                onChange={(e) => setUserNote(e.target.value)}
                                placeholder="Any additional information about your payment..."
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Verification Info */}
                <Card className="mb-6 bg-yellow-50 border-yellow-200">
                    <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-yellow-900">Verification Process</p>
                                <p className="text-sm text-yellow-800 mt-1">
                                    Our team will verify your payment within <strong>1-2 hours</strong>. Once verified, you'll receive a notification and immediate access to your courses with an invoice for proof of purchase and learning. You can use this invoice for company reimbursement if required.
                                </p>
                                <p className="text-sm text-yellow-800 mt-2">
                                    <strong>Note:</strong> If your payment cannot be verified, we will process your refund within <strong>24-48 hours</strong> and send you a refund screenshot via notifications. Please check your notifications regularly.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    disabled={loading || !screenshot || !upiId}
                    size="lg"
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Submit Payment Proof
                        </>
                    )}
                </Button>

                <p className="text-xs text-center text-gray-500 mt-4">
                    By submitting, you confirm that you have made the payment and provided accurate information
                </p>
            </div>
        </div>
    );
}

// Wrap with Suspense to handle useSearchParams
export default function ManualPaymentPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <ManualPaymentPage />
        </Suspense>
    );
}
