import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = await context.params;

    console.log('🔍 Looking for course with slug:', slug);

    // Find the course by slug
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                duration: true,
                videoUrl: true,
                content: true,
                order: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    console.log('📚 Course found:', course);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Find user's enrollment for this course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: course.id,
      },
    });

    console.log('📝 Enrollment found:', enrollment ? 'Yes' : 'No');

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 }
      );
    }

    // Get full enrollment with course data
    const fullEnrollment = {
      ...enrollment,
      course: course,
    };

    // Get lesson progress for this enrollment
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        enrollmentId: enrollment.id,
      },
    });

    // Add isCompleted flag to lessons
    const enrichedEnrollment = {
      ...fullEnrollment,
      course: {
        ...fullEnrollment.course,
        modules: fullEnrollment.course.modules.map((module: any) => ({
          ...module,
          lessons: module.lessons.map((lesson: any) => ({
            ...lesson,
            isCompleted: lessonProgress.some(
              (progress: any) => progress.lessonId === lesson.id && progress.completed
            ),
          })),
        })),
      },
    };

    return NextResponse.json({ enrollment: enrichedEnrollment }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollment' },
      { status: 500 }
    );
  }
}
