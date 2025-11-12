# Local Machine నుండి Render Database Setup Guide

## Overview

Render Shell free tier లో available కాదు, కాబట్టి మీ local machine నుండి Render database కి connect చేసి setup చేయడం.

## Prerequisites

1. Node.js installed (v18+)
2. Git repository cloned locally
3. Render Dashboard access (DATABASE_URL copy చేయడానికి)

---

## Step 1: Render నుండి DATABASE_URL Copy చేయండి

1. Render Dashboard → Your Service → **Environment** tab
2. `DATABASE_URL` variable value copy చేయండి
3. Example formats:
   - **SQLite**: `file:/opt/render/project/src/dev.db`
   - **PostgreSQL**: `postgresql://user:pass@host:port/db?sslmode=require`

---

## Step 2: Local .env.local File Create చేయండి

Project root directory లో `.env.local` file create చేయండి:

```bash
# Windows PowerShell
New-Item -Path .env.local -ItemType File

# Linux/Mac
touch .env.local
```

`.env.local` file లో paste చేయండి:

```env
# Render Database URL (మీ Render dashboard నుండి copy చేసిన URL)
DATABASE_URL="your-render-database-url-here"

# Local development (optional)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-dev-secret-min-32-chars-long"

# Other env vars if needed for local testing
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
```

**⚠️ Important:** `.env.local` file git లో commit చేయకండి (ఇది `.gitignore` లో ఉంది)

---

## Step 3: Dependencies Install చేయండి

```bash
npm install
```

---

## Step 4: Prisma Client Generate & Schema Push

### Option A: SQLite Database (Current Setup)

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Option B: PostgreSQL Database (If you switched)

1. **First, update `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite" to "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Then run:**

```bash
npx prisma generate
npx prisma db push
```

---

## Step 5: Database Connection Test

Quick test script run చేయండి:

```bash
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(()=>{console.log('✅ DB Connection OK'); p.\$disconnect()}).catch(e=>{console.error('❌ DB Error:', e.message); process.exit(1)})"
```

**Expected Output:** `✅ DB Connection OK`

---

## Step 6: Owner Account Create/Update

Setup script run చేయండి:

```bash
node scripts/setup-render-db.js
```

**Expected Output:**
```
🚀 Starting database setup for Render...
📋 Database URL: postgresql://****@...
1️⃣ Testing database connection...
✅ Database connection successful!
2️⃣ Pushing database schema...
✅ Found X tables in database
3️⃣ Setting up owner account...
✅ Owner account ready!
   Email: owner@goldlink.com
   ID: clx...
   Role: OWNER
4️⃣ Verifying setup...
✅ Total users in database: 1
🎉 Database setup completed successfully!
```

---

## Step 7: Verify in Render

1. **Health Check:**
   ```bash
   curl https://goldlink-app.onrender.com/api/health
   ```
   Should return: `{"status":"healthy","database":"connected"}`

2. **Owner Login Test:**
   - Visit: `https://goldlink-app.onrender.com/auth/login`
   - Email: `owner@goldlink.com`
   - Password: `Owner@GoldLink2024`

---

## Troubleshooting

### Error: DATABASE_URL not found

**Solution:**
- `.env.local` file create చేసి DATABASE_URL add చేయండి
- File path correct అని verify చేయండి

### Error: P1001 - Can't reach database server

**Possible Causes:**
1. DATABASE_URL incorrect
2. Database not running on Render
3. Network/firewall issue

**Solution:**
- Render Dashboard → Database → Check status
- DATABASE_URL format verify చేయండి
- PostgreSQL అయితే `?sslmode=require` add చేయండి

### Error: P1003 - Database file not found

**Solution:**
- SQLite: `npx prisma db push` run చేయండి
- PostgreSQL: Database exists అని verify చేయండి

### Error: Schema mismatch

**Solution:**
```bash
# Force reset (⚠️ deletes all data)
npx prisma db push --force-reset

# Or migrate (safer)
npx prisma migrate dev
```

---

## Alternative: Manual Owner Account Creation

If script fails, manually create:

```bash
node - <<'NODE'
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
(async ()=>{
  const prisma = new PrismaClient();
  const hashed = await bcrypt.hash('Owner@GoldLink2024', 10);
  try{
    const user = await prisma.user.upsert({
      where: { email: 'owner@goldlink.com' },
      update: { hashedPassword: hashed, role: 'OWNER' },
      create: {
        name: 'GoldLink Owner',
        email: 'owner@goldlink.com',
        role: 'OWNER',
        hashedPassword: hashed
      }
    });
    console.log('✅ Owner created:', user.id);
  }catch(e){
    console.error('❌ Error:', e.message);
  } finally { await prisma.$disconnect(); }
})();
NODE
```

---

## Quick Reference Commands

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Push schema to database
npx prisma db push

# 4. Setup owner account
node scripts/setup-render-db.js

# 5. Test connection
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(()=>console.log('OK')).catch(e=>console.error('ERR',e.message)).finally(()=>p.\$disconnect())"
```

---

## Next Steps

1. ✅ Database setup complete
2. ✅ Owner account created
3. 🔄 Render service restart (if needed)
4. 🧪 Test login at: `https://goldlink-app.onrender.com/auth/login`

---

## Support

Issues persist అయితే:
1. Render logs check చేయండి
2. Error messages copy చేసి share చేయండి
3. Health endpoint test: `/api/health`

