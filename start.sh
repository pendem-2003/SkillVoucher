#!/bin/bash

echo "🚀 Starting SkillReimburse Application..."
echo ""

# Start Prisma dev server in background
echo "📦 Starting Prisma Database Server..."
npx prisma dev > /dev/null 2>&1 &
PRISMA_PID=$!
echo "✅ Prisma server started (PID: $PRISMA_PID)"

# Wait for Prisma to be ready
sleep 3

# Start Next.js dev server
echo "⚡ Starting Next.js Development Server..."
echo ""
npm run dev
