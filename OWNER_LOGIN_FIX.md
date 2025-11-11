# Owner Login Fix for Production

## Quick Fix Steps

If owner login is not working in production, follow these steps:

### Step 1: Initialize/Reset Owner Account

Open your browser and navigate to:
```
https://goldlink-app.onrender.com/api/owner/init
```

**OR** use curl/Postman to make a POST request:
```bash
curl -X POST https://goldlink-app.onrender.com/api/owner/init
```

This will:
- Create the owner account if it doesn't exist
- Reset the password to default if the account exists

### Step 2: Login with Default Credentials

**Email:** `owner@goldlink.com`  
**Password:** `Owner@GoldLink2024`

1. Go to: `https://goldlink-app.onrender.com/auth/login`
2. Click "Owner Login" button
3. Email should auto-fill to `owner@goldlink.com`
4. Enter password: `Owner@GoldLink2024`
5. Click "Sign In"

## What Changed

1. **Better Error Handling**: Added console logging to track login issues
2. **Password Reset**: The `/api/owner/init` endpoint now resets the password to default if owner exists
3. **Improved Authentication**: Better handling of owner account creation and verification

## Troubleshooting

If login still fails after Step 1:

1. Check Render logs for error messages
2. Verify database connection is working
3. Ensure `DATABASE_URL` environment variable is set correctly
4. Check that Prisma schema is synced with database

## Alternative: Manual Database Check

If you have database access, verify the owner account exists:
- Email: `owner@goldlink.com`
- Role: `OWNER`
- Password hash should match `Owner@GoldLink2024`

