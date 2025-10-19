import axios from 'axios';

// Get the current hostname to handle different environments
const currentHost = window.location.hostname;

// Get API URL from environment variables
let API_URL = import.meta.env.VITE_API_URL;

// Parse fallbacks from environment or create default set
let API_FALLBACKS: string[] = [];

if (import.meta.env.VITE_API_FALLBACKS) {
  API_FALLBACKS = import.meta.env.VITE_API_FALLBACKS.split(',');
  console.log('Using configured API fallbacks:', API_FALLBACKS);
} else {
  // Default fallbacks for WSL/Windows compatibility
  if (window.navigator.userAgent.toLowerCase().includes('windows')) {
    API_FALLBACKS = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      `http://${currentHost}:3000`
    ];
    console.log('Using default fallbacks for Windows/WSL:', API_FALLBACKS);
  }
}

if (!API_URL) {
  // For local development
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    API_URL = 'http://localhost:3000';
  } else {
    // For production - use same hostname but port 3000
    API_URL = `http://${currentHost}:3000`;
  }
  console.log('No API_URL found in env, defaulting to:', API_URL);
}

// Store fallback URLs for potential connection issues
if (API_FALLBACKS.length > 0) {
  (window as any).API_FALLBACKS = API_FALLBACKS;
}

console.log('Primary API URL:', API_URL);

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/CORS
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Try fallback URLs for WSL environments if available
    if (!error.response && error.code === 'ECONNREFUSED' && (window as any).API_FALLBACKS) {
      const fallbacks = (window as any).API_FALLBACKS;
      const currentBaseURL = originalRequest.baseURL;
      const currentIndex = fallbacks.indexOf(currentBaseURL);
      
      // If there's another fallback URL to try
      if (currentIndex < fallbacks.length - 1) {
        console.log(`Trying fallback API URL: ${fallbacks[currentIndex + 1]}`);
        const nextBaseURL = fallbacks[currentIndex + 1];
        
        // Create a new axios instance with the next fallback URL
        const fallbackClient = axios.create({
          baseURL: nextBaseURL,
          timeout: originalRequest.timeout,
          headers: originalRequest.headers,
          withCredentials: true
        });
        
        // Update the global client base URL for future requests
        axiosClient.defaults.baseURL = nextBaseURL;
        
        // Retry the original request with the new base URL
        return fallbackClient({
          url: originalRequest.url,
          method: originalRequest.method,
          data: originalRequest.data,
          params: originalRequest.params
        });
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message, error.code);
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server. Please ensure the server is running.');
      }
      throw new Error(`Network error (${error.code || 'unknown'}). Please check your connection.`);
    }

    // Handle 401 Unauthorized errors
    if (error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    // Handle 403 Forbidden errors
    if (error.response.status === 403) {
      throw new Error('Access denied. You do not have permission to perform this action.');
    }

    // Handle 404 errors with more helpful message
    if (error.response.status === 404) {
      console.error('API endpoint not found:', originalRequest.url);
      throw new Error(`API endpoint not found: ${originalRequest.url}. The server may be misconfigured or the endpoint doesn't exist.`);
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    throw new Error(errorMessage);
  }
);

export default axiosClient;
