import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });
  
  return user?.role === 'ADMIN' ? user : null;
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ lessonId: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { lessonId } = await context.params;

    await prisma.lesson.delete({
      where: { id: lessonId }
    });

    return NextResponse.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ lessonId: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { lessonId } = await context.params;
    const { title, content, videoUrl, duration } = await request.json();

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { title, content, videoUrl, duration }
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
  }
}
