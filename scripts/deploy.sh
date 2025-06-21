#!/bin/bash

# NerdGamer Deployment Script
# This script helps prepare your application for deployment

echo "🚀 NerdGamer Deployment Preparation"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. You'll need to set environment variables in your deployment platform."
    echo "Required environment variables:"
    echo "  - DATABASE_URL"
    echo "  - JWT_SECRET"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️  Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Your application is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Choose a deployment platform:"
    echo "   - Vercel (recommended): https://vercel.com"
    echo "   - Railway: https://railway.app"
    echo "   - Netlify: https://netlify.com"
    echo "3. Set up your environment variables"
    echo "4. Deploy!"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions."
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi 