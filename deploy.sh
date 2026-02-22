#!/bin/bash

# 🚀 SkillReimburse LMS - Quick Deployment Script
# Run this after setting up Neon database

echo "🚀 Starting SkillReimburse LMS Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the skillreimburse directory${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}🔧 Step 2: Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

echo -e "${YELLOW}⚠️  Step 3: Database Setup${NC}"
echo "Make sure you have:"
echo "1. Created a Neon PostgreSQL database"
echo "2. Added DATABASE_URL to .env file"
echo ""
read -p "Have you set up DATABASE_URL in .env? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Please set up DATABASE_URL first${NC}"
    echo "Get it from: https://neon.tech"
    exit 1
fi

echo -e "${BLUE}📊 Pushing database schema...${NC}"
npx prisma db push
echo -e "${GREEN}✅ Database schema pushed${NC}"
echo ""

echo -e "${BLUE}🏗️  Step 4: Building application...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed. Check errors above.${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}🔐 Step 5: Generate NEXTAUTH_SECRET${NC}"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "Add this to your .env file:"
echo "NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\""
echo ""

echo -e "${GREEN}✅ Local setup complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Test locally: npm run dev"
echo "2. Install Vercel CLI: npm install -g vercel"
echo "3. Deploy: vercel --prod"
echo "4. Set environment variables in Vercel dashboard"
echo "5. Create admin user: gpendem2003@gmail.com"
echo ""
echo -e "${GREEN}🎉 Ready to deploy!${NC}"
