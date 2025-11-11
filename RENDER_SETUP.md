# Render Deployment Setup Guide

## Critical: Environment Variables

You MUST set these environment variables in your Render dashboard:

### 1. DATABASE_URL (REQUIRED)
```
DATABASE_URL=file:/opt/render/project/src/dev.db
```
**Important:** 
- Must start with `file:` protocol
- Path must be writable
- Use absolute path for Render

### 2. NEXTAUTH_URL (REQUIRED)
```
NEXTAUTH_URL=https://goldlink-app.onrender.com
```
Replace `goldlink-app.onrender.com` with your actual Render app URL.

### 3. NEXTAUTH_SECRET (REQUIRED)
Generate a secure secret:
```bash
openssl rand -base64 32
```
Then set it in Render:
```
NEXTAUTH_SECRET=your-generated-secret-here
```

## Render Build & Start Commands

### Build Command:
```bash
npm install && npx prisma generate && npx prisma db push && npm run build
```

### Start Command:
```bash
npm run start:prod
```

This will:
1. Initialize the database
2. Create/reset the owner account
3. Start the Next.js server

## Owner Login Credentials

After deployment, the owner account will be automatically created:

**Email:** `owner@goldlink.com`  
**Password:** `Owner@GoldLink2024`

## Manual Owner Account Initialization

If owner login fails, you can manually initialize the account:

1. **Via Browser:**
   - Navigate to: `https://your-app.onrender.com/api/owner/init`
   - This will create/reset the owner account

2. **Via API (POST request):**
   ```bash
   curl -X POST https://your-app.onrender.com/api/owner/init
   ```

## Troubleshooting

### Issue: "DATABASE_URL must start with file:"
**Solution:** Check your Render environment variables. The DATABASE_URL must be:
```
file:/opt/render/project/src/dev.db
```
NOT:
```
./dev.db
```
or
```
dev.db
```

### Issue: "Owner login fails"
**Solution:** 
1. First, ensure DATABASE_URL is set correctly
2. Call the initialization endpoint: `POST /api/owner/init`
3. Try logging in with:
   - Email: `owner@goldlink.com`
   - Password: `Owner@GoldLink2024`

### Issue: "Database not found"
**Solution:** The database will be created automatically on first run. Make sure:
- DATABASE_URL is set correctly
- The directory `/opt/render/project/src/` is writable
- Prisma can access the database file

## Step-by-Step Render Setup

1. **Create a new Web Service** in Render
2. **Connect your GitHub repository**
3. **Set Environment Variables:**
   - `DATABASE_URL=file:/opt/render/project/src/dev.db`
   - `NEXTAUTH_URL=https://your-app.onrender.com`
   - `NEXTAUTH_SECRET=<generate-with-openssl>`
4. **Set Build Command:**
   ```
   npm install && npx prisma generate && npx prisma db push && npm run build
   ```
5. **Set Start Command:**
   ```
   npm run start:prod
   ```
6. **Deploy**

## After Deployment

1. Wait for the build to complete
2. Check the logs for "Database initialization complete"
3. Navigate to your app URL
4. Try owner login with the default credentials
5. If login fails, call `POST /api/owner/init` to reset the account

## Important Notes

- SQLite on Render: The database file is stored in the project directory
- Database persistence: The database persists between deployments
- Owner account: Automatically created/reset on startup if using `start:prod`
- Password reset: Use `/api/owner/init` endpoint to reset owner password

