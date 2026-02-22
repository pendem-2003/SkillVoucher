import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' }
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const {
      title,
      slug,
      description,
      shortDesc,
      author,
      thumbnail,
      price,
      category,
      language,
      pages,
      publisher,
      publishedYear,
      isbn,
      isActive,
      isFeatured
    } = data;

    // Check if slug already exists
    const existingBook = await prisma.book.findUnique({
      where: { slug }
    });

    if (existingBook) {
      return NextResponse.json(
        { error: 'A book with this slug already exists' },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title,
        slug,
        description,
        shortDesc: shortDesc || null,
        author,
        thumbnail: thumbnail || 'https://via.placeholder.com/400x600/cccccc/666666?text=Book+Cover',
        price: parseFloat(price),
        category,
        language: language || 'English',
        pages: pages ? parseInt(pages) : null,
        publisher: publisher || null,
        publishedYear: publishedYear ? parseInt(publishedYear) : null,
        isbn: isbn || null,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured !== undefined ? isFeatured : false,
        rating: 4.5 + Math.random() * 0.5, // Random between 4.5 and 5.0
        ordersCount: Math.floor(Math.random() * 501) + 100 // Random between 100 and 600
      }
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}
