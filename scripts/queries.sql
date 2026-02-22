-- ============================================
-- DATABASE INSPECTION QUERIES
-- ============================================

-- 1. LIST ALL TABLES
\dt

-- 2. VIEW TABLE STRUCTURES
\d "User"
\d "Course"
\d "Enrollment"
\d "CourseRequest"
\d "Transaction"

-- 3. COUNT RECORDS IN EACH TABLE
SELECT 'Users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Courses', COUNT(*) FROM "Course"
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM "Enrollment"
UNION ALL
SELECT 'CourseRequests', COUNT(*) FROM "CourseRequest"
UNION ALL
SELECT 'Transactions', COUNT(*) FROM "Transaction";

-- 4. VIEW ALL USERS
SELECT id, name, email, company, role, "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC;

-- 5. VIEW ALL COURSES
SELECT id, title, category, price, instructor, status 
FROM "Course" 
ORDER BY "createdAt" DESC;

-- 6. VIEW ENROLLMENTS WITH USER AND COURSE INFO
SELECT 
  e.id,
  u.name as user_name,
  u.email,
  c.title as course_title,
  e.progress,
  e.status,
  e."enrolledAt"
FROM "Enrollment" e
JOIN "User" u ON e."userId" = u.id
JOIN "Course" c ON e."courseId" = c.id
ORDER BY e."enrolledAt" DESC;

-- 7. VIEW COURSE REQUESTS
SELECT 
  cr.id,
  u.name as user_name,
  u.email,
  cr."courseName",
  cr.description,
  cr.status,
  cr."createdAt"
FROM "CourseRequest" cr
JOIN "User" u ON cr."userId" = u.id
ORDER BY cr."createdAt" DESC;

-- 8. VIEW TRANSACTIONS
SELECT 
  t.id,
  u.name as user_name,
  t.amount,
  t.type,
  t.status,
  t."paymentMethod",
  t."createdAt"
FROM "Transaction" t
JOIN "User" u ON t."userId" = u.id
ORDER BY t."createdAt" DESC;

-- 9. USER STATISTICS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'USER' THEN 1 END) as regular_users,
  COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admins,
  COUNT(CASE WHEN company IS NOT NULL THEN 1 END) as users_with_company
FROM "User";

-- 10. COURSE STATISTICS
SELECT 
  COUNT(*) as total_courses,
  COUNT(CASE WHEN status = 'PUBLISHED' THEN 1 END) as published,
  COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as drafts,
  AVG(price) as avg_price,
  SUM(students) as total_students
FROM "Course";
