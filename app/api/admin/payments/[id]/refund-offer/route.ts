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
                { error: 'Only administrators can send refund offers' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const body = await request.json();
        const { refundOfferScreenshot, adminMessage } = body;

        if (!refundOfferScreenshot) {
            return NextResponse.json(
                { error: 'Refund offer screenshot is required' },
                { status: 400 }
            );
        }

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

        if (payment.status !== 'COMPLETED' && payment.status !== 'PENDING_REFUND') {
            return NextResponse.json(
                { error: 'Invalid payment status for refund offer' },
                { status: 400 }
            );
        }

        if (payment.refundOfferSent) {
            return NextResponse.json(
                { error: 'Refund offer already sent for this payment' },
                { status: 400 }
            );
        }

        // Update payment with refund offer details
        const updatedPayment = await prisma.$transaction(async (tx: any) => {
            const updated = await tx.payment.update({
                where: { id },
                data: {
                    refundOfferSent: true,
                    refundOfferUrl: refundOfferScreenshot,
                    refundOfferSentAt: new Date(),
                },
            });

            // Create notification for user with 78% refund offer
            const refundAmount = Math.round(payment.amount * 0.78);
            await tx.notification.create({
                data: {
                    userId: payment.userId,
                    userEmail: payment.user.email,
                    title: '🎉 78% Cashback Offer - Money Refunded!',
                    message: adminMessage
                        ? `Great news! We've sent you ₹${refundAmount.toLocaleString()} (78% cashback) to your UPI. ${adminMessage}. Check the refund screenshot below.`
                        : `Great news! As part of our customer appreciation program, we've refunded ₹${refundAmount.toLocaleString()} (78% of your payment) to your UPI. Check the refund screenshot below for confirmation.`,
                    type: 'PAYMENT_REFUND_OFFER',
                    metadata: {
                        refundOfferScreenshot,
                        adminMessage: adminMessage || undefined,
                        refundAmount,
                        refundPercentage: 78,
                    },
                },
            });

            return updated;
        });

        return NextResponse.json({
            success: true,
            message: '60% refund offer sent successfully',
            data: updatedPayment,
        });
    } catch (error: any) {
        console.error('Error sending refund offer:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send refund offer' },
            { status: 500 }
        );
    }
}
