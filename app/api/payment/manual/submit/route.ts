import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { courseIds, billingInfo, paymentProofUrl, userNote, upiId } = body;

        // Validate input
        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return NextResponse.json(
                { error: 'Course IDs are required' },
                { status: 400 }
            );
        }

        if (!paymentProofUrl) {
            return NextResponse.json(
                { error: 'Payment proof is required' },
                { status: 400 }
            );
        }

        if (!upiId || !upiId.includes('@')) {
            return NextResponse.json(
                { error: 'Valid UPI ID is required for refund purposes' },
                { status: 400 }
            );
        }

        // Check if user already has pending payment for any of these courses
        const existingPending = await prisma.payment.findFirst({
            where: {
                userId: session.user.id,
                courseId: {
                    in: courseIds,
                },
                status: 'PENDING',
            },
        });

        if (existingPending) {
            return NextResponse.json(
                { error: 'You already have a pending payment request for these courses' },
                { status: 400 }
            );
        }

        // Fetch course details
        const courses = await prisma.course.findMany({
            where: {
                id: {
                    in: courseIds,
                },
                isActive: true,
            },
        });

        if (courses.length !== courseIds.length) {
            return NextResponse.json(
                { error: 'One or more courses not found' },
                { status: 404 }
            );
        }

        // Calculate total amount
        const totalAmount = courses.reduce((sum: number, course: any) => sum + course.price, 0);
        const taxAmount = Math.round(totalAmount * 0.18); // 18% GST
        const finalAmount = totalAmount + taxAmount;

        // Generate unique invoice number
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        // Create payment record with PENDING status
        const payment = await prisma.payment.create({
            data: {
                userId: session.user.id,
                courseId: courses[0].id,
                amount: finalAmount,
                status: 'PENDING',
                paymentMethod: 'Manual',
                invoiceNumber: invoiceNumber,
                customerName: billingInfo?.name || session.user.name || 'Customer',
                customerEmail: billingInfo?.email || session.user.email || '',
                customerPhone: billingInfo?.phone || '',
                customerCompany: billingInfo?.company || '',
                paymentProofUrl: paymentProofUrl,
                upiId: upiId,
                userNote: userNote || '',
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Create notification for user
        await prisma.notification.create({
            data: {
                userId: session.user.id,
                title: 'Payment Verification Pending',
                message: `Your payment request for ${courses.length} course(s) has been submitted successfully. Our team will verify and activate your courses within 1-2 hours.`,
                type: 'PAYMENT',
            },
        });

        return NextResponse.json({
            success: true,
            payment: {
                id: payment.id,
                amount: payment.amount,
                status: payment.status,
                courseCount: courses.length,
            },
            message: 'Payment proof submitted successfully. Verification will be completed within 1-2 hours.',
        });
    } catch (error: any) {
        console.error('Error submitting manual payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to submit payment' },
            { status: 500 }
        );
    }
}
