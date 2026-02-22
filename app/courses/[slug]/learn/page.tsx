'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PlayCircle, 
  CheckCircle, 
  Lock, 
  BookOpen, 
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  Award,
  FileText
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  isCompleted: boolean;
  videoUrl?: string;
  content?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  category: string;
  instructor?: string;
  thumbnail: string;
  modules: Module[];
}

interface Enrollment {
  id: string;
  progress: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  course: Course;
}

export default function CourseLearnPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/courses/${slug}/learn`);
    }
  }, [status, router, slug]);

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const response = await fetch(`/api/enrollments/course/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setEnrollment(data.enrollment);
          
          // Auto-expand first module and select first lesson
          if (data.enrollment?.course?.modules?.length > 0) {
            const firstModule = data.enrollment.course.modules[0];
            setExpandedModules(new Set([firstModule.id]));
            if (firstModule.lessons?.length > 0) {
              setCurrentLesson(firstModule.lessons[0]);
            }
          }
        } else if (response.status === 404) {
          // Not enrolled
          router.push(`/courses/${slug}`);
        }
      } catch (error) {
        console.error('Failed to fetch enrollment:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && slug) {
      fetchEnrollment();
    }
  }, [status, slug, router]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleMarkComplete = async () => {
    if (!currentLesson || !enrollment) return;

    setMarkingComplete(true);
    try {
      const response = await fetch('/api/progress/mark-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: enrollment.id,
          lessonId: currentLesson.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Lesson toggled, new progress:', data.overallProgress);
        
        // Update enrollment progress
        setEnrollment((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            progress: data.overallProgress,
            course: {
              ...prev.course,
              modules: prev.course.modules.map((module) => ({
                ...module,
                lessons: module.lessons.map((lesson) =>
                  lesson.id === currentLesson.id
                    ? { ...lesson, isCompleted: data.isCompleted }
                    : lesson
                ),
              })),
            },
          };
        });

        // Update current lesson
        setCurrentLesson((prev) => {
          if (!prev) return prev;
          return { ...prev, isCompleted: data.isCompleted };
        });

        const action = data.isCompleted ? 'marked as complete' : 'unmarked';
        alert(`Lesson ${action}! Your progress is now ${data.overallProgress}%`);
      } else {
        console.error('❌ Failed to toggle lesson:', data.error);
        alert(data.error || 'Failed to update lesson status');
      }
    } catch (error) {
      console.error('❌ Error toggling lesson:', error);
      alert('Failed to update lesson status. Please try again.');
    } finally {
      setMarkingComplete(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-6">You are not enrolled in this course.</p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(enrollment.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  ← Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{enrollment.course.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className="bg-blue-600">{enrollment.course.category}</Badge>
                  {enrollment.course.instructor && (
                    <span className="text-sm text-gray-600">by {enrollment.course.instructor}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-700">
                  Progress: {enrollment.progress}%
                </div>
                <div className="text-xs text-gray-500">
                  <Clock className="inline h-3 w-3 mr-1" />
                  {daysLeft} days left
                </div>
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                  style={{ width: `${enrollment.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {currentLesson ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {currentLesson.title}
                      </h2>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{currentLesson.duration} minutes</span>
                      </div>
                    </div>

                    {/* Video Player */}
                    {currentLesson.videoUrl ? (
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="100%"
                          src={currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be')
                            ? currentLesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                            : currentLesson.videoUrl}
                          title={currentLesson.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <PlayCircle className="mx-auto h-16 w-16 mb-4" />
                          <p className="text-lg">No Video Available</p>
                          <p className="text-sm text-gray-400 mt-2">
                            This lesson contains text content only
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Lesson Content */}
                    {currentLesson.content && (
                      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Lesson Content
                        </h3>
                        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {currentLesson.content}
                        </div>
                      </div>
                    )}

                    {/* Mark Complete Button */}
                    <div className="flex justify-between pt-4 border-t">
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Resources
                      </Button>
                      <Button 
                        onClick={handleMarkComplete}
                        disabled={markingComplete}
                        className={currentLesson.isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {markingComplete 
                          ? 'Updating...' 
                          : currentLesson.isCompleted 
                            ? 'Mark as Incomplete' 
                            : 'Mark as Complete'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a lesson to begin
                  </h3>
                  <p className="text-gray-600">
                    Choose a lesson from the curriculum on the right
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Curriculum */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Course Curriculum</h3>
                <div className="space-y-2">
                  {enrollment.course.modules.length > 0 ? (
                    enrollment.course.modules.map((module) => (
                      <div key={module.id} className="border rounded-lg">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            <div className="text-left">
                              <div className="font-semibold text-sm">{module.title}</div>
                              <div className="text-xs text-gray-500">
                                {module.lessons?.length || 0} lessons · {module.duration} min
                              </div>
                            </div>
                          </div>
                          {expandedModules.has(module.id) ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </button>

                        {expandedModules.has(module.id) && module.lessons && (
                          <div className="border-t">
                            {module.lessons.map((lesson) => (
                              <button
                                key={lesson.id}
                                onClick={() => setCurrentLesson(lesson)}
                                className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                                  currentLesson?.id === lesson.id ? 'bg-blue-50' : ''
                                }`}
                              >
                                {lesson.isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                ) : (
                                  <PlayCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                )}
                                <div className="flex-1 text-left">
                                  <div className="text-sm font-medium">{lesson.title}</div>
                                  <div className="text-xs text-gray-500">{lesson.duration} min</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600">No modules available yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
