export interface NavItem {
  s: string;
  l: string;
  icon: string;
  badge?: string;
  desc?: string;
  external?: boolean;
}

export interface NavGroup {
  g: string;
  items: NavItem[];
}

export interface RoleConfig {
  name: string;
  tagline: string;
  persona: string;
  color: string;
  nav: NavGroup[];
  quickLinks: Array<{ s: string; label: string; icon: string; desc: string }>;
}

export interface FinanceNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  screenId?: string;
}

export function getIconName(tiClass: string): string {
  return tiClass.replace(/^ti-/, '').trim();
}
