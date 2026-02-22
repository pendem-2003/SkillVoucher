import { Pool } from 'pg';

const connectionString =
  'postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable';

const pool = new Pool({ connectionString });

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔨 Creating database tables...\n');

    // Create User table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "phone" TEXT,
        "company" TEXT,
        "designation" TEXT,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ User table created');

    // Create Course table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Course" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "thumbnail" TEXT,
        "category" TEXT NOT NULL,
        "duration" TEXT NOT NULL,
        "level" TEXT NOT NULL,
        "price" DECIMAL(10, 2) NOT NULL,
        "originalPrice" DECIMAL(10, 2),
        "instructor" TEXT NOT NULL,
        "rating" DECIMAL(3, 2) NOT NULL DEFAULT 0,
        "students" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Course table created');

    // Create Enrollment table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Enrollment" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "progress" INTEGER NOT NULL DEFAULT 0,
        "enrolledAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedAt" TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
      );
    `);
    console.log('✅ Enrollment table created');

    // Create CourseRequest table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "CourseRequest" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "courseName" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `);
    console.log('✅ CourseRequest table created');

    // Create Transaction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "amount" DECIMAL(10, 2) NOT NULL,
        "type" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "paymentMethod" TEXT NOT NULL,
        "razorpayOrderId" TEXT,
        "razorpayPaymentId" TEXT,
        "description" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `);
    console.log('✅ Transaction table created');

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS "Enrollment_userId_idx" ON "Enrollment"("userId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "Enrollment_courseId_idx" ON "Enrollment"("courseId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "CourseRequest_userId_idx" ON "CourseRequest"("userId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");`);
    console.log('✅ Indexes created');

    // List all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📊 Database Tables:');
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n✅ All tables created successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTables();
