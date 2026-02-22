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

export async function PUT(
  request: Request,
  context: { params: Promise<{ moduleId: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { moduleId } = await context.params;
    const { title, description, order } = await request.json();

    const module = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title,
        description,
        order,
      },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ moduleId: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { moduleId } = await context.params;

    await prisma.module.delete({
      where: { id: moduleId }
    });

    return NextResponse.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
  }
}
