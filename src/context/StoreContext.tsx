import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { FinanceNotification } from '../data/types';
import { getIconName } from '../data/types';

interface StoreState {
  notifs: FinanceNotification[];
  activeRole: string;
  currency: string;
  fiscalYear: string;
}

interface StoreContextValue extends StoreState {
  setNotifs: (v: FinanceNotification[] | ((prev: FinanceNotification[]) => FinanceNotification[])) => void;
  markNotifRead: (id: string) => void;
  markAllNotifsRead: () => void;
  setActiveRole: (role: string) => void;
  setCurrency: (c: string) => void;
  getIconName: (tiClass: string) => string;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const initialNotifs: FinanceNotification[] = [];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [notifs, setNotifs] = useState<FinanceNotification[]>(() => {
    try {
      const saved = localStorage.getItem('bomach_finance_notifs');
      return saved ? JSON.parse(saved) : initialNotifs;
    } catch {
      return initialNotifs;
    }
  });

  const [activeRole, setActiveRole] = useState<string>('cfo');
  const [currency, setCurrency] = useState<string>('NGN');
  const [fiscalYear] = useState<string>('2026');

  useEffect(() => {
    try {
      localStorage.setItem('bomach_finance_notifs', JSON.stringify(notifs));
    } catch {
      // ignore
    }
  }, [notifs]);

  const markNotifRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotifsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <StoreContext.Provider
      value={{
        notifs,
        activeRole,
        currency,
        fiscalYear,
        setNotifs,
        markNotifRead,
        markAllNotifsRead,
        setActiveRole,
        setCurrency,
        getIconName,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
