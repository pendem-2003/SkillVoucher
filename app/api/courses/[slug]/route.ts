import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Transform the data to include lesson counts
    const transformedCourse = {
      ...course,
      modules: course.modules.map((module: any) => ({
        ...module,
        lessonCount: module.lessons.length,
        duration: module.lessons.reduce((total: number, lesson: any) => total + (lesson.duration || 0), 0)
      }))
    };

    return NextResponse.json(transformedCourse);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
