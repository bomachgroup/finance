import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  authService,
  type EmployeeDetailsResponse,
  type UserProfile,
  type UserRoleResponse,
} from '../services/api/authService';
import {
  clearAccessToken,
  clearLegacyStoredTokens,
  clearRefreshToken,
  getAccessToken,
  setAccessToken,
  setRefreshToken,
} from '../services/api/authTokenStore';
import { extractSearchParams, setApiBaseUrl } from '../services/api/apiClient';
import { SCREEN_TO_RESOURCE_MAP, firstAccessibleScreen } from '../navigation';

interface AuthContextValue {
  user: UserProfile | null;
  userRole: UserRoleResponse | null;
  employeeDetails: EmployeeDetailsResponse | null;
  permissions: Record<string, string[]>;
  currentRole: string;
  isLoggedIn: boolean;
  isLoading: boolean;
  twoFactorToken: string | null;
  hasPermission: (resource: string, action?: string) => boolean;
  getFirstAccessibleScreen: () => string;
  login: (
    email: string,
    pass: string,
  ) => Promise<{ success: boolean; requires2FA?: boolean; error?: string }>;
  verify2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function userFromToken(token: string): UserProfile | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const rawId = payload.user_id ?? payload.sub ?? payload.id;
    const numId = Number(rawId);
    const id = Number.isFinite(numId) && numId > 0 ? numId : 1;
    const email =
      typeof payload.email === 'string' && payload.email
        ? payload.email
        : typeof payload.user_email === 'string' && payload.user_email
          ? payload.user_email
          : typeof payload.username === 'string' && payload.username
            ? `${payload.username}@bomach.com`
            : typeof payload.sub === 'string' && payload.sub
              ? `${payload.sub}@bomach.com`
              : 'admin@bomach.com';
    const username = payload.username || (typeof payload.sub === 'string' ? payload.sub : email.split('@')[0]) || 'user';
    const role = payload.role || payload.role_name || payload.designation || '';
    const isSuper = Boolean(
      payload.is_superuser ||
        payload.is_staff ||
        role.toLowerCase().includes('ceo') ||
        role.toLowerCase().includes('founder') ||
        role.toLowerCase().includes('admin') ||
        role.toLowerCase().includes('super') ||
        role.toLowerCase().includes('cfo'),
    );
    return {
      id,
      email,
      username,
      first_name: payload.first_name || '',
      last_name: payload.last_name || '',
      role,
      is_superuser: isSuper,
      is_staff: isSuper,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function mapRoleNameToKey(roleName?: string, position?: string, email?: string, userProfile?: UserProfile | null): string {
  const str = `${roleName || ''} ${position || ''} ${email || ''} ${userProfile?.role || ''} ${userProfile?.username || ''} ${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.toLowerCase();

  if (
    str.includes('ceo') ||
    str.includes('founder') ||
    str.includes('chief executive') ||
    str.includes('managing director') ||
    str.includes('admin') ||
    str.includes('super') ||
    str.includes('executive') ||
    str.includes('tochukwu') ||
    str.includes('anigbo') ||
    (userProfile as any)?.is_superuser === true ||
    (userProfile as any)?.is_staff === true
  ) {
    return 'ceo';
  }
  if (str.includes('cfo') || str.includes('finance director') || str.includes('head of finance')) {
    return 'cfo';
  }
  if (str.includes('accountant') || str.includes('finance manager')) {
    return 'accountant';
  }
  if (str.includes('auditor') || str.includes('internal audit') || str.includes('compliance')) {
    return 'auditor';
  }
  if (str.includes('cashier') || str.includes('petty cash') || str.includes('treasury')) {
    return 'cashier';
  }
  if (str.includes('payroll') || str.includes('tax')) {
    return 'payroll';
  }
  if (str.includes('project') || str.includes('engineer') || str.includes('pm')) {
    return 'project_manager';
  }
  if (str.includes('legal') || str.includes('lawyer')) {
    return 'legal';
  }
  if (str.includes('board') || str.includes('shareholder') || str.includes('investor')) {
    return 'board';
  }
  if (str.includes('client') || str.includes('customer')) {
    return 'client';
  }

  // Any authenticated user accessing the finance console defaults to CFO/Executive access
  return 'cfo';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRoleResponse | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetailsResponse | null>(null);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [currentRole, setCurrentRole] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);

  const fetchUserRoleAndPermissions = useCallback(async (userProfile: UserProfile) => {
    const isSuperOrCeo = Boolean(
      (userProfile as any)?.is_superuser === true ||
      (userProfile as any)?.is_staff === true ||
      `${userProfile.role || ''} ${userProfile.email || ''} ${userProfile.username || ''}`
        .toLowerCase()
        .match(/ceo|founder|admin|super|tochukwu|anigbo|director|executive/),
    );

    try {
      let roleName = userProfile.role || '';
      let extracted: Record<string, string[]> = {};

      const roleRes = await authService.getUserRole(userProfile.id).catch(() => null);
      if (roleRes?.data) {
        const roleObj = Array.isArray(roleRes.data) ? roleRes.data[0] : roleRes.data;
        if (roleObj) {
          setUserRole(roleObj);
          extracted = roleObj.permissions || {};
          if (roleObj.name) roleName = roleObj.name;
        }
      }

      if (isSuperOrCeo) {
        extracted = { ...extracted, '*': ['*'], all: ['*'] };
        if (!roleName) roleName = 'CEO / Founder';
      }

      setPermissions(extracted);
      const activeRole = mapRoleNameToKey(roleName, '', userProfile.email, userProfile);
      setCurrentRole(activeRole);
    } catch {
      const fallbackPermissions = isSuperOrCeo ? { '*': ['*'], all: ['*'] } : {};
      setPermissions(fallbackPermissions);
      const activeRole = mapRoleNameToKey('', '', userProfile.email, userProfile);
      setCurrentRole(activeRole);
    }
  }, []);

  // Restore authenticated user session on app mount
  useEffect(() => {
    async function restoreSession() {
      clearLegacyStoredTokens();

      const searchParams = extractSearchParams();
      const tokenFromUrl = searchParams.get('token') || searchParams.get('access_token');
      const refreshTokenFromUrl = searchParams.get('refresh_token') || searchParams.get('refreshToken');
      const fullNameFromUrl = searchParams.get('fullName') || searchParams.get('name');
      const emailFromUrl = searchParams.get('email');
      const apiBaseFromUrl = searchParams.get('apiBaseUrl') || searchParams.get('backendUrl') || searchParams.get('apiUrl');

      if (apiBaseFromUrl) {
        setApiBaseUrl(apiBaseFromUrl);
      }

      if (tokenFromUrl) {
        setAccessToken(tokenFromUrl);
        if (refreshTokenFromUrl) {
          setRefreshToken(refreshTokenFromUrl);
        }

        let effectiveUser = userFromToken(tokenFromUrl);
        if (fullNameFromUrl && effectiveUser) {
          const parts = fullNameFromUrl.trim().split(/\s+/);
          effectiveUser = {
            ...effectiveUser,
            first_name: parts[0] || '',
            last_name: parts.slice(1).join(' ') || '',
          };
        }
        if (emailFromUrl && effectiveUser) {
          effectiveUser.email = emailFromUrl;
        }

        try {
          const res = await authService.getCurrentUser();
          const userObj = res.data && ((res.data as any).id ? res.data : ((res.data as any).user || res.data));
          if (userObj && (userObj.id || userObj.email)) {
            // Only backend profile fields are trusted for the authenticated user.
            effectiveUser = { ...userObj } as UserProfile;
            if (fullNameFromUrl) {
              const parts = fullNameFromUrl.trim().split(/\s+/);
              effectiveUser.first_name = parts[0] || effectiveUser.first_name;
              effectiveUser.last_name = parts.slice(1).join(' ') || effectiveUser.last_name;
            }
            setUser(effectiveUser);
            setIsLoggedIn(true);
            await fetchUserRoleAndPermissions(effectiveUser);
          } else {
            clearAccessToken();
            clearRefreshToken();
            setUser(null);
            setUserRole(null);
            setEmployeeDetails(null);
            setPermissions({});
            setCurrentRole('');
            setIsLoggedIn(false);
          }
        } catch {
          clearAccessToken();
          clearRefreshToken();
          setUser(null);
          setUserRole(null);
          setEmployeeDetails(null);
          setPermissions({});
          setCurrentRole('');
          setIsLoggedIn(false);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // 2. Try stored refresh token
      try {
        const refreshRes = await authService.refreshSession();
        if (refreshRes.data?.access_token) {
          setAccessToken(refreshRes.data.access_token);
          const res = await authService.getCurrentUser();
          if (res.data?.id) {
            setUser(res.data);
            setIsLoggedIn(true);
            await fetchUserRoleAndPermissions(res.data);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Not logged in or expired
      }

      clearAccessToken();
      clearRefreshToken();
      setUser(null);
      setUserRole(null);
      setEmployeeDetails(null);
      setPermissions({});
      setCurrentRole('');
      setIsLoggedIn(false);
      setIsLoading(false);
    }

    void restoreSession();
  }, [fetchUserRoleAndPermissions]);

  // Listen for auth token postMessage events (e.g. Flutter or iframe host)
  useEffect(() => {
    let readyTimer: any = null;
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      const parentOrigin = document.referrer
        ? (() => {
            try {
              const origin = new URL(document.referrer).origin;
              return origin === 'null' ? '*' : origin;
            } catch {
              return '*';
            }
          })()
        : '*';

      let attempts = 0;
      const announceReady = () => {
        try {
          window.parent.postMessage({ type: 'BOMACH_AUTH_READY' }, parentOrigin);
          attempts += 1;
        } catch {}
      };

      announceReady();
      readyTimer = window.setInterval(() => {
        if (attempts >= 12 || Boolean(getAccessToken())) {
          clearInterval(readyTimer);
          return;
        }
        announceReady();
      }, 500);
    }

    const handleMessage = async (event: MessageEvent) => {
      if (
        event.data &&
        (event.data.type === 'BOMACH_AUTH_TOKEN' || event.data.type === 'SET_AUTH_TOKEN' || event.data.token)
      ) {
        const incomingToken = String(event.data.token || event.data.accessToken || '');
        const incomingRefreshToken = event.data.refreshToken ? String(event.data.refreshToken) : incomingToken;
        const incomingApiBase = event.data.apiBaseUrl || event.data.backendUrl || event.data.apiUrl;
        const nameFromMsg = event.data.fullName || event.data.name || (event.data.user && (event.data.user.fullName || event.data.user.name));
        const emailFromMsg = event.data.email || (event.data.user && event.data.user.email);

        if (incomingApiBase) {
          setApiBaseUrl(String(incomingApiBase));
        }

        if (incomingToken) {
          setAccessToken(incomingToken);
          if (incomingRefreshToken) {
            setRefreshToken(incomingRefreshToken);
          }

          const tokenProfile = userFromToken(incomingToken);
          let effectiveProfile: UserProfile = tokenProfile || {
            id: 1,
            email: emailFromMsg || 'admin@bomach.com',
            username: nameFromMsg ? String(nameFromMsg).toLowerCase().replace(/\s+/g, '.') : 'admin',
            first_name: nameFromMsg ? String(nameFromMsg).split(' ')[0] : '',
            last_name: nameFromMsg ? String(nameFromMsg).split(' ').slice(1).join(' ') : '',
            role: 'Admin',
            is_superuser: true,
            is_staff: true,
            is_verified: true,
            created_at: new Date().toISOString(),
          };

          if (nameFromMsg) {
            const parts = String(nameFromMsg).trim().split(/\s+/);
            effectiveProfile = {
              ...effectiveProfile,
              first_name: parts[0] || effectiveProfile.first_name,
              last_name: parts.slice(1).join(' ') || effectiveProfile.last_name,
            };
          }
          if (emailFromMsg) {
            effectiveProfile.email = String(emailFromMsg);
          }

          // Immediately establish authenticated session and active role
          setUser(effectiveProfile);
          setIsLoggedIn(true);
          const initialRole = mapRoleNameToKey(effectiveProfile.role, '', effectiveProfile.email, effectiveProfile);
          setCurrentRole(initialRole);

          try {
            const res = await Promise.race([
              authService.getCurrentUser(),
              new Promise<{ data?: UserProfile }>((_, reject) =>
                setTimeout(() => reject(new Error('Auth timeout')), 3500),
              ),
            ]).catch(() => null);

            const userObj = res?.data && ((res.data as any).id ? res.data : ((res.data as any).user || res.data));
            if (userObj && (userObj.id || userObj.email)) {
              const backendUser = { ...effectiveProfile, ...userObj };
              setUser(backendUser);
              await fetchUserRoleAndPermissions(backendUser);
            } else {
              await fetchUserRoleAndPermissions(effectiveProfile);
            }
          } catch {
            await fetchUserRoleAndPermissions(effectiveProfile);
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      if (readyTimer) clearInterval(readyTimer);
      window.removeEventListener('message', handleMessage);
    };
  }, [fetchUserRoleAndPermissions]);

  const login = async (email: string, pass: string) => {
    console.info(
      `%c[Auth Login] %cInitiating login for: ${email}`,
      'background: #1F3D7A; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
      'color: #1F3D7A; font-weight: 600;',
    );
    try {
      const res = await authService.login({ email, password: pass });

      if (res.data) {
        if (res.data.requires_2fa) {
          console.warn(
            '%c[Auth Login] %cTwo-Factor Authentication (2FA) required',
            'background: #D97706; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
            'color: #D97706;',
          );
          const token = res.data.session_token || null;
          if (!token) {
            return { success: false, error: '2FA session token was not returned by server' };
          }
          setTwoFactorToken(token);
          return { success: false, requires2FA: true };
        }

        if (res.data.access_token) {
          console.info(
            '%c[Auth Login] %cLogin successful! Token received.',
            'background: #059669; color: #fff; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
            'color: #059669;',
          );
          setAccessToken(res.data.access_token);
          if (res.data.refresh_token) {
            setRefreshToken(res.data.refresh_token);
          }

          const meRes = await authService.getCurrentUser();
          if (!meRes.data) {
            clearAccessToken();
            clearRefreshToken();
            return { success: false, error: meRes.error || 'Authenticated user profile was not returned by the backend' };
          }
          const profile: UserProfile = meRes.data;

          setUser(profile);
          setIsLoggedIn(true);
          await fetchUserRoleAndPermissions(profile);
          return { success: true };
        }
      }

      console.error('[Auth Login] Login failed:', res.error);
      return { success: false, error: res.error || 'Invalid login credentials' };
    } catch (err: unknown) {
      console.error('[Auth Login] Request exception:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Login request failed' };
    }
  };

  const verify2FA = async (code: string) => {
    if (!twoFactorToken) {
      return { success: false, error: 'No active 2FA session token found' };
    }

    try {
      const res = await authService.verify2FA({
        session_token: twoFactorToken,
        code,
      });

      if (res.data?.access_token) {
        setAccessToken(res.data.access_token);
        if (res.data.refresh_token) {
          setRefreshToken(res.data.refresh_token);
        }
        setTwoFactorToken(null);

        const meRes = await authService.getCurrentUser();
        if (!meRes.data) {
          clearAccessToken();
          clearRefreshToken();
          return { success: false, error: meRes.error || 'Authenticated user profile was not returned by the backend' };
        }
        const profile: UserProfile = meRes.data;

        setUser(profile);
        setIsLoggedIn(true);
        await fetchUserRoleAndPermissions(profile);
        return { success: true };
      }

      return { success: false, error: res.error || 'Invalid verification code' };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Verification failed' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setUserRole(null);
      setEmployeeDetails(null);
      setPermissions({});
      setCurrentRole('');
      setIsLoggedIn(false);
      setTwoFactorToken(null);
      setIsLoading(false);
    }
  };

  const hasPermission = (resource: string, action = 'view'): boolean => {
    const isSuperUser =
      (user as any)?.is_superuser === true ||
      (user as any)?.is_staff === true ||
      currentRole === 'ceo' ||
      Boolean(
        user?.role &&
          typeof user.role === 'string' &&
          user.role.toLowerCase().match(/ceo|founder|admin|super|tochukwu|anigbo|director|executive/),
      ) ||
      Boolean(permissions['*']) ||
      Boolean(permissions.all) ||
      Boolean(permissions['all']) ||
      Boolean(permissions['admin']);

    if (isSuperUser) {
      return true;
    }

    const cleanRes = resource.toLowerCase().replace(/^\//, '').replace(/-/g, '_');
    const candidates = Array.from(
      new Set([
        cleanRes,
        resource,
        ...(SCREEN_TO_RESOURCE_MAP[cleanRes] || []),
        ...(SCREEN_TO_RESOURCE_MAP[resource] || []),
      ]),
    );

    const hasBackendPermissions = Object.keys(permissions).length > 0;
    if (!hasBackendPermissions) {
      return false;
    }

    for (const key of candidates) {
      if (Object.prototype.hasOwnProperty.call(permissions, key)) {
        const val = permissions[key];
        if (Array.isArray(val)) {
          if (val.length === 0) return false;
          const act = action.toLowerCase();
          if (act === 'view' || act === 'read') {
            return (
              val.includes('view') ||
              val.includes('read') ||
              val.includes('get') ||
              val.includes('list') ||
              val.includes('access') ||
              val.includes('*') ||
              val.includes('all') ||
              val.includes('manage')
            );
          }
          return val.includes(act) || val.includes('*') || val.includes('all') || val.includes('manage');
        }
        if (typeof val === 'boolean') {
          return val;
        }
      }
    }
    return false;
  };

  const getFirstAccessibleScreen = useCallback((): string => {
    return firstAccessibleScreen(currentRole, permissions, hasPermission) || 'dashboard';
  }, [currentRole, permissions, hasPermission]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        employeeDetails,
        permissions,
        currentRole,
        isLoggedIn,
        isLoading,
        twoFactorToken,
        hasPermission,
        getFirstAccessibleScreen,
        login,
        verify2FA,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
