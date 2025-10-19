#!/bin/bash

# Ensure PostgreSQL is ready
chmod +x ./ensure-postgresql.sh
./ensure-postgresql.sh

if [ $? -ne 0 ]; then
  echo "Failed to connect to PostgreSQL. Aborting."
  exit 1
fi

# Run migrations
echo "Running database migrations..."
npx tsx run-seed.ts

if [ $? -ne 0 ]; then
  echo "Failed to run migrations. Aborting."
  exit 1
fi

echo "Database initialized successfully."