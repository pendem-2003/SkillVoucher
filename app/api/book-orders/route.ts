import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('📚 Book Order API - Session:', session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    console.log('📚 Book Order API - User found:', user?.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await request.json();
    console.log('📚 Book Order API - Request data:', data);
    
    const {
      bookId,
      quantity,
      deliveryName,
      deliveryPhone,
      deliveryEmail,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryPincode,
      deliveryLandmark,
      paymentMethod,
      paymentScreenshot,
      upiId
    } = data;

    // Validate required fields
    if (!bookId) {
      console.error('❌ Missing bookId');
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }
    if (!deliveryName || !deliveryPhone || !deliveryEmail || !deliveryAddress || !deliveryCity || !deliveryState || !deliveryPincode) {
      console.error('❌ Missing delivery fields');
      return NextResponse.json({ error: 'All delivery fields are required' }, { status: 400 });
    }
    if (!paymentScreenshot) {
      console.error('❌ Missing payment screenshot');
      return NextResponse.json({ error: 'Payment screenshot is required' }, { status: 400 });
    }
    if (!upiId) {
      console.error('❌ Missing UPI ID');
      return NextResponse.json({ error: 'UPI ID is required' }, { status: 400 });
    }

    // Update user's UPI ID if provided
    if (upiId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { upiId }
      });
      console.log('📚 Updated user UPI ID');
    }

    // Fetch book
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });
    console.log('📚 Book found:', book?.title);

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const totalAmount = book.price * (quantity || 1);
    console.log('📚 Total amount:', totalAmount);

    // Create book order with PENDING payment status (admin needs to approve)
    console.log('📚 Creating book order...');
    const bookOrder = await prisma.bookOrder.create({
      data: {
        userId: user.id,
        bookId: book.id,
        quantity: quantity || 1,
        totalAmount,
        deliveryName,
        deliveryPhone,
        deliveryEmail,
        deliveryAddress,
        deliveryCity,
        deliveryState,
        deliveryPincode,
        deliveryLandmark: deliveryLandmark || '',
        upiId,
        paymentMethod: 'Manual',
        paymentScreenshot,
        orderStatus: 'PROCESSING',
        paymentStatus: 'PENDING', // Admin needs to approve payment first
      },
      include: {
        book: true,
      },
    });
    console.log('✅ Book order created:', bookOrder.id);

    // Update book orders count
    await prisma.book.update({
      where: { id: book.id },
      data: {
        ordersCount: {
          increment: quantity || 1
        }
      }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        type: 'BOOK_ORDER_PLACED',
        title: '📚 Book Order Placed - Awaiting Payment Approval',
        message: `Your order for "${book.title}" has been placed successfully! We'll verify your payment and notify you within 1-2 hours.`,
        metadata: {
          bookOrderId: bookOrder.id,
          bookTitle: book.title,
          amount: totalAmount,
        },
      },
    });

    return NextResponse.json(bookOrder, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating book order:', error);
    console.error('❌ Error details:', error.message, error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to create book order', details: error.toString() },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const bookOrders = await prisma.bookOrder.findMany({
      where: { userId: user.id },
      include: {
        book: {
          select: {
            title: true,
            author: true,
            thumbnail: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookOrders });
  } catch (error) {
    console.error('Error fetching book orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book orders' },
      { status: 500 }
    );
  }
}
