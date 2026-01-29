#!/bin/bash

# Docker Development Setup Script for IV1201-Chat

set -e

echo "🐳 Setting up Docker development environment..."

# Check if Docker Desktop is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    echo "   On macOS: Start Docker Desktop from Applications"
    echo "   On Windows: Start Docker Desktop from Start Menu"
    echo "   On Linux: sudo systemctl start docker"
    exit 1
fi

echo "✅ Docker is running"

# Copy environment file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from example..."
    cp .env.example .env
    echo "   ✅ Created .env with Docker defaults"
    echo "   ℹ️  You can edit .env to customize settings"
fi

# Start PostgreSQL container
echo "🚀 Starting PostgreSQL container..."
docker compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U chatuser > /dev/null 2>&1; then
        echo "   ✅ Database is ready!"
        break
    else
        echo "   ⏳ Attempt $i/30..."
        sleep 2
    fi
    
    if [ $i -eq 30 ]; then
        echo "❌ Database failed to start after 30 attempts"
        docker compose logs postgres
        exit 1
    fi
done

echo ""
echo "🎯 Docker development environment is ready!"
echo ""
echo "📋 Available commands:"
echo "   npm run docker-dev    # Start development with Docker + backend"
echo "   npm run docker-logs  # View database logs"
echo "   npm run docker-reset # Reset database (clears all data)"
echo "   npm run docker-down  # Stop database container"
echo ""
echo "🌐 Access points:"
echo "   Backend:  http://localhost:8001"
echo "   Database:  localhost:5432 (inside Docker)"
echo "   pgAdmin:   http://localhost:5050 (if started with --profile tools)"
echo ""
echo "   Now run: npm run docker-dev"