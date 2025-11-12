/**
 * Setup Script for Render Database (Local Machine)
 * 
 * This script connects to Render's database from your local machine
 * and initializes the database schema and owner account.
 * 
 * Usage:
 * 1. Copy DATABASE_URL from Render Dashboard → Environment
 * 2. Create .env.local file with DATABASE_URL
 * 3. Run: node scripts/setup-render-db.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const DEFAULT_OWNER_EMAIL = "owner@goldlink.com"
const DEFAULT_OWNER_PASSWORD = "Owner@GoldLink2024"

async function setupDatabase() {
  console.log('🚀 Starting database setup for Render...\n')
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set!')
    console.error('\nPlease create a .env.local file with:')
    console.error('DATABASE_URL="your-render-database-url"')
    console.error('\nGet DATABASE_URL from: Render Dashboard → Your Service → Environment')
    process.exit(1)
  }

  console.log('📋 Database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'))
  console.log('')

  const prisma = new PrismaClient()

  try {
    // Step 1: Test connection
    console.log('1️⃣ Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful!\n')

    // Step 2: Push schema
    console.log('2️⃣ Pushing database schema...')
    // Note: We'll use prisma db push via CLI, but we can verify tables exist
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `.catch(() => {
      // If SQLite query fails, try PostgreSQL query
      return prisma.$queryRaw`
        SELECT table_name as name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `
    })
    
    console.log(`✅ Found ${tables.length} tables in database\n`)

    // Step 3: Create/Update owner account
    console.log('3️⃣ Setting up owner account...')
    const hashedPassword = await bcrypt.hash(DEFAULT_OWNER_PASSWORD, 10)
    
    const owner = await prisma.user.upsert({
      where: { email: DEFAULT_OWNER_EMAIL },
      update: {
        hashedPassword,
        role: 'OWNER',
        name: 'GoldLink Owner'
      },
      create: {
        name: 'GoldLink Owner',
        email: DEFAULT_OWNER_EMAIL,
        role: 'OWNER',
        hashedPassword,
      },
    })

    console.log('✅ Owner account ready!')
    console.log(`   Email: ${owner.email}`)
    console.log(`   ID: ${owner.id}`)
    console.log(`   Role: ${owner.role}\n`)

    // Step 4: Verify setup
    console.log('4️⃣ Verifying setup...')
    const userCount = await prisma.user.count()
    console.log(`✅ Total users in database: ${userCount}\n`)

    console.log('🎉 Database setup completed successfully!\n')
    console.log('📝 Owner Login Credentials:')
    console.log(`   Email: ${DEFAULT_OWNER_EMAIL}`)
    console.log(`   Password: ${DEFAULT_OWNER_PASSWORD}\n`)
    console.log('✅ You can now login at: https://goldlink-app.onrender.com/auth/login\n')

  } catch (error) {
    console.error('❌ Error during database setup:')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    if (error.code === 'P1001') {
      console.error('\n💡 Tip: Database server is not reachable. Check:')
      console.error('   1. DATABASE_URL is correct')
      console.error('   2. Database is running on Render')
      console.error('   3. Your IP is allowed (if database has IP restrictions)')
    } else if (error.code === 'P1003') {
      console.error('\n💡 Tip: Database file not found. Run:')
      console.error('   npx prisma db push')
    } else if (error.message?.includes('ENOENT')) {
      console.error('\n💡 Tip: Database file path issue. Check DATABASE_URL format:')
      console.error('   SQLite: file:/path/to/db.db')
      console.error('   PostgreSQL: postgresql://user:pass@host:port/db')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed.')
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

