# FastAPI Auth Server
# This server provides authentication endpoints compatible with the StockSageAI client
# Filename: fastapi_auth_server.py

from fastapi import FastAPI, HTTPException, Header, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import base64
import json
import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="StockSageAI Auth Server",
    description="Authentication server for StockSageAI",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:3000"],  # Allow specific origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample user data for testing
users = [
    {
        "id": 1,
        "email": "admin@quantumtrade.ai",
        "password_hash": "$2a$10$KhH.wXXA0HZUrnpPu84Stebv13zXKBcACx45H2zXpDFUr3YBlgmDG",  # admin123
        "first_name": "Admin",
        "last_name": "User",
        "role": "admin",
        "isActive": True
    }
]

# Request models
class LoginRequest(BaseModel):
    email: str
    password: str

# Basic authentication function
def authenticate_user(email: str, password: str):
    """Authenticate a user by email and password"""
    for user in users:
        if user["email"] == email:
            # For demo, just check direct password (in a real system, use proper hashing)
            if password == "admin123":  # Mock password check
                return user
    return None

# Helper function to decode token
def decode_token(token: str) -> dict:
    """Decode a base64 token"""
    try:
        decoded_bytes = base64.b64decode(token)
        decoded_str = decoded_bytes.decode('utf-8')
        return json.loads(decoded_str)
    except Exception as e:
        logger.error(f"Token decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# Authentication dependency
def get_current_user(authorization: str = Header(None)):
    """Get the current user from the authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required"
        )
    
    token = authorization.split(" ")[1]
    try:
        payload = decode_token(token)
        user_id = payload.get("userId")
        
        # Find user by ID
        user = next((u for u in users if u["id"] == user_id), None)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        return user
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

# --- ROUTES ---

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/health")
async def api_health():
    """API health check endpoint"""
    return {
        "status": "ok",
        "message": "Authentication server is running",
        "timestamp": datetime.now().isoformat(),
        "endpoints": [
            {"method": "GET", "path": "/api/health"},
            {"method": "POST", "path": "/api/auth/login"},
            {"method": "GET", "path": "/api/auth/user"},
            {"method": "POST", "path": "/api/auth/logout"}
        ]
    }

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Login endpoint"""
    logger.info(f"Login attempt received for: {request.email}")
    
    user = authenticate_user(request.email, request.password)
    if not user:
        logger.warning(f"Login failed for: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create a simple token
    token_data = {
        "userId": user["id"],
        "email": user["email"],
        "role": user["role"]
    }
    token = base64.b64encode(json.dumps(token_data).encode('utf-8')).decode('utf-8')
    
    logger.info(f"Login successful for: {request.email}")
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
            "role": user["role"],
            "isActive": user["isActive"]
        }
    }

@app.get("/api/auth/user")
async def get_user(user: dict = Depends(get_current_user)):
    """Get current user information"""
    logger.info(f"User info requested for ID: {user['id']}")
    
    return {
        "id": user["id"],
        "email": user["email"],
        "firstName": user["first_name"],
        "lastName": user["last_name"],
        "role": user["role"],
        "isActive": user["isActive"]
    }

@app.post("/api/auth/logout")
async def logout():
    """Logout endpoint"""
    logger.info("Logout request received")
    
    return {"message": "Logged out successfully"}

if __name__ == "__main__":
    # This block is executed when running the script directly
    # For development only - in production, use a proper ASGI server like uvicorn
    import uvicorn
    port = int(os.getenv("PORT", "3000"))
    uvicorn.run(app, host="0.0.0.0", port=port)