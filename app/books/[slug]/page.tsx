'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Star, ShoppingCart, Package, ArrowLeft, Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

export default function BookDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderForm, setOrderForm] = useState({
        quantity: 1,
        deliveryName: '',
        deliveryPhone: '',
        deliveryEmail: '',
        deliveryAddress: '',
        deliveryCity: '',
        deliveryState: '',
        deliveryPincode: '',
        deliveryLandmark: '',
        paymentScreenshot: '',
        upiId: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Test log
    console.log('BookDetailsPage rendered', { showOrderForm, orderForm });

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await fetch(`/api/books/${resolvedParams.slug}`);
                if (response.ok) {
                    const data = await response.json();
                    setBook(data.book);
                } else {
                    toast.error('Book not found');
                    router.push('/books');
                }
            } catch (error) {
                console.error('Failed to fetch book:', error);
                toast.error('Failed to load book details');
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [resolvedParams.slug, router]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploading(true);
        const reader = new FileReader();

        reader.onloadend = () => {
            const base64String = reader.result as string;
            setOrderForm(prev => ({ ...prev, paymentScreenshot: base64String }));
            setUploading(false);
            toast.success('Screenshot uploaded successfully');
        };

        reader.onerror = () => {
            toast.error('Failed to read file');
            setUploading(false);
        };

        reader.readAsDataURL(file);
    };

    const handleOrderSubmit = async () => {
        console.log('=== ORDER SUBMIT START ===');
        console.log('Session:', session);
        console.log('Order form data:', orderForm);
        console.log('Book ID:', book?.id);

        if (!session) {
            console.log('❌ No session');
            toast.error('Please login to order');
            router.push('/login');
            return;
        }

        // Check each field individually
        if (!orderForm.deliveryName) {
            console.log('❌ Missing: deliveryName');
            toast.error('Please enter your name');
            return;
        }
        if (!orderForm.deliveryPhone) {
            console.log('❌ Missing: deliveryPhone');
            toast.error('Please enter your phone number');
            return;
        }
        if (!orderForm.deliveryEmail) {
            console.log('❌ Missing: deliveryEmail');
            toast.error('Please enter your email');
            return;
        }
        if (!orderForm.deliveryAddress) {
            console.log('❌ Missing: deliveryAddress');
            toast.error('Please enter your address');
            return;
        }
        if (!orderForm.deliveryCity) {
            console.log('❌ Missing: deliveryCity');
            toast.error('Please enter your city');
            return;
        }
        if (!orderForm.deliveryState) {
            console.log('❌ Missing: deliveryState');
            toast.error('Please enter your state');
            return;
        }
        if (!orderForm.deliveryPincode) {
            console.log('❌ Missing: deliveryPincode');
            toast.error('Please enter your pincode');
            return;
        }

        if (!orderForm.upiId) {
            console.log('❌ Missing: upiId');
            toast.error('Please enter your UPI ID');
            return;
        }

        if (!orderForm.paymentScreenshot) {
            console.log('❌ Missing: paymentScreenshot');
            toast.error('Please upload payment screenshot');
            return;
        }

        console.log('✅ All validations passed!');
        console.log('Starting API call...');
        setSubmitting(true);

        try {
            const payload = {
                bookId: book.id,
                ...orderForm,
            };
            console.log('API Payload:', payload);

            const response = await fetch('/api/book-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            console.log('API Response status:', response.status);

            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('Failed to parse response:', e);
                data = { error: 'Invalid server response' };
            }

            console.log('API Response data:', data);

            if (response.ok) {
                console.log('✅ Order placed successfully!');
                toast.success('Order placed successfully! We will process your order soon.');
                router.push('/dashboard');
            } else {
                console.error('❌ API Error:', data);
                console.error('❌ Status:', response.status);
                console.error('❌ Status Text:', response.statusText);
                toast.error(data.error || data.details || 'Failed to place order');
            }
        } catch (error) {
            console.error('❌ Network/Fetch error:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setSubmitting(false);
            console.log('=== ORDER SUBMIT END ===');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!book) {
        return null;
    }

    const totalAmount = book.price * orderForm.quantity;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
            <div className="container mx-auto px-4">
                <Link href="/books">
                    <Button variant="outline" className="mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Books
                    </Button>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Book Image & Info */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-24">
                            <div className="relative h-96 mb-6 rounded-lg overflow-hidden">
                                {book.thumbnail ? (
                                    <Image
                                        src={book.thumbnail}
                                        alt={book.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <BookOpen className="h-24 w-24 text-white" />
                                    </div>
                                )}
                                {book.isFeatured && (
                                    <Badge className="absolute top-3 right-3 bg-yellow-500">
                                        Featured
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-4xl font-bold text-blue-600">
                                        ₹{book.price}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                        <span className="ml-1 font-medium">
                                            {book.rating?.toFixed(1) || '4.5'}
                                        </span>
                                    </div>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-600">
                                        {book.ordersCount || 0} orders
                                    </span>
                                </div>

                                {!showOrderForm ? (
                                    <Button
                                        type="button"
                                        className="w-full py-6 text-lg"
                                        size="lg"
                                        onClick={() => {
                                            if (!session) {
                                                toast.error('Please login to order');
                                                router.push('/login');
                                                return;
                                            }
                                            setShowOrderForm(true);
                                            setOrderForm({
                                                ...orderForm,
                                                deliveryName: session?.user?.name || '',
                                                deliveryEmail: session?.user?.email || '',
                                            });
                                        }}
                                    >
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Order Now
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setShowOrderForm(false)}
                                    >
                                        Cancel Order
                                    </Button>
                                )}

                                <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package className="h-5 w-5 text-green-600" />
                                        <span className="font-semibold text-green-900">Fast Delivery</span>
                                    </div>
                                    <p className="text-sm text-green-800">
                                        Book will be delivered within 3 days after payment approval!
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Book Details or Order Form */}
                    <div className="lg:col-span-2">
                        {!showOrderForm ? (
                            <Card className="p-8">
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    {book.title}
                                </h1>
                                <p className="text-xl text-gray-600 mb-6">
                                    by <span className="font-semibold text-blue-600">{book.author}</span>
                                </p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    <Badge variant="outline">{book.category}</Badge>
                                    <Badge variant="outline">{book.language}</Badge>
                                    {book.pages && <Badge variant="outline">{book.pages} pages</Badge>}
                                    {book.publisher && <Badge variant="outline">{book.publisher}</Badge>}
                                    {book.publishedYear && <Badge variant="outline">{book.publishedYear}</Badge>}
                                </div>

                                <div className="prose max-w-none">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Book</h2>
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {book.description}
                                    </p>

                                    {book.isbn && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">ISBN</h3>
                                            <p className="text-gray-600">{book.isbn}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ) : (
                            <Card className="p-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                    Complete Your Order
                                </h2>

                                <div className="space-y-6">
                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Quantity
                                        </label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={orderForm.quantity}
                                            onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>

                                    {/* Delivery Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                value={orderForm.deliveryName}
                                                onChange={(e) => setOrderForm({ ...orderForm, deliveryName: e.target.value })}
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                value={orderForm.deliveryPhone}
                                                onChange={(e) => setOrderForm({ ...orderForm, deliveryPhone: e.target.value })}
                                                placeholder="+91 22 9115 7332"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="email"
                                                value={orderForm.deliveryEmail}
                                                onChange={(e) => setOrderForm({ ...orderForm, deliveryEmail: e.target.value })}
                                                placeholder="john@example.com"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">
                                                Complete Address <span className="text-red-500">*</span>
                                            </label>
                                            <Textarea
                                                value={orderForm.deliveryAddress}
                                                onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                                                placeholder="House/Flat no., Street, Area"
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                value={orderForm.deliveryCity}
                                                onChange={(e) => setOrderForm({ ...orderForm, deliveryCity: e.target.value })}
                                                placeholder="Mumbai"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                State <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                value={orderForm.deliveryState}
                                                onChange={(e) => setOrderForm({ ...orderForm, deliveryState: e.target.value })}
                                                placeholder="Maharashtra"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Pincode <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                value={orderForm.deliveryPincode}
                                                onChange={(e) => setOrderForm({ ...orderForm, deliveryPincode: e.target.value })}
                                                placeholder="400001"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Landmark (Optional)
                                            </label>
                                            <Input
                                                value={orderForm.deliveryLandmark}
                                                onChange={(e) => setOrderForm({ ...orderForm, deliveryLandmark: e.target.value })}
                                                placeholder="Near ABC Mall"
                                            />
                                        </div>
                                    </div>

                                    {/* UPI ID for Refund */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            UPI ID <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            value={orderForm.upiId}
                                            onChange={(e) => setOrderForm({ ...orderForm, upiId: e.target.value })}
                                            placeholder="yourname@paytm / yourname@ybl"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Required for payment verification and refunds (if any)
                                        </p>
                                    </div>

                                    {/* Payment Screenshot */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Payment Screenshot <span className="text-red-500">*</span>
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            {orderForm.paymentScreenshot ? (
                                                <div className="space-y-4">
                                                    {/* Use regular img tag for base64 images */}
                                                    <img
                                                        src={orderForm.paymentScreenshot}
                                                        alt="Payment Screenshot"
                                                        className="mx-auto rounded-lg max-w-[200px] h-auto"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setOrderForm({ ...orderForm, paymentScreenshot: '' })}
                                                    >
                                                        Change Screenshot
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div>
                                                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            disabled={uploading}
                                                            className="max-w-xs mx-auto"
                                                        />
                                                        <p className="text-sm text-gray-500 mt-2">
                                                            {uploading ? 'Uploading...' : 'Upload payment screenshot (Max 5MB)'}
                                                        </p>
                                                    </div>
                                                    <div className="text-left max-w-md mx-auto">
                                                        <p className="text-sm text-gray-600 mb-2">Or enter image URL:</p>
                                                        <Input
                                                            type="url"
                                                            value={orderForm.paymentScreenshot}
                                                            onChange={(e) => setOrderForm({ ...orderForm, paymentScreenshot: e.target.value })}
                                                            placeholder="https://example.com/payment-screenshot.jpg"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <Card className="p-6 bg-blue-50 border-blue-200">
                                        <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Book Price:</span>
                                                <span className="font-semibold">₹{book.price}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Quantity:</span>
                                                <span className="font-semibold">{orderForm.quantity}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                                <span>Total Amount:</span>
                                                <span className="text-blue-600">₹{totalAmount}</span>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Submit Button */}
                                    <Button
                                        type="button"
                                        className="w-full py-6 text-lg"
                                        size="lg"
                                        onClick={handleOrderSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Placing Order...' : 'Place Order & Pay'}
                                    </Button>

                                    <p className="text-sm text-gray-600 text-center">
                                        Your book will be delivered within 3 days after payment approval.
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
