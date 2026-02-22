import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseIds, billingInfo } = body;

    // Validate input
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { error: 'Course IDs are required' },
        { status: 400 }
      );
    }

    // Check if user is already enrolled in any of these courses
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
        courseId: {
          in: courseIds,
        },
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    if (existingEnrollments.length > 0) {
      const enrolledCourses = existingEnrollments.map((e: any) => e.course.title).join(', ');
      return NextResponse.json(
        { error: `You are already enrolled in: ${enrolledCourses}` },
        { status: 400 }
      );
    }

    // Fetch course details
    const courses = await prisma.course.findMany({
      where: {
        id: {
          in: courseIds,
        },
        isActive: true, // Only allow enrolling in active courses
      },
    });

    if (courses.length !== courseIds.length) {
      return NextResponse.json(
        { error: 'One or more courses not found or not available' },
        { status: 404 }
      );
    }

    // Calculate total amount
    const totalAmount = courses.reduce((sum: number, course: any) => sum + course.price, 0);
    const taxAmount = Math.round(totalAmount * 0.18); // 18% GST
    const finalAmount = totalAmount + taxAmount;

    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create enrollments, payment record, and invoice in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create enrollments
      const enrollments = await Promise.all(
        courses.map((course: any) => {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 90); // 90 days validity

          return tx.enrollment.create({
            data: {
              userId: session.user.id,
              courseId: course.id,
              startDate,
              endDate,
              progress: 0,
              isActive: true,
            },
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  thumbnail: true,
                  instructor: true,
                  price: true,
                },
              },
            },
          });
        }) as any
      );

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          userId: session.user.id,
          courseId: courses[0].id, // Link to first course
          amount: finalAmount,
          status: 'COMPLETED',
          paymentMethod: 'CARD',
          razorpayOrderId: `ORDER_${Date.now()}`,
          razorpayPaymentId: `PAY_${Date.now()}`,
          invoiceNumber: invoiceNumber,
          customerName: billingInfo?.name || session.user.name || 'Customer',
          customerEmail: billingInfo?.email || session.user.email || '',
          customerPhone: billingInfo?.phone || '',
          customerCompany: billingInfo?.company || '',
        },
      });

      // Create invoice with detailed course information
      const courseDetails = courses.map((course: any) => ({
        id: course.id,
        title: course.title,
        instructor: course.instructor || 'SkillVoucher Instructor',
        price: course.price,
        duration: `${course.duration} days`,
      }));

      await tx.invoice.create({
        data: {
          invoiceNumber: invoiceNumber,
          paymentId: payment.id,
          userId: session.user.id,
          subtotal: totalAmount,
          taxRate: 18,
          taxAmount: taxAmount,
          totalAmount: finalAmount,
          customerName: billingInfo?.name || session.user.name || 'Customer',
          customerEmail: billingInfo?.email || session.user.email || '',
          customerPhone: billingInfo?.phone || '',
          customerCompany: billingInfo?.company || '',
          customerAddress: billingInfo?.address || '',
          courseIds: courses.map((c: any) => c.id),
          courseDetails: courseDetails,
          paymentMethod: 'CARD',
          transactionId: `TXN_${Date.now()}`,
          notes: `Purchase of ${courses.length} course(s) - Valid for 90 days`,
        },
      });

      // Update course student counts
      await Promise.all(
        courses.map((course: any) =>
          tx.course.update({
            where: { id: course.id },
            data: { studentsCount: { increment: 1 } },
          })
        )
      );

      return { enrollments, payment };
    });

    return NextResponse.json({
      success: true,
      enrollments: result.enrollments,
      payment: {
        id: result.payment.id,
        amount: result.payment.amount,
        status: result.payment.status,
      },
      message: `Successfully enrolled in ${result.enrollments.length} course(s)`,
    });
  } catch (error: any) {
    console.error('Error creating enrollments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create enrollments' },
      { status: 500 }
    );
  }
}
