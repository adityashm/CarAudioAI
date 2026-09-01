import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
export const TOKEN_STORAGE_KEY = '@car_audio_ai_token';
export const USER_STORAGE_KEY = '@car_audio_ai_user';

// Create Axios Client
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from AsyncStorage if available
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[API Client] Error reading auth token from storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Provide clean error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with non-2xx status
      console.warn(`[API Client] Error ${error.response.status} from ${error.config?.url}:`, error.response.data);
    } else if (error.request) {
      // Backend offline or unreachable
      console.warn(`[API Client] Network timeout or backend offline at ${error.config?.url}. Falling back to client-side engine.`);
    } else {
      console.warn('[API Client] Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Health check helper to verify if backend is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/api/health', { timeout: 3000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

export default apiClient;
