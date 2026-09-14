import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../services/api/apiClient';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const { login, verify2FA, twoFactorToken } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        onSuccess?.();
      } else if (res.error) {
        setErrorMessage(parseApiError(res.error));
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Sign in failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify2FA = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!twoFactorCode.trim()) {
      setErrorMessage('Please enter your 6-digit 2FA verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verify2FA(twoFactorCode.trim());
      if (res.success) {
        onSuccess?.();
      } else if (res.error) {
        setErrorMessage(parseApiError(res.error));
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '2FA verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 text-text antialiased">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-xl">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-xl font-black text-white shadow-md">
            ₦
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-text font-heading">
            Bomach Finance OS
          </h1>
          <p className="mt-1 text-xs font-medium text-text-3">
            Financial & Accounting Operating System
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 flex items-start justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs font-semibold text-rose-800 shadow-xs animate-in fade-in duration-150">
            <div className="flex items-start gap-2 min-w-0">
              <span className="text-sm shrink-0">⚠️</span>
              <span className="leading-snug">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="shrink-0 text-rose-600 hover:text-rose-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2FA or Credentials Form */}
        {twoFactorToken ? (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="text-sm font-bold text-text">Two-Factor Authentication</div>
              <div className="text-[11px] text-text-3">
                Enter the 6-digit verification code sent to your device
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-text-2">
                Verification Code
              </label>
              <input
                type="text"
                value={twoFactorCode}
                disabled={isSubmitting}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-center font-mono text-base tracking-widest text-text outline-none focus:border-navy focus:ring-1 focus:ring-navy disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-navy py-2.5 text-xs font-bold text-white transition hover:bg-navy-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-text-2">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled={isSubmitting}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="finance@bomachgroup.com"
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-xs text-text outline-none placeholder:text-text-3 focus:border-navy focus:ring-1 focus:ring-navy disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-text-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={isSubmitting}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-10 w-full rounded-xl border border-border bg-surface pl-3 pr-10 text-xs text-text outline-none placeholder:text-text-3 focus:border-navy focus:ring-1 focus:ring-navy disabled:opacity-60"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-xs text-text-3 hover:text-text-2"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-2.5 text-xs font-bold text-white transition hover:bg-navy-dark disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
