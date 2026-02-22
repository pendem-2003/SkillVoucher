'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Clock
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number | null;
  videoUrl: string | null;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
}

export default function ModuleManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  
  // Module form
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

  // Lesson form
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    videoUrl: '',
    duration: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (courseId) {
      fetchCourse();
      fetchModules();
    }
  }, [status, session, router, courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`);
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...moduleForm,
          order: modules.length + 1
        })
      });

      if (response.ok) {
        fetchModules();
        setShowModuleForm(false);
        setModuleForm({ title: '', description: '' });
        alert('Module created successfully!');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      alert('Failed to create module');
    }
  };

  const handleCreateLesson = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    try {
      const module = modules.find(m => m.id === moduleId);
      const response = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lessonForm,
          duration: lessonForm.duration ? parseInt(lessonForm.duration) : null,
          order: (module?.lessons.length || 0) + 1
        })
      });

      if (response.ok) {
        fetchModules();
        setShowLessonForm(null);
        setLessonForm({ title: '', content: '', videoUrl: '', duration: '' });
        alert('Lesson created successfully!');
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Failed to create lesson');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure? This will delete all lessons in this module.')) return;

    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchModules();
        alert('Module deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchModules();
        alert('Lesson deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson');
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/admin/courses">
          <Button variant="outline" size="sm" className="mb-4">
            ← Back to Courses
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
            <p className="text-gray-600 mt-2">Manage modules and lessons</p>
          </div>
          <Button onClick={() => setShowModuleForm(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Add Module
          </Button>
        </div>

        {/* Create Module Form */}
        {showModuleForm && (
          <Card className="mb-6 border-2 border-blue-500">
            <CardHeader>
              <CardTitle>Create New Module</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateModule} className="space-y-4">
                <div>
                  <Label htmlFor="module-title">Module Title *</Label>
                  <Input
                    id="module-title"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Introduction to React"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="module-description">Description</Label>
                  <Textarea
                    id="module-description"
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this module..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Module</Button>
                  <Button type="button" variant="outline" onClick={() => setShowModuleForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <Card key={module.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="hover:bg-gray-100 p-2 rounded"
                    >
                      {expandedModules.has(module.id) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge>Module {moduleIndex + 1}</Badge>
                        <h3 className="text-lg font-bold">{module.title}</h3>
                      </div>
                      {module.description && (
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {module.lessons.length} lessons
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLessonForm(module.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedModules.has(module.id) && (
                <CardContent className="space-y-4">
                  {/* Add Lesson Form */}
                  {showLessonForm === module.id && (
                    <Card className="border-2 border-green-500">
                      <CardContent className="pt-6">
                        <form onSubmit={(e) => handleCreateLesson(e, module.id)} className="space-y-4">
                          <div>
                            <Label htmlFor="lesson-title">Lesson Title *</Label>
                            <Input
                              id="lesson-title"
                              value={lessonForm.title}
                              onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g., Understanding Props"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lesson-content">Content *</Label>
                            <Textarea
                              id="lesson-content"
                              value={lessonForm.content}
                              onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="Lesson description and content..."
                              rows={4}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="lesson-video">Video URL</Label>
                              <Input
                                id="lesson-video"
                                value={lessonForm.videoUrl}
                                onChange={(e) => setLessonForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                                placeholder="https://youtube.com/..."
                              />
                            </div>
                            <div>
                              <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                              <Input
                                id="lesson-duration"
                                type="number"
                                value={lessonForm.duration}
                                onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                                placeholder="30"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" size="sm">Create Lesson</Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowLessonForm(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lessons List */}
                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <PlayCircle className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-semibold">{lesson.title}</div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              {lesson.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration} min
                                </span>
                              )}
                              <span>Lesson {lessonIndex + 1}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {modules.length === 0 && !showModuleForm && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No modules yet</h3>
              <p className="text-gray-600 mb-6">Start building your course by adding modules</p>
              <Button onClick={() => setShowModuleForm(true)}>
                <Plus className="mr-2 h-5 w-5" />
                Create First Module
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
