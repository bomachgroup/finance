let accessToken: string | null = null;
const ACCESS_TOKEN_KEY = 'bomach_access_token_v1';
const REFRESH_TOKEN_KEY = 'bomach_refresh_token_v1';

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  try {
    const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      accessToken = stored;
      return stored;
    }
  } catch {
    // Ignore storage quota/access errors
  }
  return null;
}

export function getRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  try {
    if (token) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    // Ignore storage quota/access errors
  }
}

export function setRefreshToken(token: string | null | undefined): void {
  try {
    if (token) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
      return;
    }
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore storage quota/access errors
  }
}

export function clearAccessToken(): void {
  accessToken = null;
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Ignore storage quota/access errors
  }
}

export function clearRefreshToken(): void {
  try {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore storage quota/access errors
  }
}

export function clearLegacyStoredTokens(): void {
  try {
    localStorage.removeItem('bomach_access_token');
    localStorage.removeItem('bomach_refresh_token');
    localStorage.removeItem('bomachOS_v3_auth');
    localStorage.removeItem('bomachFinanceOS_auth');
  } catch {
    // Ignore storage quota/access errors
  }
}

// Ingest tokens synchronously upon script load
if (typeof window !== 'undefined') {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token') || params.get('access_token');
    const urlRefreshToken = params.get('refresh_token') || params.get('refreshToken') || urlToken;
    if (urlToken) {
      setAccessToken(urlToken);
      if (urlRefreshToken) {
        setRefreshToken(urlRefreshToken);
      }
    }
  } catch {
    // Ignore URL parse error
  }
}
