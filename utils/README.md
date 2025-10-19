# QuantumTrade AI Utility Scripts

This directory contains essential utility scripts for the QuantumTrade AI platform.

## Available Scripts

- **init-database.sh**: Initializes the PostgreSQL database with the required schema and tables.
- **health-check.sh**: Performs health checks on the application services and database.
- **setup.sh**: Complete setup script for the development environment.

## Usage

These scripts should be run from the project root directory:

```bash
# Initialize the database
./utils/init-database.sh

# Run health checks
./utils/health-check.sh

# Set up the development environment
./utils/setup.sh
```

## Note

All other utility scripts have been consolidated into these main scripts for simplicity and maintainability. The npm scripts in package.json are the preferred way to run common development tasks.