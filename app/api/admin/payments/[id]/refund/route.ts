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
                { error: 'Only administrators can send refund screenshots' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const body = await request.json();
        const { refundScreenshot, adminMessage } = body;

        if (!refundScreenshot) {
            return NextResponse.json(
                { error: 'Refund screenshot is required' },
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

        if (payment.status !== 'PENDING_REFUND') {
            return NextResponse.json(
                { error: 'Payment must be in PENDING_REFUND status to send refund' },
                { status: 400 }
            );
        }

        // Update payment to REFUNDED and send notification
        const updatedPayment = await prisma.$transaction(async (tx: any) => {
            const refunded = await tx.payment.update({
                where: { id },
                data: {
                    status: 'REFUNDED',
                    adminNote: adminMessage || payment.adminNote,
                },
            });

            // Create notification for user with refund screenshot
            await tx.notification.create({
                data: {
                    userId: payment.userId,
                    userEmail: payment.user.email,
                    title: '💸 Refund Completed',
                    message: adminMessage
                        ? `Your refund has been processed. ${adminMessage}. Please check the refund screenshot below.`
                        : 'Your refund has been processed. Please check the refund screenshot below for confirmation.',
                    type: 'PAYMENT_REJECTED',
                    metadata: {
                        refundScreenshot,
                        adminMessage: adminMessage || undefined,
                    },
                },
            });

            return refunded;
        });

        return NextResponse.json({
            success: true,
            message: 'Refund screenshot sent successfully',
            data: updatedPayment,
        });
    } catch (error: any) {
        console.error('Error sending refund:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send refund screenshot' },
            { status: 500 }
        );
    }
}
