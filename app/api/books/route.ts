import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const category = searchParams.get('category');

        const where: any = {
            isActive: true,
        };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { author: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (category && category !== 'All Books') {
            where.category = category;
        }

        const books = await prisma.book.findMany({
            where,
            orderBy: [
                { isFeatured: 'desc' },
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                shortDesc: true,
                author: true,
                thumbnail: true,
                price: true,
                category: true,
                language: true,
                pages: true,
                publisher: true,
                publishedYear: true,
                isbn: true,
                rating: true,
                ordersCount: true,
                isFeatured: true,
            },
        });

        return NextResponse.json({ books });
    } catch (error) {
        console.error('Error fetching books:', error);
        return NextResponse.json(
            { error: 'Failed to fetch books' },
            { status: 500 }
        );
    }
}
