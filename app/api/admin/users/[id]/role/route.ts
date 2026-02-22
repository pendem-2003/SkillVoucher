import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { role } = await request.json();

    if (!['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user role
    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    // Handle enrollments based on role change
    if (role === 'ADMIN' && currentUser.role !== 'ADMIN') {
      // Promoted to ADMIN - create enrollments for ALL courses
      console.log(`🔑 User ${id} promoted to ADMIN - creating enrollments for all courses`);
      
      const allCourses = await prisma.course.findMany({
        select: { id: true },
      });

      // Get existing enrollments to avoid duplicates
      const existingEnrollments = await prisma.enrollment.findMany({
        where: { userId: id },
        select: { courseId: true },
      });

      const existingCourseIds = new Set(existingEnrollments.map(e => e.courseId));

      // Create enrollments for courses not already enrolled
      const enrollmentsToCreate = allCourses
        .filter(course => !existingCourseIds.has(course.id))
        .map(course => ({
          id: `admin-auto-${id}-${course.id}`,
          userId: id,
          courseId: course.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year access
          isActive: true,
          progress: 0,
        }));

      if (enrollmentsToCreate.length > 0) {
        await prisma.enrollment.createMany({
          data: enrollmentsToCreate,
        });
        console.log(`✅ Created ${enrollmentsToCreate.length} admin enrollments`);
      }
    } else if (role === 'USER' && currentUser.role === 'ADMIN') {
      // Demoted from ADMIN - remove auto-generated admin enrollments
      console.log(`🔓 User ${id} demoted from ADMIN - removing auto-generated enrollments`);
      
      // Delete enrollments that follow the admin-auto pattern
      // These are enrollments that don't have associated payments
      const result = await prisma.enrollment.deleteMany({
        where: {
          userId: id,
          id: {
            startsWith: 'admin-auto-',
          },
        },
      });

      console.log(`✅ Removed ${result.count} admin auto-enrollments`);
    }

    return NextResponse.json({ 
      user,
      message: role === 'ADMIN' 
        ? 'User promoted to ADMIN with access to all courses' 
        : 'User demoted to USER, admin privileges removed'
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
