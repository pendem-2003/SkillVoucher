import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { enrollmentId, lessonId } = await request.json();

    console.log('📝 Mark complete request:', { enrollmentId, lessonId, userEmail: session.user.email });

    if (!enrollmentId || !lessonId) {
      return NextResponse.json(
        { error: 'Enrollment ID and Lesson ID are required' },
        { status: 400 }
      );
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('👤 User found:', user.id);

    console.log('👤 User found:', user.id);

    // Verify enrollment belongs to user
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: user.id
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true
              }
            }
          }
        }
      }
    });

    if (!enrollment) {
      console.log('❌ Enrollment not found for user');
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    console.log('✅ Enrollment found:', enrollment.id);

    console.log('✅ Enrollment found:', enrollment.id);

    // Check if already completed
    const existingProgress = await prisma.lessonProgress.findFirst({
      where: {
        enrollmentId,
        lessonId
      }
    });

    // Toggle completion status
    const isCurrentlyCompleted = existingProgress?.completed || false;
    const newCompletionStatus = !isCurrentlyCompleted;

    console.log(`📚 ${newCompletionStatus ? 'Marking' : 'Unmarking'} lesson as complete...`);

    // Mark or unmark lesson
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId
        }
      },
      update: {
        completed: newCompletionStatus,
        completedAt: newCompletionStatus ? new Date() : null
      },
      create: {
        enrollmentId,
        lessonId,
        completed: true,
        completedAt: new Date()
      }
    });

    console.log(`✅ Lesson ${newCompletionStatus ? 'marked' : 'unmarked'} as complete`);

    // Calculate total progress
    const totalLessons = enrollment.course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    );

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId,
        completed: true
      }
    });

    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    console.log(`📊 Progress: ${completedLessons}/${totalLessons} lessons = ${progress}%`);

    // Update enrollment progress
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        lastAccessedAt: new Date(),
        completedAt: progress === 100 ? new Date() : null
      }
    });

    return NextResponse.json({
      message: `Lesson ${newCompletionStatus ? 'marked' : 'unmarked'} as complete`,
      progress: lessonProgress,
      overallProgress: progress,
      isCompleted: newCompletionStatus
    });
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark lesson as complete' },
      { status: 500 }
    );
  }
}
