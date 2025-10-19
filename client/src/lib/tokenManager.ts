import jwt_decode from 'jwt-decode';
import axiosClient from './axiosClient';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  exp: number;
  tokenVersion: number;
}

export const tokenManager = {
  getToken: () => localStorage.getItem('auth_token'),
  
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },
  
  removeToken: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
  
  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = jwt_decode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      // Check if token will expire in the next 5 minutes
      return decoded.exp <= currentTime + 300;
    } catch {
      return true;
    }
  },
  
  refreshToken: async (): Promise<string | null> => {
    try {
      const response = await axiosClient.post('/api/auth/refresh-token');
      const { token } = response.data;
      
      if (token) {
        tokenManager.setToken(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  },
  
  getDecodedToken: (): DecodedToken | null => {
    const token = tokenManager.getToken();
    if (!token) return null;
    
    try {
      return jwt_decode<DecodedToken>(token);
    } catch {
      return null;
    }
  }
};
