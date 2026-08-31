import { createContext, useContext, useState, type ReactNode } from 'react';

export interface TopbarConfig {
  title: string;
  period?: string;
  onPeriodChange?: (period: string) => void;
  periodOptions?: Array<{ value: string; label: string; icon?: string }> | string[];
  hidePeriod?: boolean;
  action?: ReactNode;
}

interface ShellContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean | ((p: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  topbarConfig: TopbarConfig | null;
  setTopbarConfig: (config: TopbarConfig | null) => void;
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [topbarConfig, setTopbarConfig] = useState<TopbarConfig | null>(null);

  const openModal = (id: string) => setActiveModal(id);
  const closeModal = () => setActiveModal(null);

  return (
    <ShellContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileOpen,
        setMobileOpen,
        searchQuery,
        setSearchQuery,
        activeModal,
        openModal,
        closeModal,
        topbarConfig,
        setTopbarConfig,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('useShell must be used within ShellProvider');
  return ctx;
}
