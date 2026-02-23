'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, BookOpen, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function BooksPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Books');
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 12;

    const categories = [
        'All Books',
        'Programming',
        'Business',
        'Self-Help',
        'Novel',
        'Technical',
        'Biography',
        'Science',
        'Fiction',
    ];

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const params = new URLSearchParams();
                if (searchQuery) params.append('search', searchQuery);
                if (selectedCategory !== 'All Books') params.append('category', selectedCategory);

                const response = await fetch(`/api/books?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    setBooks(data.books || []);
                }
            } catch (error) {
                console.error('Failed to fetch books:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
        setCurrentPage(1);
    }, [searchQuery, selectedCategory]);

    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = Math.ceil(books.length / booksPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="h-12 w-12" />
                            <h1 className="text-5xl font-bold">Explore Books</h1>
                        </div>
                        <p className="text-xl text-blue-100 mb-8">
                            Discover inspiring, technical, and transformative books. Order now with easy delivery!
                        </p>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="text"
                                placeholder="Search books by title, author, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 py-6 text-lg bg-white/95 backdrop-blur border-0 shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-64 shrink-0">
                        <Card className="p-6 sticky top-24">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                Categories
                            </h3>
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ${selectedCategory === category
                                                ? 'bg-blue-600 text-white font-medium shadow-md'
                                                : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>

                            <Link href="/request-book">
                                <Button className="w-full mt-4" variant="outline">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Request a Book
                                </Button>
                            </Link>
                        </Card>
                    </aside>

                    {/* Books Grid */}
                    <main className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {selectedCategory === 'All Books' ? 'All Books' : selectedCategory}
                                <span className="ml-3 text-lg font-normal text-gray-500">
                                    ({books.length} books)
                                </span>
                            </h2>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i} className="p-4 animate-pulse">
                                        <div className="bg-gray-200 h-64 rounded-lg mb-4" />
                                        <div className="bg-gray-200 h-4 rounded mb-2" />
                                        <div className="bg-gray-200 h-4 rounded w-2/3" />
                                    </Card>
                                ))}
                            </div>
                        ) : currentBooks.length === 0 ? (
                            <Card className="p-12 text-center">
                                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No books found
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Try adjusting your search or filters
                                </p>
                                <Link href="/request-book">
                                    <Button>
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Request This Book
                                    </Button>
                                </Link>
                            </Card>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {currentBooks.map((book) => (
                                        <Link key={book.id} href={`/books/${book.slug}`}>
                                            <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer h-full">
                                                <div className="relative h-64 overflow-hidden rounded-t-lg">
                                                    {book.thumbnail ? (
                                                        <Image
                                                            src={book.thumbnail}
                                                            alt={book.title}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                            <BookOpen className="h-16 w-16 text-white" />
                                                        </div>
                                                    )}
                                                    {book.isFeatured && (
                                                        <Badge className="absolute top-3 right-3 bg-yellow-500">
                                                            Featured
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="p-5">
                                                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                        {book.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-3">
                                                        by {book.author}
                                                    </p>

                                                    {book.shortDesc && (
                                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                            {book.shortDesc}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="flex items-center">
                                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                            <span className="ml-1 text-sm font-medium">
                                                                {book.rating?.toFixed(1) || '4.5'}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-sm text-gray-600">
                                                            {book.ordersCount || 0} orders
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-2xl font-bold text-blue-600">
                                                                ₹{book.price}
                                                            </span>
                                                        </div>
                                                        <Button size="sm" className="group-hover:bg-blue-700">
                                                            <ShoppingCart className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <Badge variant="outline" className="mt-3">
                                                        {book.category}
                                                    </Badge>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-12 flex justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        {[...Array(totalPages)].map((_, index) => (
                                            <Button
                                                key={index}
                                                variant={currentPage === index + 1 ? 'default' : 'outline'}
                                                onClick={() => handlePageChange(index + 1)}
                                            >
                                                {index + 1}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="outline"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
