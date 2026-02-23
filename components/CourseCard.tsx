'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, Clock, Users, BookOpen, ShoppingCart, PlayCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CourseCardProps } from '@/types';
import { useCart } from '@/lib/cart-store';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function CourseCard({
  id,
  title,
  slug,
  shortDesc,
  thumbnail,
  price,
  category,
  level,
  rating = 0,
  studentsCount,
  isFeatured = false,
}: CourseCardProps) {
  const { addItem } = useCart();
  const { data: session } = useSession();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!session?.user?.id) {
        setCheckingEnrollment(false);
        return;
      }

      try {
        const response = await fetch(`/api/enrollments/check/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setIsEnrolled(data.isEnrolled);
        }
      } catch (error) {
        console.error('Error checking enrollment:', error);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [session, slug]);

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      Beginner: 'success',
      Intermediate: 'warning',
      Advanced: 'danger',
    };
    return colors[level] || 'default';
  };

  return (
    <Card className="group overflow-hidden h-full flex flex-col hover:shadow-3xl transition-all duration-300 border-3 hover:border-blue-300">
      {/* Thumbnail */}
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200">
        {isFeatured && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="shadow-2xl text-base px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-bold">
              ⭐ Featured
            </Badge>
          </div>
        )}
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-125"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardHeader className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-3 py-1.5 text-sm font-bold shadow-lg">
            {category}
          </Badge>
          <Badge variant={getLevelColor(level)} className="px-3 py-1.5 text-sm font-bold shadow-lg">
            {level}
          </Badge>
        </div>
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
          {title}
        </h3>
        {shortDesc && (
          <p className="text-base text-gray-600 mt-3 line-clamp-2 leading-relaxed">{shortDesc}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rating & Students */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-xl border-2 border-yellow-200">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
            <span className="text-gray-600 text-sm">(Reviews)</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl border-2 border-blue-200">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">{studentsCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 bg-purple-50 px-4 py-3 rounded-xl border-2 border-purple-200">
          <Clock className="h-5 w-5 text-purple-600" />
          <span className="font-bold text-gray-900">3 Months Access</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
          <div>
            <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {formatCurrency(price)}
            </div>
            <div className="text-sm text-gray-600 font-semibold mt-1">One-time payment</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Link href={isEnrolled ? `/courses/${slug}/learn` : `/courses/${slug}`} className="w-full">
          <Button className="w-full" size="lg" disabled={checkingEnrollment}>
            {isEnrolled ? (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Continue Learning
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                View Course
              </>
            )}
          </Button>
        </Link>
        {!isEnrolled && (
          <Button
            variant="outline"
            size="lg"
            className="w-full border-2"
            onClick={() => {
              addItem({ id, title, price, thumbnail, slug });
              alert('Added to cart!');
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
