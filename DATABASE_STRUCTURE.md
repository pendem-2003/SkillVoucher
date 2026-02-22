# 📊 SkillReimburse Database Architecture

## 🗃️ Database Overview

**Database Type**: PostgreSQL (via Prisma Postgres)  
**ORM**: Prisma Client  
**Total Tables**: 15  
**Connection**: Local at `localhost:51214`

---

## 📋 Table Categories

### 1️⃣ **User Management** (4 tables)
- User
- Account
- Session  
- VerificationToken

### 2️⃣ **Course Content** (4 tables)
- Course
- Module
- Lesson
- Book

### 3️⃣ **Learning Tracking** (2 tables)
- Enrollment
- LessonProgress

### 4️⃣ **Financial** (1 table)
- Payment

### 5️⃣ **User Interaction** (2 tables)
- CourseRequest
- Review

### 6️⃣ **System** (1 table)
- Notification

---

## 🔗 Detailed Table Relationships

```
┌──────────────┐
│    USER      │ (Main hub - connects to everything)
│──────────────│
│ id (PK)      │
│ email        │◄───────────┐
│ name         │            │
│ password     │            │
│ company      │            │
│ role         │            │
└──────┬───────┘            │
       │                    │
       │ One-to-Many        │
       ├───────────────────────────┐
       │                           │
       ▼                           ▼
┌──────────────┐          ┌──────────────┐
│  ENROLLMENT  │          │   PAYMENT    │
│──────────────│          │──────────────│
│ id (PK)      │          │ id (PK)      │
│ userId (FK)  │          │ userId (FK)  │
│ courseId(FK) │          │ amount       │
│ startDate    │          │ status       │
│ endDate      │          │ invoiceNumber│
│ progress %   │          │ razorpayId   │
└──────┬───────┘          └──────────────┘
       │
       │ One-to-Many
       ▼
┌──────────────┐
│LESSON        │
│PROGRESS      │
│──────────────│
│ id (PK)      │
│ enrollmentId │
│ lessonId(FK) │
│ completed    │
│ watchedTime  │
└──────────────┘

┌──────────────┐
│   COURSE     │ (Content hub)
│──────────────│
│ id (PK)      │
│ title        │◄───────┐
│ slug         │        │
│ price        │        │
│ duration     │        │
│ category     │        │
└──────┬───────┘        │
       │                │
       │ One-to-Many    │
       ├────────────────┼───────┐
       │                │       │
       ▼                ▼       ▼
┌──────────┐    ┌──────────┐  ┌──────────┐
│  MODULE  │    │   BOOK   │  │  REVIEW  │
│──────────│    │──────────│  │──────────│
│ id (PK)  │    │ id (PK)  │  │ id (PK)  │
│courseId  │    │courseId  │  │courseId  │
│ title    │    │ title    │  │ userId   │
│ order    │    │ fileUrl  │  │ rating   │
└────┬─────┘    │ price    │  │ comment  │
     │          └──────────┘  └──────────┘
     │ One-to-Many
     ▼
┌──────────┐
│  LESSON  │
│──────────│
│ id (PK)  │
│ moduleId │
│ title    │
│ videoUrl │
│ content  │
│ order    │
└──────────┘

┌──────────────┐
│COURSE REQUEST│ (User suggestions)
│──────────────│
│ id (PK)      │
│ userId (FK)  │────────┐
│ courseName   │        │
│ description  │        │ Many-to-One
│ status       │        │
└──────────────┘        │
                        ▼
                   ┌──────────┐
                   │   USER   │
                   └──────────┘
```

---

## 📊 Table-by-Table Breakdown

### 👤 **USER TABLE**
**Purpose**: Store all user information

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (PK) | Unique identifier (cuid) |
| `email` | String (Unique) | Login email |
| `name` | String | Full name |
| `password` | String | Hashed password (bcrypt) |
| `phone` | String? | Contact number |
| `company` | String? | Employer (for reimbursement) |
| `designation` | String? | Job title |
| `upiId` | String? | UPI for refunds |
| `role` | Enum | USER or ADMIN |
| `createdAt` | DateTime | Registration date |

**Connected To**:
- ✅ Enrollments (what courses they bought)
- ✅ Payments (their transactions)
- ✅ CourseRequests (courses they requested)
- ✅ Accounts (OAuth providers)
- ✅ Sessions (login sessions)

---

### 📚 **COURSE TABLE**
**Purpose**: Store all course information

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (PK) | Unique identifier |
| `title` | String | Course name |
| `slug` | String (Unique) | URL-friendly name |
| `description` | Text | Full description |
| `thumbnail` | String | Image URL |
| `price` | Float | Price in INR |
| `duration` | Int | Access days (default 90) |
| `category` | String | Programming, Design, etc. |
| `level` | String | Beginner/Intermediate/Advanced |
| `whatYouLearn` | String[] | Learning outcomes |
| `rating` | Float | Average rating (0-5) |
| `studentsCount` | Int | Total enrolled |
| `isFeatured` | Boolean | Show on homepage |

**Connected To**:
- ✅ Modules (course chapters)
- ✅ Enrollments (who bought it)
- ✅ Books (supplementary materials)
- ✅ Reviews (student feedback)

---

### 📖 **MODULE TABLE**
**Purpose**: Course chapters/sections

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (PK) | Unique identifier |
| `courseId` | String (FK) | Parent course |
| `title` | String | Module name |
| `description` | String | Module overview |
| `order` | Int | Display order (1, 2, 3...) |

**Connected To**:
- ✅ Course (parent)
- ✅ Lessons (child content)

---

### 🎥 **LESSON TABLE**
**Purpose**: Individual video/theory lessons

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (PK) | Unique identifier |
| `moduleId` | String (FK) | Parent module |
| `title` | String | Lesson name |
| `content` | Text | Theory (Markdown) |
| `videoUrl` | String? | YouTube/Vimeo link |
| `videoType` | String | youtube/vimeo/custom |
| `duration` | Int | Video minutes |
| `order` | Int | Display order |
| `isFree` | Boolean | Preview lesson |

**Connected To**:
- ✅ Module (parent)
- ✅ LessonProgress (tracking)

---

### ✅ **ENROLLMENT TABLE**
**Purpose**: Track who bought which course

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (PK) | Unique identifier |
| `userId` | String (FK) | Student |
| `courseId` | String (FK) | Course purchased |
| `startDate` | DateTime | Purchase date |
| `endDate` | DateTime | Access expires (90 days) |
| `progress` | Int | 0-100% complete |
| `isActive` | Boolean | Access valid |
| `completedAt` | DateTime? | Finish date |

**Connected To**:
- ✅ User (student)
- ✅ Course (content)
- ✅ LessonProgress (detailed tracking)

---

### 📊 **LESSON_PROGRESS TABLE**
**Purpose**: Track individual lesson completion

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (PK) | Unique identifier |
| `enrollmentId` | String (FK) | Enrollment record |
| `lessonId` | String (FK) | Lesson watched |
| `completed` | Boolean | Finished? |
| `watchedDuration` | Int | Seconds watched |
| `completedAt` | DateTime? | Completion time |

**Connected To**:
- ✅ Enrollment (parent)
- ✅ Lesson (content)

---

### 💳 **PAYMENT TABLE**
**Purpose**: Store all financial transactions

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (PK) | Unique identifier |
| `userId` | String (FK) | Customer |
| `amount` | Float | Price paid |
| `status` | Enum | PENDING/COMPLETED/FAILED |
| `paymentMethod` | String | UPI/Card/Wallet |
| `razorpayOrderId` | String | Razorpay order ID |
| `razorpayPaymentId` | String | Razorpay payment ID |
| `invoiceNumber` | String (Unique) | Invoice # for company |
| `customerCompany` | String | For reimbursement |

**Connected To**:
- ✅ User (customer)

---

### 💡 **COURSE_REQUEST TABLE**
**Purpose**: Store user course suggestions

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (PK) | Unique identifier |
| `userId` | String (FK) | Requester |
| `courseName` | String | Suggested course |
| `description` | Text | Why they want it |
| `category` | String | Subject area |
| `status` | Enum | PENDING/APPROVED/REJECTED |
| `adminNotes` | Text | Admin response |

**Connected To**:
- ✅ User (requester)

---

### ⭐ **REVIEW TABLE**
**Purpose**: Course ratings and feedback

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (PK) | Unique identifier |
| `userId` | String (FK) | Reviewer |
| `courseId` | String (FK) | Course reviewed |
| `rating` | Int | 1-5 stars |
| `comment` | Text | Written review |
| `isApproved` | Boolean | Moderation flag |

**Connected To**:
- ✅ Course (reviewed course)

---

### 📚 **BOOK TABLE**
**Purpose**: Supplementary ebooks/PDFs

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (PK) | Unique identifier |
| `courseId` | String? (FK) | Related course (optional) |
| `title` | String | Book name |
| `author` | String | Author name |
| `price` | Float | Price |
| `fileUrl` | String | PDF download link |

**Connected To**:
- ✅ Course (optional link)

---

## 🔑 Key Relationships Summary

### **One-to-Many Relationships**:
```
User ──► Enrollments (One user, many courses)
User ──► Payments (One user, many transactions)
User ──► CourseRequests (One user, many requests)

Course ──► Modules (One course, many chapters)
Course ──► Enrollments (One course, many students)
Course ──► Reviews (One course, many reviews)

Module ──► Lessons (One module, many lessons)

Enrollment ──► LessonProgress (One enrollment, many lesson completions)
```

### **Unique Constraints** (prevent duplicates):
```
✅ User.email (one email = one account)
✅ Course.slug (unique URLs)
✅ Payment.invoiceNumber (unique invoices)
✅ Enrollment: userId + courseId (can't buy same course twice)
```

---

## 📍 Data Flow Example

### **When a user signs up:**
```
1. POST /api/auth/register
2. Create User record
   └── Store: name, email, hashed password, company
3. Return success
```

### **When a user buys a course:**
```
1. POST /api/payment/create
2. Create Payment record (status: PENDING)
   └── Store: userId, amount, razorpayOrderId
3. User pays via Razorpay
4. Update Payment (status: COMPLETED)
5. Create Enrollment record
   └── Store: userId, courseId, startDate, endDate (90 days)
6. Generate Invoice PDF
```

### **When a user watches a lesson:**
```
1. User clicks lesson
2. Check Enrollment.isActive (access valid?)
3. Load Lesson.videoUrl
4. Create/Update LessonProgress
   └── Store: enrollmentId, lessonId, watchedDuration
5. Update Enrollment.progress (calculate %)
```

---

## 🎯 Current Status

Your database has **5 main tables created**:
- ✅ User
- ✅ Course  
- ✅ Enrollment
- ✅ CourseRequest
- ✅ Transaction (older version)

**Still need to create** (from Prisma schema):
- Module
- Lesson
- LessonProgress
- Payment (new version)
- Review
- Book
- Notification
- Account/Session (NextAuth)

To create all tables, run:
```bash
npx prisma db push
```

This will synchronize your Prisma schema with the PostgreSQL database!
