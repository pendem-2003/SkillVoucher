import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await request.json();
    const { bookName, author, description, category, expectedPrice, priority } = data;

    const bookRequest = await prisma.bookRequest.create({
      data: {
        userId: user.id,
        bookName,
        author,
        description,
        category,
        expectedPrice: expectedPrice ? parseFloat(expectedPrice) : null,
        priority: priority || 'MEDIUM',
      },
    });

    return NextResponse.json(bookRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating book request:', error);
    return NextResponse.json(
      { error: 'Failed to create book request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If admin, show all requests; if user, show only their requests
    const where = user.role === 'ADMIN' ? {} : { userId: user.id };

    const bookRequests = await prisma.bookRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookRequests });
  } catch (error) {
    console.error('Error fetching book requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book requests' },
      { status: 500 }
    );
  }
}
