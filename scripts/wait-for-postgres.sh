#!/bin/bash
# Wait for PostgreSQL to be ready

set -e

host="${DB_HOST:-localhost}"
port="${DB_PORT:-5432}"
user="${DB_USER:-postgres}"
max_attempts=30
attempt=0

echo "Waiting for PostgreSQL at $host:$port..."

until PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h "$host" -p "$port" -U "$user" -c '\q' 2>/dev/null; do
  attempt=$((attempt + 1))
  
  if [ $attempt -ge $max_attempts ]; then
    echo "❌ PostgreSQL is not available after $max_attempts attempts"
    exit 1
  fi
  
  echo "⏳ PostgreSQL is unavailable - sleeping (attempt $attempt/$max_attempts)"
  sleep 1
done

echo "✅ PostgreSQL is up and ready!"
