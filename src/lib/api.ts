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

// Sign-in lives entirely in httpOnly cookies that the browser attaches by itself, so no script on the page can
// read or steal the login. This flag is NOT a secret: it only remembers "this browser was signed in", so guests
// do not trigger a pointless /auth/me call on every page load.
const SIGNED_IN_FLAG = 'qotn_signed_in';
const LEGACY_TOKEN_KEY = 'qotn_token'; // older versions stored the access token here; it is cleaned up, never used

export function markSignedIn() {
  try { localStorage.setItem(SIGNED_IN_FLAG, '1'); localStorage.removeItem(LEGACY_TOKEN_KEY); } catch { /* storage unavailable */ }
}
export function markSignedOut() {
  try { localStorage.removeItem(SIGNED_IN_FLAG); localStorage.removeItem(LEGACY_TOKEN_KEY); } catch { /* storage unavailable */ }
}
export function wasSignedIn(): boolean {
  try { return !!localStorage.getItem(SIGNED_IN_FLAG) || !!localStorage.getItem(LEGACY_TOKEN_KEY); } catch { return false; }
}

// Ask for a new access cookie using the httpOnly refresh cookie. Resolves true when it worked.
let _refreshing: Promise<boolean> | null = null;
async function tryRefresh(): Promise<boolean> {
  if (_refreshing) return _refreshing;
  _refreshing = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
      return res.ok;
    } catch {
      return false;
    } finally {
      _refreshing = null;
    }
  })();
  return _refreshing;
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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

  // On 401, attempt a silent session refresh then retry once
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      try {
        const retryRes = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers, credentials: 'include' });
        if (retryRes.ok) {
          try { return await retryRes.json() as T; } catch { return {} as T; }
        }
      } catch {}
    }
    // Refresh failed or the retry was still refused: if this browser thought it was signed in, send it to sign in again
    if (typeof window !== 'undefined' && wasSignedIn()) {
      markSignedOut();
      window.location.href = '/account';
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

// Server-side RSC fetch always needs an absolute URL (relative URLs break during ISR revalidation).
// API_ORIGIN (also read by next.config.ts) points a local build at a local backend.
const SERVER_ORIGIN =
  process.env.API_ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://qotn-backend.onrender.com' : 'http://localhost:3001');
const SERVER_URL = `${SERVER_ORIGIN}/api`;

export async function fetchPublic<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
