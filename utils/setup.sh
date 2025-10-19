#!/bin/bash

# All-in-One Setup Script for StockSageAI

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}======================================${RESET}"
echo -e "${BOLD}${BLUE}   StockSageAI Complete Setup Tool   ${RESET}"
echo -e "${BOLD}${BLUE}======================================${RESET}"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Install dependencies
install_dependencies() {
    echo -e "\n${BOLD}${YELLOW}[1/5] Installing Dependencies...${RESET}"
    
    # Check if npm is installed
    if command -v npm &> /dev/null; then
        echo -e "${GREEN}✓ npm is installed${RESET}"
    else
        echo -e "${RED}✗ npm is not installed${RESET}"
        echo -e "${YELLOW}Please install Node.js and npm before continuing${RESET}"
        exit 1
    fi
    
    # Install project dependencies
    echo -e "${YELLOW}Installing main project dependencies...${RESET}"
    npm install --legacy-peer-deps
    
    # Install client dependencies
    echo -e "${YELLOW}Installing client dependencies...${RESET}"
    cd client
    npm install --legacy-peer-deps
    cd ..
    
    echo -e "${GREEN}✓ Dependencies installed successfully${RESET}"
}

# Step 2: Set up the database
setup_database() {
    echo -e "\n${BOLD}${YELLOW}[2/5] Setting Up Database...${RESET}"
    
    # Check if PostgreSQL is installed
    if command -v psql &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL is installed${RESET}"
    else
        echo -e "${RED}✗ PostgreSQL is not installed${RESET}"
        
        if command -v apt-get &> /dev/null; then
            echo -e "${YELLOW}Attempting to install PostgreSQL...${RESET}"
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
        else
            echo -e "${YELLOW}Please install PostgreSQL before continuing${RESET}"
            echo -e "${YELLOW}Visit: https://www.postgresql.org/download/${RESET}"
            return
        fi
    fi
    
    # Run database initialization script if it exists
    if [ -f "init-database.sh" ]; then
        echo -e "${YELLOW}Running database initialization script...${RESET}"
        bash ./init-database.sh
    elif [ -f "initialize-db.js" ]; then
        echo -e "${YELLOW}Running database initialization script...${RESET}"
        node initialize-db.js
    else
        echo -e "${RED}✗ Database initialization script not found${RESET}"
    fi
    
    # Run migrations
    if [ -d "migrations" ]; then
        echo -e "${YELLOW}Running database migrations...${RESET}"
        npm run drizzle:migrate
    fi
    
    echo -e "${GREEN}✓ Database setup completed${RESET}"
}

# Step 3: Fix common issues
fix_common_issues() {
    echo -e "\n${BOLD}${YELLOW}[3/5] Fixing Common Issues...${RESET}"
    
    # Fix CORS issues
    echo -e "${YELLOW}Fixing CORS configuration...${RESET}"
    if [ -f "server/index.ts" ]; then
        # Check if cors is imported and configured properly
        if ! grep -q "import cors from 'cors'" server/index.ts; then
            echo -e "${YELLOW}Adding CORS import...${RESET}"
            sed -i '1s/^/import cors from "cors";\n/' server/index.ts
        fi
        
        # Check if cors is applied to the app
        if ! grep -q "app.use(cors())" server/index.ts; then
            echo -e "${YELLOW}Adding CORS middleware...${RESET}"
            sed -i '/app.use(express.json())/a app.use(cors());' server/index.ts
        fi
    fi
    
    # Fix theme consistency
    echo -e "${YELLOW}Fixing theme consistency...${RESET}"
    if [ -f "client/src/index.css" ]; then
        # Run the fix-login-page-now.sh script if it exists
        if [ -f "fix-login-page-now.sh" ]; then
            echo -e "${YELLOW}Running login page fix script...${RESET}"
            bash ./fix-login-page-now.sh
        fi
    fi
    
    # Check for missing packages
    echo -e "${YELLOW}Checking for missing packages...${RESET}"
    if ! grep -q "cors" package.json; then
        echo -e "${YELLOW}Adding missing cors package...${RESET}"
        npm install cors --legacy-peer-deps
    fi
    
    echo -e "${GREEN}✓ Common issues fixed${RESET}"
}

# Step 4: Set up development environment
setup_dev_environment() {
    echo -e "\n${BOLD}${YELLOW}[4/5] Setting Up Development Environment...${RESET}"
    
    # Create VSCode settings if .vscode directory doesn't exist
    if [ ! -d ".vscode" ]; then
        echo -e "${YELLOW}Creating VSCode settings...${RESET}"
        mkdir -p .vscode
        
        # Create settings.json
        cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
EOF
        
        # Create launch.json for debugging
        cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/server/index.ts",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/tsx",
      "outFiles": ["${workspaceFolder}/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
EOF
    fi
    
    # Create convenient npm scripts if not already present
    if [ -f "package.json" ]; then
        echo -e "${YELLOW}Updating npm scripts for convenience...${RESET}"
        
        # Check if jq is installed
        if command -v jq &> /dev/null; then
            # Add or update scripts
            jq '.scripts["start:dev"] = "bash ./run-dev.sh"' package.json > temp.json && mv temp.json package.json
            jq '.scripts["fix:login"] = "bash ./fix-login-page-now.sh"' package.json > temp.json && mv temp.json package.json
            jq '.scripts["health:check"] = "bash ./health-check.sh"' package.json > temp.json && mv temp.json package.json
        else
            echo -e "${YELLOW}jq not installed, skipping package.json updates${RESET}"
            echo -e "${YELLOW}Consider adding the following scripts manually:${RESET}"
            echo -e "  \"start:dev\": \"bash ./run-dev.sh\","
            echo -e "  \"fix:login\": \"bash ./fix-login-page-now.sh\","
            echo -e "  \"health:check\": \"bash ./health-check.sh\""
        fi
    fi
    
    echo -e "${GREEN}✓ Development environment set up${RESET}"
}

# Step 5: Run verification checks
verify_setup() {
    echo -e "\n${BOLD}${YELLOW}[5/5] Verifying Setup...${RESET}"
    
    # Check and reset database user credentials
    echo -e "${YELLOW}Checking database connection and user accounts...${RESET}"
    node ../utils/check-db-connection.js
    
    # Check if the server can start
    echo -e "${YELLOW}Testing server startup...${RESET}"
    NODE_ENV=development PORT=3000 tsx ../server/index.ts > server-test.log 2>&1 &
    SERVER_PID=$!
    
    # Give the server some time to start
    sleep 3
    
    # Check if server is responding
    curl -s http://localhost:3000/api/health > /dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Server is running correctly${RESET}"
    else
        echo -e "${RED}✗ Server is not responding${RESET}"
        echo -e "${YELLOW}Check server-test.log for errors${RESET}"
    fi
    
    # Kill the test server
    kill $SERVER_PID 2>/dev/null
    
    echo -e "${GREEN}✓ Verification completed${RESET}"
}

# Main function to run all setup steps
run_setup() {
    echo -e "\n${BOLD}${BLUE}Starting complete StockSageAI setup...${RESET}"
    
    install_dependencies
    setup_database
    fix_common_issues
    setup_dev_environment
    verify_setup
    
    echo -e "\n${BOLD}${GREEN}Setup Complete!${RESET}"
    echo -e "${BOLD}${BLUE}======================================${RESET}"
    echo -e "${BOLD}${BLUE}         StockSageAI is Ready!        ${RESET}"
    echo -e "${BOLD}${BLUE}======================================${RESET}"
    echo -e "You can now start the application using:"
    echo -e "${YELLOW}npm run start:dev${RESET}"
    echo -e "\nOr manually start the components:"
    echo -e "1. Server: ${YELLOW}cd server && NODE_ENV=development tsx index.ts${RESET}"
    echo -e "2. Client: ${YELLOW}cd client && npm run dev${RESET}"
    echo -e "\nIf you encounter any issues:"
    echo -e "- Run the health check: ${YELLOW}npm run health:check${RESET}"
    echo -e "- Fix login page issues: ${YELLOW}npm run fix:login${RESET}"
    echo -e "\nAccess your application at:"
    echo -e "- Frontend: ${YELLOW}http://localhost:5173${RESET}"
    echo -e "- Backend API: ${YELLOW}http://localhost:3000${RESET}"
    echo -e "${BOLD}${BLUE}======================================${RESET}"
}

# Run the setup
run_setup