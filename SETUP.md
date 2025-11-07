# GoldLink Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

1. Create a PostgreSQL database (locally or using a service like Supabase, Neon, etc.)
2. Copy `.env.example` to `.env`
3. Update `DATABASE_URL` in `.env` with your database connection string

### 3. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Configure Environment Variables

Edit `.env` file and add:

- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
- **NEXTAUTH_URL**: `http://localhost:3000` for development
- **RAZORPAY_KEY_ID** and **RAZORPAY_KEY_SECRET**: Get from Razorpay dashboard
- **RAZORPAY_WEBHOOK_SECRET**: Set in Razorpay webhook settings
- **UPLOADTHING_SECRET** and **UPLOADTHING_APP_ID**: Get from UploadThing dashboard

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Creating Test Users

### Option 1: Using Prisma Studio

1. Run `npx prisma studio`
2. Navigate to User table
3. Manually create users (password will need to be hashed with bcrypt)

### Option 2: Using Registration Page

1. Visit `/auth/register`
2. Create a Customer account
3. Create an Owner account (select "Jeweler" tab)

## Testing the Flow

1. **As Customer**:
   - Login with customer account
   - Go to Dashboard → "Apply to Owner"
   - Fill form and submit application
   - View application status

2. **As Owner**:
   - Login with owner account
   - View pending applications
   - Approve an application (set principal amount and interest rate)
   - View active settlements

3. **Payment Flow**:
   - As customer, go to active settlement
   - Click "Pay Now"
   - Complete Razorpay payment (use test mode)
   - Verify payment success

## Setting Up Gold Rates Cron Job

### Option 1: Vercel Cron (if deploying to Vercel)

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/gold-rates",
    "schedule": "*/5 * * * *"
  }]
}
```

### Option 2: External Cron Service

Use services like:
- cron-job.org
- EasyCron
- GitHub Actions

Set up to call: `https://your-domain.com/api/cron/gold-rates` with header:
```
Authorization: Bearer YOUR_CRON_SECRET
```

## Razorpay Webhook Setup

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events: `payment.captured`
4. Copy webhook secret to `.env` as `RAZORPAY_WEBHOOK_SECRET`

## UploadThing Setup

1. Sign up at [uploadthing.com](https://uploadthing.com)
2. Create a new app
3. Copy API keys to `.env`
4. Configure allowed file types and sizes in `app/api/uploadthing/core.ts`

## Production Deployment

1. Deploy to Vercel/Netlify/your platform
2. Set up PostgreSQL database (Supabase, Neon, etc.)
3. Configure all environment variables
4. Set up cron job for gold rates
5. Configure Razorpay webhook URL
6. Test all flows in production

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Run `npx prisma db push` again

### Authentication Issues
- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies

### Payment Issues
- Verify Razorpay keys are correct
- Check webhook URL is accessible
- Use Razorpay test mode for development

### File Upload Issues
- Verify UploadThing credentials
- Check file size limits
- Verify CORS settings

