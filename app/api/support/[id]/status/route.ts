import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const ticket = await prisma.support.update({
      where: { id },
      data: { status },
    });

    // Notify user of status change
    if (status === 'RESOLVED' || status === 'CLOSED') {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          userEmail: ticket.userEmail,
          title: `🎯 Support Ticket ${status === 'RESOLVED' ? 'Resolved' : 'Closed'}`,
          message: `Your support ticket "${ticket.subject}" has been marked as ${status.toLowerCase()}.`,
          type: 'COMPLAINT_REPLY',
          metadata: { complaintId: id },
        },
      });
    }

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket status' },
      { status: 500 }
    );
  }
}
