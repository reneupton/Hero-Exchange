#!/bin/bash

echo "🎮 Starting FlogIt Arena Gamification Service..."
echo ""

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL connection..."
until docker exec flogit-arena-postgres-1 pg_isready -U postgres 2>/dev/null; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done
echo "✅ PostgreSQL is ready!"
echo ""

# Check if RabbitMQ is running
echo "🐰 Checking RabbitMQ connection..."
until docker exec flogit-arena-rabbitmq-1 rabbitmq-diagnostics ping 2>/dev/null; do
  echo "Waiting for RabbitMQ to be ready..."
  sleep 2
done
echo "✅ RabbitMQ is ready!"
echo ""

# Run database migrations
echo "🗄️  Running database migrations..."
cd src/GamificationService
dotnet ef database update 2>/dev/null || echo "⚠️  Note: Migrations will run on first service start"
cd ../..
echo ""

# Start the Gamification Service
echo "🚀 Starting Gamification Service on http://localhost:7005"
echo "📝 API Documentation: http://localhost:7005/swagger"
echo ""
cd src/GamificationService
dotnet run --urls "http://localhost:7005"
