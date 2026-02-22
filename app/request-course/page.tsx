'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Send, CheckCircle2 } from 'lucide-react';

export default function RequestCoursePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    courseName: '',
    description: '',
    category: '',
    expectedPrice: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      alert('Please login to request a course');
      router.push('/login');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/course-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      alert('Course request submitted successfully! We will review it and get back to you.');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Request error:', error);
      setError(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const categories = [
    "Web Development",
    "Data Science",
    "Cloud Computing",
    "Programming",
    "DevOps",
    "Design",
    "Security",
    "Mobile Development",
    "AI & ML",
    "Other"
  ];

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 mb-12">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Lightbulb className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Request a Course
          </h1>
          <p className="text-xl text-blue-100">
            Can't find what you're looking for? Let us know and we'll create it!
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Tell Us What You Want to Learn</CardTitle>
            <CardDescription className="text-base">
              We review all requests and prioritize based on demand. Popular requests are added within 30 days.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Course Name */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Course Name *
                </label>
                <Input
                  name="courseName"
                  type="text"
                  required
                  placeholder="e.g., Advanced Kubernetes for Production"
                  value={formData.courseName}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Course Description *
                </label>
                <Textarea
                  name="description"
                  required
                  placeholder="Describe what topics and skills you want this course to cover..."
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Be specific about what you want to learn and why it's valuable
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={formData.category === category ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2"
                      onClick={() => setFormData({ ...formData, category })}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Expected Price */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Expected Price Range (Optional)
                </label>
                <Input
                  name="expectedPrice"
                  type="text"
                  placeholder="e.g., ₹10,000 - ₹15,000"
                  value={formData.expectedPrice}
                  onChange={handleChange}
                />
              </div>

              {/* Benefits Info */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 text-sm text-gray-700">
                      <p className="font-semibold">What happens next?</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>We review your request within 48 hours</li>
                        <li>If approved, we'll notify you when the course is ready</li>
                        <li>You'll get early access with a special discount</li>
                        <li>Your feedback helps shape the curriculum</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Submitting...' : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Submit Request
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">250+</div>
              <div className="text-sm text-gray-600 mt-1">Requests Received</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600">150+</div>
              <div className="text-sm text-gray-600 mt-1">Courses Created</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">30 Days</div>
              <div className="text-sm text-gray-600 mt-1">Avg. Turnaround</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
