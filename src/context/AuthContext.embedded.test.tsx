import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/api/authService';

vi.mock('../services/api/authService', () => ({
  authService: {
    refreshSession: vi.fn(),
    getCurrentUser: vi.fn(),
    getUserRole: vi.fn(),
  },
}));

function AuthStateProbe() {
  const { isLoading, isLoggedIn } = useAuth();
  return (
    <div>
      <span>{isLoading ? 'loading' : 'ready'}</span>
      <span>{isLoggedIn ? 'authenticated' : 'signed out'}</span>
    </div>
  );
}

describe('embedded Finance authentication', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.mocked(authService.refreshSession).mockResolvedValue({ status: 401 });
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      status: 200,
      data: {
        id: 42,
        email: 'employee@example.com',
        username: 'employee',
        is_verified: true,
        created_at: '2026-10-23T00:00:00Z',
        role: 'Staff',
      },
    });
    vi.mocked(authService.getUserRole).mockResolvedValue({
      status: 200,
      data: {
        id: 4,
        name: 'Staff',
        permissions: {},
        created_at: '2026-10-23T00:00:00Z',
        updated_at: '2026-10-23T00:00:00Z',
      },
    });
  });

  it('does not restart authentication when the host retries the same token message', async () => {
    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('ready')).toBeInTheDocument());

    const message = new MessageEvent('message', {
      data: { type: 'BOMACH_AUTH_TOKEN', token: 'test-access-token' },
    });
    act(() => {
      window.dispatchEvent(message);
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'BOMACH_AUTH_TOKEN', token: 'test-access-token' },
        }),
      );
    });

    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument());
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(authService.getUserRole).toHaveBeenCalledTimes(1);

    act(() => window.dispatchEvent(message));
    expect(screen.getByText('ready')).toBeInTheDocument();
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
  });
});
