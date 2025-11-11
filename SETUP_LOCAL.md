# Local Setup Guide

## Quick Start

The development server should be starting. Once it's ready, open your browser and go to:

**http://localhost:3000**

## Environment Variables

For local testing, create a `.env` file in the root directory with:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production-min-32-chars"
RAZORPAY_KEY_ID="rzp_test_1234567890"
RAZORPAY_KEY_SECRET="test_secret_key"
RAZORPAY_WEBHOOK_SECRET="test_webhook_secret"
UPLOADTHING_SECRET="sk_live_test"
UPLOADTHING_APP_ID="test_app_id"
CRON_SECRET="test_cron_secret"
```

## Testing the Application

1. **Open Chrome** and navigate to `http://localhost:3000`

2. **Register as Customer:**
   - Click "Register"
   - Select "Customer" tab
   - Fill in name, email, password
   - Click "Create Account"
   - Login with your credentials

3. **Register as Owner:**
   - Click "Register" 
   - Select "Owner" tab
   - Fill in details and create account
   - Login as owner

4. **Test Flow:**
   - As Customer: Apply to Owner with gold item details
   - As Owner: Review and approve/reject applications
   - As Customer: View settlements and make payments

## Database

The app uses SQLite for local testing. The database file is `dev.db` in the root directory.

To reset the database:
```bash
npx prisma db push --force-reset
```

## Troubleshooting

If the server doesn't start:
1. Check if port 3000 is available
2. Make sure all dependencies are installed: `npm install`
3. Check the terminal for error messages

## Notes

- Gold rates are currently using mock data
- Payment integration requires real Razorpay keys for production
- File uploads require UploadThing configuration for production

