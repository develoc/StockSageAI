#!/bin/bash

echo "🚀 Starting Quantum Trade v1.0..."
echo "=================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your database configuration"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env; then
    echo "⚠️  Warning: DATABASE_URL not found in .env file"
    echo "Please configure your database connection"
fi

echo "📦 Installing dependencies (if needed)..."
npm install --silent

echo "📦 Installing client dependencies (if needed)..."
cd client && npm install --silent && cd ..

echo "🗄️  Setting up database schema..."
npm run db:push

echo ""
echo "🌐 Starting development servers..."
echo "   - Backend (API): http://localhost:3000"
echo "   - Frontend (Web): http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev
