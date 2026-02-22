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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const { isActive } = await request.json();

    const course = await prisma.course.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error toggling course status:', error);
    return NextResponse.json({ error: 'Failed to toggle course status' }, { status: 500 });
  }
}
