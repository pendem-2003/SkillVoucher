import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if slug is being changed and if it already exists
    if (slug) {
      const existingBook = await prisma.book.findUnique({
        where: { slug }
      });

      if (existingBook && existingBook.id !== id) {
        return NextResponse.json(
          { error: 'A book with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(shortDesc !== undefined && { shortDesc }),
        ...(author && { author }),
        ...(thumbnail && { thumbnail }),
        ...(price && { price: parseFloat(price) }),
        ...(category && { category }),
        ...(language && { language }),
        ...(pages && { pages: parseInt(pages) }),
        ...(publisher !== undefined && { publisher }),
        ...(publishedYear && { publishedYear: parseInt(publishedYear) }),
        ...(isbn !== undefined && { isbn }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
      }
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    await prisma.book.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
