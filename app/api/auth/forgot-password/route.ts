import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOTPEmail } from '@/lib/email';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not (security)
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive an OTP shortly.' },
        { status: 200 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: {
        email,
        used: false,
      },
    });

    // Create new OTP token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: otp,
        expires,
      },
    });

    // Send OTP email (optional - will log error if SMTP not configured)
    try {
      await sendOTPEmail(email, otp);
      console.log('✅ OTP email sent to:', email);
    } catch (emailError) {
      console.warn('⚠️ Failed to send email (SMTP not configured):', emailError instanceof Error ? emailError.message : emailError);
      console.log('📧 OTP for', email, ':', otp, '(expires in 10 minutes)');
    }

    console.log('✅ Password reset OTP generated for:', email);

    return NextResponse.json(
      { 
        message: 'OTP sent to your email address. Please check your inbox.',
        expiresIn: 600, // seconds
        // In development, show OTP in response when email fails
        ...(process.env.NODE_ENV === 'development' && { otp })
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
