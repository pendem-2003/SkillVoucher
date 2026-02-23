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

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const body = await request.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Verify ticket exists
        const ticket = await prisma.support.findUnique({
            where: { id },
        });

        if (!ticket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        // Check permission
        if (ticket.userEmail !== session.user.email && session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        const isAdmin = session.user.role === 'ADMIN';

        // Create message and update ticket
        const result = await prisma.$transaction(async (tx: any) => {
            const newMessage = await tx.supportMessage.create({
                data: {
                    supportId: id,
                    senderId: session.user.id!,
                    senderEmail: session.user.email!,
                    senderName: session.user.name || (isAdmin ? 'Admin' : 'User'),
                    senderRole: isAdmin ? 'ADMIN' : 'USER',
                    message,
                },
            });

            // Update ticket timestamp and status
            const updatedTicket = await tx.support.update({
                where: { id },
                data: {
                    updatedAt: new Date(),
                    status: isAdmin && ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
                },
            });

            // Create notification for the other party
            if (isAdmin) {
                // Admin replied - notify user
                await tx.notification.create({
                    data: {
                        userId: ticket.userId,
                        userEmail: ticket.userEmail,
                        title: '💬 Admin Replied to Your Support Ticket',
                        message: `You have a new response on "${ticket.subject}". Click to view the conversation.`,
                        type: 'COMPLAINT_REPLY',
                        metadata: { complaintId: id },
                    },
                });
            } else {
                // User replied - notify all admins
                const admins = await tx.user.findMany({
                    where: { role: 'ADMIN' },
                    select: { id: true, email: true },
                });

                for (const admin of admins) {
                    await tx.notification.create({
                        data: {
                            userId: admin.id,
                            userEmail: admin.email,
                            title: '💬 New User Message on Support Ticket',
                            message: `${ticket.userName} replied on "${ticket.subject}"`,
                            type: 'COMPLAINT_REPLY',
                            metadata: { complaintId: id },
                        },
                    });
                }
            }

            return { message: newMessage, ticket: updatedTicket };
        });

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully',
            data: result,
        });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
