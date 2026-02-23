'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Plus, Edit, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function AdminBooksPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBook, setEditingBook] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        shortDesc: '',
        author: '',
        thumbnail: '',
        price: '',
        category: 'Programming',
        language: 'English',
        pages: '',
        publisher: '',
        publishedYear: '',
        isbn: '',
        isActive: true,
        isFeatured: false,
    });

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        fetchBooks();
    }, [session, router]);

    const fetchBooks = async () => {
        try {
            const response = await fetch('/api/admin/books');
            if (response.ok) {
                const data = await response.json();
                setBooks(data.books || []);
            }
        } catch (error) {
            console.error('Failed to fetch books:', error);
            toast.error('Failed to fetch books');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('upload_preset', 'skillupdate');

        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

            if (!cloudName) {
                toast.error('Cloudinary is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your .env.local file');
                setUploading(false);
                return;
            }

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formDataUpload,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Cloudinary error:', errorData);
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await response.json();
            setFormData({ ...formData, thumbnail: data.secure_url });
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.author || !formData.description || !formData.price) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const url = editingBook
                ? `/api/admin/books/${editingBook.id}`
                : '/api/admin/books';
            const method = editingBook ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(editingBook ? 'Book updated!' : 'Book created!');
                setShowForm(false);
                setEditingBook(null);
                resetForm();
                fetchBooks();
            } else {
                toast.error(data.error || 'Failed to save book');
                console.error('API Error:', data);
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save book. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            const response = await fetch(`/api/admin/books/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Book deleted!');
                fetchBooks();
            } else {
                toast.error('Failed to delete book');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete book');
        }
    };

    const handleEdit = (book: any) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            slug: book.slug,
            description: book.description,
            shortDesc: book.shortDesc || '',
            author: book.author,
            thumbnail: book.thumbnail || '',
            price: book.price.toString(),
            category: book.category,
            language: book.language,
            pages: book.pages?.toString() || '',
            publisher: book.publisher || '',
            publishedYear: book.publishedYear?.toString() || '',
            isbn: book.isbn || '',
            isActive: book.isActive,
            isFeatured: book.isFeatured,
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            description: '',
            shortDesc: '',
            author: '',
            thumbnail: '',
            price: '',
            category: 'Programming',
            language: 'English',
            pages: '',
            publisher: '',
            publishedYear: '',
            isbn: '',
            isActive: true,
            isFeatured: false,
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                        Manage Books
                    </h1>
                    <p className="text-gray-600 mt-2">{books.length} books in catalog</p>
                </div>
                <Button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingBook(null);
                        resetForm();
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Book
                </Button>
            </div>

            {showForm && (
                <Card className="p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-6">
                        {editingBook ? 'Edit Book' : 'Add New Book'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => {
                                        const title = e.target.value;
                                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                        setFormData({ ...formData, title, slug });
                                    }}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Slug *</label>
                                <Input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Author *</label>
                                <Input
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-2 border rounded-md"
                                    required
                                >
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
                                <label className="block text-sm font-medium mb-2">Language</label>
                                <Input
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Pages</label>
                                <Input
                                    type="number"
                                    value={formData.pages}
                                    onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Publisher</label>
                                <Input
                                    value={formData.publisher}
                                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Published Year</label>
                                <Input
                                    type="number"
                                    value={formData.publishedYear}
                                    onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">ISBN</label>
                                <Input
                                    value={formData.isbn}
                                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Short Description</label>
                            <Input
                                value={formData.shortDesc}
                                onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                                placeholder="One-line description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description *</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={6}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Cover Image (Optional)</label>
                            {formData.thumbnail && (
                                <Image
                                    src={formData.thumbnail}
                                    alt="Cover"
                                    width={200}
                                    height={200}
                                    className="mb-4 rounded-lg"
                                />
                            )}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Option 1: Upload File</label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-px bg-gray-300"></div>
                                    <span className="text-xs text-gray-500">OR</span>
                                    <div className="flex-1 h-px bg-gray-300"></div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Option 2: Enter Image URL</label>
                                    <Input
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                        value={formData.thumbnail}
                                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {uploading ? 'Uploading...' : 'If not provided, a placeholder image will be used'}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <span>Active</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                />
                                <span>Featured</span>
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={submitting || uploading}>
                                {submitting ? 'Saving...' : editingBook ? 'Update Book' : 'Create Book'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingBook(null);
                                    resetForm();
                                }}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                    <Card key={book.id} className="p-4">
                        {book.thumbnail && (
                            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                                <Image
                                    src={book.thumbnail}
                                    alt={book.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <h3 className="font-bold text-lg mb-2">{book.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                        <p className="text-blue-600 font-semibold mb-2">₹{book.price}</p>
                        <p className="text-sm text-gray-600 mb-4">
                            {book.ordersCount || 0} orders • {book.category}
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(book)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(book.id)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
