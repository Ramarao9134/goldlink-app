# Deployment Notes for GoldLink

## Environment Variables Required

When deploying to Render (or any hosting platform), make sure to set these environment variables:

### Required Variables

1. **DATABASE_URL** (CRITICAL for SQLite)
   - Must start with `file:` protocol
   - Example: `file:./dev.db` or `file:/path/to/database.db`
   - On Render, you might need: `file:/opt/render/project/src/dev.db`
   - **Important**: The database file path must be writable and persistent

2. **NEXTAUTH_URL**
   - Your application URL
   - Example: `https://your-app.onrender.com` (for production)
   - Example: `http://localhost:3000` (for local development)

3. **NEXTAUTH_SECRET**
   - A random secret string (minimum 32 characters)
   - Generate with: `openssl rand -base64 32`

### Optional Variables

4. **RAZORPAY_KEY_ID** (for payment processing)
   - Your Razorpay API Key ID
   - If not set, the app will use mock payment mode

5. **RAZORPAY_KEY_SECRET** (for payment processing)
   - Your Razorpay API Key Secret
   - If not set, the app will use mock payment mode

## Render Deployment Setup

1. **Set Environment Variables in Render Dashboard:**
   ```
   DATABASE_URL=file:/opt/render/project/src/dev.db
   NEXTAUTH_URL=https://your-app.onrender.com
   NEXTAUTH_SECRET=your-secret-key-min-32-chars
   ```

2. **Build Command:**
   ```
   npm install && npx prisma generate && npm run build
   ```

3. **Start Command:**
   ```
   npm start
   ```

4. **Database Setup:**
   - The database will be created automatically on first run
   - Run `npx prisma db push` if needed to sync schema

## Important Notes

- All API routes are marked as `dynamic = 'force-dynamic'` to prevent static generation issues
- The login page uses Suspense for `useSearchParams()` to avoid build errors
- SQLite database file must be in a persistent volume on Render
- For production, consider using PostgreSQL instead of SQLite for better performance and reliability

