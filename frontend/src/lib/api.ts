const BASE_URL = (import.meta as any).env?.VITE_API_URL || "/api";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail || `API error with status ${status}`);
    this.status = status;
    this.detail = detail;
    this.name = 'ApiError';
  }
}

function getRole(): string | null {
  return localStorage.getItem('mootion_role');
}

function tokenKey(role: string | null): string {
  return `mootion_${role}_access_token`;
}

function refreshTokenKey(role: string | null): string {
  return `mootion_${role}_refresh_token`;
}

async function performRequest(path: string, options: RequestInit, isRetry = false): Promise<any> {
  const role = getRole();
  const token = localStorage.getItem(tokenKey(role));
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !headers.has('Content-Type')) {
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error: any) {
    throw new ApiError(500, error.message || 'Network error');
  }

  if (!response.ok) {
    if (response.status === 401) {
      if (isRetry) {
        // Retry failed again
        const role = getRole();
        localStorage.removeItem(tokenKey(role));
        localStorage.removeItem(refreshTokenKey(role));
        if (typeof window !== 'undefined') {
          window.location.href = role === 'teacher' ? '/teacher/login' : '/onboarding';
        }
        throw new ApiError(401, 'Unauthorized');
      }

      const currentRole = getRole();
      const refreshToken = localStorage.getItem(refreshTokenKey(currentRole));
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const role = data.role || getRole();
            localStorage.setItem(tokenKey(role), data.access_token);
            localStorage.setItem(refreshTokenKey(role), data.refresh_token);
            if (data.role) {
              localStorage.setItem('mootion_role', data.role);
            }
            return performRequest(path, options, true);
          } else {
            const role = getRole();
            localStorage.removeItem(tokenKey(role));
            localStorage.removeItem(refreshTokenKey(role));
            if (typeof window !== 'undefined') {
              window.location.href = role === 'teacher' ? '/teacher/login' : '/onboarding';
            }
            throw new ApiError(refreshRes.status, 'Unauthorized refresh');
          }
        } catch (err: any) {
          const role = getRole();
          localStorage.removeItem(tokenKey(role));
          localStorage.removeItem(refreshTokenKey(role));
          if (typeof window !== 'undefined') {
            window.location.href = role === 'teacher' ? '/teacher/login' : '/onboarding';
          }
          throw err;
        }
      } else {
        localStorage.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/onboarding';
        }
        throw new ApiError(401, 'Unauthorized');
      }
    }

    let detail = '';
    try {
      const data = await response.json();
      detail = data.detail || response.statusText;
    } catch {
      detail = response.statusText;
    }
    throw new ApiError(response.status, detail);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

async function request(path: string, options: RequestInit = {}) {
  return performRequest(path, options, false);
}

export const api = {
  get: (path: string, options: RequestInit = {}) => request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options: RequestInit = {}) => {
    const isFormData = body instanceof FormData;
    return request(path, {
      ...options,
      method: 'POST',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  },
  put: (path: string, body?: any, options: RequestInit = {}) => request(path, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  }),
  patch: (path: string, body?: any, options: RequestInit = {}) => request(path, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  }),
  delete: (path: string, options: RequestInit = {}) => request(path, { ...options, method: 'DELETE' }),
  logout: async () => {
    const role = getRole();
    const refreshToken = localStorage.getItem(refreshTokenKey(role));
    if (refreshToken) {
      try {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (err) {
        console.error("Revoke error:", err);
      }
    }
    localStorage.removeItem(tokenKey(role));
    localStorage.removeItem(refreshTokenKey(role));
    localStorage.removeItem('mootion_role');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
};
