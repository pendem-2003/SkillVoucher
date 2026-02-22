'use client';

import { useState, useEffect } from 'react';
import CourseCard from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, BookOpen } from 'lucide-react';

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Courses');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  // Fetch courses from database
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedCategory !== 'All Courses') params.append('category', selectedCategory);
        
        const response = await fetch(`/api/courses?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [searchQuery, selectedCategory]);

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // OLD HARDCODED DATA - NOW DELETED
  const oldHardcodedCourses_DELETED = [
    {
      id: "1",
      title: "Full Stack Web Development Bootcamp",
      slug: "full-stack-web-development",
      shortDesc: "Master React, Node.js, MongoDB and become a full-stack developer with hands-on projects",
      thumbnail: "/placeholder-course.svg",
      price: 15999,
      category: "Web Development",
      level: "Intermediate",
      rating: 4.8,
      studentsCount: 2450,
      isFeatured: true,
    },
    {
      id: "2",
      title: "Data Science & Machine Learning",
      slug: "data-science-machine-learning",
      shortDesc: "Python, pandas, scikit-learn, TensorFlow and deep learning fundamentals",
      thumbnail: "/placeholder-course.svg",
      price: 18999,
      category: "Data Science",
      level: "Advanced",
      rating: 4.9,
      studentsCount: 1890,
      isFeatured: true,
    },
    {
      id: "3",
      title: "AWS Cloud Practitioner Complete Guide",
      slug: "aws-cloud-practitioner",
      shortDesc: "Get AWS certified with hands-on projects and real-world scenarios",
      thumbnail: "/placeholder-course.svg",
      price: 12999,
      category: "Cloud Computing",
      level: "Beginner",
      rating: 4.7,
      studentsCount: 3200,
      isFeatured: true,
    },
    {
      id: "4",
      title: "Python Programming Masterclass",
      slug: "python-programming-masterclass",
      shortDesc: "Complete Python course from basics to advanced with 50+ projects",
      thumbnail: "/placeholder-course.svg",
      price: 9999,
      category: "Programming",
      level: "Beginner",
      rating: 4.6,
      studentsCount: 5400,
      isFeatured: false,
    },
    {
      id: "5",
      title: "React & Next.js Complete Course",
      slug: "react-nextjs-complete",
      shortDesc: "Build modern web applications with React 18 and Next.js 14",
      thumbnail: "/placeholder-course.svg",
      price: 13999,
      category: "Web Development",
      level: "Intermediate",
      rating: 4.8,
      studentsCount: 2890,
      isFeatured: false,
    },
    {
      id: "6",
      title: "DevOps Engineering Complete Path",
      slug: "devops-engineering-complete",
      shortDesc: "Docker, Kubernetes, Jenkins, CI/CD pipelines and cloud automation",
      thumbnail: "/placeholder-course.svg",
      price: 16999,
      category: "DevOps",
      level: "Advanced",
      rating: 4.7,
      studentsCount: 1560,
      isFeatured: false,
    },
    {
      id: "7",
      title: "UI/UX Design Fundamentals",
      slug: "uiux-design-fundamentals",
      shortDesc: "Design thinking, Figma, prototyping and user research",
      thumbnail: "/placeholder-course.svg",
      price: 11999,
      category: "Design",
      level: "Beginner",
      rating: 4.5,
      studentsCount: 2100,
      isFeatured: false,
    },
    {
      id: "8",
      title: "Cybersecurity Essentials",
      slug: "cybersecurity-essentials",
      shortDesc: "Network security, ethical hacking, and security best practices",
      thumbnail: "/placeholder-course.svg",
      price: 14999,
      category: "Security",
      level: "Intermediate",
      rating: 4.6,
      studentsCount: 1780,
      isFeatured: false,
    },
    {
      id: "9",
      title: "Mobile App Development with Flutter",
      slug: "flutter-mobile-development",
      shortDesc: "Build iOS and Android apps with Flutter and Dart",
      thumbnail: "/placeholder-course.svg",
      price: 13499,
      category: "Mobile Development",
      level: "Intermediate",
      rating: 4.7,
      studentsCount: 2340,
      isFeatured: false,
    },
  ]; // END OF OLD HARDCODED DATA

  const categories = [
    "All Courses",
    "Web Development",
    "Data Science",
    "Cloud Computing",
    "Programming",
    "DevOps",
    "Design",
    "Security",
    "Mobile Development"
  ];

  const handleSearch = () => {
    // Search is now reactive through useEffect
    console.log('Searching for:', searchQuery);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-20 mb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-4 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold text-sm shadow-xl">
              🎓 {courses.length} Courses Available
            </div>
            <h1 className="text-6xl font-extrabold text-white mb-6 drop-shadow-2xl">
              Explore Our Courses
            </h1>
            <p className="text-2xl text-white/90 mb-10 font-medium">
              Choose from expert-led courses designed for professionals
            </p>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="relative shadow-2xl rounded-2xl">
                <Search className="absolute left-6 top-5 h-6 w-6 text-blue-600" />
                <Input
                  type="search"
                  placeholder="Search for courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-16 h-16 text-lg bg-white border-0 shadow-xl rounded-2xl font-medium"
                />
                <Button className="absolute right-2 top-2 h-12 shadow-2xl" size="lg" onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl shadow-2xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  All Courses
                </h2>
                <p className="text-gray-600 mt-1">Showing {courses.length} courses</p>
              </div>
            </div>
            <Button variant="outline" size="lg" className="shadow-xl border-2">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </Button>
          </div>
          
          {/* Category Pills */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-blue-100">
            <div className="flex flex-wrap gap-3">
              {categories.map((category, index) => (
                <Badge
                  key={category}
                  variant={category === selectedCategory ? "default" : "outline"}
                  className="cursor-pointer px-6 py-3 text-base font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all border-2"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {currentCourses.length > 0 ? (
            currentCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6">
                <BookOpen className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">No courses found</h3>
              <p className="text-xl text-gray-600 mb-6">Try adjusting your search or filters</p>
              <Button onClick={() => { setSearchQuery(''); setSelectedCategory('All Courses'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 mb-8">
            <div className="flex justify-center gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                className="shadow-xl border-2 hover:scale-105"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button 
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="lg" 
                  className={currentPage === page ? "shadow-2xl" : "shadow-xl border-2 hover:scale-105"}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
              <Button 
                variant="outline" 
                size="lg" 
                className="shadow-xl border-2 hover:scale-105"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
