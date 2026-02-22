const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testSignup() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('TestPass123', 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        phone: '1234567890',
        company: 'Test Company',
        designation: 'Developer',
        role: 'USER',
      },
    });
    
    console.log('✅ User created successfully:', user);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSignup();
