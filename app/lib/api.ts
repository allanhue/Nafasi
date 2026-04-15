import { readSession } from './session';

export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  includeToken?: boolean;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    includeToken = true,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Add authorization token if available
  if (includeToken) {
    const session = readSession();
    if (session?.token) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${session.token}`,
      };
    }
  }

  // Add request body if provided
  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new APIError(
        data?.error || `${response.status} ${response.statusText}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      error instanceof Error ? error.message : 'Network request failed',
      0
    );
  }
}

export async function apiGet<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
  return apiCall<T>(endpoint, { ...options, method: 'GET' });
}

export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>
) {
  return apiCall<T>(endpoint, { ...options, method: 'POST', body });
}

export async function apiPut<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
  return apiCall<T>(endpoint, { ...options, method: 'PUT', body });
}

export async function apiDelete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
  return apiCall<T>(endpoint, { ...options, method: 'DELETE' });
}
