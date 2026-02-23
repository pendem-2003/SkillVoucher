import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin only' },
                { status: 401 }
            );
        }

        const tickets = await prisma.support.findMany({
            include: {
                _count: {
                    select: { messages: true },
                },
            },
            orderBy: [
                { status: 'asc' }, // OPEN first
                { updatedAt: 'desc' },
            ],
        });

        return NextResponse.json({
            success: true,
            tickets,
        });
    } catch (error) {
        console.error('Error fetching admin support tickets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch support tickets' },
            { status: 500 }
        );
    }
}
