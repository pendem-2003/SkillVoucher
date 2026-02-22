#!/bin/bash

# Test Forgot Password and Show OTP
# This script requests an OTP and displays it

EMAIL="${1:-john@example.com}"

echo "🔐 Testing Forgot Password Flow"
echo "================================"
echo ""
echo "Email: $EMAIL"
echo ""

# Request OTP
echo "📧 Requesting OTP..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\"}")

echo "$RESPONSE" | jq .

# Extract OTP
OTP=$(echo "$RESPONSE" | jq -r '.otp // empty')

if [ -n "$OTP" ]; then
  echo ""
  echo "✅ OTP Generated!"
  echo "===================="
  echo ""
  echo "   🔢 YOUR OTP: $OTP"
  echo ""
  echo "===================="
  echo ""
  echo "This OTP is valid for 10 minutes."
  echo "Use it to reset your password."
  echo ""
  
  # Show in database
  echo "💾 OTP in database:"
  psql "postgresql://postgres:postgres123@localhost:5432/skillreimburse" -c \
    "SELECT email, token as otp, TO_CHAR(expires, 'HH24:MI:SS') as expires_at 
     FROM password_reset_tokens 
     WHERE email = '$EMAIL' AND used = false 
     ORDER BY \"createdAt\" DESC LIMIT 1;" 2>/dev/null
else
  echo "❌ Failed to generate OTP"
  echo ""
  echo "Response: $RESPONSE"
fi
