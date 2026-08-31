import { apiRequest } from './apiClient';
import {
  clearAccessToken,
  clearRefreshToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from './authTokenStore';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Verify2FAPayload {
  session_token: string;
  code: string;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  requires_2fa?: boolean;
  session_token?: string;
  user_id?: number;
}

export interface RefreshTokenResponse {
  access_token: string;
  success?: boolean;
  detail?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  is_verified: boolean;
  created_at: string;
  role?: string;
  is_superuser?: boolean;
  is_staff?: boolean;
}

export interface UserRoleResponse {
  id: number;
  name: string;
  permissions: Record<string, string[]>;
  branches?: unknown[];
  created_at: string;
  updated_at: string;
}

export interface EmployeeDetailsResponse {
  id: string | number;
  employee_id: string;
  email: string;
  full_name: string;
  phone: string;
  department_id: string;
  position: string;
  role_id?: number | string | null;
  role_name?: string | null;
  designation?: string | null;
  department_name: string;
  branch_name: string;
  is_active: boolean;
}

export interface AuthorityLimit {
  id: number;
  role_id: number;
  max_discount_pct?: number;
  max_expense_approval_amount?: number;
  can_approve_credit?: boolean;
  can_override_pricing?: boolean;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const res = await apiRequest<AuthTokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data?.access_token) {
      setAccessToken(res.data.access_token);
    }
    if (res.data?.refresh_token) {
      setRefreshToken(res.data.refresh_token);
    }
    return res;
  },

  verify2FA: async (payload: Verify2FAPayload) => {
    const res = await apiRequest<AuthTokenResponse>('/api/v1/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data?.access_token) {
      setAccessToken(res.data.access_token);
    }
    if (res.data?.refresh_token) {
      setRefreshToken(res.data.refresh_token);
    }
    return res;
  },

  refreshSession: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return { status: 401, error: 'No refresh token available' };
    }

    const res = await apiRequest<RefreshTokenResponse>(
      '/api/v1/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
      false,
    );

    if (res.data?.access_token) {
      setAccessToken(res.data.access_token);
    } else {
      clearAccessToken();
      clearRefreshToken();
    }
    return res;
  },

  getCurrentUser: async () => {
    return apiRequest<UserProfile>('/api/v1/auth/me');
  },

  getUserRole: async (userId: number | string) => {
    return apiRequest<UserRoleResponse>(`/api/v1/roles/employees/${userId}`);
  },

  getRoleById: async (roleId: number | string) => {
    return apiRequest<UserRoleResponse>(`/api/v1/roles/${roleId}`);
  },

  getPermissionsMap: async () => {
    return apiRequest<Record<string, string[]>>('/api/v1/roles/permissions-map');
  },

  getAuthorityLimits: async () => {
    return apiRequest<AuthorityLimit>('/api/v1/roles/me/authority-limits');
  },

  logout: async () => {
    try {
      await apiRequest('/api/v1/auth/logout', {
        method: 'POST',
      });
    } finally {
      clearAccessToken();
      clearRefreshToken();
    }
  },
};
