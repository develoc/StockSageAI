#!/bin/bash

# Enable verbose debugging
set -x

# Check if PostgreSQL service is running
echo "Checking PostgreSQL service status..."
sudo service postgresql status
pg_status=$(sudo service postgresql status | grep -c 'active (running)')

if [ $pg_status -eq 0 ]; then
  echo "PostgreSQL is not running. Starting PostgreSQL..."
  sudo service postgresql start
  echo "PostgreSQL started successfully."
else
  echo "PostgreSQL is already running."
fi

# Wait for PostgreSQL to fully start
echo "Waiting for PostgreSQL to be fully available..."
sleep 5

# Check PostgreSQL configuration
echo "Current PostgreSQL configuration:"
sudo grep -E "listen_addresses|port" /etc/postgresql/17/main/postgresql.conf
sudo grep -E "host|local" /etc/postgresql/17/main/pg_hba.conf | head -n 10

# Ensure user and database exist
echo "Ensuring database and user exist..."
sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname='dbadmin';"
if [ $? -ne 0 ]; then
  echo "Creating dbadmin user..."
  sudo -u postgres psql -c "CREATE USER dbadmin WITH PASSWORD 'dbadmin';"
fi

sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='quantumtrade';"
if [ $? -ne 0 ]; then
  echo "Creating quantumtrade database..."
  sudo -u postgres psql -c "CREATE DATABASE quantumtrade OWNER dbadmin;"
fi

# Configure PostgreSQL to listen on all interfaces
echo "Configuring PostgreSQL to listen on all interfaces..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/17/main/postgresql.conf
# Add the connection rule if it doesn't exist
if ! sudo grep -q "host all all 0.0.0.0/0 md5" /etc/postgresql/17/main/pg_hba.conf; then
  echo "host all all 0.0.0.0/0 md5" | sudo tee -a /etc/postgresql/17/main/pg_hba.conf > /dev/null
fi

echo "Restarting PostgreSQL to apply configuration changes..."
sudo service postgresql restart
sleep 5

# Verify database connection with detailed output
echo "Verifying database connection..."
echo "Testing connection to localhost..."
PGPASSWORD=dbadmin psql -h localhost -U dbadmin -d quantumtrade -c "SELECT 1;"
db_connection=$?

if [ $db_connection -eq 0 ]; then
  echo "Database connection verified successfully."
  # Turn off debugging
  set +x
  exit 0
else
  echo "Failed to connect to database with error code $db_connection."
  
  # Additional diagnostics
  echo "Checking network connectivity..."
  netstat -tuln | grep 5432
  
  echo "Checking PostgreSQL process..."
  ps aux | grep postgres
  
  echo "Failed to set up PostgreSQL. Please check the error messages above."
  # Turn off debugging
  set +x
  exit 1
fi