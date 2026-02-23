import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch user's support tickets
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const tickets = await prisma.support.findMany({
            where: {
                userEmail: session.user.email,
            },
            include: {
                _count: {
                    select: { messages: true },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return NextResponse.json({
            success: true,
            tickets,
        });
    } catch (error) {
        console.error('Error fetching support tickets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch support tickets' },
            { status: 500 }
        );
    }
}

// POST - Create new support ticket
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { subject, message } = body;

        if (!subject || !message) {
            return NextResponse.json(
                { error: 'Subject and message are required' },
                { status: 400 }
            );
        }

        // Create ticket with first message
        const ticket = await prisma.support.create({
            data: {
                userId: session.user.id!,
                userEmail: session.user.email,
                userName: session.user.name || 'User',
                subject,
                status: 'OPEN',
                messages: {
                    create: {
                        senderId: session.user.id!,
                        senderEmail: session.user.email,
                        senderName: session.user.name || 'User',
                        senderRole: 'USER',
                        message,
                    },
                },
            },
            include: {
                messages: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Support ticket created successfully',
            ticket,
        });
    } catch (error) {
        console.error('Error creating support ticket:', error);
        return NextResponse.json(
            { error: 'Failed to create support ticket' },
            { status: 500 }
        );
    }
}
