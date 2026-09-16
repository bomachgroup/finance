import { createRootRoute, createRoute, createRouter, Navigate, useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ApprovalsPage } from './components/screens/ApprovalsPage';
import { AuditPage } from './components/screens/AuditPage';
import { CashbookPage } from './components/screens/CashbookPage';
import { CashflowPage } from './components/screens/CashflowPage';
import { ChartOfAccountsPage } from './components/screens/ChartOfAccountsPage';
import { CommissionsPage } from './components/screens/CommissionsPage';
import { DashboardPage } from './components/screens/DashboardPage';
import { EstateFinancePage } from './components/screens/EstateFinancePage';
import { ExpensesPage } from './components/screens/ExpensesPage';
import { FixedAssetsPage } from './components/screens/FixedAssetsPage';
import { InvoicesPage } from './components/screens/InvoicesPage';
import { JournalsPage } from './components/screens/JournalsPage';
import { PaymentsPage } from './components/screens/PaymentsPage';
import { PayrollPage } from './components/screens/PayrollPage';
import { PettyCashPage } from './components/screens/PettyCashPage';
import { ReceivablesPage } from './components/screens/ReceivablesPage';
import { ReportsPage } from './components/screens/ReportsPage';
import { ServiceOrdersPage } from './components/screens/ServiceOrdersPage';
import { SettingsPage } from './components/screens/SettingsPage';
import { TaxStatutoryPage } from './components/screens/TaxStatutoryPage';
import { VendorsPage } from './components/screens/VendorsPage';
import { WalletsPage } from './components/screens/WalletsPage';
import { useAuth } from './context/AuthContext';

const screenMap: Record<string, FC> = {
  dashboard: DashboardPage,
  invoices: InvoicesPage,
  payments: PaymentsPage,
  receivables: ReceivablesPage,
  wallets: WalletsPage,
  cashbook: CashbookPage,
  expenses: ExpensesPage,
  vendors: VendorsPage,
  pettycash: PettyCashPage,
  approvals: ApprovalsPage,
  payroll: PayrollPage,
  commissions: CommissionsPage,
  tax: TaxStatutoryPage,
  journals: JournalsPage,
  coa: ChartOfAccountsPage,
  assets: FixedAssetsPage,
  cashflow: CashflowPage,
  serviceorders: ServiceOrdersPage,
  estatefinance: EstateFinancePage,
  reports: ReportsPage,
  audit: AuditPage,
  settings: SettingsPage,
};

const rootRoute = createRootRoute({
  component: AppShell,
});
function IndexRedirect() {
  const { isLoggedIn, getFirstAccessibleScreen } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/$screenId" params={{ screenId: 'dashboard' }} replace />;
  }
  const target = getFirstAccessibleScreen();
  return <Navigate to="/$screenId" params={{ screenId: target }} replace />;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexRedirect,
});

function ScreenDispatcher() {
  const params = useParams({ strict: false });
  const screenId = (params as Record<string, string>)?.screenId || 'dashboard';
  const ScreenComponent = screenMap[screenId] || DashboardPage;
  return <ScreenComponent />;
}

const screenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$screenId',
  component: ScreenDispatcher,
});

const routeTree = rootRoute.addChildren([indexRoute, screenRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
