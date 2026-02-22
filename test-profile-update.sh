#!/bin/bash

# Test Profile Update
# This script tests the profile update functionality

echo "🧪 Testing Profile Update"
echo "========================="
echo ""

# First, login and get session (simplified test)
echo "📝 Test updating profile for john@example.com..."
echo ""

# Show current profile
echo "Current profile in database:"
psql "postgresql://postgres:postgres123@localhost:5432/skillreimburse" -c \
  "SELECT name, email, phone, company, designation FROM users WHERE email = 'john@example.com';"

echo ""
echo "Update the profile via UI:"
echo "1. Go to: http://localhost:3000/login"
echo "2. Login with: john@example.com / SecurePass123"
echo "3. Go to: http://localhost:3000/profile"
echo "4. Click 'Edit' button"
echo "5. Update name, phone, company, or designation"
echo "6. Click 'Save'"
echo ""
echo "After saving, run this command to see updates:"
echo "psql \"postgresql://postgres:postgres123@localhost:5432/skillreimburse\" -c \"SELECT name, phone, company, designation, \\\"updatedAt\\\" FROM users WHERE email = 'john@example.com';\""
