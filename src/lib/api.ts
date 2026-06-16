const BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api';

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

// Refresh the access token using the httpOnly refresh_token cookie.
// Returns true if a new access token was stored in localStorage.
let _refreshing: Promise<boolean> | null = null;
async function tryRefresh(): Promise<boolean> {
  if (_refreshing) return _refreshing;
  _refreshing = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return false;
      const data = await res.json();
      const token: string | undefined = data?.data?.token ?? data?.token;
      if (token) { localStorage.setItem('qotn_token', token); return true; }
      return false;
    } catch {
      return false;
    } finally {
      _refreshing = null;
    }
  })();
  return _refreshing;
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

  // On 401, attempt a silent token refresh then retry once
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = getToken();
      const retryHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
        ...(options.headers as Record<string, string>),
      };
      try {
        const retryRes = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers: retryHeaders,
          credentials: 'include',
        });
        if (retryRes.ok) {
          try { return await retryRes.json() as T; } catch { return {} as T; }
        }
      } catch {}
    }
    // Refresh failed or retry still 401 — log out only if there was a token
    if (typeof window !== 'undefined') {
      const hadToken = !!localStorage.getItem('qotn_token');
      localStorage.removeItem('qotn_token');
      if (hadToken) window.location.href = '/account';
    }
  }

  let data: any = {};
  try {
    data = await response.json();
  } catch {
    // non-JSON response — data stays {}
  }

  if (!response.ok) {
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
