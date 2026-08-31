import { useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firstAccessibleScreen, SCREEN_TITLES } from '../../navigation';
import { Button } from '../shared/Button';

interface NoPermissionPageProps {
  screen: string;
}

export const NoPermissionPage: FC<NoPermissionPageProps> = ({ screen }) => {
  const navigate = useNavigate();
  const { currentRole, permissions, hasPermission } = useAuth();

  const title = SCREEN_TITLES[screen] || screen;
  const fallbackScreen = firstAccessibleScreen(currentRole, permissions, hasPermission);

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6 text-center">
      <div className="max-w-md rounded-2xl border border-border bg-surface p-8 shadow-xs">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-600 mb-4">
          🔒
        </div>
        <h2 className="text-lg font-bold text-text">Access Restricted</h2>
        <p className="text-xs text-text-3 mt-2 leading-relaxed">
          Your current role (<b className="text-text">{currentRole}</b>) does not have authorization to
          view <span className="font-semibold text-text">{title}</span>.
        </p>

        {fallbackScreen ? (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => void navigate({ to: `/${fallbackScreen}` })}
            >
              Return to {SCREEN_TITLES[fallbackScreen] || 'Dashboard'}
            </Button>
          </div>
        ) : (
          <p className="mt-6 text-xs text-text-3">Contact an administrator to request access.</p>
        )}
      </div>
    </div>
  );
};
