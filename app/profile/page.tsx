'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase,
  Edit,
  Save,
  Award,
  ShoppingBag,
  Clock,
  FileText
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    designation: '',
    upiId: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          company: data.user.company || '',
          designation: data.user.designation || '',
          upiId: data.user.upiId || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          company: formData.company,
          designation: formData.designation,
          upiId: formData.upiId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Profile updated successfully!');
        setIsEditing(false);
        // Refresh the data
        await fetchProfile();
      } else {
        const error = await response.json();
        alert(`Failed to update profile: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('An error occurred while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Enrolled Courses', value: '2', icon: ShoppingBag, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: '0', icon: Award, color: 'from-green-500 to-green-600' },
    { label: 'Total Spent', value: '₹34,998', icon: FileText, color: 'from-purple-500 to-purple-600' },
    { label: 'Member Since', value: 'Jan 2026', icon: Clock, color: 'from-yellow-500 to-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-xl text-gray-600">Manage your account information</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card className="shadow-2xl border-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-xl">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Personal Information</CardTitle>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="border-2">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <Button onClick={handleSave} disabled={saving} className="shadow-xl">
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Full Name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email Address
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={true}
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Company
                  </label>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    Designation
                  </label>
                  <Input
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="shadow-2xl border-3">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-xl shadow-xl">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold">Account Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-1">Account Type</p>
                    <p className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Premium Member
                    </p>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 px-6 py-3 text-lg shadow-xl">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="shadow-2xl border-2 hover:scale-105 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-xl`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">{stat.label}</p>
                        <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
