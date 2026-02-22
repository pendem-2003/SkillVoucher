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

export async function POST(
  request: Request,
  context: { params: Promise<{ moduleId: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { moduleId } = await context.params;
    const { title, content, videoUrl, duration, order } = await request.json();

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        content,
        videoUrl,
        duration,
        order
      }
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
}
