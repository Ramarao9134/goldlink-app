# 🚀 Deploy GoldLink to Render - Step by Step

## Quick Start (10 minutes)

### Step 1: Prepare Your Code

1. **Update Prisma Schema for PostgreSQL**:
   ```bash
   # Copy the PostgreSQL schema
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   ```
   
   Or manually edit `prisma/schema.prisma`:
   - Change `provider = "sqlite"` to `provider = "postgresql"`
   - Change `photos String` to `photos String[]`
   - Change `meta String?` to `meta Json?`
   - Add back enums (UserRole, ApplicationStatus, etc.)

2. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   ```

### Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Render deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/goldlink.git
git branch -M main
git push -u origin main
```

### Step 3: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up/Login (use GitHub account for easy integration)
3. Verify your email if needed

### Step 4: Create PostgreSQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Fill in details:
   - **Name**: `goldlink-db`
   - **Database**: `goldlink`
   - **User**: `goldlink`
   - **Region**: Choose closest to you
   - **Plan**: Free (or paid for production)
3. Click **"Create Database"**
4. Wait for database to be created (1-2 minutes)
5. Copy the **Internal Database URL** (you'll need this)

### Step 5: Deploy Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect GitHub"** if not connected
   - Select your `goldlink` repository
   - Click **"Connect"**
3. Configure the service:
   - **Name**: `goldlink` (or your preferred name)
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `.` if needed)
   - **Runtime**: `Node`
   - **Build Command**: 
     ```
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**: 
     ```
     npm start
     ```
4. Click **"Advanced"** to add environment variables

### Step 6: Add Environment Variables

In the **Environment Variables** section, add:

```
NODE_ENV=production
DATABASE_URL=<your-postgresql-internal-url-from-step-4>
NEXTAUTH_URL=https://your-app-name.onrender.com
NEXTAUTH_SECRET=<generate-random-32-char-secret>
RAZORPAY_KEY_ID=<your-razorpay-key> (optional)
RAZORPAY_KEY_SECRET=<your-razorpay-secret> (optional)
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret> (optional)
UPLOADTHING_SECRET=<your-uploadthing-secret> (optional)
UPLOADTHING_APP_ID=<your-uploadthing-app-id> (optional)
CRON_SECRET=<any-random-string>
```

**Generate NEXTAUTH_SECRET:**
```bash
# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use online tool: https://generate-secret.vercel.app/32
```

**Important**: 
- Use the **Internal Database URL** from your PostgreSQL service
- Update `NEXTAUTH_URL` after deployment with your actual Render URL

### Step 7: Deploy!

1. Click **"Create Web Service"**
2. Render will start building your application (5-10 minutes)
3. Watch the build logs for any errors
4. Once deployed, your app will be live at: `https://your-app-name.onrender.com`

### Step 8: Run Database Migrations

After first deployment:

**Option A: Via Render Shell**
1. Go to your web service in Render dashboard
2. Click **"Shell"** tab
3. Run:
   ```bash
   npx prisma migrate deploy
   ```

**Option B: Via Local Terminal**
```bash
# Set DATABASE_URL to your Render database URL
export DATABASE_URL="your-render-database-url"

# Run migrations
npx prisma migrate deploy
```

### Step 9: Set Up Cron Job (Gold Rates)

**Option A: Using Render Cron Jobs**

1. In Render dashboard, click **"New +"** → **"Cron Job"**
2. Configure:
   - **Name**: `goldlink-gold-rates`
   - **Schedule**: `*/5 * * * *` (every 5 minutes)
   - **Command**: 
     ```bash
     curl -X GET "https://your-app-name.onrender.com/api/cron/gold-rates" -H "Authorization: Bearer YOUR_CRON_SECRET"
     ```
   - **Environment Variables**:
     - `CRON_SECRET`: Same as in web service
3. Click **"Create Cron Job"**

**Option B: Using External Service**

Use services like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- GitHub Actions

Set up to call:
```
https://your-app-name.onrender.com/api/cron/gold-rates
```
With header:
```
Authorization: Bearer YOUR_CRON_SECRET
```

### Step 10: Configure Razorpay Webhook (Optional)

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Settings → Webhooks
3. Add webhook:
   - **URL**: `https://your-app-name.onrender.com/api/payments/webhook`
   - **Events**: Select `payment.captured`
4. Copy webhook secret
5. Add to Render environment variables as `RAZORPAY_WEBHOOK_SECRET`

### Step 11: Configure UploadThing (Optional)

1. Go to [uploadthing.com](https://uploadthing.com)
2. Create account/app
3. Add your Render domain to allowed domains
4. Copy credentials to Render environment variables

## ✅ Done!

Your app is now live at: `https://your-app-name.onrender.com`

## Test Your Live App

1. Visit your live URL
2. Register a new account
3. Test the application flow
4. Check if gold rates are updating (cron job)

## Important Notes

### Render Free Tier Limitations

- **Spins down after 15 minutes of inactivity** (first request after spin-down takes ~30 seconds)
- **750 hours/month** of free usage
- **512 MB RAM** limit
- **Database**: 90 days retention on free tier

### Upgrade to Paid Plan

For production use, consider upgrading:
- **Starter Plan**: $7/month - No spin-down, 512 MB RAM
- **Standard Plan**: $25/month - 1 GB RAM, better performance

### Database Connection

- Use **Internal Database URL** for better performance (free)
- Or use **External Database URL** if connecting from outside Render

## Troubleshooting

**Build fails?**
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure Prisma schema is updated for PostgreSQL
- Check Node.js version (should be 18+)

**Database connection fails?**
- Verify `DATABASE_URL` is correct
- Check if database is active in Render dashboard
- Ensure you're using Internal Database URL (for free tier)
- Check database credentials

**App spins down?**
- Free tier apps spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds to wake up
- Upgrade to paid plan to avoid spin-down

**Cron job not running?**
- Verify cron job is set up correctly
- Check CRON_SECRET matches in both services
- Verify cron job URL is correct
- Check cron job logs in Render dashboard

**Webhook not working?**
- Verify webhook URL is accessible
- Check webhook secret matches
- Test with Razorpay test mode first
- Check Render service logs

## Need Help?

- Check Render documentation: https://render.com/docs
- Check Render status: https://status.render.com
- Render community: https://community.render.com

