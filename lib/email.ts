import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string) {
  const mailOptions = {
    from: `"SkillVoucher" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Password Reset OTP - SkillVoucher',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested to reset your password for SkillVoucher. Use the OTP code below to proceed:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
                <p class="otp-code">${otp}</p>
                <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
              </div>
              
              <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
              
              <div class="warning">
                ⚠️ <strong>Security Note:</strong> Never share this OTP with anyone. SkillVoucher staff will never ask for your OTP.
              </div>
              
              <div class="footer">
                <p>© 2026 SkillVoucher. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}

export async function sendPasswordResetConfirmation(email: string, name: string) {
  const mailOptions = {
    from: `"SkillVoucher" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Password Reset Successful - SkillVoucher',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 48px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>Password Reset Successful</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Your password has been successfully reset. You can now login with your new password.</p>
              <p>If you didn't make this change, please contact us immediately at <a href="mailto:support@skillvoucher.com">support@skillvoucher.com</a></p>
              
              <div class="footer">
                <p>© 2026 SkillVoucher. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset confirmation sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    // Don't throw error - password is already reset
  }
}
