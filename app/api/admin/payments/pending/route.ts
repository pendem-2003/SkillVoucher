import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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
                { error: 'Only administrators can view pending payments' },
                { status: 403 }
            );
        }

        // Fetch all pending manual payments (including approved but awaiting refund offer)
        const pendingPayments = await prisma.payment.findMany({
            where: {
                paymentMethod: 'Manual',
                OR: [
                    {
                        status: {
                            in: ['PENDING', 'PENDING_REFUND'],
                        },
                    },
                    {
                        status: 'COMPLETED',
                        refundOfferSent: false,
                    },
                ],
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Get course details for each payment
        const paymentsWithCourses = await Promise.all(
            pendingPayments.map(async (payment: any) => {
                const course = payment.courseId
                    ? await prisma.course.findUnique({
                        where: { id: payment.courseId },
                        select: {
                            id: true,
                            title: true,
                            price: true,
                        },
                    })
                    : null;

                return {
                    ...payment,
                    course,
                };
            })
        );

        return NextResponse.json({
            success: true,
            payments: paymentsWithCourses,
            count: paymentsWithCourses.length,
        });
    } catch (error: any) {
        console.error('Error fetching pending payments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pending payments' },
            { status: 500 }
        );
    }
}
