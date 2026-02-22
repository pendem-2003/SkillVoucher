'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  DollarSign,
  BookOpen
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  level: string | null;
  price: number;
  thumbnail: string | null;
  studentsCount: number;
  isActive: boolean;
  isFeatured: boolean;
}

export default function AdminCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/');
      } else {
        fetchCourses();
      }
    }
  }, [status, session, router]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCourses(courses.filter(c => c.id !== courseId));
        alert('Course deleted successfully');
      } else {
        alert('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const toggleStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setCourses(courses.map(c => 
          c.id === courseId ? { ...c, isActive: !currentStatus } : c
        ));
      }
    } catch (error) {
      console.error('Error toggling course status:', error);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" className="mb-4">← Back to Dashboard</Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
            <p className="text-gray-600 mt-2">Create and manage your course catalog</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/courses/comprehensive">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Plus className="mr-2 h-5 w-5" />
                Create Course (All-in-One)
              </Button>
            </Link>
            <Link href="/admin/courses/new">
              <Button size="lg" variant="outline">
                <Plus className="mr-2 h-5 w-5" />
                Basic Course
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="relative h-32 w-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={course.thumbnail || '/placeholder-course.svg'}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                        <div className="flex items-center gap-3">
                          <Badge variant={course.isActive ? 'default' : 'secondary'}>
                            {course.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {course.isFeatured && (
                            <Badge className="bg-yellow-500">Featured</Badge>
                          )}
                          {course.category && (
                            <Badge variant="outline">{course.category}</Badge>
                          )}
                          {course.level && (
                            <Badge variant="outline">{course.level}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">₹{course.price.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.studentsCount} students
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ₹{(course.price * course.studentsCount).toLocaleString()} revenue
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href={`/courses/${course.slug}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/admin/courses/${course.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/admin/courses/${course.id}/modules`}>
                        <Button variant="outline" size="sm">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Modules
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(course.id, course.isActive)}
                      >
                        {course.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first course</p>
              <Link href="/admin/courses/new">
                <Button>
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
