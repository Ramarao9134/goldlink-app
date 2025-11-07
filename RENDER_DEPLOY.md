# 🚀 Deploy GoldLink to Render - Quick Guide

## Prerequisites

- GitHub account
- Render account (sign up at [render.com](https://render.com))
- Code pushed to GitHub

## Step-by-Step Deployment

### 1. Update Prisma Schema for PostgreSQL

```bash
# Copy PostgreSQL schema
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Or manually edit prisma/schema.prisma:
# - Change provider from "sqlite" to "postgresql"
# - Change photos from String to String[]
# - Change meta from String? to Json?
# - Add back enums
```

### 2. Push to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 3. Create PostgreSQL Database in Render

1. Go to [render.com](https://render.com) → Dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `goldlink-db`
   - **Database**: `goldlink`
   - **User**: `goldlink`
   - **Region**: Choose closest
   - **Plan**: Free (or paid)
4. Click **"Create Database"**
5. Wait 1-2 minutes
6. Copy the **Internal Database URL**

### 4. Create Web Service in Render

1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repository
3. Select your `goldlink` repository
4. Configure:
   - **Name**: `goldlink`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Runtime**: `Node`
   - **Build Command**: 
     ```
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**: 
     ```
     npm start
     ```

### 5. Add Environment Variables

In **Environment Variables** section, add:

```
NODE_ENV=production
DATABASE_URL=<internal-database-url-from-step-3>
NEXTAUTH_URL=https://goldlink.onrender.com
NEXTAUTH_SECRET=<generate-32-char-secret>
RAZORPAY_KEY_ID=<optional>
RAZORPAY_KEY_SECRET=<optional>
RAZORPAY_WEBHOOK_SECRET=<optional>
UPLOADTHING_SECRET=<optional>
UPLOADTHING_APP_ID=<optional>
CRON_SECRET=<any-random-string>
```

**Generate NEXTAUTH_SECRET:**
```powershell
# Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 6. Deploy

1. Click **"Create Web Service"**
2. Wait for build (5-10 minutes)
3. Your app will be live at: `https://goldlink.onrender.com`

### 7. Run Database Migrations

After deployment, go to **Shell** tab in Render dashboard:

```bash
npx prisma migrate deploy
```

### 8. Set Up Cron Job (Optional)

1. Click **"New +"** → **"Cron Job"**
2. Configure:
   - **Name**: `goldlink-gold-rates`
   - **Schedule**: `*/5 * * * *`
   - **Command**: 
     ```bash
     curl -X GET "https://goldlink.onrender.com/api/cron/gold-rates" -H "Authorization: Bearer YOUR_CRON_SECRET"
     ```
3. Add environment variable: `CRON_SECRET`

## ✅ Done!

Your app is live at: `https://goldlink.onrender.com`

## Important Notes

- **Free tier spins down** after 15 min inactivity (first request takes ~30s)
- Use **Internal Database URL** for better performance
- Update `NEXTAUTH_URL` after deployment with actual URL
- For production, consider upgrading to paid plan ($7/month)

## Troubleshooting

- **Build fails?** Check build logs, verify env vars
- **Database connection fails?** Verify DATABASE_URL, check database is active
- **App spins down?** Normal on free tier, upgrade to avoid
- **Cron not working?** Verify CRON_SECRET matches, check logs

## Need Help?

- See `deploy-render.md` for detailed guide
- Render docs: https://render.com/docs
- Render status: https://status.render.com

