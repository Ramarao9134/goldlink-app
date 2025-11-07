# GoldLink Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts to deploy.

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub + Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   In Vercel dashboard, add these environment variables:
   ```
   DATABASE_URL=your-postgresql-connection-string
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
   UPLOADTHING_SECRET=your-uploadthing-secret
   UPLOADTHING_APP_ID=your-uploadthing-app-id
   CRON_SECRET=your-cron-secret
   ```

4. **Deploy**: Click "Deploy"

## Database Setup (PostgreSQL)

### Option 1: Supabase (Free Tier Available)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Update `DATABASE_URL` in Vercel environment variables

### Option 2: Neon (Free Tier Available)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update `DATABASE_URL` in Vercel environment variables

### Option 3: Railway

1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Update `DATABASE_URL` in Vercel environment variables

## Update Prisma Schema for PostgreSQL

Before deploying, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then update the schema to use PostgreSQL features:
- Change `photos String` back to `photos String[]` (PostgreSQL supports arrays)
- Change `meta String?` back to `meta Json?` (PostgreSQL supports JSON)
- Add back enums (PostgreSQL supports enums)

## Post-Deployment Steps

1. **Run Database Migrations**:
   ```bash
   npx prisma migrate deploy
   ```
   Or in Vercel, add a build command:
   ```bash
   npx prisma generate && npx prisma migrate deploy && npm run build
   ```

2. **Set Up Gold Rates Cron Job**:
   - Vercel automatically handles cron jobs defined in `vercel.json`
   - Or use external service like cron-job.org to call:
     `https://your-app.vercel.app/api/cron/gold-rates`
     With header: `Authorization: Bearer YOUR_CRON_SECRET`

3. **Configure Razorpay Webhook**:
   - Go to Razorpay Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-app.vercel.app/api/payments/webhook`
   - Select event: `payment.captured`
   - Copy webhook secret to Vercel environment variables

4. **Configure UploadThing**:
   - Update UploadThing app settings with your production domain
   - Add CORS settings if needed

## Alternative Deployment Options

### Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

### Railway

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Deploy:
   ```bash
   railway login
   railway init
   railway up
   ```

### Self-Hosted (VPS)

1. Set up Node.js on your server
2. Install PM2:
   ```bash
   npm i -g pm2
   ```

3. Build and start:
   ```bash
   npm run build
   pm2 start npm --name "goldlink" -- start
   ```

4. Set up Nginx reverse proxy
5. Configure SSL with Let's Encrypt

## Environment Variables Checklist

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your production URL
- [ ] `NEXTAUTH_SECRET` - Random secret (32+ chars)
- [ ] `RAZORPAY_KEY_ID` - From Razorpay dashboard
- [ ] `RAZORPAY_KEY_SECRET` - From Razorpay dashboard
- [ ] `RAZORPAY_WEBHOOK_SECRET` - From Razorpay webhook settings
- [ ] `UPLOADTHING_SECRET` - From UploadThing dashboard
- [ ] `UPLOADTHING_APP_ID` - From UploadThing dashboard
- [ ] `CRON_SECRET` - Random secret for cron job protection

## Testing Production

1. Visit your live URL
2. Test registration/login
3. Test application flow
4. Test payment (use Razorpay test mode first)
5. Verify webhook is working
6. Check cron job is running

## Troubleshooting

- **Database connection issues**: Verify `DATABASE_URL` is correct
- **Build errors**: Check Node.js version (should be 18+)
- **Webhook not working**: Verify webhook URL is accessible
- **Cron job not running**: Check Vercel cron configuration
- **File upload issues**: Verify UploadThing domain settings

