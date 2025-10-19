#!/bin/bash

# Define colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== QuantumTrade AI Database Initialization ===${NC}"

# Step 1: Check if PostgreSQL is running
echo -e "${YELLOW}[1/5] Checking PostgreSQL service...${NC}"
pg_status=$(sudo service postgresql status | grep -c 'active (running)')

if [ $pg_status -eq 0 ]; then
  echo -e "${YELLOW}PostgreSQL is not running. Starting PostgreSQL...${NC}"
  sudo service postgresql start
fi

sleep 2

# Step 2: Ensure database and user exist
echo -e "${YELLOW}[2/5] Ensuring database user and database exist...${NC}"
sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname='dbadmin'" | grep -q 1
if [ $? -ne 0 ]; then
  echo "Creating dbadmin user..."
  sudo -u postgres psql -c "CREATE USER dbadmin WITH PASSWORD 'dbadmin';"
fi

sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='quantumtrade'" | grep -q 1
if [ $? -ne 0 ]; then
  echo "Creating quantumtrade database..."
  sudo -u postgres psql -c "CREATE DATABASE quantumtrade OWNER dbadmin;"
fi

echo -e "${GREEN}Database and user configured successfully.${NC}"

# Step 3: Load environment variables
echo -e "${YELLOW}[3/5] Setting up environment variables...${NC}"
export DATABASE_URL="postgresql://dbadmin:dbadmin@localhost:5432/quantumtrade"

# Step 4: Apply migrations to create schema
echo -e "${YELLOW}[4/5] Applying database migrations...${NC}"

# First, run migrations using Drizzle
echo "Running Drizzle migrations..."
npx drizzle-kit push

if [ $? -ne 0 ]; then
  echo -e "${RED}Migration using drizzle-kit failed. Attempting manual migration...${NC}"
  
  # Try to apply migrations manually using psql
  echo "Applying migrations manually..."
  
  # Apply first migration
  PGPASSWORD=dbadmin psql -h localhost -U dbadmin -d quantumtrade -f ./migrations/0000_naive_zuras.sql
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to apply base migration schema.${NC}"
    exit 1
  fi
  
  # Apply subsequent migrations
  PGPASSWORD=dbadmin psql -h localhost -U dbadmin -d quantumtrade -f ./migrations/0001_yummy_oracle.sql
  PGPASSWORD=dbadmin psql -h localhost -U dbadmin -d quantumtrade -f ./migrations/0002_add_alerts_and_settings.sql
else
  echo -e "${GREEN}Migrations applied successfully.${NC}"
fi

# Verify that the market_data table was created
echo "Verifying market_data table exists..."
PGPASSWORD=dbadmin psql -h localhost -U dbadmin -d quantumtrade -c "\dt market_data"

if [ $? -ne 0 ]; then
  echo -e "${RED}market_data table was not created. Creating manually...${NC}"
  PGPASSWORD=dbadmin psql -h localhost -U dbadmin -d quantumtrade -c "
  CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY NOT NULL,
    symbol VARCHAR NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    open NUMERIC(12, 4) NOT NULL,
    high NUMERIC(12, 4) NOT NULL,
    low NUMERIC(12, 4) NOT NULL,
    close NUMERIC(12, 4) NOT NULL,
    volume NUMERIC(15, 2) NOT NULL,
    timeframe VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );"
  
  echo -e "${GREEN}market_data table created manually.${NC}"
else
  echo -e "${GREEN}market_data table exists.${NC}"
fi

# Step 5: Seed the database
echo -e "${YELLOW}[5/5] Seeding the database...${NC}"
echo "Running seeding script..."
npx tsx run-seed.ts

if [ $? -ne 0 ]; then
  echo -e "${RED}Database seeding failed. Please check the logs above.${NC}"
  exit 1
fi

echo -e "${GREEN}Database initialized and seeded successfully!${NC}"
echo -e "${BLUE}You can now start the application using ./start-dev.sh${NC}"