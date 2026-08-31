import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import './App.css';
import './styles.css';
import { AuthProvider } from './context/AuthContext';
import { ShellProvider } from './context/ShellContext';
import { StoreProvider } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing root element.');
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <ToastProvider>
            <ShellProvider>
              <RouterProvider router={router} />
            </ShellProvider>
          </ToastProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
