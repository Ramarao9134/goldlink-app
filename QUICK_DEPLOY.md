# 🚀 Quick Deploy Guide - GoldLink

## Fastest Way: Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - GoldLink"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Set Up Database (Supabase - Free)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to **Settings → Database**
4. Copy the **Connection string** (URI format)
5. It looks like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### Step 3: Update Schema for PostgreSQL

Before deploying, you need to update the Prisma schema:

1. Copy `prisma/schema.postgresql.prisma` to `prisma/schema.prisma`
2. Or manually update `datasource db` to use `postgresql` instead of `sqlite`

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js ✅

### Step 5: Add Environment Variables

In Vercel project settings → Environment Variables, add:

```
DATABASE_URL=your-supabase-connection-string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
RAZORPAY_KEY_ID=your-key (optional for now)
RAZORPAY_KEY_SECRET=your-secret (optional for now)
RAZORPAY_WEBHOOK_SECRET=your-secret (optional for now)
UPLOADTHING_SECRET=your-secret (optional for now)
UPLOADTHING_APP_ID=your-app-id (optional for now)
CRON_SECRET=any-random-string
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 6: Deploy & Run Migrations

1. Click **"Deploy"** in Vercel
2. After deployment, go to **Deployments** tab
3. Click on the deployment → **"Functions"** tab
4. Or run migrations manually:
   ```bash
   npx prisma migrate deploy
   ```

### Step 7: Set Up Cron Job

Vercel will automatically run the cron job defined in `vercel.json` every 5 minutes.

Or manually set up:
- Go to Vercel project → **Settings → Cron Jobs**
- Add: `*/5 * * * *` → `/api/cron/gold-rates`

### Step 8: Configure Razorpay (Optional)

1. Go to Razorpay Dashboard
2. Settings → Webhooks
3. Add URL: `https://your-app.vercel.app/api/payments/webhook`
4. Select event: `payment.captured`
5. Copy webhook secret to Vercel env vars

### Step 9: Configure UploadThing (Optional)

1. Go to UploadThing dashboard
2. Add your Vercel domain to allowed domains
3. Copy credentials to Vercel env vars

## ✅ Done!

Your app is now live at: `https://your-app.vercel.app`

## Alternative: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/goldlink)

## Troubleshooting

**Build fails?**
- Check Node.js version (needs 18+)
- Verify all environment variables are set
- Check Prisma schema is updated for PostgreSQL

**Database connection fails?**
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure IP is whitelisted (Supabase allows all by default)

**Webhook not working?**
- Verify webhook URL is accessible
- Check webhook secret matches
- Test with Razorpay test mode first

## Need Help?

- Check `DEPLOYMENT.md` for detailed instructions
- Check `SETUP.md` for local setup
- Check `README.md` for project overview

