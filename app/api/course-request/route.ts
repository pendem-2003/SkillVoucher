import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseName, description, category, expectedPrice } = body;

    if (!courseName || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const courseRequest = await prisma.courseRequest.create({
      data: {
        courseName,
        description,
        category: category || 'Other',
        expectedPrice: expectedPrice ? parseInt(expectedPrice) : null,
        userId: session.user.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        message: 'Course request submitted successfully',
        courseRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Course request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit course request' },
      { status: 500 }
    );
  }
}
