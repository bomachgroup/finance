import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { useShell } from '../../context/ShellContext';
import { ROLES } from '../../data/defaults';
import { accessibleNavGroups } from '../../navigation';
import { Modal, HighlightText } from '../shared';
import { AppIcon } from '../shared/AppIcon';
import { capitalizeName } from '../../data/helpers';
import { fuzzyMatch } from '../../utils/fuzzySearch';

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group relative flex" title={label}>
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 z-[9999] ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#1A2038] px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1A2038]" />
      </div>
    </div>
  );
}

export function Sidebar() {
  const { currentRole, user, userRole, employeeDetails, logout, permissions, hasPermission } = useAuth();
  const { notifs, markAllNotifsRead } = useStore();
  const { showToast } = useToast();
  const { mobileOpen, setMobileOpen, sidebarCollapsed, setSidebarCollapsed } = useShell();
  const navigate = useNavigate();
  const location = useLocation();

  const navGroups = useMemo(() => {
    return accessibleNavGroups(currentRole, permissions, hasPermission);
  }, [currentRole, hasPermission, permissions]);

  const activeGroup =
    navGroups.find((g) => g.items.some((item) => location.pathname === `/${item.s}`))?.g ??
    navGroups[0]?.g;

  const [openGroup, setOpenGroup] = useState<string>(activeGroup);
  const [search, setSearch] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const current = navGroups.find((g) => g.items.some((item) => location.pathname === `/${item.s}`))?.g;
    if (current) setOpenGroup(current);
  }, [location.pathname, navGroups]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen, setMobileOpen]);

  // Close notifications on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();

        if (sidebarCollapsed) setSidebarCollapsed(false);
        if (!mobileOpen && window.innerWidth < 768) setMobileOpen(true);

        requestAnimationFrame(() => {
          setTimeout(() => {
            if (searchRef.current) {
              searchRef.current.focus();
              searchRef.current.select();
            }
          }, 30);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [sidebarCollapsed, mobileOpen, setSidebarCollapsed, setMobileOpen]);

  const role = ROLES[currentRole] || ROLES.cfo;
  const roleTitle =
    employeeDetails?.role_name ||
    employeeDetails?.designation ||
    userRole?.name ||
    employeeDetails?.position ||
    role.name;

  const rawDisplayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
      user.username?.trim() ||
      user.email?.split('@')[0] ||
      role.name
    : role.name;

  const displayName = capitalizeName(rawDisplayName);

  const userInitials = user
    ? user.first_name && user.last_name
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : user.username?.slice(0, 2).toUpperCase() || 'FO'
    : 'FO';

  const unreadCount = notifs.filter((n) => !n.read).length;

  const handleNav = (screen: string) => {
    navigate({ to: `/${screen}` });
    setMobileOpen(false);
    setSearch('');
  };

  const handleGroupClick = (groupName: string) => {
    if (openGroup === groupName) {
      setOpenGroup('');
    } else {
      setOpenGroup(groupName);
      const group = navGroups.find((g) => g.g === groupName);
      if (group?.items[0]) handleNav(group.items[0].s);
    }
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    showToast('Signed out successfully', 'info');
    navigate({ to: '/' });
  };

  const toggleNotifs = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotifs((prev) => !prev);
  };

  const handleMarkAllRead = () => {
    markAllNotifsRead();
    showToast('All notifications marked as read', 'success');
    setShowNotifs(false);
  };

  // Search logic
  const q = search.trim();
  const groupedPageResults: Record<string, Array<{ icon: string; l: string; s: string }>> = {};

  if (q) {
    navGroups.forEach((g) => {
      const matches = g.items.filter((item) => fuzzyMatch(q, item.l).match);
      if (matches.length > 0) {
        groupedPageResults[g.g] = matches;
      }
    });
  }

  const hasPageResults = Object.keys(groupedPageResults).length > 0;

  // Expanded Content
  const expandedContent = (
    <div className="relative z-10 flex h-full flex-col overflow-hidden bg-[#F7F8FA]">
      {/* Brand header */}
      <div className="flex h-14 shrink-0 items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-navy text-sm font-black text-white shadow-xs">
            ₦
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-black tracking-tight text-sidebar-text">
              Bomach OS
            </div>
            <div className="truncate text-[10px] font-bold text-text-3 uppercase tracking-wider">
              Finances
            </div>
          </div>
        </div>

        {/* Notifications & Collapse */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text transition-all md:hidden"
            title="Close navigation"
            aria-label="Close navigation"
          >
            <AppIcon name="ti-close" size={16} />
          </button>
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={toggleNotifs}
              className="relative flex h-7 w-7 items-center justify-center rounded-lg text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text transition-all"
              title="Notifications"
            >
              <AppIcon name="ti-bell" size={16} />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red ring-2 ring-sidebar" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute left-0 top-10 z-50 w-72 max-h-80 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-lg animate-in fade-in">
                <div className="flex items-center justify-between border-b border-border px-2 pb-2">
                  <span className="text-xs font-bold text-text">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-semibold text-navy hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  {notifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.screenId) handleNav(n.screenId);
                        setShowNotifs(false);
                      }}
                      className={`cursor-pointer rounded-lg p-2 text-xs transition-colors ${
                        n.read ? 'text-text-3 hover:bg-surface-2' : 'bg-navy/5 text-text hover:bg-navy/10 font-medium'
                      }`}
                    >
                      <div className="font-bold text-text">{n.title}</div>
                      <div className="text-[11px] text-text-2">{n.message}</div>
                      <div className="mt-1 text-[9px] text-text-3">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSidebarCollapsed((p) => !p)}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text transition-colors"
            title="Collapse Sidebar"
          >
            <AppIcon name="ti-chevron-left" size={14} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative flex items-center">
          <AppIcon
            name="ti-search"
            size={14}
            className="pointer-events-none absolute left-2.5 text-text-3"
          />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search screens... (Ctrl+K)"
            className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-7 text-xs text-text placeholder-text-3 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 text-text-3 hover:text-text"
            >
              <AppIcon name="ti-close" size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 custom-scrollbar">
        {q ? (
          <div className="space-y-3 p-1">
            {hasPageResults ? (
              Object.entries(groupedPageResults).map(([group, items]) => (
                <div key={group}>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-3">
                    {group}
                  </div>
                  <div className="space-y-0.5">
                    {items.map((item) => (
                      <button
                        key={item.s}
                        onClick={() => handleNav(item.s)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-sidebar-text hover:bg-sidebar-hover text-left"
                      >
                        <AppIcon name={item.icon} size={15} className="text-navy" />
                        <HighlightText text={item.l} query={q} />
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-text-3">No matching screens</div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {navGroups.map((group) => {
              const isOpen = openGroup === group.g;
              return (
                <div key={group.g}>
                  <button
                    type="button"
                    onClick={() => handleGroupClick(group.g)}
                    className="flex w-full items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sidebar-text-muted hover:text-sidebar-text"
                  >
                    <span>{group.g}</span>
                    <AppIcon
                      name="ti-chevron-down"
                      size={12}
                      className={`transition-transform duration-150 ${isOpen ? '' : '-rotate-90'}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-0.5 space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = location.pathname === `/${item.s}`;
                        return (
                          <button
                            key={item.s}
                            type="button"
                            onClick={() => handleNav(item.s)}
                            className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-navy text-white shadow-sm'
                                : 'text-[#535870] hover:bg-[#EEF0F8] hover:text-[#1A2038]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <AppIcon
                                name={item.icon}
                                size={16}
                                className={`shrink-0 ${isActive ? 'text-white' : 'text-[#7B82A0]'}`}
                              />
                              <span className="truncate">{item.l}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                                  isActive ? 'bg-white/20 text-white' : 'bg-red text-white'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User profile footer */}
      <div className="shrink-0 border-t border-sidebar-border p-3 bg-surface">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white shadow-xs">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-sidebar-text">{displayName}</p>
              <p className="truncate text-[10px] text-sidebar-text-muted">{roleTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-red transition-colors"
            title="Sign out"
          >
            <AppIcon name="ti-logout" size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // Collapsed Content
  const collapsedContent = (
    <div className="flex h-full w-16 flex-col items-center justify-between border-r border-sidebar-border bg-[#F7F8FA] py-3">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-sm font-black text-white shadow-xs">
          ₦
        </div>

        <button
          type="button"
          onClick={() => setSidebarCollapsed(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text transition-colors"
          title="Expand Sidebar"
        >
          <AppIcon name="ti-chevron-right" size={16} />
        </button>

        <div className="my-1 h-px w-8 bg-sidebar-border" />

        <div className="flex flex-col items-center gap-1">
          {navGroups.flatMap((g) => g.items).slice(0, 8).map((item) => {
            const isActive = location.pathname === `/${item.s}`;
            return (
              <Tooltip key={item.s} label={item.l}>
                <button
                  type="button"
                  onClick={() => handleNav(item.s)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-[#7B82A0] hover:bg-[#EEF0F8] hover:text-[#1A2038]'
                  }`}
                >
                  <AppIcon name={item.icon} size={18} />
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-3 hover:bg-surface-2 hover:text-red transition-colors"
          title="Sign out"
        >
          <AppIcon name="ti-logout" size={16} />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white shadow-xs">
          {userInitials}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 border-r border-sidebar-border transition-all duration-200 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarCollapsed ? collapsedContent : expandedContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Finance navigation">
          <div
            className="fixed inset-0 bg-navy-dark/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-10 w-[min(18rem,calc(100vw-1rem))] bg-[#F7F8FA] shadow-xl animate-in slide-in-from-left duration-200">
            {expandedContent}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Sign Out"
        maxWidth="sm"
      >
        <p className="text-sm text-text-2">
          Are you sure you want to end your current session? You will need to log back in to access the Finance OS.
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setShowLogoutModal(false)}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="rounded-xl bg-red px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs"
          >
            Sign Out
          </button>
        </div>
      </Modal>
    </>
  );
}
