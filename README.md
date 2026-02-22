# 🎓 SkillReimburse - Professional E-Learning Platform

A modern, full-featured e-learning platform built with Next.js 14, designed for professionals seeking company reimbursement for their courses.

![SkillReimburse](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### For Students
- 🎯 Browse 500+ professional courses
- 💳 Secure payment integration with Razorpay (UPI, Cards, Wallets)
- 📄 Professional invoices for company reimbursement
- ⏱️ 3-month course access period
- 🎬 Video lessons with progress tracking
- 📚 Theory content and downloadable resources
- ⭐ Course reviews and ratings
- 💡 Request custom courses

### For Administrators
- 📊 Complete admin dashboard
- 📝 Course management with structured modules/lessons
- 💰 Payment tracking and analytics
- 📬 Course request management
- 👥 User management

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Payment**: Razorpay
- **PDF Generation**: jsPDF
- **Deployment**: Vercel

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (copy .env.example to .env)
cp .env.example .env

# Run Prisma migrations
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📦 Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/skillreimburse"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
RAZORPAY_KEY_ID="your_key_id"
RAZORPAY_KEY_SECRET="your_key_secret"
```

## 📂 Project Structure

```
skillreimburse/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/             # Utilities & configurations
├── prisma/          # Database schema
├── types/           # TypeScript types
└── public/          # Static assets
```

## 🎨 UI Highlights

- ✨ Bright, modern gradient design
- 📱 Fully responsive
- 🎭 Smooth animations
- ♿ Accessible (WCAG compliant)

## 📊 Key Pages

- **/** - Homepage with featured courses
- **/courses** - Course catalog with filters
- **/login & /register** - Authentication pages
- **/dashboard** - User learning dashboard
- **/request-course** - Course request form
- **/admin** - Admin dashboard (coming soon)

## 🔐 Security

- 🔒 Bcrypt password hashing
- 🛡️ CSRF protection
- 🔑 JWT authentication
- 💳 Razorpay signature verification

## 🎯 Next Steps

1. Set up PostgreSQL database
2. Configure Razorpay account
3. Create admin user
4. Add sample courses
5. Deploy to Vercel

## 📝 Documentation

For detailed documentation, see [PROJECT_PLAN.md](../PROJECT_PLAN.md)

## 🤝 Contributing

Contributions welcome! Please create an issue or PR.

## 📄 License

MIT License - see LICENSE file for details.

## 💬 Support

Email: support@skillreimburse.com

---

Built with ❤️ for professionals seeking continuous learning 🚀

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
