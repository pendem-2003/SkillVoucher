const { Pool } = require('pg');

const connectionString =
    'postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable';

const pool = new Pool({ connectionString });

async function viewDatabase() {
    const client = await pool.connect();

    try {
        console.log('\n📊 DATABASE OVERVIEW\n');
        console.log('='.repeat(60));

        // List all tables
        const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        console.log('\n📋 TABLES:');
        if (tables.rows.length === 0) {
            console.log('  No tables found. Creating tables...\n');
            await createTables(client);

            // Re-fetch tables
            const newTables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
            newTables.rows.forEach((row) => {
                console.log(`  ✓ ${row.table_name}`);
            });
        } else {
            tables.rows.forEach((row) => {
                console.log(`  ✓ ${row.table_name}`);
            });
        }

        // Check data in each table
        console.log('\n📈 DATA COUNTS:');

        const counts = await Promise.all([
            client.query('SELECT COUNT(*) FROM "User"').catch(() => ({ rows: [{ count: 'N/A' }] })),
            client.query('SELECT COUNT(*) FROM "Course"').catch(() => ({ rows: [{ count: 'N/A' }] })),
            client.query('SELECT COUNT(*) FROM "Enrollment"').catch(() => ({ rows: [{ count: 'N/A' }] })),
            client.query('SELECT COUNT(*) FROM "CourseRequest"').catch(() => ({ rows: [{ count: 'N/A' }] })),
            client.query('SELECT COUNT(*) FROM "Transaction"').catch(() => ({ rows: [{ count: 'N/A' }] })),
        ]);

        console.log(`  Users: ${counts[0].rows[0].count}`);
        console.log(`  Courses: ${counts[1].rows[0].count}`);
        console.log(`  Enrollments: ${counts[2].rows[0].count}`);
        console.log(`  Course Requests: ${counts[3].rows[0].count}`);
        console.log(`  Transactions: ${counts[4].rows[0].count}`);

        // Show recent users
        const users = await client.query('SELECT id, name, email, company, role, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 5').catch(() => ({ rows: [] }));
        if (users.rows.length > 0) {
            console.log('\n👥 RECENT USERS:');
            users.rows.forEach((user) => {
                console.log(`  - ${user.name} (${user.email})`);
                console.log(`    Role: ${user.role} | Company: ${user.company || 'N/A'}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Database query completed!\n');
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

async function createTables(client) {
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

    await client.query(`CREATE INDEX IF NOT EXISTS "Enrollment_userId_idx" ON "Enrollment"("userId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "Enrollment_courseId_idx" ON "Enrollment"("courseId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "CourseRequest_userId_idx" ON "CourseRequest"("userId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");`);

    console.log('  ✅ All tables created successfully!');
}

viewDatabase();
