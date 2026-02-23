#!/bin/bash

# Test Registration After Server Restart
# Run this after restarting your Next.js dev server

echo "🧪 Testing User Registration"
echo "============================"
echo ""

# Test 1: Register a new user
echo "📝 Registering new user..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123",
    "phone": "2291157332",
    "company": "Tech Corp",
    "designation": "Software Engineer"
  }')

echo "$RESPONSE" | jq .
echo ""

# Check if registration was successful
if echo "$RESPONSE" | grep -q "successfully"; then
  echo "✅ Registration successful!"
  echo ""
  
  # View the user in database
  echo "👤 User in database:"
  echo "-------------------"
  psql "postgresql://postgres:postgres@localhost:51215/template1" -c "
    SELECT id, name, email, phone, company, designation, role 
    FROM users 
    WHERE email = 'john.doe@example.com';
  "
else
  echo "❌ Registration failed. Error details above."
fi
