'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, ChevronDown, ChevronUp, Trash2, Save, Video, FileText } from 'lucide-react';

interface Lesson {
  id?: string;
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
  order: number;
}

interface Module {
  id?: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  isExpanded?: boolean;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string;
  thumbnail: string;
  price: number;
  duration: string;
  category: string;
  level: string;
  language: string;
  instructor: string;
  isActive: boolean;
  isFeatured: boolean;
  whatYouLearn: string[];
  prerequisites: string[];
  modules: Module[];
}

export default function EditCoursePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDesc: '',
    thumbnail: '',
    price: '',
    duration: '3 months',
    category: 'Technology',
    level: 'Beginner',
    language: 'English',
    instructor: '',
    isActive: true,
    isFeatured: false,
  });

  const [whatYouLearn, setWhatYouLearn] = useState<string[]>(['']);
  const [prerequisites, setPrerequisites] = useState<string[]>(['']);
  const [modules, setModules] = useState<Module[]>([]);
  const [deletedModules, setDeletedModules] = useState<string[]>([]);
  const [deletedLessons, setDeletedLessons] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchCourse();
    }
  }, [status, session, router]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`);
      if (res.ok) {
        const course: Course = await res.json();
        setFormData({
          title: course.title,
          slug: course.slug,
          description: course.description,
          shortDesc: course.shortDesc,
          thumbnail: course.thumbnail || '',
          price: course.price.toString(),
          duration: course.duration,
          category: course.category,
          level: course.level,
          language: course.language,
          instructor: course.instructor,
          isActive: course.isActive,
          isFeatured: course.isFeatured,
        });
        setWhatYouLearn(course.whatYouLearn.length ? course.whatYouLearn : ['']);
        setPrerequisites(course.prerequisites.length ? course.prerequisites : ['']);
        setModules(
          course.modules.map(m => ({
            ...m,
            isExpanded: false,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const addModule = () => {
    setModules(prev => [
      ...prev,
      {
        title: '',
        description: '',
        order: prev.length + 1,
        lessons: [],
        isExpanded: true,
      },
    ]);
  };

  const removeModule = (index: number) => {
    const module = modules[index];
    if (module.id) {
      setDeletedModules(prev => [...prev, module.id!]);
    }
    setModules(prev => prev.filter((_, i) => i !== index));
  };

  const updateModule = (index: number, field: string, value: any) => {
    setModules(prev =>
      prev.map((module, i) =>
        i === index ? { ...module, [field]: value } : module
      )
    );
  };

  const toggleModuleExpand = (index: number) => {
    setModules(prev =>
      prev.map((module, i) =>
        i === index ? { ...module, isExpanded: !module.isExpanded } : module
      )
    );
  };

  const addLesson = (moduleIndex: number) => {
    setModules(prev =>
      prev.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: [
                ...module.lessons,
                {
                  title: '',
                  content: '',
                  videoUrl: '',
                  duration: 0,
                  order: module.lessons.length + 1,
                },
              ],
            }
          : module
      )
    );
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const lesson = modules[moduleIndex].lessons[lessonIndex];
    if (lesson.id) {
      setDeletedLessons(prev => [...prev, lesson.id!]);
    }
    setModules(prev =>
      prev.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.filter((_, li) => li !== lessonIndex),
            }
          : module
      )
    );
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, field: string, value: any) => {
    setModules(prev =>
      prev.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, li) =>
                li === lessonIndex ? { ...lesson, [field]: value } : lesson
              ),
            }
          : module
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Step 1: Update course basic info
      const courseResponse = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          whatYouLearn: whatYouLearn.filter(item => item.trim() !== ''),
          prerequisites: prerequisites.filter(item => item.trim() !== ''),
        }),
      });

      if (!courseResponse.ok) {
        throw new Error('Failed to update course');
      }

      // Step 2: Delete removed modules
      for (const moduleId of deletedModules) {
        await fetch(`/api/admin/modules/${moduleId}`, {
          method: 'DELETE',
        });
      }

      // Step 3: Delete removed lessons
      for (const lessonId of deletedLessons) {
        await fetch(`/api/admin/lessons/${lessonId}`, {
          method: 'DELETE',
        });
      }

      // Step 4: Update/create modules and lessons
      for (const module of modules) {
        if (!module.title.trim()) continue;

        let moduleId = module.id;

        if (moduleId) {
          // Update existing module
          await fetch(`/api/admin/modules/${moduleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: module.title,
              description: module.description,
              order: module.order,
            }),
          });
        } else {
          // Create new module
          const moduleResponse = await fetch(`/api/admin/courses/${courseId}/modules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: module.title,
              description: module.description,
              order: module.order,
            }),
          });

          if (moduleResponse.ok) {
            const createdModule = await moduleResponse.json();
            moduleId = createdModule.id;
          }
        }

        // Handle lessons for this module
        for (const lesson of module.lessons) {
          if (!lesson.title.trim() || !moduleId) continue;

          if (lesson.id) {
            // Update existing lesson
            await fetch(`/api/admin/lessons/${lesson.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl,
                duration: lesson.duration,
                order: lesson.order,
              }),
            });
          } else {
            // Create new lesson
            await fetch(`/api/admin/modules/${moduleId}/lessons`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl,
                duration: lesson.duration,
                order: lesson.order,
              }),
            });
          }
        }
      }

      alert('Course updated successfully!');
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Edit Course
          </h1>
          <p className="text-gray-600">Update course details, modules, and lessons</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information - Same as create */}
          <Card className="border-2 border-blue-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shortDesc">Short Description *</Label>
                <Input
                  id="shortDesc"
                  name="shortDesc"
                  value={formData.shortDesc}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="thumbnail">Thumbnail URL *</Label>
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/photo-..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Provide a direct image URL. Recommended size: 800x600px
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="instructor">Instructor *</Label>
                  <Input
                    id="instructor"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({...prev, level: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({...prev, language: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* What You'll Learn */}
          <Card className="border-2 border-green-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {whatYouLearn.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateArrayItem(setWhatYouLearn, index, e.target.value)}
                    placeholder="Learning outcome..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem(setWhatYouLearn, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => addArrayItem(setWhatYouLearn)}>
                <Plus className="h-4 w-4 mr-2" /> Add Learning Outcome
              </Button>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card className="border-2 border-yellow-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-green-50">
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {prerequisites.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateArrayItem(setPrerequisites, index, e.target.value)}
                    placeholder="Prerequisite..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem(setPrerequisites, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => addArrayItem(setPrerequisites)}>
                <Plus className="h-4 w-4 mr-2" /> Add Prerequisite
              </Button>
            </CardContent>
          </Card>

          {/* Modules & Lessons - Same structure as create */}
          <Card className="border-2 border-purple-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center justify-between">
                <span>Course Curriculum (Modules & Lessons)</span>
                <Button type="button" onClick={addModule} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Module
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {modules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No modules yet. Click "Add Module" to get started.</p>
                </div>
              ) : (
                modules.map((module, moduleIndex) => (
                  <Card key={moduleIndex} className="border-2 border-gray-200">
                    <CardHeader className="bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Input
                            value={module.title}
                            onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                            placeholder={`Module ${moduleIndex + 1} Title`}
                            className="font-semibold text-lg mb-2"
                          />
                          <Textarea
                            value={module.description}
                            onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                            placeholder="Module description..."
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleModuleExpand(moduleIndex)}
                          >
                            {module.isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeModule(moduleIndex)}
                          >
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {module.isExpanded && (
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-700">Lessons</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addLesson(moduleIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Lesson
                          </Button>
                        </div>

                        {module.lessons.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">No lessons yet</p>
                        ) : (
                          module.lessons.map((lesson, lessonIndex) => (
                            <Card key={lessonIndex} className="border border-gray-200">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Input
                                      value={lesson.title}
                                      onChange={(e) =>
                                        updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)
                                      }
                                      placeholder={`Lesson ${lessonIndex + 1} Title`}
                                      className="flex-1 font-medium"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                      className="ml-2"
                                    >
                                      <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-semibold text-gray-700 mb-1">
                                      Lesson Content *
                                    </Label>
                                    <Textarea
                                      value={lesson.content}
                                      onChange={(e) =>
                                        updateLesson(moduleIndex, lessonIndex, 'content', e.target.value)
                                      }
                                      placeholder="Enter detailed lesson content, explanations, key points, and learning materials. This will be displayed to students alongside the video."
                                      rows={5}
                                      className="resize-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Write comprehensive content that students will read. Supports plain text and line breaks.
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-sm font-semibold flex items-center gap-1 text-gray-700 mb-1">
                                        <Video className="h-4 w-4 text-red-600" /> YouTube Video URL *
                                      </Label>
                                      <Input
                                        value={lesson.videoUrl}
                                        onChange={(e) =>
                                          updateLesson(moduleIndex, lessonIndex, 'videoUrl', e.target.value)
                                        }
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="text-sm"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Paste the full YouTube URL. Video will be embedded on the course page.
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-semibold text-gray-700 mb-1">Duration (minutes) *</Label>
                                      <Input
                                        type="number"
                                        value={lesson.duration}
                                        onChange={(e) =>
                                          updateLesson(moduleIndex, lessonIndex, 'duration', parseInt(e.target.value) || 0)
                                        }
                                        placeholder="e.g., 15"
                                        className="text-sm"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Video length in minutes
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
