import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ isEnrolled: false }, { status: 200 });
    }

    const { slug } = await context.params;

    // Find the course by slug
    const course = await prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ isEnrolled: false }, { status: 200 });
    }

    // Check if user has enrollment for this course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: course.id,
        isActive: true,
      },
    });

    return NextResponse.json({ isEnrolled: !!enrollment }, { status: 200 });
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return NextResponse.json({ isEnrolled: false }, { status: 200 });
  }
}
