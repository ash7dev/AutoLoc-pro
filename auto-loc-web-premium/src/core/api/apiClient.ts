import { API_URL } from "@/lib/config";

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, unknown>;
}

export class ApiError extends Error {
  status: number;
  statusCode: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = status;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { params, headers, ...rest } = options;
    const url = this.buildUrl(endpoint, params);
    const token = typeof window !== 'undefined' ? localStorage.getItem('autoloc_token') : null;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...rest,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Erreur API (${response.status})`;
      throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status, errorData);
    }

    return response.json();
  }

  async post<T>(endpoint: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    const { headers, ...rest } = options;
    const url = this.buildUrl(endpoint);
    const token = typeof window !== 'undefined' ? localStorage.getItem('autoloc_token') : null;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Erreur API (${response.status})`;
      throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status, errorData);
    }

    return response.json();
  }

  async patch<T>(endpoint: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    const { headers, ...rest } = options;
    const url = this.buildUrl(endpoint);
    const token = typeof window !== 'undefined' ? localStorage.getItem('autoloc_token') : null;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Erreur API (${response.status})`;
      throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status, errorData);
    }

    return response.json();
  }

  async put<T>(endpoint: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    const { headers, ...rest } = options;
    const url = this.buildUrl(endpoint);
    const token = typeof window !== 'undefined' ? localStorage.getItem('autoloc_token') : null;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Erreur API (${response.status})`;
      throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status, errorData);
    }

    return response.json();
  }

  async delete<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { params, headers, ...rest } = options;
    const url = this.buildUrl(endpoint, params);
    const token = typeof window !== 'undefined' ? localStorage.getItem('autoloc_token') : null;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...rest,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Erreur API (${response.status})`;
      throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status, errorData);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();


