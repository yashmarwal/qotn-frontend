const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api');

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(typeof message === 'string' && message ? message : `HTTP ${status}`);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('qotn_token');
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (networkErr) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[API] Network error — ${endpoint}:`, networkErr);
    }
    throw new ApiError(0, 'Network error — is the backend running?');
  }

  let data: any = {};
  try {
    data = await response.json();
  } catch {
    // non-JSON response — data stays {}
  }

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('qotn_token');
        window.location.href = '/account';
      }
    }
    const message = typeof data.message === 'string' ? data.message : `HTTP ${response.status}`;
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[API] ${endpoint} → ${response.status}:`, message);
    }
    throw new ApiError(response.status, message);
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) => fetchAPI<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    fetchAPI<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    fetchAPI<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => fetchAPI<T>(endpoint, { method: 'DELETE' }),
};

export async function fetchPublic<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
