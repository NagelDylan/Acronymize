import { useAuthHeader } from './auth';
import { useCallback, useMemo } from 'react';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Request configuration
interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

// Custom hook for API requests
export const useApi = () => {
  const getAuthHeader = useAuthHeader();

  // Helper to build URL with query params
  const buildUrl = useCallback((endpoint: string, params?: Record<string, any>): string => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }, []);

  // Generic request handler
  const makeRequest = useCallback(async <T>(
    method: string,
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const authHeaders = await getAuthHeader();
      const headers = {
        ...authHeaders,
        ...config?.headers,
      };

      const url = buildUrl(endpoint, config?.params);

      const requestConfig: RequestInit = {
        method,
        headers,
      };

      // Add body for POST, PUT, PATCH requests
      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        requestConfig.body = JSON.stringify(data);
      }

      const response = await fetch(url, requestConfig);

      // Handle non-JSON responses
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || responseData || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }, [getAuthHeader, buildUrl]);

  // HTTP method helpers
  const get = useCallback(<T>(endpoint: string, config?: RequestConfig) =>
    makeRequest<T>('GET', endpoint, undefined, config), [makeRequest]);

  const post = useCallback(<T>(endpoint: string, data?: any, config?: RequestConfig) =>
    makeRequest<T>('POST', endpoint, data, config), [makeRequest]);

  const put = useCallback(<T>(endpoint: string, data?: any, config?: RequestConfig) =>
    makeRequest<T>('PUT', endpoint, data, config), [makeRequest]);

  const patch = useCallback(<T>(endpoint: string, data?: any, config?: RequestConfig) =>
    makeRequest<T>('PATCH', endpoint, data, config), [makeRequest]);

  const del = useCallback(<T>(endpoint: string, config?: RequestConfig) =>
    makeRequest<T>('DELETE', endpoint, undefined, config), [makeRequest]);

  return useMemo(() => ({
    get,
    post,
    put,
    patch,
    delete: del,
    makeRequest,
  }), [get, post, put, patch, del, makeRequest]);
};

// Non-hook version for use outside of React components
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'True',
        ...config?.headers,
      };

      const url = this.buildUrl(endpoint, config?.params);

      const requestConfig: RequestInit = {
        method,
        headers,
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        requestConfig.body = JSON.stringify(data);
      }

      const response = await fetch(url, requestConfig);

      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || responseData || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  get<T>(endpoint: string, config?: RequestConfig) {
    return this.makeRequest<T>('GET', endpoint, undefined, config);
  }

  post<T>(endpoint: string, data?: any, config?: RequestConfig) {
    return this.makeRequest<T>('POST', endpoint, data, config);
  }

  put<T>(endpoint: string, data?: any, config?: RequestConfig) {
    return this.makeRequest<T>('PUT', endpoint, data, config);
  }

  patch<T>(endpoint: string, data?: any, config?: RequestConfig) {
    return this.makeRequest<T>('PATCH', endpoint, data, config);
  }

  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.makeRequest<T>('DELETE', endpoint, undefined, config);
  }
}

// Default client instance for non-authenticated requests
export const apiClient = new ApiClient();