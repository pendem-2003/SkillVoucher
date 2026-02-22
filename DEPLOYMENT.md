# 🚀 Deployment Guide - SkillReimburse

Complete guide to deploy SkillReimburse to production.

## 📋 Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database schema finalized
- [ ] Build successful (`npm run build`)

### 2. Accounts Required
- [ ] GitHub account (for code hosting)
- [ ] Vercel account (for deployment)
- [ ] Database provider (Supabase/Railway/Neon)
- [ ] Razorpay account (live credentials)
- [ ] Domain registrar (optional)

---

## 🗄️ Database Setup

### Option 1: Supabase (Recommended)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose region closest to your users

2. **Get Connection String**
   ```
   Settings → Database → Connection String
   Copy the connection pooler string
   ```

3. **Update Environment Variable**
   ```env
   DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true"
   ```

### Option 2: Railway

1. **Create Database**
   - Go to [railway.app](https://railway.app)
   - New Project → Provision PostgreSQL

2. **Copy Connection URL**
   ```bash
   railway variables
   # Copy DATABASE_URL
   ```

### Option 3: Neon

1. **Create Project**
   - Visit [neon.tech](https://neon.tech)
   - Create new project

2. **Get Connection String**
   - Copy connection string from dashboard

---

## ☁️ Vercel Deployment

### Step 1: Push to GitHub

```bash
cd /Users/ganesh.pendem/Reimb_course/skillreimburse

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/skillreimburse.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Root Directory: `./` (or `skillreimburse` if needed)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**

   Click "Environment Variables" and add:

   ```env
   # Database
   DATABASE_URL=postgresql://[your-database-url]
   
   # NextAuth
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=[generate-using-openssl-rand-base64-32]
   
   # Razorpay LIVE credentials
   RAZORPAY_KEY_ID=rzp_live_[your-key]
   RAZORPAY_KEY_SECRET=[your-secret]
   
   # App
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_APP_NAME=SkillReimburse
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Step 3: Run Database Migrations

After deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migrations
vercel env pull .env.production
npx prisma migrate deploy
```

Or use Vercel's command feature in dashboard.

---

## 🔐 Generate Secure Secrets

### NextAuth Secret

```bash
openssl rand -base64 32
# Copy output to NEXTAUTH_SECRET
```

### Alternative (Node.js)

```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 💳 Razorpay Setup

### Test Mode (Development)

1. **Get Test Credentials**
   - Login to [razorpay.com](https://razorpay.com)
   - Go to Settings → API Keys
   - Generate Test Keys

2. **Use in .env.local**
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   ```

### Live Mode (Production)

1. **Complete KYC**
   - Submit business documents
   - Wait for approval (1-2 days)

2. **Activate Live Mode**
   - Settings → API Keys → Generate Live Keys

3. **Configure Webhook**
   - Webhook URL: `https://your-domain.com/api/webhooks/razorpay`
   - Events: `payment.captured`, `payment.failed`
   - Copy webhook secret

4. **Add to Environment**
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   RAZORPAY_WEBHOOK_SECRET=xxxxx
   ```

---

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `skillreimburse.com`)
3. Copy the DNS records shown

### Step 2: Configure DNS

Add these records to your domain registrar:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### Step 3: Update Environment Variables

```env
NEXTAUTH_URL=https://skillreimburse.com
NEXT_PUBLIC_APP_URL=https://skillreimburse.com
```

### Step 4: SSL Certificate

Vercel automatically provisions SSL certificates (Let's Encrypt).

---

## 📧 Email Setup (Optional)

### Using SendGrid

1. **Create Account**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Get API key

2. **Add to Environment**
   ```env
   SENDGRID_API_KEY=SG.xxxxx
   EMAIL_FROM=noreply@skillreimburse.com
   ```

### Using Resend

1. **Create Account**
   - Go to [resend.com](https://resend.com)
   - Get API key

2. **Add to Environment**
   ```env
   RESEND_API_KEY=re_xxxxx
   ```

---

## 🔍 Monitoring & Analytics

### Vercel Analytics

Enable in Vercel dashboard:
- Project Settings → Analytics → Enable

### Error Tracking with Sentry

1. **Install**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Configure**
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Add DSN to Environment**
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

---

## 🎯 Post-Deployment Tasks

### 1. Create Admin User

```bash
# Connect to production database
npx prisma studio --browser none

# Or run SQL
psql $DATABASE_URL -c "
  UPDATE users 
  SET role = 'ADMIN' 
  WHERE email = 'admin@skillreimburse.com';
"
```

### 2. Add Sample Courses

Create a seed script or use Prisma Studio to add initial courses.

### 3. Test Payment Flow

1. Use Razorpay test cards
2. Verify invoice generation
3. Check enrollment creation

### 4. Set Up Monitoring

- Enable Vercel Analytics
- Set up error alerts
- Monitor performance

### 5. Configure Backups

**Supabase**: Automatic daily backups

**Railway**: 
```bash
railway backup create
```

---

## 🚨 Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Connection Issues

```bash
# Test connection
npx prisma db execute --url="$DATABASE_URL" \
  --stdin <<< "SELECT 1;"
```

### Environment Variables Not Working

- Ensure they're set in Vercel dashboard
- Redeploy after adding variables
- Check for typos

---

## 📊 Performance Optimization

### 1. Enable Caching

```typescript
// app/layout.tsx
export const revalidate = 3600; // 1 hour
```

### 2. Optimize Images

Use Next.js Image component everywhere:
```tsx
<Image 
  src="/course.jpg" 
  alt="Course" 
  width={800} 
  height={600}
  priority 
/>
```

### 3. Enable Compression

Vercel automatically enables Brotli compression.

---

## 🔒 Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection (React escaping)
- [ ] Razorpay signature verification
- [ ] Input validation with Zod

---

## 📱 Mobile Testing

Test on real devices:
- iOS (Safari)
- Android (Chrome)
- Check responsive breakpoints
- Test payment flow

---

## 🎉 Go Live Checklist

- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Sample courses added
- [ ] Payment gateway tested
- [ ] Email notifications working
- [ ] Analytics enabled
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Legal pages added (Terms, Privacy)

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review Prisma database logs
3. Test locally with production environment
4. Check GitHub Issues
5. Contact support@skillreimburse.com

---

## 🎊 Congratulations!

Your SkillReimburse platform is now live! 🚀

Share your link with users and start helping professionals upskill their careers!

---

**Next Steps:**
- Marketing & user acquisition
- Gather user feedback
- Add more courses
- Implement advanced features
- Scale infrastructure as needed

Happy Teaching! 🎓
