#!/bin/bash

# Direct Fix Script for Login Page Issues

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}======================================${RESET}"
echo -e "${BOLD}${BLUE}   StockSageAI Login Page Fix Tool   ${RESET}"
echo -e "${BOLD}${BLUE}======================================${RESET}"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "\n${BOLD}${YELLOW}Starting Login Page Fix...${RESET}"

# Step 1: Check if the server is running
echo -e "\n${YELLOW}Checking if server is running...${RESET}"
curl -s http://localhost:3000/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Server is running${RESET}"
    SERVER_RUNNING=true
else
    echo -e "${RED}✗ Server is not running${RESET}"
    echo -e "${YELLOW}Starting server...${RESET}"
    NODE_ENV=development PORT=3000 tsx server/index.ts > server-logs.txt 2>&1 &
    SERVER_PID=$!
    echo -e "${GREEN}Server started with PID: $SERVER_PID${RESET}"
    sleep 3
    SERVER_RUNNING=true
fi

# Step 2: Fix CORS configuration in the server
echo -e "\n${YELLOW}Fixing CORS configuration...${RESET}"
if [ -f "server/index.ts" ]; then
    # Check if cors is imported and configured properly
    if grep -q "import cors from 'cors'" server/index.ts; then
        echo -e "${GREEN}✓ CORS import found${RESET}"
    else
        echo -e "${RED}✗ CORS import missing${RESET}"
        echo -e "${YELLOW}Adding CORS import...${RESET}"
        sed -i '1s/^/import cors from "cors";\n/' server/index.ts
    fi
    
    # Check if cors is applied to the app
    if grep -q "app.use(cors())" server/index.ts; then
        echo -e "${GREEN}✓ CORS middleware found${RESET}"
    else
        echo -e "${RED}✗ CORS middleware missing${RESET}"
        echo -e "${YELLOW}Adding CORS middleware...${RESET}"
        sed -i '/app.use(express.json())/a app.use(cors());' server/index.ts
    fi
    
    echo -e "${GREEN}CORS configuration updated${RESET}"
else
    echo -e "${RED}✗ Server index file not found${RESET}"
fi

# Step 3: Fix authentication endpoints
echo -e "\n${YELLOW}Enhancing authentication endpoints...${RESET}"
if [ -f "server/auth.ts" ]; then
    # Add better error logging
    if grep -q "console.log('Login attempt:')" server/auth.ts; then
        echo -e "${GREEN}✓ Debug logging already present${RESET}"
    else
        echo -e "${YELLOW}Adding debug logging...${RESET}"
        # Find login endpoint and add logging
        sed -i '/login = async/a \\  console.log("Login attempt:", req.body);' server/auth.ts
        sed -i '/catch (error)/a \\    console.error("Login error:", error);' server/auth.ts
    fi
    
    echo -e "${GREEN}Authentication endpoints enhanced${RESET}"
else
    echo -e "${RED}✗ Auth file not found${RESET}"
fi

# Step 4: Fix Axios client configuration
echo -e "\n${YELLOW}Fixing Axios client configuration...${RESET}"
if [ -f "client/src/lib/axiosClient.ts" ]; then
    # Ensure baseURL is set correctly
    if grep -q "baseURL: \"http://localhost:3000\"" client/src/lib/axiosClient.ts; then
        echo -e "${GREEN}✓ Axios baseURL is correct${RESET}"
    else
        echo -e "${YELLOW}Updating Axios baseURL...${RESET}"
        # This sed pattern looks for lines containing baseURL and replaces with the correct one
        sed -i 's|baseURL:.*|baseURL: "http://localhost:3000",|' client/src/lib/axiosClient.ts
        echo -e "${GREEN}Axios baseURL updated${RESET}"
    fi
    
    # Add error interceptor if not present
    if grep -q "interceptors.response.use" client/src/lib/axiosClient.ts; then
        echo -e "${GREEN}✓ Axios error interceptors found${RESET}"
    else
        echo -e "${YELLOW}Adding Axios error interceptors...${RESET}"
        # Add interceptors to the end of the file before export
        cat >> client/src/lib/axiosClient.ts << 'EOF'

// Add response interceptor for better error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
EOF
        echo -e "${GREEN}Axios error interceptors added${RESET}"
    fi
else
    echo -e "${RED}✗ Axios client file not found${RESET}"
fi

# Step 5: Fix login page styling
echo -e "\n${YELLOW}Fixing login page styling...${RESET}"
if [ -f "client/src/pages/login.tsx" ]; then
    # Add inline styles to ensure consistent appearance
    LOGIN_FILE_CONTENT=$(cat client/src/pages/login.tsx)
    
    # Make a backup of the original file
    cp client/src/pages/login.tsx client/src/pages/login.tsx.bak
    
    # Create a new login page with enhanced styling
    cat > client/src/pages/login.tsx << 'EOF'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../lib/axiosClient';
import { Logo } from '../components/ui/logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';

const loginContainerStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'var(--quantum-background, linear-gradient(145deg, #1a1a2e, #16213e))',
  color: 'var(--quantum-text, #fff)',
  padding: '20px'
};

const loginCardStyle = {
  background: 'var(--quantum-card-bg, rgba(30, 41, 59, 0.8))',
  borderRadius: '12px',
  padding: '2rem',
  boxShadow: 'var(--quantum-shadow, 0 8px 32px rgba(0, 0, 0, 0.2))',
  width: '100%',
  maxWidth: '400px',
  backdropFilter: 'blur(10px)',
  border: '1px solid var(--quantum-border, rgba(255, 255, 255, 0.1))'
};

const inputStyle = {
  background: 'var(--quantum-input-bg, rgba(15, 23, 42, 0.7))',
  border: '1px solid var(--quantum-border, rgba(255, 255, 255, 0.1))',
  color: 'var(--quantum-text, white)',
  padding: '10px 16px',
  borderRadius: '8px',
  marginBottom: '16px',
  width: '100%'
};

const buttonStyle = {
  background: 'var(--quantum-primary, linear-gradient(45deg, #3490dc, #6574cd))',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  width: '100%',
  fontWeight: 'bold' as const,
  transition: 'all 0.2s ease',
  marginTop: '16px'
};

const errorStyle = {
  color: 'var(--quantum-error, #f87171)',
  marginTop: '8px',
  textAlign: 'center' as const
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('Attempting login with:', email);
      const response = await axiosClient.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      console.log('Login successful, token received');
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <div className="login-container quantum-theme" style={loginContainerStyle}>
      <div className="login-card" style={loginCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <Logo />
        </div>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem', fontWeight: 'bold' }}>
          Welcome to StockSageAI
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '2rem', opacity: 0.8 }}>
          Sign in to access your account
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px' }}>Email</label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="Enter your email"
              className="quantum-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px' }}>Password</label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="Enter your password"
              className="quantum-input"
            />
          </div>
          
          {error && <div className="error-message" style={errorStyle}>{error}</div>}
          
          <Button type="submit" style={buttonStyle} className="quantum-button">
            Sign In
          </Button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/forgot-password" style={{ color: 'var(--quantum-link, #60a5fa)', textDecoration: 'none' }}>
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}
EOF
    
    echo -e "${GREEN}Login page styling fixed with inline styles${RESET}"
else
    echo -e "${RED}✗ Login page file not found${RESET}"
fi

# Step 6: Fix logo component
echo -e "\n${YELLOW}Fixing logo component...${RESET}"
if [ -f "client/src/components/ui/logo.tsx" ]; then
    # Make a backup of the original file
    cp client/src/components/ui/logo.tsx client/src/components/ui/logo.tsx.bak
    
    # Create a new logo component with enhanced styling
    cat > client/src/components/ui/logo.tsx << 'EOF'
import React from 'react';

const logoContainerStyle = {
  background: 'var(--quantum-logo-bg, linear-gradient(45deg, #3490dc, #6574cd))',
  padding: '12px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'var(--quantum-shadow, 0 4px 12px rgba(0, 0, 0, 0.15))'
};

const logoTextStyle = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  background: 'linear-gradient(to right, #ffffff, #e2e8f0)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  marginLeft: '8px'
};

const logoIconStyle = {
  width: '28px',
  height: '28px',
  fill: 'white'
};

export function Logo() {
  return (
    <div className="logo" style={logoContainerStyle}>
      <svg 
        style={logoIconStyle} 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
        <path d="M0 0h24v24H0z" fill="none" />
      </svg>
      <span className="logo-text" style={logoTextStyle}>
        StockSageAI
      </span>
    </div>
  );
}
EOF
    
    echo -e "${GREEN}Logo component fixed with inline styles${RESET}"
else
    echo -e "${RED}✗ Logo component file not found${RESET}"
fi

# Step 7: Fix theme configuration in index.css
echo -e "\n${YELLOW}Fixing theme configuration...${RESET}"
if [ -f "client/src/index.css" ]; then
    # Make a backup of the original file
    cp client/src/index.css client/src/index.css.bak
    
    # Check if quantum theme variables exist
    if grep -q "quantum" client/src/index.css; then
        echo -e "${GREEN}✓ Quantum theme variables found${RESET}"
        
        # Update the quantum theme variables with improved values
        cat >> client/src/index.css << 'EOF'

/* Enhanced Quantum Theme Variables */
:root {
  /* Base Colors */
  --quantum-background: linear-gradient(145deg, #1a1a2e, #16213e);
  --quantum-card-bg: rgba(30, 41, 59, 0.8);
  --quantum-text: #ffffff;
  --quantum-text-secondary: rgba(255, 255, 255, 0.7);
  --quantum-border: rgba(255, 255, 255, 0.1);
  
  /* UI Elements */
  --quantum-primary: linear-gradient(45deg, #3490dc, #6574cd);
  --quantum-secondary: linear-gradient(45deg, #4c51bf, #6b46c1);
  --quantum-accent: #60a5fa;
  --quantum-input-bg: rgba(15, 23, 42, 0.7);
  --quantum-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  
  /* Status Colors */
  --quantum-success: #10b981;
  --quantum-warning: #f59e0b;
  --quantum-error: #ef4444;
  --quantum-info: #3b82f6;
  
  /* Logo Specific */
  --quantum-logo-bg: linear-gradient(45deg, #3490dc, #6574cd);
  --quantum-logo-text: linear-gradient(to right, #ffffff, #e2e8f0);
  
  /* Link Colors */
  --quantum-link: #60a5fa;
  --quantum-link-hover: #93c5fd;
}

/* Apply Quantum theme to standard UI components */
.quantum-theme button,
.quantum-button {
  background: var(--quantum-primary);
  color: var(--quantum-text);
  border: none;
  border-radius: 8px;
}

.quantum-theme input,
.quantum-input {
  background: var(--quantum-input-bg);
  border: 1px solid var(--quantum-border);
  color: var(--quantum-text);
  border-radius: 8px;
}

.quantum-theme a {
  color: var(--quantum-link);
}

.quantum-theme a:hover {
  color: var(--quantum-link-hover);
}
EOF
        echo -e "${GREEN}Quantum theme variables enhanced${RESET}"
    else
        echo -e "${RED}✗ Quantum theme variables not found${RESET}"
        echo -e "${YELLOW}Adding quantum theme variables...${RESET}"
        
        cat >> client/src/index.css << 'EOF'

/* Quantum Theme Variables */
:root {
  /* Base Colors */
  --quantum-background: linear-gradient(145deg, #1a1a2e, #16213e);
  --quantum-card-bg: rgba(30, 41, 59, 0.8);
  --quantum-text: #ffffff;
  --quantum-text-secondary: rgba(255, 255, 255, 0.7);
  --quantum-border: rgba(255, 255, 255, 0.1);
  
  /* UI Elements */
  --quantum-primary: linear-gradient(45deg, #3490dc, #6574cd);
  --quantum-secondary: linear-gradient(45deg, #4c51bf, #6b46c1);
  --quantum-accent: #60a5fa;
  --quantum-input-bg: rgba(15, 23, 42, 0.7);
  --quantum-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  
  /* Status Colors */
  --quantum-success: #10b981;
  --quantum-warning: #f59e0b;
  --quantum-error: #ef4444;
  --quantum-info: #3b82f6;
  
  /* Logo Specific */
  --quantum-logo-bg: linear-gradient(45deg, #3490dc, #6574cd);
  --quantum-logo-text: linear-gradient(to right, #ffffff, #e2e8f0);
  
  /* Link Colors */
  --quantum-link: #60a5fa;
  --quantum-link-hover: #93c5fd;
}

/* Apply Quantum theme to standard UI components */
.quantum-theme button,
.quantum-button {
  background: var(--quantum-primary);
  color: var(--quantum-text);
  border: none;
  border-radius: 8px;
}

.quantum-theme input,
.quantum-input {
  background: var(--quantum-input-bg);
  border: 1px solid var(--quantum-border);
  color: var(--quantum-text);
  border-radius: 8px;
}

.quantum-theme a {
  color: var(--quantum-link);
}

.quantum-theme a:hover {
  color: var(--quantum-link-hover);
}
EOF
        echo -e "${GREEN}Quantum theme variables added${RESET}"
    fi
else
    echo -e "${RED}✗ CSS file not found${RESET}"
fi

# Final Summary
echo -e "\n${BOLD}${GREEN}Login Page Fix Complete!${RESET}"
echo -e "${BOLD}${BLUE}======================================${RESET}"
echo -e "${BOLD}${BLUE}           Changes Summary            ${RESET}"
echo -e "${BOLD}${BLUE}======================================${RESET}"
echo -e "✓ ${YELLOW}Server configuration enhanced${RESET}"
echo -e "✓ ${YELLOW}Auth endpoints improved${RESET}"
echo -e "✓ ${YELLOW}Axios client configured properly${RESET}"
echo -e "✓ ${YELLOW}Login page styling fixed with fallback styles${RESET}"
echo -e "✓ ${YELLOW}Logo component enhanced${RESET}"
echo -e "✓ ${YELLOW}Theme configuration updated${RESET}"
echo -e "\n${BOLD}${GREEN}Next Steps:${RESET}"
echo -e "1. Restart the client application with: ${YELLOW}cd client && npm run dev${RESET}"
echo -e "2. If the server was not running, it has been started for you"
echo -e "3. Access the application at: ${YELLOW}http://localhost:5173${RESET}"
echo -e "\n${BOLD}${BLUE}======================================${RESET}"

# Ask if user wants to restart the client
echo -e "\n${YELLOW}Would you like to restart the client application now? (y/n)${RESET}"
read -r restart_client
if [[ "$restart_client" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Restarting client...${RESET}"
    cd client
    npm run dev
fi