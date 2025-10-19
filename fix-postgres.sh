#!/bin/bash

# Stop PostgreSQL if running
sudo service postgresql stop

# Start PostgreSQL with specific configuration
echo "Starting PostgreSQL..."
sudo service postgresql start

# Wait for PostgreSQL to start
sleep 3

# Create user if not exists
echo "Creating dbadmin user..."
sudo -u postgres psql -c "DROP USER IF EXISTS dbadmin;"
sudo -u postgres psql -c "CREATE USER dbadmin WITH PASSWORD 'dbadmin';"

# Create database if not exists
echo "Creating quantumtrade database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS quantumtrade;"
sudo -u postgres psql -c "CREATE DATABASE quantumtrade OWNER dbadmin;"

# Configure PostgreSQL to listen on all interfaces
echo "Configuring PostgreSQL..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/17/main/postgresql.conf

# Allow connections from any IP
echo "Configuring access rules..."
echo "host all all 0.0.0.0/0 md5" | sudo tee -a /etc/postgresql/17/main/pg_hba.conf > /dev/null
echo "host all dbadmin 127.0.0.1/32 md5" | sudo tee -a /etc/postgresql/17/main/pg_hba.conf > /dev/null
echo "host all dbadmin 0.0.0.0/0 md5" | sudo tee -a /etc/postgresql/17/main/pg_hba.conf > /dev/null

# Restart PostgreSQL to apply changes
echo "Restarting PostgreSQL..."
sudo service postgresql restart

# Wait for PostgreSQL to restart
sleep 3

# Test connection
echo "Testing connection..."
PGPASSWORD=dbadmin psql -h localhost -U dbadmin -d quantumtrade -c "SELECT 'Connection successful';"

echo "PostgreSQL setup complete!"