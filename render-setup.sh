#!/bin/bash

# GoldLink Render Deployment Setup Script
# This script helps prepare your application for Render deployment

echo "🚀 GoldLink Render Deployment Setup"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
# Render Production Environment Variables
# Copy these to Render dashboard after deployment

DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_URL=https://your-app-name.onrender.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
CRON_SECRET=any-random-string
EOF
    echo "✅ Created .env template"
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Prisma schema is for PostgreSQL
if grep -q 'provider = "sqlite"' prisma/schema.prisma; then
    echo ""
    echo "⚠️  Prisma schema is set to SQLite"
    echo "   For Render, you need PostgreSQL"
    echo ""
    read -p "Do you want to update schema to PostgreSQL? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f prisma/schema.postgresql.prisma ]; then
            cp prisma/schema.postgresql.prisma prisma/schema.prisma
            echo "✅ Updated schema to PostgreSQL"
        else
            echo "❌ PostgreSQL schema template not found"
            echo "   Please manually update prisma/schema.prisma"
        fi
    fi
fi

# Check if code is committed
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo ""
    echo "⚠️  Git repository not initialized"
    echo "   Run: git init && git add . && git commit -m 'Initial commit'"
fi

# Check if pushed to GitHub
if git rev-parse --git-dir > /dev/null 2>&1; then
    if ! git remote | grep -q origin; then
        echo ""
        echo "⚠️  No GitHub remote configured"
        echo "   Run: git remote add origin <your-github-repo-url>"
    fi
fi

echo ""
echo "📋 Next Steps:"
echo "1. Push code to GitHub: git push -u origin main"
echo "2. Create PostgreSQL database in Render dashboard"
echo "3. Create Web Service in Render dashboard"
echo "4. Add environment variables in Render dashboard"
echo "5. Deploy and run migrations: npx prisma migrate deploy"
echo ""
echo "See deploy-render.md for detailed instructions!"

