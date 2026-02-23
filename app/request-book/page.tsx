'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RequestBookPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        bookName: '',
        author: '',
        description: '',
        category: '',
        expectedPrice: '',
        priority: 'MEDIUM',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) {
            toast.error('Please login to request a book');
            router.push('/login');
            return;
        }

        if (!formData.bookName || !formData.description) {
            toast.error('Please fill required fields');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/book-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success('Book request submitted successfully!');
                router.push('/books');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Request error:', error);
            toast.error('Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <Link href="/books">
                    <Button variant="outline" className="mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Books
                    </Button>
                </Link>

                <Card className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Request a Book</h1>
                    </div>

                    <p className="text-gray-600 mb-8">
                        Can't find the book you're looking for? Request it here and we'll try to add it to our collection!
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Book Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={formData.bookName}
                                onChange={(e) => setFormData({ ...formData, bookName: e.target.value })}
                                placeholder="Enter book title"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Author
                            </label>
                            <Input
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                placeholder="Enter author name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">Select category</option>
                                <option value="Programming">Programming</option>
                                <option value="Business">Business</option>
                                <option value="Self-Help">Self-Help</option>
                                <option value="Novel">Novel</option>
                                <option value="Technical">Technical</option>
                                <option value="Biography">Biography</option>
                                <option value="Science">Science</option>
                                <option value="Fiction">Fiction</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Why do you want this book? What's it about?"
                                rows={4}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Expected Price (₹)
                            </label>
                            <Input
                                type="number"
                                value={formData.expectedPrice}
                                onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                                placeholder="Optional"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-6"
                            size="lg"
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
