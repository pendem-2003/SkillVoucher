# Email Setup Instructions for SkillReimburse

## Current Status
Your email is configured to use: **gpendem2003@gmail.com**
Sender name: **SkillReimburse**

But the SMTP password is not set up, so emails cannot be sent.

## Quick Setup (5 minutes)

### Step 1: Get Gmail App Password

1. **Open this link**: https://myaccount.google.com/apppasswords
   - Sign in with: `gpendem2003@gmail.com`

2. **If you see "App passwords not available":**
   - First enable 2-Step Verification here: https://myaccount.google.com/security
   - Then go back to: https://myaccount.google.com/apppasswords

3. **Create App Password:**
   - App name: `SkillReimburse`
   - Click "Create"
   - Copy the 16-character password (like: `abcd efgh ijkl mnop`)

### Step 2: Update .env.local File

Open: `.env.local` and update this line:

```env
SMTP_PASS="your-16-char-app-password-here"
```

Replace it with your actual app password (remove spaces):
```env
SMTP_PASS="abcdefghijklmnop"
```

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C in the terminal)
# Then restart:
npm run dev
```

### Step 4: Test

Go to your app and try "Forgot Password" with any registered email.

---

## Alternative: For Testing Only (No Real Email)

If you don't want to set up Gmail now, the system already shows OTP in:
1. **Browser DevTools** → Network tab → Response
2. **Terminal script**: `./get-otp.sh your-email@example.com`

The OTP is generated and saved to database, you just won't receive an actual email.

---

## Email Templates

Your emails will look like this:

**Subject:** Password Reset OTP - SkillReimburse
**From:** SkillReimburse <gpendem2003@gmail.com>
**Content:** Professional HTML template with your 6-digit OTP code

---

## Need Help?

If you face any issues:
1. Make sure 2-Step Verification is enabled
2. Use App Password, not your regular Gmail password
3. Remove any spaces from the app password
4. Restart the dev server after updating .env.local
