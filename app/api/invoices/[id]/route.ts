import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Fetch invoice with payment details
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: id,
      },
      include: {
        payment: {
          select: {
            status: true,
            paymentMethod: true,
            razorpayPaymentId: true,
            razorpayOrderId: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Verify the invoice belongs to the user
    if (invoice.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to invoice' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}
