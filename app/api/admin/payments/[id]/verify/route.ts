import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
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

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can verify payments' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { action, adminNote } = body; // action: 'approve' or 'reject'

    // Fetch payment
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'PENDING' && payment.status !== 'PENDING_REFUND') {
      return NextResponse.json(
        { error: 'Payment has already been processed' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Approve payment and create enrollments
      const result = await prisma.$transaction(async (tx: any) => {
        // Update payment status
        const updatedPayment = await tx.payment.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            verifiedAt: new Date(),
            verifiedBy: session.user.id,
            adminNote: adminNote || 'Payment verified and approved',
          },
        });

        // Get course
        const course = await tx.course.findUnique({
          where: { id: payment.courseId! },
        });

        if (!course) {
          throw new Error('Course not found');
        }

        // Create enrollment
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 90); // 90 days validity

        const enrollment = await tx.enrollment.create({
          data: {
            userId: payment.userId,
            courseId: course.id,
            startDate,
            endDate,
            progress: 0,
            isActive: true,
          },
        });

        // Create invoice
        const courseDetails = [{
          id: course.id,
          title: course.title,
          instructor: course.instructor || 'LearnReimb Instructor',
          price: course.price,
          duration: `${course.duration} days`,
        }];

        const subtotal = course.price;
        const taxAmount = Math.round(subtotal * 0.18);
        const totalAmount = subtotal + taxAmount;

        await tx.invoice.create({
          data: {
            invoiceNumber: payment.invoiceNumber,
            paymentId: payment.id,
            userId: payment.userId,
            subtotal,
            taxRate: 18,
            taxAmount,
            totalAmount,
            customerName: payment.customerName,
            customerEmail: payment.customerEmail,
            customerPhone: payment.customerPhone || '',
            customerCompany: payment.customerCompany || '',
            customerAddress: '',
            courseIds: [course.id],
            courseDetails: courseDetails,
            paymentMethod: 'Manual',
            transactionId: `TXN_${Date.now()}`,
            notes: 'Manual payment verified by admin',
          },
        });

        // Update course student count
        await tx.course.update({
          where: { id: course.id },
          data: { studentsCount: { increment: 1 } },
        });

        // Create notification for user
        await tx.notification.create({
          data: {
            userId: payment.userId,
            userEmail: payment.user.email,
            title: '✅ Payment Verified - Course Activated!',
            message: `Great news! Your payment has been verified and you now have access to "${course.title}". Start learning now!`,
            type: 'PAYMENT_APPROVED',
            metadata: adminNote ? { adminMessage: adminNote } : undefined,
          },
        });

        return { payment: updatedPayment, enrollment, course };
      });

      return NextResponse.json({
        success: true,
        message: 'Payment approved and course activated successfully',
        data: result,
      });
    } else if (action === 'reject') {
      // Reject payment - status goes to PENDING_REFUND (admin will upload refund screenshot later)
      const updatedPayment = await prisma.$transaction(async (tx: any) => {
        const rejected = await tx.payment.update({
          where: { id },
          data: {
            status: 'PENDING_REFUND',
            rejectedAt: new Date(),
            rejectionReason: adminNote || 'Payment verification failed',
            adminNote: adminNote || 'Payment rejected by admin',
          },
        });

        // Create notification for user
        await tx.notification.create({
          data: {
            userId: payment.userId,
            userEmail: payment.user.email,
            title: '❌ Payment Rejected - Refund Processing',
            message: `Your payment verification failed. ${adminNote ? `Reason: ${adminNote}. ` : ''}We will process your refund and send you the refund screenshot within 1-2 hours. Please check your notifications for the refund proof.`,
            type: 'PAYMENT_REJECTED',
            metadata: adminNote ? { adminMessage: adminNote } : undefined,
          },
        });

        return rejected;
      });

      return NextResponse.json({
        success: true,
        message: 'Payment rejected - Admin will send refund screenshot shortly',
        data: updatedPayment,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
