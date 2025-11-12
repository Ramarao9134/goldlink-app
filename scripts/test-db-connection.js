/**
 * Quick Database Connection Test
 * 
 * Usage: node scripts/test-db-connection.js
 */

const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  console.log('🔍 Testing database connection...\n')
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL not set!')
    console.error('Create .env.local file with DATABASE_URL')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Try a simple query
    const userCount = await prisma.user.count().catch(() => 0)
    console.log(`✅ Database is accessible`)
    console.log(`   Users in database: ${userCount}\n`)
    
    // Check if owner exists
    const owner = await prisma.user.findUnique({
      where: { email: 'owner@goldlink.com' }
    })
    
    if (owner) {
      console.log('✅ Owner account exists')
      console.log(`   Email: ${owner.email}`)
      console.log(`   Role: ${owner.role}\n`)
    } else {
      console.log('⚠️  Owner account not found')
      console.log('   Run: node scripts/setup-render-db.js\n')
    }
    
  } catch (error) {
    console.error('❌ Database connection failed!')
    console.error(`   Error: ${error.message}`)
    console.error(`   Code: ${error.code || 'N/A'}\n`)
    
    if (error.code === 'P1001') {
      console.error('💡 Tip: Check DATABASE_URL and ensure database is running')
    } else if (error.code === 'P1003') {
      console.error('💡 Tip: Database file not found. Run: npx prisma db push')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

