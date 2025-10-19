#!/bin/bash

# Troubleshooting and Health Check Script for StockSageAI

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}======================================${RESET}"
echo -e "${BOLD}${BLUE}   StockSageAI Health Check Tool     ${RESET}"
echo -e "${BOLD}${BLUE}======================================${RESET}"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if package.json exists and has all required dependencies
check_dependencies() {
  echo -e "\n${BOLD}${YELLOW}Checking Package Dependencies...${RESET}"
  
  # Required dependencies
  DEPENDENCIES=("express" "cors" "jsonwebtoken" "drizzle-orm" "react" "axios")
  
  MISSING=0
  for dep in "${DEPENDENCIES[@]}"; do
    if grep -q "\"$dep\":" package.json; then
      echo -e "${GREEN}✓ $dep found${RESET}"
    else
      echo -e "${RED}✗ $dep missing${RESET}"
      MISSING=$((MISSING+1))
    fi
  done
  
  if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}All core dependencies found!${RESET}"
  else
    echo -e "${YELLOW}Attempting to install missing dependencies...${RESET}"
    npm install --legacy-peer-deps
  fi
}

# Check if PostgreSQL is properly initialized
check_database() {
  echo -e "\n${BOLD}${YELLOW}Checking Database Connection...${RESET}"
  
  if [ -f "verify-connection.js" ]; then
    echo -e "${YELLOW}Running database connection test...${RESET}"
    node verify-connection.js
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Database connection successful${RESET}"
    else
      echo -e "${RED}✗ Database connection failed${RESET}"
      echo -e "${YELLOW}Would you like to initialize the database? (y/n)${RESET}"
      read -r answer
      if [[ "$answer" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Running database initialization...${RESET}"
        bash ./init-database.sh
      fi
    fi
  else
    echo -e "${RED}✗ Database verification script not found${RESET}"
  fi
}

# Check authentication server
check_auth() {
  echo -e "\n${BOLD}${YELLOW}Checking Authentication Server...${RESET}"
  
  # Check if auth.ts exists
  if [ -f "server/auth.ts" ]; then
    echo -e "${GREEN}✓ Authentication module found${RESET}"
    
    # Test if server is running
    curl -s http://localhost:3000/api/health > /dev/null
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Server is running${RESET}"
      
      # Test auth endpoints
      echo -e "${YELLOW}Testing authentication endpoints...${RESET}"
      curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"password123"}' \
        http://localhost:3000/api/auth/login > /dev/null
        
      if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Auth endpoints responding${RESET}"
      else
        echo -e "${RED}✗ Auth endpoints not responding${RESET}"
        echo -e "${YELLOW}Would you like to run the auth test server? (y/n)${RESET}"
        read -r answer
        if [[ "$answer" =~ ^[Yy]$ ]]; then
          echo -e "${YELLOW}Running auth test server...${RESET}"
          node test-auth-server.mjs &
          AUTH_PID=$!
          echo -e "${GREEN}Auth test server started with PID: $AUTH_PID${RESET}"
        fi
      fi
    else
      echo -e "${RED}✗ Server is not running${RESET}"
      echo -e "${YELLOW}Would you like to start the server? (y/n)${RESET}"
      read -r answer
      if [[ "$answer" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Starting server...${RESET}"
        NODE_ENV=development tsx server/index.ts &
        SERVER_PID=$!
        echo -e "${GREEN}Server started with PID: $SERVER_PID${RESET}"
      fi
    fi
  else
    echo -e "${RED}✗ Authentication module not found${RESET}"
  fi
}

# Check theme consistency
check_theme() {
  echo -e "\n${BOLD}${YELLOW}Checking Theme Consistency...${RESET}"
  
  # Check if index.css exists
  if [ -f "client/src/index.css" ]; then
    echo -e "${GREEN}✓ Main CSS file found${RESET}"
    
    # Check for quantum theme variables
    if grep -q "quantum" client/src/index.css; then
      echo -e "${GREEN}✓ Quantum theme found${RESET}"
      
      # Check if login.tsx has consistent styling
      if [ -f "client/src/pages/login.tsx" ]; then
        echo -e "${GREEN}✓ Login page found${RESET}"
        
        # Check for inline styles or quantum theme classes
        if grep -q "style=" client/src/pages/login.tsx || grep -q "quantum" client/src/pages/login.tsx; then
          echo -e "${GREEN}✓ Login page appears to have proper styling${RESET}"
        else
          echo -e "${RED}✗ Login page might be missing styles${RESET}"
          echo -e "${YELLOW}Would you like to add fallback styles to the login page? (y/n)${RESET}"
          read -r answer
          if [[ "$answer" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Adding fallback styles to login page...${RESET}"
            sed -i 's/<div className="login-container">/<div className="login-container" style={{background: "var(--quantum-background)", color: "var(--quantum-text)"}}>/g' client/src/pages/login.tsx
            echo -e "${GREEN}Fallback styles added to login page${RESET}"
          fi
        fi
      else
        echo -e "${RED}✗ Login page not found${RESET}"
      fi
    else
      echo -e "${RED}✗ Quantum theme not found${RESET}"
    fi
  else
    echo -e "${RED}✗ Main CSS file not found${RESET}"
  fi
}

# Check logo component
check_logo() {
  echo -e "\n${BOLD}${YELLOW}Checking Logo Component...${RESET}"
  
  # Check if logo component exists
  if [ -f "client/src/components/ui/logo.tsx" ]; then
    echo -e "${GREEN}✓ Logo component found${RESET}"
    
    # Check for inline styles or fallbacks
    if grep -q "style=" client/src/components/ui/logo.tsx; then
      echo -e "${GREEN}✓ Logo has inline styles${RESET}"
    else
      echo -e "${RED}✗ Logo might be missing fallback styles${RESET}"
      echo -e "${YELLOW}Would you like to add fallback styles to the logo? (y/n)${RESET}"
      read -r answer
      if [[ "$answer" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Adding fallback styles to logo...${RESET}"
        sed -i 's/<div className="logo">/<div className="logo" style={{background: "linear-gradient(45deg, #3490dc, #6574cd)", padding: "10px", borderRadius: "8px"}}>/g' client/src/components/ui/logo.tsx
        echo -e "${GREEN}Fallback styles added to logo${RESET}"
      fi
    fi
  else
    echo -e "${RED}✗ Logo component not found${RESET}"
  fi
}

# Fix common axios issues
fix_axios_issues() {
  echo -e "\n${BOLD}${YELLOW}Checking Axios Configuration...${RESET}"
  
  if [ -f "client/src/lib/axiosClient.ts" ]; then
    echo -e "${GREEN}✓ Axios client found${RESET}"
    
    # Check for baseURL configuration
    if grep -q "baseURL" client/src/lib/axiosClient.ts; then
      echo -e "${GREEN}✓ Axios baseURL configured${RESET}"
      
      # Ensure baseURL is set correctly
      if grep -q "localhost:3000" client/src/lib/axiosClient.ts; then
        echo -e "${GREEN}✓ Axios baseURL appears to be set correctly${RESET}"
      else
        echo -e "${YELLOW}Axios baseURL might not be pointing to localhost:3000${RESET}"
        echo -e "${YELLOW}Would you like to fix the baseURL? (y/n)${RESET}"
        read -r answer
        if [[ "$answer" =~ ^[Yy]$ ]]; then
          echo -e "${YELLOW}Updating Axios baseURL...${RESET}"
          sed -i 's|baseURL: ".*"|baseURL: "http://localhost:3000"|g' client/src/lib/axiosClient.ts
          echo -e "${GREEN}Axios baseURL updated${RESET}"
        fi
      fi
    else
      echo -e "${RED}✗ Axios baseURL not configured${RESET}"
    fi
  else
    echo -e "${RED}✗ Axios client not found${RESET}"
  fi
}

# Main menu
display_menu() {
  echo -e "\n${BOLD}${BLUE}StockSageAI Health Check Menu${RESET}"
  echo -e "${YELLOW}1. Check Package Dependencies${RESET}"
  echo -e "${YELLOW}2. Check Database Connection${RESET}"
  echo -e "${YELLOW}3. Check Authentication Server${RESET}"
  echo -e "${YELLOW}4. Check Theme Consistency${RESET}"
  echo -e "${YELLOW}5. Check Logo Component${RESET}"
  echo -e "${YELLOW}6. Fix Axios Configuration${RESET}"
  echo -e "${YELLOW}7. Run All Checks${RESET}"
  echo -e "${YELLOW}8. Start Development Environment${RESET}"
  echo -e "${YELLOW}0. Exit${RESET}"
  
  echo -e "\n${BOLD}Enter your choice:${RESET}"
  read -r choice
  
  case $choice in
    1) check_dependencies ;;
    2) check_database ;;
    3) check_auth ;;
    4) check_theme ;;
    5) check_logo ;;
    6) fix_axios_issues ;;
    7) 
      check_dependencies
      check_database
      check_auth
      check_theme
      check_logo
      fix_axios_issues
      ;;
    8)
      echo -e "${YELLOW}Starting development environment...${RESET}"
      ./run-dev.sh
      ;;
    0) 
      echo -e "${BLUE}Exiting StockSageAI Health Check Tool.${RESET}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Please try again.${RESET}"
      display_menu
      ;;
  esac
  
  # Return to menu after operation completes
  echo -e "\n${YELLOW}Press Enter to return to the main menu...${RESET}"
  read
  display_menu
}

# Start the program
display_menu