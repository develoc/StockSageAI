
import { useQuery } from "@tanstack/react-query";

import axiosClient from '@/lib/axiosClient';

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No token found');
      }

      try {
        const response = await axiosClient.get('/api/auth/user');
        return response.data;
      } catch (error: any) {
        // axiosClient will handle token removal and redirection for 401 errors
        throw new Error(error.message || 'Authentication failed');
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  });

  const logout = async () => {
    try {
      await axiosClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && !error,
    logout,
  };
}
