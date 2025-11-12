# Troubleshooting Guide for Database Connection Issues

## Common Issues and Solutions

### Issue 1: 502 Bad Gateway Errors
**Symptoms:**
- Browser shows 502 errors for API endpoints
- `/api/auth/session` returns 502
- `/api/auth/callback/credentials` returns 401

**Possible Causes:**
1. Server is crashing during startup
2. Database file doesn't exist or isn't accessible
3. Prisma client failing to initialize
4. Environment variables not set correctly

**Solutions:**
1. Check Render logs for crash errors
2. Verify `DATABASE_URL` is set correctly: `file:/opt/render/project/src/dev.db`
3. Ensure the directory `/opt/render/project/src/` exists and is writable
4. Check that `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set

### Issue 2: 500 Internal Server Error - Database Connection
**Symptoms:**
- "Database connection error" message
- Registration fails with 500 error
- Login fails with authentication errors

**Solutions:**
1. **Check Database File Exists:**
   - The database file should be created automatically on first run
   - If not, ensure `prisma db push` runs during build

2. **Verify DATABASE_URL:**
   ```bash
   # Should be:
   DATABASE_URL=file:/opt/render/project/src/dev.db
   
   # NOT:
   DATABASE_URL=./dev.db
   DATABASE_URL=dev.db
   ```

3. **Check Build Command:**
   ```bash
   npm install && npx prisma generate && npx prisma db push && npm run build
   ```

4. **Initialize Database Manually:**
   - Visit: `https://your-app.onrender.com/api/owner/init` (POST)
   - This will create the database and owner account

### Issue 3: 401 Unauthorized - Authentication Fails
**Symptoms:**
- "Invalid owner credentials" error
- Login attempts return 401

**Solutions:**
1. **Initialize Owner Account:**
   ```bash
   curl -X POST https://your-app.onrender.com/api/owner/init
   ```

2. **Use Correct Credentials:**
   - Email: `owner@goldlink.com`
   - Password: `Owner@GoldLink2024`

3. **Check Server Logs:**
   - Look for authentication errors in Render logs
   - Check if database queries are succeeding

### Issue 4: Database File Not Found (ENOENT)
**Symptoms:**
- Error messages mentioning "no such file" or "ENOENT"
- Database operations fail

**Solutions:**
1. **Ensure Database Directory Exists:**
   - The path `/opt/render/project/src/` must exist
   - Render should create this automatically

2. **Run Database Migration:**
   - The build command should include `npx prisma db push`
   - This creates the database file if it doesn't exist

3. **Check File Permissions:**
   - The database file must be writable
   - Render should handle this automatically

## Health Check Endpoint

Use the health check endpoint to verify database connectivity:

```bash
curl https://your-app.onrender.com/api/health
```

**Expected Response (Healthy):**
```json
{
  "status": "healthy",
  "database": "connected",
  "userCount": 1,
  "timestamp": "2025-11-12T..."
}
```

**Expected Response (Unhealthy):**
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "Database connection failed",
  "timestamp": "2025-11-12T..."
}
```

## Step-by-Step Recovery Process

1. **Check Render Dashboard:**
   - Go to your Render dashboard
   - Check the "Logs" tab for errors
   - Look for Prisma or database-related errors

2. **Verify Environment Variables:**
   - `DATABASE_URL=file:/opt/render/project/src/dev.db`
   - `NEXTAUTH_URL=https://your-app.onrender.com`
   - `NEXTAUTH_SECRET=<your-secret>`

3. **Restart the Service:**
   - In Render dashboard, click "Manual Deploy" → "Clear build cache & deploy"
   - This will rebuild and restart the service

4. **Initialize Database:**
   - After restart, call: `POST /api/owner/init`
   - This ensures the database and owner account exist

5. **Test Health Endpoint:**
   - Visit: `https://your-app.onrender.com/api/health`
   - Should return healthy status

6. **Test Login:**
   - Try owner login with default credentials
   - Check browser console for detailed errors

## Render-Specific Considerations

1. **SQLite on Render:**
   - SQLite works on Render but requires proper file path
   - Database persists between deployments
   - File is stored in the project directory

2. **Build Process:**
   - `prisma generate` - Generates Prisma client
   - `prisma db push` - Creates/updates database schema
   - `npm run build` - Builds Next.js app

3. **Startup:**
   - `npm run start:prod` runs `init-db.js` first
   - This initializes the database and owner account
   - Then starts the Next.js server

## Debugging Tips

1. **Check Logs:**
   - Render logs show all console.log and console.error output
   - Look for Prisma error codes (P1001, P1003, P2002, etc.)

2. **Error Codes:**
   - `P1001`: Can't reach database server
   - `P1003`: Database file doesn't exist
   - `P2002`: Unique constraint violation (duplicate email)

3. **Test Locally First:**
   - Test database operations locally
   - Ensure everything works before deploying

## Contact Support

If issues persist:
1. Check Render logs for specific error messages
2. Verify all environment variables are set
3. Try manual database initialization
4. Check that the build process completes successfully

