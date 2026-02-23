'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2, ArrowRight, CreditCard, Tag, ShoppingBag, BookOpen } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, clearCart, getTotal } = useCart();
  const [couponCode, setCouponCode] = useState('');

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    // Navigate to checkout
    window.location.href = '/checkout';
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Card className="text-center py-20 shadow-2xl border-3">
            <CardContent className="space-y-6">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
                <ShoppingBag className="h-16 w-16 text-blue-600" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Cart is Empty
              </h2>
              <p className="text-xl text-gray-600">
                Start adding courses to your cart and begin your learning journey!
              </p>
              <Link href="/courses">
                <Button size="lg" className="shadow-2xl text-lg px-8">
                  Browse Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-2xl">
              <ShoppingCart className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Shopping Cart
              </h1>
              <p className="text-xl text-gray-600 mt-2">{items.length} courses in your cart</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-2xl transition-all border-2">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <div className="relative h-32 w-48 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="mt-4">
                        <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatCurrency(item.price)}
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="border-2 hover:border-red-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-2xl border-3">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Coupon */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Have a coupon code?
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button variant="outline" className="border-2">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-200" />

                {/* Price Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-green-600">₹0</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-xl font-bold">Total</span>
                      <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatCurrency(getTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full shadow-2xl text-lg"
                  size="lg"
                  onClick={handleCheckout}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Checkout
                </Button>

                {/* Clear Cart */}
                <Button
                  variant="outline"
                  className="w-full border-2"
                  onClick={clearCart}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cart
                </Button>

                {/* Info */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Note:</strong> All courses include 3 months access and downloadable invoices for proof of purchase and learning. You can use these invoices for company reimbursement if required.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
