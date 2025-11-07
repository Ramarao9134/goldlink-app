#!/bin/bash

# GoldLink Deployment Script
# This script helps prepare and deploy the application

echo "🚀 GoldLink Deployment Script"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your values."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set in .env"
    echo "   For production, you need a PostgreSQL database."
    echo "   Options: Supabase, Neon, Railway, or your own PostgreSQL server"
    exit 1
fi

# Check database provider
if [[ "$DATABASE_URL" == *"postgresql"* ]] || [[ "$DATABASE_URL" == *"postgres"* ]]; then
    echo "✅ PostgreSQL database detected"
    echo ""
    echo "🔄 Updating schema for PostgreSQL..."
    # In production, use PostgreSQL schema
    # You should manually copy schema.postgresql.prisma to schema.prisma
    echo "⚠️  Remember to update prisma/schema.prisma for PostgreSQL before deploying!"
else
    echo "⚠️  SQLite detected. For production, use PostgreSQL."
fi

# Build the application
echo ""
echo "🏗️  Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update prisma/schema.prisma for PostgreSQL (see prisma/schema.postgresql.prisma)"
    echo "2. Set up your database and update DATABASE_URL"
    echo "3. Run: npx prisma migrate deploy"
    echo "4. Deploy to Vercel: vercel --prod"
    echo "   Or push to GitHub and connect to Vercel dashboard"
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

