-- Create tables from Prisma schema

-- User table
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

-- Course table
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

-- Enrollment table
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

-- CourseRequest table
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

-- Transaction table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS "Enrollment_userId_idx" ON "Enrollment"("userId");
CREATE INDEX IF NOT EXISTS "Enrollment_courseId_idx" ON "Enrollment"("courseId");
CREATE INDEX IF NOT EXISTS "CourseRequest_userId_idx" ON "CourseRequest"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");

-- View all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
