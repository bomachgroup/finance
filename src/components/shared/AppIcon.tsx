import React from 'react';
import * as Iconsax from 'iconsax-react';
import type { Icon } from 'iconsax-react';

interface AppIconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export function AppIcon({ name, size = 18, className = '', color = 'currentColor' }: AppIconProps) {
  const clean = (name || '').replace(/^ti-/, '').toLowerCase().trim();

  let Component: Icon | React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined;

  switch (clean) {
    case 'dashboard':
    case 'category':
    case 'overview':
      Component = Iconsax.Category;
      break;

    case 'file-invoice':
    case 'invoice':
    case 'billing':
    case 'receipt-item':
      Component = Iconsax.ReceiptItem;
      break;

    case 'cash':
    case 'money-recive':
    case 'payment':
    case 'payments':
      Component = Iconsax.MoneyRecive;
      break;

    case 'credit-card':
    case 'card':
    case 'receivables':
    case 'cards':
      Component = Iconsax.Cards;
      break;

    case 'wallet':
    case 'wallets':
    case 'wallet-3':
      Component = Iconsax.Wallet3;
      break;

    case 'book':
    case 'cashbook':
    case 'book-saved':
      Component = Iconsax.BookSaved;
      break;

    case 'receipt':
    case 'expense':
    case 'expenses':
    case 'money-send':
      Component = Iconsax.MoneySend;
      break;

    case 'truck':
    case 'vendor':
    case 'vendors':
    case 'shop':
      Component = Iconsax.Shop;
      break;

    case 'coin':
    case 'coins':
    case 'pettycash':
    case 'empty-wallet':
      Component = Iconsax.EmptyWallet;
      break;

    case 'checkup-list':
    case 'approvals':
    case 'task-square':
      Component = Iconsax.TaskSquare;
      break;

    case 'users':
    case 'payroll':
    case 'people':
    case 'user-octagon':
      Component = Iconsax.UserOctagon;
      break;

    case 'award':
    case 'commission':
    case 'commissions':
    case 'medal-star':
      Component = Iconsax.MedalStar;
      break;

    case 'scale':
    case 'tax':
    case 'judge':
    case 'percentage-square':
      Component = Iconsax.PercentageSquare;
      break;

    case 'writing':
    case 'journal':
    case 'journals':
    case 'edit-2':
      Component = Iconsax.Edit2;
      break;

    case 'list-tree':
    case 'coa':
    case 'hierarchy':
    case 'folder-2':
      Component = Iconsax.Folder2;
      break;

    case 'building':
    case 'assets':
    case 'fixed-assets':
    case 'building-4':
      Component = Iconsax.Building4;
      break;

    case 'chart-arrows':
    case 'cashflow':
    case 'trend-up':
      Component = Iconsax.TrendUp;
      break;

    case 'report-analytics':
    case 'serviceorders':
    case 'chart-2':
      Component = Iconsax.Chart2;
      break;

    case 'home-dollar':
    case 'estatefinance':
    case 'house-2':
      Component = Iconsax.House2;
      break;

    case 'file-analytics':
    case 'reports':
    case 'document-text':
      Component = Iconsax.DocumentText;
      break;

    case 'shield-check':
    case 'audit':
    case 'security-user':
    case 'shield-tick':
      Component = Iconsax.ShieldTick;
      break;

    case 'settings':
    case 'setting-2':
      Component = Iconsax.Setting2;
      break;

    case 'search':
    case 'search-normal':
      Component = Iconsax.SearchNormal1;
      break;

    case 'plus':
    case 'add':
      Component = Iconsax.Add;
      break;

    case 'filter':
      Component = Iconsax.Filter;
      break;

    case 'bell':
    case 'notification':
      Component = Iconsax.Notification;
      break;

    case 'logout':
      Component = Iconsax.LogoutCurve;
      break;

    case 'user':
    case 'profile':
      Component = Iconsax.Profile;
      break;

    case 'chevron-down':
    case 'arrow-down-1':
      Component = Iconsax.ArrowDown2;
      break;

    case 'chevron-right':
      Component = Iconsax.ArrowRight2;
      break;

    case 'chevron-left':
      Component = Iconsax.ArrowLeft2;
      break;

    case 'close':
    case 'close-circle':
      Component = Iconsax.CloseCircle;
      break;

    default:
      Component = Iconsax.Element3;
      break;
  }

  return <Component size={size} className={className} color={color} />;
}
