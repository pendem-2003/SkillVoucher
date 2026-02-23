'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  PlayCircle,
  Download,
  Star
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface EnrolledCourse {
  id: string;
  courseId: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    price: number;
    category: string;
    instructor?: string;
  };
  startDate: string;
  endDate: string;
  progress: number;
  isActive: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch real enrollments from database
    const fetchEnrollments = async () => {
      try {
        const response = await fetch('/api/enrollments');
        if (response.ok) {
          const data = await response.json();
          setEnrolledCourses(data.enrollments || []);
        }
      } catch (error) {
        console.error('Failed to fetch enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchEnrollments();
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Enrolled Courses', value: enrolledCourses.length.toString(), icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: '0', icon: Award, color: 'from-green-500 to-green-600' },
    { label: 'In Progress', value: enrolledCourses.length.toString(), icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Certificates', value: '0', icon: GraduationCap, color: 'from-yellow-500 to-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                My Learning
              </h1>
              <p className="text-xl text-gray-600">
                Welcome back, {session?.user?.name || 'Learner'}! 🎓
              </p>
            </div>
            <Link href="/courses">
              <Button size="lg" className="shadow-2xl">
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="shadow-2xl border-2 hover:scale-105 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-xl`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
                      <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enrolled Courses */}
        <Card className="shadow-2xl border-3">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">My Courses</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-20">
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6">
                  <BookOpen className="h-16 w-16 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No courses yet</h3>
                <p className="text-gray-600 mb-6">Start your learning journey today!</p>
                <Link href="/courses">
                  <Button size="lg" className="shadow-2xl">
                    Explore Courses
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {enrolledCourses.map((enrollment) => {
                  const daysLeft = Math.ceil(
                    (new Date(enrollment.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <Card key={enrollment.id} className="overflow-hidden border-2 hover:shadow-2xl transition-all">
                      <div className="p-6">
                        <div className="flex gap-6">
                          {/* Thumbnail */}
                          <div className="relative h-40 w-60 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-blue-200 to-purple-200">
                            {enrollment.course.thumbnail ? (
                              <Image
                                src={enrollment.course.thumbnail}
                                alt={enrollment.course.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <BookOpen className="w-20 h-20 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 space-y-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                                  {enrollment.course.category}
                                </Badge>
                                <Badge variant="outline" className="border-2">
                                  {enrollment.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </Badge>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {enrollment.course.title}
                              </h3>
                            </div>

                            {/* Progress Bar */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">
                                  Progress: {enrollment.progress}%
                                </span>
                                <span className="text-sm text-gray-600">
                                  <Clock className="inline h-4 w-4 mr-1" />
                                  {daysLeft} days left
                                </span>
                              </div>
                              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
                                  style={{ width: `${enrollment.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                              <Link href={`/courses/${enrollment.course.slug}/learn`} className="flex-1">
                                <Button className="w-full shadow-xl" size="lg">
                                  <PlayCircle className="mr-2 h-5 w-5" />
                                  Continue Learning
                                </Button>
                              </Link>
                              <Button variant="outline" size="lg" className="border-2">
                                <Download className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
