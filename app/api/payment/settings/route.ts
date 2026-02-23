import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get payment settings
export async function GET(request: NextRequest) {
    try {
        const settings = await prisma.paymentSettings.findFirst({
            where: {
                isActive: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        if (!settings) {
            return NextResponse.json({
                success: true,
                settings: {
                    upiId: 'payment@learnreimb',
                    qrCodeUrl: '/payment-qr-placeholder.png',
                    bankName: 'Not configured',
                    accountNo: '',
                    ifscCode: '',
                    accountName: '',
                },
            });
        }

        return NextResponse.json({
            success: true,
            settings: {
                upiId: settings.upiId,
                qrCodeUrl: settings.qrCodeUrl,
                bankName: settings.bankName,
                accountNo: settings.accountNo,
                ifscCode: settings.ifscCode,
                accountName: settings.accountName,
            },
        });
    } catch (error: any) {
        console.error('Error fetching payment settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment settings' },
            { status: 500 }
        );
    }
}

// Update payment settings (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is admin
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Only administrators can update payment settings' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { upiId, qrCodeUrl, bankName, accountNo, ifscCode, accountName } = body;

        if (!upiId) {
            return NextResponse.json(
                { error: 'UPI ID is required' },
                { status: 400 }
            );
        }

        // Deactivate old settings
        await prisma.paymentSettings.updateMany({
            where: {
                isActive: true,
            },
            data: {
                isActive: false,
            },
        });

        // Create new settings
        const settings = await prisma.paymentSettings.create({
            data: {
                upiId,
                qrCodeUrl: qrCodeUrl || '/payment-qr-placeholder.png',
                bankName: bankName || null,
                accountNo: accountNo || null,
                ifscCode: ifscCode || null,
                accountName: accountName || null,
                isActive: true,
                updatedBy: session.user.id,
            },
        });

        return NextResponse.json({
            success: true,
            settings,
            message: 'Payment settings updated successfully',
        });
    } catch (error: any) {
        console.error('Error updating payment settings:', error);
        return NextResponse.json(
            { error: 'Failed to update payment settings' },
            { status: 500 }
        );
    }
}
