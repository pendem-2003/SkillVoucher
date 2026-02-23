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
        const { orderStatus, paymentStatus, trackingNumber, notes } = data;

        const updateData: any = {};

        if (orderStatus) updateData.orderStatus = orderStatus;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
        if (notes !== undefined) updateData.notes = notes;

        // If marking as delivered, set deliveredAt
        if (orderStatus === 'DELIVERED') {
            updateData.deliveredAt = new Date();
        }

        const bookOrder = await prisma.bookOrder.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                book: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        // Create notification for user
        await prisma.notification.create({
            data: {
                userId: bookOrder.userId,
                userEmail: bookOrder.user.email,
                type: orderStatus === 'DELIVERED' ? 'BOOK_DELIVERED' : 'BOOK_STATUS_UPDATE',
                title: orderStatus === 'DELIVERED'
                    ? '📚 Book Delivered!'
                    : '📦 Order Status Updated',
                message: orderStatus === 'DELIVERED'
                    ? `Your book "${bookOrder.book.title}" has been delivered successfully!`
                    : `Your book order status has been updated to: ${orderStatus}`,
                metadata: {
                    bookOrderId: bookOrder.id,
                    orderStatus,
                    trackingNumber,
                },
            },
        });

        return NextResponse.json(bookOrder);
    } catch (error) {
        console.error('Error updating book order:', error);
        return NextResponse.json(
            { error: 'Failed to update book order' },
            { status: 500 }
        );
    }
}

// Payment approval/rejection for manual payments
export async function POST(
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
        const { action, refundScreenshot, refundOfferScreenshot } = data;

        const bookOrder = await prisma.bookOrder.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        price: true,
                    },
                },
            },
        });

        if (!bookOrder) {
            return NextResponse.json(
                { error: 'Book order not found' },
                { status: 404 }
            );
        }

        if (action === 'approve') {
            // Approve payment and generate invoice (like courses)
            const updated = await prisma.$transaction(async (tx) => {
                const order = await tx.bookOrder.update({
                    where: { id },
                    data: {
                        paymentStatus: 'COMPLETED',
                        // No orderStatus change - admin will send cashback screenshot next
                    },
                });

                // Generate invoice number
                const invoiceNumber = `INV-BOOK-${Date.now()}`;

                // Create invoice for the book
                const bookDetails = {
                    id: bookOrder.book.id,
                    title: bookOrder.book.title,
                    author: bookOrder.book.author,
                    price: bookOrder.book.price,
                    quantity: bookOrder.quantity,
                    type: 'book'
                };

                await tx.invoice.create({
                    data: {
                        invoiceNumber,
                        userId: bookOrder.userId,
                        subtotal: bookOrder.book.price * bookOrder.quantity,
                        taxRate: 18,
                        taxAmount: Math.round((bookOrder.book.price * bookOrder.quantity) * 0.18),
                        totalAmount: bookOrder.totalAmount,
                        customerName: bookOrder.deliveryName,
                        customerEmail: bookOrder.deliveryEmail,
                        customerPhone: bookOrder.deliveryPhone,
                        customerCompany: '',
                        customerAddress: `${bookOrder.deliveryAddress}, ${bookOrder.deliveryCity}, ${bookOrder.deliveryState} - ${bookOrder.deliveryPincode}`,
                        courseIds: [],
                        courseDetails: [bookDetails],
                        paymentMethod: 'Manual',
                        transactionId: `TXN-BOOK-${Date.now()}`,
                        notes: `Book Order - ${bookOrder.book.title}`,
                    },
                });

                return order;
            });

            // Create notification
            await prisma.notification.create({
                data: {
                    userId: bookOrder.userId,
                    userEmail: bookOrder.user.email,
                    type: 'BOOK_PAYMENT_APPROVED',
                    title: '✅ Book Payment Approved!',
                    message: `Your payment for "${bookOrder.book.title}" has been approved! Your book will be shipped soon. Invoice has been generated.`,
                    metadata: {
                        bookOrderId: bookOrder.id,
                        bookTitle: bookOrder.book.title,
                        amount: bookOrder.totalAmount,
                    },
                },
            });

            return NextResponse.json(updated);
        } else if (action === 'reject') {
            // Reject payment - admin will send refund screenshot (like courses)
            const updated = await prisma.bookOrder.update({
                where: { id },
                data: {
                    paymentStatus: 'PENDING_REFUND',
                    // No orderStatus change
                },
            });

            // Create notification
            await prisma.notification.create({
                data: {
                    userId: bookOrder.userId,
                    userEmail: bookOrder.user.email,
                    type: 'BOOK_PAYMENT_REJECTED',
                    title: '❌ Payment Rejected - Refund Processing',
                    message: `Your payment for "${bookOrder.book.title}" verification failed. We will process your refund and send you the refund screenshot within 1-2 hours.`,
                    metadata: {
                        bookOrderId: bookOrder.id,
                        bookTitle: bookOrder.book.title,
                        amount: bookOrder.totalAmount,
                    },
                },
            });

            return NextResponse.json(updated);
        } else if (action === 'send-cashback') {
            // Send 78% cashback screenshot (after approval, like courses)
            if (!refundOfferScreenshot) {
                return NextResponse.json(
                    { error: '78% Cashback screenshot required' },
                    { status: 400 }
                );
            }

            const cashbackAmount = Math.round(bookOrder.totalAmount * 0.78);

            const updated = await prisma.bookOrder.update({
                where: { id },
                data: {
                    refundOfferSent: true,
                    refundOfferUrl: refundOfferScreenshot,
                    refundOfferSentAt: new Date(),
                },
            });

            // Create notification
            await prisma.notification.create({
                data: {
                    userId: bookOrder.userId,
                    userEmail: bookOrder.user.email,
                    type: 'BOOK_CASHBACK_SENT',
                    title: '🎉 78% Cashback Sent!',
                    message: `Great news! We've sent you ₹${cashbackAmount} (78% cashback) for "${bookOrder.book.title}"! Check the screenshot below.`,
                    metadata: {
                        bookOrderId: bookOrder.id,
                        bookTitle: bookOrder.book.title,
                        cashbackAmount,
                        totalAmount: bookOrder.totalAmount,
                        refundOfferScreenshot,
                    },
                },
            });

            return NextResponse.json(updated);
        } else if (action === 'send-refund') {
            // Send refund screenshot (for rejected payments, like courses)
            if (!refundScreenshot) {
                return NextResponse.json(
                    { error: 'Refund screenshot required' },
                    { status: 400 }
                );
            }

            const updated = await prisma.bookOrder.update({
                where: { id },
                data: {
                    paymentStatus: 'REFUNDED',
                    refundScreenshot,
                },
            });

            // Create notification
            await prisma.notification.create({
                data: {
                    userId: bookOrder.userId,
                    userEmail: bookOrder.user.email,
                    type: 'BOOK_PAYMENT_REFUNDED',
                    title: '💰 Refund Sent',
                    message: `Your refund of ₹${bookOrder.totalAmount} for "${bookOrder.book.title}" has been processed. Check the screenshot below.`,
                    metadata: {
                        bookOrderId: bookOrder.id,
                        bookTitle: bookOrder.book.title,
                        refundAmount: bookOrder.totalAmount,
                        refundScreenshot,
                    },
                },
            });

            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('❌❌❌ Error processing book order action:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error:', error);
        return NextResponse.json(
            { error: 'Failed to process action', details: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}
