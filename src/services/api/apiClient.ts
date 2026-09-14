import {
  clearAccessToken,
  clearRefreshToken,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from './authTokenStore';

export function extractSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams()
  const searchParams = new URLSearchParams(window.location.search)

  if (window.location.hash && window.location.hash.includes('?')) {
    const hashQuery = window.location.hash.split('?')[1]
    if (hashQuery) {
      const hashParams = new URLSearchParams(hashQuery)
      hashParams.forEach((val, key) => {
        if (!searchParams.has(key)) {
          searchParams.set(key, val)
        }
      })
    }
  }
  return searchParams
}

let customApiBaseUrl: string | null = null

export function setApiBaseUrl(url: string) {
  if (!url) return
  customApiBaseUrl = url.trim().replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '')
  try {
    sessionStorage.setItem('bomach_finances_api_base', customApiBaseUrl)
    localStorage.setItem('bomach_finances_api_base', customApiBaseUrl)
  } catch {}
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    // 1. On Vercel deployments, always use same-origin relative URLs so requests proxy through Vercel rewrites without CORS restrictions
    if (hostname.includes('vercel.app')) {
      return '';
    }
  }

  if (customApiBaseUrl) return customApiBaseUrl;

  if (typeof window !== 'undefined') {
    const searchParams = extractSearchParams();
    const override = searchParams.get('apiBaseUrl') || searchParams.get('backendUrl') || searchParams.get('apiUrl');
    if (override) {
      const clean = override.trim().replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');
      setApiBaseUrl(clean);
      return clean;
    }

    try {
      const stored = sessionStorage.getItem('bomach_finances_api_base') || localStorage.getItem('bomach_finances_api_base');
      if (stored) return stored.trim().replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');
    } catch {}

    const referrer = (document.referrer || '').toLowerCase();

    // 2. Explicit test environments -> test backend
    const isTestEnvironment =
      hostname.includes('bomach-os-test') ||
      hostname.includes('-test.web.app') ||
      referrer.includes('bomach-os-test') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local');

    if (isTestEnvironment) {
      return 'https://bomachauthtest.bgbot.app';
    }

    // 3. Production app environments
    const isProdAppEnvironment =
      hostname.includes('bomach-os-app') ||
      referrer.includes('bomach-os-app') ||
      hostname === 'bomachauth.bgbot.app';

    if (isProdAppEnvironment) {
      return 'https://bomachauth.bgbot.app';
    }
  }

  const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  if (import.meta.env.DEV) {
    return 'https://bomachauthtest.bgbot.app';
  }

  return 'https://bomachauthtest.bgbot.app';
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

function humanizeFieldName(field: string): string {
  return field
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function parseApiError(errorPayload: unknown): string {
  if (!errorPayload) {
    return 'An unexpected error occurred. Please try again.';
  }

  if (typeof errorPayload === 'string') {
    return errorPayload;
  }

  if (Array.isArray(errorPayload)) {
    const formattedErrors = errorPayload
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          const msg = typeof record.msg === 'string' ? record.msg : undefined;
          const loc = Array.isArray(record.loc) ? record.loc : undefined;

          if (msg && loc && loc.length > 0) {
            const fieldPath = loc
              .filter((part) => part !== 'body' && part !== 'query' && part !== 'path')
              .map(String)
              .join('.');

            if (fieldPath) {
              return `${humanizeFieldName(fieldPath)}: ${msg}`;
            }
            return msg;
          }
          if (msg) return msg;
        }
        return JSON.stringify(item);
      })
      .filter(Boolean);

    if (formattedErrors.length > 0) {
      return formattedErrors.join('\n');
    }
  }

  if (typeof errorPayload === 'object') {
    const record = errorPayload as Record<string, unknown>;

    if (Array.isArray(record.detail)) {
      return parseApiError(record.detail);
    }
    if (typeof record.detail === 'string') {
      return record.detail;
    }
    if (typeof record.error === 'string') {
      return record.error;
    }
    if (typeof record.message === 'string') {
      return record.message;
    }

    const entries = Object.entries(record)
      .filter(([k]) => k !== 'status' && k !== 'code' && k !== 'success')
      .map(([k, v]) => {
        const valStr = typeof v === 'string' ? v : JSON.stringify(v);
        return `${humanizeFieldName(k)}: ${valStr}`;
      });

    if (entries.length > 0) {
      return entries.join('\n');
    }
  }

  return 'An error occurred while processing your request.';
}

type RefreshTokenResponse = {
  access_token?: string;
  success?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

function shouldAttemptRefresh(endpoint: string): boolean {
  const normalized = endpoint.toLowerCase();
  return (
    !normalized.includes('/auth/login') &&
    !normalized.includes('/auth/verify-2fa') &&
    !normalized.includes('/auth/refresh') &&
    !normalized.includes('/auth/logout')
  );
}

export async function refreshAccessTokenFromStorage(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.warn(
      '%c[Auth Token Refresh] %cNo refresh token in storage - clearing session',
      'background: #D97706; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
      'color: #D97706; font-weight: 600;',
    );
    clearAccessToken();
    return null;
  }

  console.info(
    '%c[Auth Token Refresh] %cAttempting session token refresh via backend API',
    'background: #3B82F6; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
    'color: #3B82F6; font-weight: 600;',
  );

  refreshPromise = fetch(`${getApiBaseUrl()}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) {
        console.warn(
          '%c[Auth Token Refresh] %cRefresh failed (HTTP ' + response.status + ') - clearing session',
          'background: #DC2626; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
          'color: #DC2626;',
        );
        clearAccessToken();
        clearRefreshToken();
        return null;
      }

      const data = (await response.json()) as RefreshTokenResponse;
      if (!data.access_token) {
        clearAccessToken();
        return null;
      }

      console.info(
        '%c[Auth Token Refresh] %cSuccessfully refreshed session token',
        'background: #059669; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #059669;',
      );
      setAccessToken(data.access_token);
      return data.access_token;
    })
    .catch((err) => {
      console.error(
        '%c[Auth Token Refresh] %cNetwork error during token refresh',
        'background: #DC2626; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #DC2626;',
        err,
      );
      clearAccessToken();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export function buildQueryString(params?: object | Record<string, unknown> | null): string {
  if (!params || typeof params !== 'object') return '';
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined && item !== null) {
            searchParams.append(key, String(item));
          }
        }
      } else {
        searchParams.append(key, String(value));
      }
    }
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const method = (options.method || 'GET').toUpperCase();
  const fullUrl = `${getApiBaseUrl()}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let parsedBody: unknown = undefined;
  if (options.body && typeof options.body === 'string') {
    try {
      parsedBody = JSON.parse(options.body);
    } catch {
      parsedBody = options.body;
    }
  }

  console.log(
    `%c[API Request] %c${method} ${endpoint}`,
    'background: #1F3D7A; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
    'color: #1F3D7A; font-weight: 600;',
    {
      url: fullUrl,
      method,
      hasToken: Boolean(token),
      body: parsedBody,
      headers,
    },
  );

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: options.credentials || 'include',
    });

    if (response.status === 401 && retryOnUnauthorized && shouldAttemptRefresh(endpoint)) {
      console.warn(
        `%c[API 401 Unauthorized] %c${method} ${endpoint} - attempting auto-refresh`,
        'background: #D97706; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #D97706;',
      );
      const refreshedToken = await refreshAccessTokenFromStorage();
      if (refreshedToken) {
        return apiRequest<T>(endpoint, options, false);
      }
    }

    const status = response.status;
    if (status === 204) {
      console.log(
        `%c[API 204 No Content] %c${method} ${endpoint}`,
        'background: #059669; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #059669;',
      );
      return { status, data: null as T };
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        const rawError = data?.error || data?.detail || data?.message || `HTTP Error ${status}`;
        const parsed = parseApiError(rawError);
        console.error(
          `%c[API Error ${status}] %c${method} ${endpoint}`,
          'background: #DC2626; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
          'color: #DC2626; font-weight: 600;',
          { status, error: parsed, raw: data },
        );
        return {
          status,
          error: parsed,
        };
      }

      console.log(
        `%c[API ${status} OK] %c${method} ${endpoint}`,
        'background: #059669; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #059669;',
        data,
      );
      return { status, data };
    }

    const isDownload = contentType.includes('application/octet-stream') ||
      contentType.includes('application/pdf') ||
      contentType.includes('spreadsheetml') ||
      contentType.includes('text/csv') ||
      Boolean(response.headers.get('content-disposition'));
    const downloadData = isDownload ? await response.blob() : undefined;
    const textData = downloadData ? '' : await response.text();
    if (!response.ok) {
      const parsed = parseApiError(textData || `HTTP Error ${status}`);
      console.error(
        `%c[API Error ${status}] %c${method} ${endpoint}`,
        'background: #DC2626; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #DC2626;',
        { status, error: parsed, raw: textData },
      );
      return {
        status,
        error: parsed,
      };
    }

    console.log(
      `%c[API ${status} OK] %c${method} ${endpoint}`,
      'background: #059669; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
      'color: #059669;',
      textData,
    );
    return { status, data: (downloadData || textData) as unknown as T };
  } catch (err: unknown) {
    const parsed = parseApiError(
      err instanceof Error
        ? err.message
        : 'Connection failed. Please check your network and try again.',
    );
    console.error(
      `%c[API Network Failure] %c${method} ${endpoint}`,
      'background: #7F1D1D; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
      'color: #DC2626; font-weight: 600;',
      { error: parsed, original: err },
    );
    return {
      status: 500,
      error: parsed,
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiFormRequest<T = any>(
  endpoint: string,
  formData: FormData,
  options: Omit<RequestInit, 'body'> = {},
  retryOnUnauthorized = true,
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const method = (options.method || 'POST').toUpperCase();
  const fullUrl = `${getApiBaseUrl()}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(
    `%c[API Form Request] %c${method} ${endpoint}`,
    'background: #1F3D7A; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
    'color: #1F3D7A; font-weight: 600;',
    {
      url: fullUrl,
      method,
      hasToken: Boolean(token),
    },
  );

  try {
    const response = await fetch(fullUrl, {
      ...options,
      method,
      body: formData,
      headers,
      credentials: options.credentials || 'include',
    });

    if (response.status === 401 && retryOnUnauthorized && shouldAttemptRefresh(endpoint)) {
      console.warn(
        `%c[API 401 Unauthorized] %c${method} ${endpoint} - attempting auto-refresh`,
        'background: #D97706; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #D97706;',
      );
      const refreshedToken = await refreshAccessTokenFromStorage();
      if (refreshedToken) {
        return apiFormRequest<T>(endpoint, formData, options, false);
      }
    }

    const status = response.status;
    if (status === 204) {
      console.log(
        `%c[API 204 No Content] %c${method} ${endpoint}`,
        'background: #059669; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #059669;',
      );
      return { status, data: null as T };
    }

    const data = await response.json();
    if (!response.ok) {
      const rawError = data?.error || data?.detail || data?.message || `HTTP Error ${status}`;
      const parsed = parseApiError(rawError);
      console.error(
        `%c[API Form Error ${status}] %c${method} ${endpoint}`,
        'background: #DC2626; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
        'color: #DC2626; font-weight: 600;',
        { status, error: parsed, raw: data },
      );
      return {
        status,
        error: parsed,
      };
    }

    console.log(
      `%c[API Form ${status} OK] %c${method} ${endpoint}`,
      'background: #059669; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
      'color: #059669;',
      data,
    );
    return { status, data };
  } catch (err: unknown) {
    const parsed = parseApiError(
      err instanceof Error
        ? err.message
        : 'Connection failed. Please check your network and try again.',
    );
    console.error(
      `%c[API Form Network Failure] %c${method} ${endpoint}`,
      'background: #7F1D1D; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
      'color: #DC2626; font-weight: 600;',
      { error: parsed, original: err },
    );
    return {
      status: 500,
      error: parsed,
    };
  }
}
