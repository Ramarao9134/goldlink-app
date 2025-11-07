# 🚀 Deploy GoldLink to Vercel - Step by Step

## Quick Start (5 minutes)

### Step 1: Prepare Your Code

1. **Update Prisma Schema for PostgreSQL** (if using PostgreSQL):
   ```bash
   # Copy the PostgreSQL schema
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   ```
   
   Or manually edit `prisma/schema.prisma`:
   - Change `provider = "sqlite"` to `provider = "postgresql"`
   - Change `photos String` to `photos String[]`
   - Change `meta String?` to `meta Json?`
   - Add back enums (UserRole, ApplicationStatus, etc.)

### Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/goldlink.git
git branch -M main
git push -u origin main
```

### Step 3: Set Up Database (Supabase - Free)

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be created
5. Go to **Settings → Database**
6. Copy the **Connection string** (URI format)
   - It looks like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login (use GitHub account)
3. Click **"New Project"**
4. Click **"Import Git Repository"**
5. Select your `goldlink` repository
6. Click **"Import"**

### Step 5: Configure Environment Variables

In Vercel project settings, go to **Settings → Environment Variables** and add:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-random-secret-here-min-32-chars
RAZORPAY_KEY_ID=your-razorpay-key (optional)
RAZORPAY_KEY_SECRET=your-razorpay-secret (optional)
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret (optional)
UPLOADTHING_SECRET=your-uploadthing-secret (optional)
UPLOADTHING_APP_ID=your-uploadthing-app-id (optional)
CRON_SECRET=any-random-string
```

**Generate NEXTAUTH_SECRET:**
```bash
# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use online tool: https://generate-secret.vercel.app/32
```

### Step 6: Deploy!

1. Click **"Deploy"** button
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at: `https://your-app-name.vercel.app`

### Step 7: Run Database Migrations

After first deployment, you need to run migrations:

**Option A: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migrations
npx prisma migrate deploy
```

**Option B: Via Vercel Dashboard**
1. Go to your deployment
2. Click on **"Functions"** tab
3. Or add a build command in Vercel settings:
   ```
   npx prisma generate && npx prisma migrate deploy && npm run build
   ```

### Step 8: Set Up Cron Job (Gold Rates)

Vercel will automatically handle cron jobs from `vercel.json`.

Or manually:
1. Go to Vercel project → **Settings → Cron Jobs**
2. Add new cron job:
   - **Schedule**: `*/5 * * * *` (every 5 minutes)
   - **Path**: `/api/cron/gold-rates`

### Step 9: Configure Razorpay Webhook (Optional)

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Settings → Webhooks
3. Add webhook:
   - **URL**: `https://your-app-name.vercel.app/api/payments/webhook`
   - **Events**: Select `payment.captured`
4. Copy webhook secret
5. Add to Vercel environment variables as `RAZORPAY_WEBHOOK_SECRET`

### Step 10: Configure UploadThing (Optional)

1. Go to [uploadthing.com](https://uploadthing.com)
2. Create account/app
3. Add your Vercel domain to allowed domains
4. Copy credentials to Vercel environment variables

## ✅ Done!

Your app is now live at: `https://your-app-name.vercel.app`

## Test Your Live App

1. Visit your live URL
2. Register a new account
3. Test the application flow
4. Check if gold rates are updating (cron job)

## Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure Prisma schema is updated for PostgreSQL

**Database connection fails?**
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure connection string includes password

**Cron job not running?**
- Check Vercel cron configuration
- Verify CRON_SECRET is set
- Check function logs in Vercel dashboard

## Need Help?

- Check `DEPLOYMENT.md` for detailed instructions
- Check `QUICK_DEPLOY.md` for quick reference
- Check Vercel documentation: https://vercel.com/docs

