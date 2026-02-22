'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  BarChart,
  Clock,
  Settings,
  MessageSquare
} from 'lucide-react';

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  activeCourses: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    activeCourses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Check if user is admin
      if (session?.user?.role !== 'ADMIN') {
        router.push('/');
      } else {
        fetchStats();
      }
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage courses, modules, and content</p>
          </div>
          <Link href="/admin/courses/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeCourses} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.5%</div>
              <p className="text-xs text-muted-foreground">
                vs last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/courses">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  Manage Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Create, edit, and manage all courses</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/books">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  Manage Books
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Create, edit, and manage all books</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/book-orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-green-600" />
                  Book Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Manage book orders and deliveries</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/book-requests">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-pink-600" />
                  Book Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Manage user book requests</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/payments/pending">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-orange-600" />
                  Pending Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Review & verify payment submissions</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings/payment">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="h-6 w-6 text-indigo-600" />
                  Payment Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Configure QR code & UPI details</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-green-600" />
                  Manage Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">View and manage user accounts</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart className="h-6 w-6 text-purple-600" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">View detailed analytics and reports</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/support">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                  Support Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Manage user support requests</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
