import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Find valid OTP token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        token: otp,
        used: false,
        expires: {
          gt: new Date(), // Not expired
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    console.log('✅ OTP verified for:', email);

    // Return token ID for reset password step
    return NextResponse.json(
      { 
        message: 'OTP verified successfully',
        resetTokenId: resetToken.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
