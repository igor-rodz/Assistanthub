import axios from 'axios';
import { supabase } from './supabaseClient';

// In production (Vercel), API is on same origin, so use relative path
// In development, use localhost backend
const isProduction = process.env.NODE_ENV === 'production';
const BACKEND_URL = isProduction 
    ? '' // Same origin in production
    : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000');

// Create axios instance
const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
    timeout: 60000, // 60s timeout for AI operations
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Auth Token
api.interceptors.request.use(
    async (config) => {
        try {
            // Get current session from Supabase
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
        } catch (error) {
            console.error("Error attaching auth token:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized globally if needed (e.g., redirect to login)
        if (error.response?.status === 401) {
            console.warn("Unauthorized access - redirecting to login might be needed");
            // Optionally dispatch a logout event or clear session
        }
        return Promise.reject(error);
    }
);

export default api;
