'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Award,
  CheckCircle2,
  PlayCircle,
  Download,
  ShoppingCart,
  ArrowLeft,
  TrendingUp,
  Globe,
  Smartphone
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  duration: number | null;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
  lessonCount: number;
  duration: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  description: string;
  thumbnail: string | null;
  price: number;
  category: string | null;
  level: string | null;
  rating: number;
  studentsCount: number;
  duration: string | null;
  language: string | null;
  instructor: string | null;
  whatYouLearn: string[];
  prerequisites: string[];
  modules: Module[];
  createdAt: string;
  updatedAt: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('overview');
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchCourse();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Course not found</h1>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const features = [
    '3 months full access',
    '50+ hours of video content',
    'Real-world projects',
    'Certificate of completion',
    'Reimbursement invoice included',
    'Lifetime community access',
    '24/7 support',
  ];

  const handleAddToCart = () => {
    addItem({
      id: course.id,
      title: course.title,
      price: course.price,
      thumbnail: course.thumbnail || '/placeholder-course.svg',
      slug: course.slug as string,
      instructor: course.instructor || undefined,
    });
    alert('Added to cart!');
  };

  const handleEnroll = () => {
    addItem({
      id: course.id,
      title: course.title,
      price: course.price,
      thumbnail: course.thumbnail || '/placeholder-course.svg',
      slug: course.slug as string,
      instructor: course.instructor || undefined,
    });
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Link href="/courses" className="inline-flex items-center gap-2 text-white hover:text-blue-100 mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-semibold">Back to Courses</span>
          </Link>

          <div className="grid gap-10 lg:grid-cols-3">
            {/* Course Info */}
            <div className="lg:col-span-2 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-white text-blue-600 hover:bg-white/90 border-0 px-4 py-2 text-base font-bold">
                  {course.category || 'General'}
                </Badge>
                <Badge className="bg-white/20 text-white border-0 px-4 py-2 text-base font-bold">
                  {course.level || 'Beginner'}
                </Badge>
              </div>
              
              <h1 className="text-5xl font-extrabold mb-4 drop-shadow-2xl">
                {course.title}
              </h1>
              
              <p className="text-xl text-white/90 mb-6 font-medium">
                {course.shortDesc || course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{course.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">{course.studentsCount.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">{course.duration || '3 months'} access</span>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <Card className="shadow-2xl border-3 sticky top-24">
                <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue-200 to-purple-200">
                  <Image
                    src={course.thumbnail || '/placeholder-course.svg'}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {formatCurrency(course.price)}
                    </div>
                    <p className="text-sm text-gray-600 font-semibold">One-time payment • 3 months access</p>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full shadow-2xl text-lg" size="lg" onClick={handleEnroll}>
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Enroll Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-2"
                      size="lg"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4 space-y-2">
                    <p className="text-sm font-bold text-gray-900 mb-3">This course includes:</p>
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tabs */}
              <Card className="shadow-2xl border-3">
                <CardHeader>
                  <div className="flex gap-4 border-b-2 border-gray-200 pb-4">
                    {['overview', 'curriculum', 'instructor'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-bold text-lg rounded-xl transition-all ${
                          activeTab === tab
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl'
                            : 'text-gray-600 hover:bg-blue-50'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h3>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {course.description}
                        </p>
                      </div>

                      {course.whatYouLearn && course.whatYouLearn.length > 0 && (
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h3>
                          <div className="grid gap-3 md:grid-cols-2">
                            {course.whatYouLearn.map((outcome, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                                <span className="text-gray-700">{outcome}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {course.prerequisites && course.prerequisites.length > 0 && (
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">Prerequisites</h3>
                          <div className="space-y-2">
                            {course.prerequisites.map((prereq, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <Award className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                                <span className="text-gray-700">{prereq}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'curriculum' && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h3>
                      {course.modules.length > 0 ? (
                        course.modules.map((module, index) => (
                          <Card key={module.id} className="border-2 hover:shadow-xl transition-all">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                                    {module.title}
                                  </h4>
                                  {module.description && (
                                    <p className="text-gray-600 mb-2">{module.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="h-4 w-4" />
                                      {module.lessonCount} lessons
                                    </span>
                                    {module.duration > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {Math.floor(module.duration / 60)}h {module.duration % 60}m
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                                  Module {index + 1}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-gray-600 text-center py-8">No modules available yet.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'instructor' && (
                    <div className="space-y-6">
                      <div className="flex items-start gap-6">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                          {course.instructor ? course.instructor.charAt(0).toUpperCase() : 'I'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {course.instructor || 'Instructor'}
                          </h3>
                          <p className="text-lg text-gray-600 mb-2">Course Instructor</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Course Stats */}
              <Card className="shadow-2xl border-3">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b-2 border-gray-200">
                    <div className="flex items-center gap-3 text-gray-700">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Level</span>
                    </div>
                    <span className="font-bold text-gray-900">{course.level || 'Beginner'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b-2 border-gray-200">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Language</span>
                    </div>
                    <span className="font-bold text-gray-900">{course.language || 'English'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b-2 border-gray-200">
                    <div className="flex items-center gap-3 text-gray-700">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Modules</span>
                    </div>
                    <span className="font-bold text-gray-900">{course.modules.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Last Updated</span>
                    </div>
                    <span className="font-bold text-gray-900">{new Date(course.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
