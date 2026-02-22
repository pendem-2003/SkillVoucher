#!/bin/bash

# Email Configuration Test Script

echo "📧 SkillReimburse Email Configuration"
echo "======================================"
echo ""

# Check environment variables
echo "Current Configuration:"
echo "---------------------"
echo "SMTP Host: ${SMTP_HOST:-smtp.gmail.com}"
echo "SMTP Port: ${SMTP_PORT:-587}"
echo "SMTP User: gpendem2003@gmail.com"
echo "SMTP Pass: ${SMTP_PASS:+[SET - $(echo $SMTP_PASS | wc -c | xargs) characters]} ${SMTP_PASS:-[NOT SET]}"
echo ""

# Check if configured
if [ -z "$SMTP_PASS" ] || [ "$SMTP_PASS" = "your-16-char-app-password-here" ]; then
  echo "❌ Email NOT configured"
  echo ""
  echo "To enable email sending:"
  echo "1. Get Gmail App Password: https://myaccount.google.com/apppasswords"
  echo "2. Update SMTP_PASS in .env.local"
  echo "3. Restart dev server"
  echo ""
  echo "📖 See EMAIL_SETUP.md for detailed instructions"
else
  echo "✅ Email CONFIGURED"
  echo ""
  echo "Emails will be sent from:"
  echo "  SkillReimburse <gpendem2003@gmail.com>"
  echo ""
  echo "To test, go to: http://localhost:3000/forgot-password"
fi

echo ""
echo "For now, OTP is shown in development mode:"
echo "  • Browser DevTools → Network tab"
echo "  • Or run: ./get-otp.sh your-email@example.com"
