# Quick Start: Local Setup for Render Database

## 🚀 Fast Setup (5 Minutes)

### Step 1: Get DATABASE_URL from Render
1. Go to: Render Dashboard → Your Service → **Environment** tab
2. Copy the `DATABASE_URL` value

### Step 2: Create `.env.local` file
```bash
# In project root directory
DATABASE_URL="paste-your-render-database-url-here"
```

### Step 3: Run Setup Commands
```bash
# Install dependencies (if not done)
npm install

# Generate Prisma client
npm run db:generate

# Push schema to Render database
npm run db:push

# Setup owner account
npm run db:setup

# Test connection
npm run db:test
```

### Step 4: Verify
Visit: `https://goldlink-app.onrender.com/auth/login`
- Email: `owner@goldlink.com`
- Password: `Owner@GoldLink2024`

## ✅ Done!

For detailed instructions, see: `LOCAL_TO_RENDER_SETUP.md`

