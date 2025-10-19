#!/bin/bash

# Reset user credentials in the QuantumTrade AI database
# This script resets passwords for admin and regular users

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}======================================${RESET}"
echo -e "${BOLD}${BLUE}   QuantumTrade AI Password Reset    ${RESET}"
echo -e "${BOLD}${BLUE}======================================${RESET}"

# Check if database URL is available
if [ -z "$DATABASE_URL" ]; then
    if [ -f ../.env ]; then
        export $(grep -v '^#' ../.env | xargs)
        echo -e "${YELLOW}Loaded database connection from .env file${RESET}"
    else
        echo -e "${RED}ERROR: DATABASE_URL not set and .env file not found${RESET}"
        echo -e "${YELLOW}Please set the DATABASE_URL environment variable or create a .env file${RESET}"
        exit 1
    fi
fi

echo -e "\n${YELLOW}Running password reset script...${RESET}"
node ./check-db-connection.js

echo -e "\n${BOLD}${GREEN}Password Reset Complete!${RESET}"
echo -e "\n${BOLD}${BLUE}Default login credentials:${RESET}"
echo -e "${BLUE}- Admin: admin@quantumtrade.ai / admin123${RESET}"
echo -e "${BLUE}- User:  user@quantumtrade.ai / user123${RESET}"
echo -e "${BOLD}${BLUE}======================================${RESET}"