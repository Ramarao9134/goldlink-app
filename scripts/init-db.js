const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const DEFAULT_OWNER_EMAIL = "owner@goldlink.com"
const DEFAULT_OWNER_PASSWORD = "Owner@GoldLink2024"

async function initDatabase() {
  try {
    console.log('Initializing database...')
    
    // Check if owner exists
    const existingOwner = await prisma.user.findUnique({
      where: { email: DEFAULT_OWNER_EMAIL },
    })

    if (existingOwner) {
      console.log('Owner account already exists, resetting password...')
      const hashedPassword = await bcrypt.hash(DEFAULT_OWNER_PASSWORD, 10)
      await prisma.user.update({
        where: { email: DEFAULT_OWNER_EMAIL },
        data: {
          hashedPassword,
          role: "OWNER",
        },
      })
      console.log('Owner password reset to default')
    } else {
      console.log('Creating owner account...')
      const hashedPassword = await bcrypt.hash(DEFAULT_OWNER_PASSWORD, 10)
      await prisma.user.create({
        data: {
          name: "GoldLink Owner",
          email: DEFAULT_OWNER_EMAIL,
          role: "OWNER",
          hashedPassword,
        },
      })
      console.log('Owner account created successfully')
    }

    console.log('Database initialization complete')
    console.log(`Owner credentials:`)
    console.log(`  Email: ${DEFAULT_OWNER_EMAIL}`)
    console.log(`  Password: ${DEFAULT_OWNER_PASSWORD}`)
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

initDatabase()
  .then(() => {
    console.log('Database initialization script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Database initialization failed:', error)
    process.exit(1)
  })

