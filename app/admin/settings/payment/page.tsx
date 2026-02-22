'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { QrCode, IndianRupee, Building2, Save, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface PaymentSettings {
  upiId: string;
  qrCodeUrl: string;
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;
  accountName?: string;
}

export default function PaymentSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PaymentSettings>({
    upiId: '',
    qrCodeUrl: '',
    bankName: '',
    accountNo: '',
    ifscCode: '',
    accountName: '',
  });
  const [qrPreview, setQrPreview] = useState<string>('');

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
      fetchSettings();
    }
  }, [status, session]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/payment/settings');
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setQrPreview(data.settings.qrCodeUrl);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSettings({ ...settings, qrCodeUrl: base64 });
      setQrPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!settings.upiId || !settings.qrCodeUrl) {
      toast({
        title: 'Missing Information',
        description: 'UPI ID and QR Code are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const response = await fetch('/api/payment/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      toast({
        title: 'Settings Saved ✅',
        description: 'Payment settings updated successfully',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <IndianRupee className="h-8 w-8 text-green-600" />
            Payment Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Configure UPI, QR Code, and bank details for manual payments
          </p>
        </div>

        <div className="grid gap-6">
          {/* UPI Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                UPI Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="upiId">UPI ID *</Label>
                <Input
                  id="upiId"
                  value={settings.upiId}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  placeholder="yourname@paytm"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be shown to users for payment
                </p>
              </div>

              <div>
                <Label htmlFor="qrCode">QR Code Image *</Label>
                <div className="mt-1">
                  <Input
                    id="qrCode"
                    type="file"
                    accept="image/*"
                    onChange={handleQrCodeUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your UPI QR code (max 2MB)
                  </p>
                </div>

                {qrPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Current QR Code:</p>
                    <div className="border rounded-lg p-4 bg-white inline-block">
                      <Image
                        src={qrPreview}
                        alt="QR Code"
                        width={200}
                        height={200}
                        className="w-48 h-48"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bank Details (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Bank Transfer Details (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={settings.bankName || ''}
                    onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                    placeholder="State Bank of India"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input
                    id="accountName"
                    value={settings.accountName || ''}
                    onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="accountNo">Account Number</Label>
                  <Input
                    id="accountNo"
                    value={settings.accountNo || ''}
                    onChange={(e) => setSettings({ ...settings, accountNo: e.target.value })}
                    placeholder="1234567890"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={settings.ifscCode || ''}
                    onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value })}
                    placeholder="SBIN0001234"
                    className="mt-1"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Bank details are optional and will be shown to users as alternative payment method
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

          {/* Info Box */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <p className="text-sm text-blue-900">
                <strong>Important:</strong> These details will be shown to all users during checkout. Make sure the QR code and UPI ID are correct and belong to your business account.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
