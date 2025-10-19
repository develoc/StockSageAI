# StockSageAI - Setup Guide

This README provides step-by-step instructions for setting up and running the StockSageAI application in a Windows WSL environment.

## Prerequisites

- Windows 10/11 with WSL2 enabled
- PostgreSQL installed in WSL
- Node.js v18+ installed in WSL

## Quick Start

1. Clone the repository (if you haven't already)
2. Run the automated setup script:

```bash
cd StockSageAI
chmod +x fix-postgres.sh
./fix-postgres.sh
npm install
npm run dev
```

This will set up the PostgreSQL database, install dependencies, and start both the backend server and frontend client.

## Manual Setup Steps

If the quick start doesn't work, follow these steps manually:

### 1. Configure PostgreSQL

```bash
# Start PostgreSQL service
sudo service postgresql start

# Create database user
sudo -u postgres psql -c "CREATE USER dbadmin WITH PASSWORD 'dbadmin';"

# Create database
sudo -u postgres psql -c "CREATE DATABASE quantumtrade OWNER dbadmin;"

# Configure PostgreSQL to accept connections
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/17/main/postgresql.conf
echo "host all all 0.0.0.0/0 md5" | sudo tee -a /etc/postgresql/17/main/pg_hba.conf

# Restart PostgreSQL
sudo service postgresql restart
```

### 2. Set up Environment Variables

Make sure your `.env` file in the project root has the following settings:

```
# Database Configuration
DATABASE_URL=postgresql://dbadmin:dbadmin@localhost:5432/quantumtrade

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
NODE_ENV=development
PORT=3000
```

### 3. Install Dependencies and Run the Application

```bash
# Install dependencies
npm install

# Start the development server (backend + frontend)
npm run dev

# Alternative: Start backend and frontend separately
npm run dev:server  # In one terminal
npm run dev:client  # In another terminal
```

## Troubleshooting

### PostgreSQL Connection Issues

If you encounter database connection errors, try:

1. Check if PostgreSQL is running:
   ```bash
   sudo service postgresql status
   ```

2. If not running, start it:
   ```bash
   sudo service postgresql start
   ```

3. Test database connection:
   ```bash
   PGPASSWORD=dbadmin psql -h localhost -U dbadmin -d quantumtrade -c "SELECT 1;"
   ```

4. Run the fix-postgres.sh script to reset the database:
   ```bash
   chmod +x fix-postgres.sh
   ./fix-postgres.sh
   ```

### Network Error (ERR_NETWORK) on Login

This error typically occurs when:

1. The backend server is not running
2. PostgreSQL database is not accessible
3. The database connection string in `.env` is incorrect

Try these solutions:

1. Ensure PostgreSQL is running:
   ```bash
   sudo service postgresql status
   ```

2. Check that the backend server is running on port 3000:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. Verify the database connection:
   ```bash
   PGPASSWORD=dbadmin psql -h localhost -U dbadmin -d quantumtrade -c "SELECT 1;"
   ```

4. Make sure the frontend is correctly configured to proxy requests to the backend (check `client/vite.config.ts`)

## Login Credentials

Once the application is running, you can access it at http://localhost:5000 and log in with:

- Admin: admin@quantumtrade.ai / admin123
- User: user@quantumtrade.ai / user123

## Automation Scripts

The repository includes several helper scripts:

- `fix-postgres.sh` - Fixes PostgreSQL configuration and database setup
- `ensure-postgresql.sh` - Verifies PostgreSQL is running and configured
- `start-system.sh` - Starts the entire application (PostgreSQL, backend, frontend)
- `init-db.sh` - Initializes the database schema and seed data

To use any script, make it executable first:

```bash
chmod +x script-name.sh
./script-name.sh
```