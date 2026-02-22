# 🔍 SkillReimburse - Complete Data Flow & Table Relationships

## 📊 Table Structure & Relationships Explained

### **Database Model**: PostgreSQL with Prisma ORM

---

## 🏗️ PART 1: TABLE STRUCTURES

### 1️⃣ **USER TABLE** (users)

```typescript
model User {
  id            String    // Unique ID (auto-generated)
  email         String    // User's email (UNIQUE)
  name          String    // Full name
  password      String    // Hashed with bcrypt
  phone         String?   // Optional phone number
  company       String?   // Employer name (for reimbursement)
  designation   String?   // Job title
  upiId         String?   // UPI ID for refunds
  role          Role      // USER or ADMIN
  createdAt     DateTime  // Registration timestamp
  updatedAt     DateTime  // Last update timestamp
  
  // RELATIONSHIPS:
  enrollments   Enrollment[]     // Courses user has purchased
  payments      Payment[]        // All payment transactions
  courseRequests CourseRequest[] // Course suggestions made
  accounts      Account[]        // OAuth providers (Google, GitHub)
  sessions      Session[]        // Login sessions (NextAuth)
}
```

**Purpose**: Store all user information - authentication, profile, company details

**When Data is Added**:
```typescript
// REGISTRATION - /app/api/auth/register/route.ts
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "password123",
  "phone": "9876543210",
  "company": "Tech Corp",
  "designation": "Developer"
}

// CODE EXECUTION:
const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword, // bcrypt.hash(password, 10)
    phone,
    company,
    designation,
    role: 'USER',
  },
});
```

**Result**: New row in `users` table
```
id: "clx123abc"
email: "john@company.com"
name: "John Doe"
password: "$2a$10$xyz..." (hashed)
company: "Tech Corp"
role: "USER"
createdAt: "2026-02-21T10:30:00.000Z"
```

---

### 2️⃣ **SESSION TABLE** (sessions) - NextAuth

```typescript
model Session {
  id           String   // Session ID
  sessionToken String   // Unique token (UNIQUE)
  userId       String   // Foreign Key → User.id
  expires      DateTime // Session expiry time
  
  // RELATIONSHIP:
  user User // Belongs to one user
}
```

**Purpose**: Track active login sessions

**When Data is Added**:
```typescript
// LOGIN - /app/login/page.tsx
signIn('credentials', {
  email: 'john@company.com',
  password: 'password123',
})

// NextAuth automatically creates:
await prisma.session.create({
  data: {
    sessionToken: "random_token_xyz",
    userId: "clx123abc",
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
})
```

**Relationship**: 
```
User (1) ──── (Many) Sessions
One user can have multiple active sessions (phone, laptop, tablet)
```

---

### 3️⃣ **COURSE TABLE** (courses)

```typescript
model Course {
  id            String
  title         String
  slug          String    // URL-friendly (UNIQUE)
  description   Text      // Full description
  shortDesc     String    // Brief summary
  thumbnail     String    // Image URL
  price         Float     // Price in INR
  duration      Int       // Access days (default: 90)
  category      String    // "Web Development", "AI/ML", etc.
  level         String    // "Beginner", "Intermediate", "Advanced"
  language      String    // "English", "Hindi"
  whatYouLearn  String[]  // Array: ["Build APIs", "React hooks"]
  prerequisites String[]  // Array: ["Basic JS", "HTML/CSS"]
  isActive      Boolean   // Published or draft
  isFeatured    Boolean   // Show on homepage
  rating        Float     // Average rating (0-5)
  studentsCount Int       // Total enrolled students
  createdAt     DateTime
  updatedAt     DateTime
  
  // RELATIONSHIPS:
  modules       Module[]      // Course chapters
  enrollments   Enrollment[]  // Students who bought it
  books         Book[]        // Supplementary PDFs
  reviews       Review[]      // Student reviews
}
```

**Purpose**: Store all course information and content

**When Data is Added**:
```typescript
// ADMIN CREATES COURSE (Currently using mock data in frontend)
// In future: POST /api/admin/courses

const course = await prisma.course.create({
  data: {
    title: "Full Stack Web Development",
    slug: "full-stack-web-development",
    description: "Learn React, Node.js, MongoDB...",
    thumbnail: "/images/course.jpg",
    price: 15999,
    duration: 90,
    category: "Web Development",
    level: "Intermediate",
    whatYouLearn: [
      "Build REST APIs",
      "Master React",
      "Deploy to cloud"
    ],
    isActive: true,
    isFeatured: true,
  }
})
```

**Current Status**: Using hardcoded data in `/app/courses/page.tsx`
```typescript
const courses = [
  {
    id: '1',
    title: 'Full Stack Web Development',
    slug: 'full-stack-web-development',
    price: 15999,
    // ... more fields
  }
]
```

---

### 4️⃣ **MODULE TABLE** (modules)

```typescript
model Module {
  id          String
  courseId    String    // Foreign Key → Course.id
  title       String
  description String
  order       Int       // Display order: 1, 2, 3...
  createdAt   DateTime
  updatedAt   DateTime
  
  // RELATIONSHIPS:
  course  Course   // Belongs to one course
  lessons Lesson[] // Contains many lessons
}
```

**Purpose**: Course chapters/sections

**When Data is Added**:
```typescript
// When admin creates course modules
await prisma.module.create({
  data: {
    courseId: "course_id_123",
    title: "Module 1: HTML & CSS Fundamentals",
    description: "Learn the basics...",
    order: 1,
  }
})
```

**Relationship**:
```
Course (1) ──── (Many) Modules
One course has multiple modules (chapters)

Example:
Course: "Full Stack Dev"
├── Module 1: HTML & CSS
├── Module 2: JavaScript
├── Module 3: React
└── Module 4: Node.js
```

---

### 5️⃣ **LESSON TABLE** (lessons)

```typescript
model Lesson {
  id          String
  moduleId    String   // Foreign Key → Module.id
  title       String
  content     Text     // Theory (Markdown format)
  videoUrl    String   // YouTube/Vimeo link
  videoType   String   // "youtube", "vimeo", "custom"
  duration    Int      // Video minutes
  order       Int      // Display order
  isFree      Boolean  // Preview lesson
  createdAt   DateTime
  updatedAt   DateTime
  
  // RELATIONSHIPS:
  module   Module            // Belongs to one module
  progress LessonProgress[]  // Tracking data
}
```

**Purpose**: Individual video/theory lessons

**When Data is Added**:
```typescript
await prisma.lesson.create({
  data: {
    moduleId: "module_123",
    title: "Introduction to HTML",
    content: "# HTML Basics\n\nHTML stands for...",
    videoUrl: "https://youtube.com/watch?v=abc123",
    videoType: "youtube",
    duration: 15,
    order: 1,
    isFree: true, // Preview lesson
  }
})
```

**Relationship**:
```
Module (1) ──── (Many) Lessons
One module has multiple lessons

Example:
Module: "JavaScript Basics"
├── Lesson 1: Variables and Data Types (15 min)
├── Lesson 2: Functions (20 min)
├── Lesson 3: Arrays (18 min)
└── Lesson 4: Objects (22 min)
```

---

### 6️⃣ **ENROLLMENT TABLE** (enrollments)

```typescript
model Enrollment {
  id            String
  userId        String    // Foreign Key → User.id
  courseId      String    // Foreign Key → Course.id
  startDate     DateTime  // Purchase date
  endDate       DateTime  // startDate + 90 days
  isActive      Boolean   // Access valid?
  progress      Int       // 0-100%
  lastAccessedAt DateTime
  completedAt   DateTime  // When 100% complete
  createdAt     DateTime
  
  // RELATIONSHIPS:
  user    User              // Belongs to one user
  course  Course            // Belongs to one course
  lessonProgress LessonProgress[] // Detailed tracking
}
```

**Purpose**: Track who bought which course and their progress

**When Data is Added**:
```typescript
// AFTER SUCCESSFUL PAYMENT - /app/api/payment/success
// (Currently not implemented, will be added with Razorpay)

await prisma.enrollment.create({
  data: {
    userId: "user_123",
    courseId: "course_456",
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 days
    isActive: true,
    progress: 0,
  }
})
```

**Relationship**:
```
User (1) ──── (Many) Enrollments ──── (1) Course

Example:
User: "John Doe"
├── Enrollment 1: Full Stack Dev (Progress: 45%)
├── Enrollment 2: Python Basics (Progress: 100%)
└── Enrollment 3: Data Science (Progress: 12%)

Unique Constraint: (userId + courseId)
Cannot buy the same course twice!
```

---

### 7️⃣ **LESSON_PROGRESS TABLE** (lesson_progress)

```typescript
model LessonProgress {
  id              String
  enrollmentId    String   // Foreign Key → Enrollment.id
  lessonId        String   // Foreign Key → Lesson.id
  completed       Boolean
  watchedDuration Int      // Seconds watched
  completedAt     DateTime
  createdAt       DateTime
  updatedAt       DateTime
  
  // RELATIONSHIPS:
  enrollment Enrollment // Belongs to one enrollment
  lesson     Lesson     // Belongs to one lesson
}
```

**Purpose**: Track individual lesson completion

**When Data is Added**:
```typescript
// When user watches a lesson (video player tracking)
// /app/dashboard/course/[id]/lesson/[lessonId]

await prisma.lessonProgress.upsert({
  where: {
    enrollmentId_lessonId: {
      enrollmentId: "enroll_123",
      lessonId: "lesson_456"
    }
  },
  update: {
    watchedDuration: 450, // 7.5 minutes
    completed: true,
    completedAt: new Date()
  },
  create: {
    enrollmentId: "enroll_123",
    lessonId: "lesson_456",
    completed: true,
    watchedDuration: 450,
  }
})
```

**Relationship**:
```
Enrollment (1) ──── (Many) LessonProgress ──── (1) Lesson

Example:
Enrollment: "John's Full Stack Course"
├── Lesson 1: HTML Intro (✅ 100% watched)
├── Lesson 2: CSS Basics (✅ 100% watched)
├── Lesson 3: JS Variables (⏸️ 45% watched)
└── Lesson 4: Functions (❌ Not started)
```

---

### 8️⃣ **PAYMENT TABLE** (payments)

```typescript
model Payment {
  id                String
  userId            String    // Foreign Key → User.id
  courseId          String
  amount            Float
  currency          String    // "INR"
  status            PaymentStatus // PENDING/COMPLETED/FAILED
  paymentMethod     String    // "UPI", "Card", "Wallet"
  razorpayOrderId   String    // Razorpay order ID
  razorpayPaymentId String    // Razorpay payment ID
  razorpaySignature String    // For verification
  invoiceNumber     String    // UNIQUE (INV-2026-001)
  customerName      String
  customerEmail     String
  customerCompany   String    // For reimbursement
  refundOption      RefundOption
  refundAccount     String
  createdAt         DateTime
  updatedAt         DateTime
  
  // RELATIONSHIPS:
  user User // Belongs to one user
}
```

**Purpose**: Store all payment transactions

**When Data is Added**:
```typescript
// STEP 1: Create Razorpay order - /app/api/payment/create
const payment = await prisma.payment.create({
  data: {
    userId: "user_123",
    courseId: "course_456",
    amount: 15999,
    currency: "INR",
    status: "PENDING",
    invoiceNumber: `INV-${Date.now()}`,
    customerName: "John Doe",
    customerEmail: "john@company.com",
    customerCompany: "Tech Corp",
  }
})

// STEP 2: After Razorpay success - /app/api/payment/verify
await prisma.payment.update({
  where: { id: payment.id },
  data: {
    status: "COMPLETED",
    razorpayPaymentId: "pay_xyz123",
    razorpayOrderId: "order_abc456",
    razorpaySignature: "signature_hash",
    paymentMethod: "UPI",
  }
})

// STEP 3: Create enrollment (course access)
await prisma.enrollment.create({...})
```

**Relationship**:
```
User (1) ──── (Many) Payments

Example:
User: "John Doe"
├── Payment 1: ₹15,999 (Full Stack - COMPLETED)
├── Payment 2: ₹12,999 (Python - COMPLETED)
└── Payment 3: ₹8,999 (DSA - FAILED)
```

---

### 9️⃣ **COURSE_REQUEST TABLE** (course_requests)

```typescript
model CourseRequest {
  id            String
  userId        String    // Foreign Key → User.id
  courseName    String
  description   Text
  category      String
  expectedPrice Float
  priority      String    // "LOW", "MEDIUM", "HIGH"
  status        RequestStatus // PENDING/APPROVED/REJECTED
  adminNotes    Text
  createdAt     DateTime
  updatedAt     DateTime
  
  // RELATIONSHIPS:
  user User // Belongs to one user
}
```

**Purpose**: Store user course suggestions/requests

**When Data is Added**:
```typescript
// REQUEST COURSE - /app/api/course-request/route.ts
POST /api/course-request
{
  "courseName": "Advanced Kubernetes",
  "description": "Need course on K8s deployment...",
  "category": "DevOps",
  "expectedPrice": 18999
}

// CODE EXECUTION:
const courseRequest = await prisma.courseRequest.create({
  data: {
    courseName: "Advanced Kubernetes",
    description: "Need course on K8s deployment...",
    category: "DevOps",
    expectedPrice: 18999,
    userId: session.user.id, // From NextAuth session
    status: "PENDING",
  },
});
```

**Result**:
```
id: "req_789"
userId: "user_123"
courseName: "Advanced Kubernetes"
description: "Need course on K8s..."
status: "PENDING"
createdAt: "2026-02-21T11:00:00.000Z"
```

---

### 🔟 **REVIEW TABLE** (reviews)

```typescript
model Review {
  id         String
  userId     String    // Foreign Key → User.id
  courseId   String    // Foreign Key → Course.id
  rating     Int       // 1-5 stars
  comment    Text
  isApproved Boolean   // Moderation
  createdAt  DateTime
  updatedAt  DateTime
  
  // RELATIONSHIPS:
  course Course // Belongs to one course
}
```

**Purpose**: Course ratings and feedback

**When Data is Added**:
```typescript
// After completing course
await prisma.review.create({
  data: {
    userId: "user_123",
    courseId: "course_456",
    rating: 5,
    comment: "Excellent course! Learned a lot.",
    isApproved: false, // Admin will review
  }
})
```

---

## 🔗 PART 2: COMPLETE RELATIONSHIPS MAP

```
┌─────────────────────────────────────────────────────────────┐
│                         USER TABLE                          │
│                      (Central Hub)                          │
└───────┬─────────────┬─────────────┬────────────┬───────────┘
        │             │             │            │
        │             │             │            │
        │1:N          │1:N          │1:N         │1:N
        ▼             ▼             ▼            ▼
   ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌─────────┐
   │ENROLLMENT│  │ PAYMENT  │  │COURSE   │  │SESSION  │
   │          │  │          │  │REQUEST  │  │         │
   └────┬─────┘  └──────────┘  └─────────┘  └─────────┘
        │
        │1:N
        ▼
   ┌──────────┐
   │ LESSON   │
   │ PROGRESS │
   └──────────┘

┌─────────────────────────────────────────────────────────────┐
│                        COURSE TABLE                         │
│                     (Content Hub)                           │
└───────┬─────────────┬─────────────┬───────────────────────┘
        │             │             │
        │1:N          │1:N          │1:N
        ▼             ▼             ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │  MODULE  │  │   BOOK   │  │  REVIEW  │
   └────┬─────┘  └──────────┘  └──────────┘
        │
        │1:N
        ▼
   ┌──────────┐
   │  LESSON  │
   └──────────┘
```

### **Key Relationships**:

1. **User → Enrollments** (One-to-Many)
   - One user can enroll in many courses
   
2. **Course → Enrollments** (One-to-Many)
   - One course can have many students

3. **Enrollment → LessonProgress** (One-to-Many)
   - Each enrollment tracks progress for multiple lessons

4. **Course → Modules** (One-to-Many)
   - One course has multiple modules (chapters)

5. **Module → Lessons** (One-to-Many)
   - One module has multiple lessons

6. **User → Payments** (One-to-Many)
   - One user can make many purchases

7. **User → CourseRequests** (One-to-Many)
   - One user can request many courses

---

## 📈 PART 3: COMPLETE DATA FLOW

### **FLOW 1: User Registration**
```
1. User fills form: /app/register/page.tsx
2. POST /api/auth/register
3. Validate: name, email, password
4. Check: prisma.user.findUnique({ where: { email } })
5. Hash password: bcrypt.hash(password, 10)
6. Create user: prisma.user.create({...})
7. Return success ✅
```

**Tables Updated**: `users` ✅

---

### **FLOW 2: User Login**
```
1. User submits: /app/login/page.tsx
2. signIn('credentials', { email, password })
3. NextAuth calls: lib/auth.ts → authorize()
4. Query: prisma.user.findUnique({ where: { email } })
5. Verify: bcrypt.compare(password, user.password)
6. Create JWT token
7. Create session: prisma.session.create({...}) ← AUTOMATIC
8. Return session ✅
```

**Tables Updated**: `users` (read), `sessions` ✅

---

### **FLOW 3: Request Course**
```
1. User fills form: /app/request-course/page.tsx
2. POST /api/course-request
3. Check session: getServerSession(authOptions)
4. Create request: prisma.courseRequest.create({
     courseName, description, userId, status: "PENDING"
   })
5. Return success ✅
```

**Tables Updated**: `course_requests` ✅

---

### **FLOW 4: Purchase Course (FUTURE)**
```
1. User clicks "Buy": /app/courses/[slug]
2. POST /api/payment/create
3. Create pending payment: prisma.payment.create({
     userId, courseId, amount, status: "PENDING"
   })
4. Create Razorpay order
5. User pays via Razorpay
6. POST /api/payment/verify
7. Verify signature
8. Update payment: prisma.payment.update({
     status: "COMPLETED", razorpayPaymentId
   })
9. Create enrollment: prisma.enrollment.create({
     userId, courseId, startDate, endDate: +90 days
   })
10. Send invoice email ✅
```

**Tables Updated**: `payments`, `enrollments` ✅

---

### **FLOW 5: Watch Lesson (FUTURE)**
```
1. User clicks lesson: /app/dashboard/course/[id]/lesson/[lessonId]
2. Check enrollment: prisma.enrollment.findFirst({
     userId, courseId, isActive: true
   })
3. Load lesson: prisma.lesson.findUnique({ id })
4. Track progress: prisma.lessonProgress.upsert({
     enrollmentId, lessonId, watchedDuration, completed
   })
5. Calculate overall progress
6. Update enrollment: prisma.enrollment.update({
     progress: calculated %
   })
```

**Tables Updated**: `lesson_progress`, `enrollments` ✅

---

## 🎯 CURRENT STATUS

### ✅ **Implemented Tables**:
1. User (via Prisma schema)
2. Session (NextAuth automatic)
3. CourseRequest (API working)

### ⏳ **Partially Implemented**:
1. Course (hardcoded data in frontend)
2. Payment (Razorpay integration pending)
3. Enrollment (API not created yet)

### ❌ **Not Yet Implemented**:
1. Module, Lesson, LessonProgress
2. Review, Book, Notification
3. Account (OAuth providers)

### 🚀 **To Complete Full System**:
```bash
# 1. Push schema to database
npx prisma db push

# 2. Create missing API routes
- /api/payment/create
- /api/payment/verify
- /api/enrollment/create
- /api/admin/courses (CRUD)

# 3. Add Razorpay integration
# 4. Build lesson player
# 5. Add progress tracking
```

This is your complete database architecture! 🎉
