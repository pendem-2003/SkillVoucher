import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CourseCard from "@/components/CourseCard";
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  Clock, 
  Download,
  CreditCard,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Star
} from "lucide-react";

export default function Home() {
  // Sample featured courses - will be replaced with database data
  const featuredCourses = [
    {
      id: "1",
      title: "Full Stack Web Development Bootcamp",
      slug: "full-stack-web-development",
      shortDesc: "Master React, Node.js, MongoDB and become a full-stack developer",
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
      shortDesc: "Python, pandas, scikit-learn, and deep learning fundamentals",
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
  ];

  const features = [
    {
      icon: Clock,
      title: "3 Months Access",
      description: "Full access to all course materials for 90 days",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Download,
      title: "Reimbursement Invoices",
      description: "Professional invoices ready for company submission",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: CreditCard,
      title: "Flexible Payments",
      description: "UPI, Cards, and multiple refund options available",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Award,
      title: "Certificate",
      description: "Earn certificates upon course completion",
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  const stats = [
    { label: "Active Students", value: "10,000+", icon: GraduationCap },
    { label: "Expert Courses", value: "500+", icon: Award },
    { label: "Success Rate", value: "95%", icon: TrendingUp },
    { label: "Avg Rating", value: "4.8★", icon: Star },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Learn & Get Reimbursed
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Level Up Your Skills with{" "}
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                Company Support
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-blue-100 sm:text-xl">
              Premium courses designed for professionals. Get instant invoices for company reimbursement. 
              3-month access to transform your career.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/courses">
                <Button size="lg" variant="default" className="bg-white text-blue-600 hover:bg-gray-100 shadow-2xl text-lg px-8 py-6">
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/request-course">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-2xl text-lg px-8 py-6">
                  Request Course
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 h-72 w-72 rounded-full bg-purple-400 opacity-20 blur-3xl" />
        <div className="absolute bottom-1/4 right-10 h-72 w-72 rounded-full bg-pink-400 opacity-20 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="mt-1 text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillVoucher
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need for professional learning and company reimbursement
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-2 hover:border-blue-300 transition-all">
                  <CardHeader>
                    <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Featured{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Courses
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Handpicked courses from industry experts
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/courses">
              <Button size="lg" variant="default" className="shadow-xl">
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              How It{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Simple steps to start learning and get reimbursed
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Choose Your Course",
                description: "Browse our catalog and select the perfect course for your career goals",
              },
              {
                step: "2",
                title: "Make Payment",
                description: "Pay securely via UPI, Card, or other methods. Get instant access",
              },
              {
                step: "3",
                title: "Download Invoice",
                description: "Get professional invoice for company reimbursement. Learn for 3 months",
              },
            ].map((item) => (
              <Card key={item.step} className="text-center border-2">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-2xl font-bold text-white shadow-xl">
                    {item.step}
                  </div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                  <CardDescription className="text-base">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Ready to Transform Your Career?
          </h2>
          <p className="mt-6 text-xl text-blue-100">
            Join thousands of professionals upskilling with company support
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="default" className="bg-white text-blue-600 hover:bg-gray-100 shadow-2xl text-lg px-8 py-6">
                Get Started Free
                <CheckCircle2 className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/request-course">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                Request Custom Course
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
