export type ScreenId =
  | 'dashboard'
  | 'invoices'
  | 'payments'
  | 'receivables'
  | 'wallets'
  | 'cashbook'
  | 'serviceorders'
  | 'estatefinance'
  | 'expenses'
  | 'vendors'
  | 'pettycash'
  | 'approvals'
  | 'budgets'
  | 'projects'
  | 'cashflow'
  | 'payroll'
  | 'commissions'
  | 'tax'
  | 'banks'
  | 'reconcile'
  | 'journals'
  | 'coa'
  | 'assets'
  | 'clientportal'
  | 'reports'
  | 'audit'
  | 'settings';

export type PeriodMode = 'day' | 'week' | 'month' | 'year';

export interface Invoice {
  id: string;
  client: string;
  service: string;
  branch: string;
  total: number;
  paid: number;
  due: string;
  status: string;
  project: string;
  order: string;
  created: string;
}

export interface Payment {
  id: string;
  date: string;
  client: string;
  invoice: string;
  order: string;
  amount: number;
  method: string;
  account: string;
  reference: string;
  status: string;
}

export interface Expense {
  id: string;
  date: string;
  requester: string;
  category: string;
  costType: string;
  stage: string;
  billable: string;
  branch: string;
  project: string;
  order: string;
  amount: number;
  status: string;
  beneficiary: string;
  purpose: string;
}

export interface VendorBill {
  id: string;
  vendor: string;
  category: string;
  project: string;
  order?: string;
  amount: number;
  due: string;
  status: string;
  withholding: number;
}

export interface Budget {
  id: string;
  name: string;
  owner: string;
  period: string;
  approved: number;
  spent: number;
  committed: number;
  status: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: string;
  project: string;
  funded: number;
  spent: number;
  committed: number;
  status: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  contract: number;
  received: number;
  budget: number;
  spent: number;
  committed: number;
  physical: number;
  financial: number;
  status: string;
}

export interface ServiceOrder {
  id: string;
  source: string;
  client: string;
  service: string;
  project: string;
  branch: string;
  contractType: string;
  contractValue: number;
  budget: number;
  overhead: number;
  status: string;
  owner: string;
  start: string;
  due: string;
}

export interface OrderCost {
  id: string;
  order: string;
  date: string;
  category: string;
  stage: string;
  description: string;
  beneficiary: string;
  amount: number;
  status: string;
  billable: string;
  clientVisible: boolean;
}

export interface EstateProject {
  id: string;
  name: string;
  location: string;
  acquisition: number;
  agencyRate: number;
  legal: number;
  clearing: number;
  fencing: number;
  gatehouse: number;
  roads: number;
  survey: number;
  marketing: number;
  contingency: number;
  totalPlots: number;
  sellablePlots: number;
  unitPrice: number;
  soldPlots: number;
  collected: number;
  status: string;
}

export interface CashbookEntry {
  id: string;
  date: string;
  type: 'Inflow' | 'Outflow';
  source: string;
  reference: string;
  description: string;
  account: string;
  order: string;
  service: string;
  project: string;
  amount: number;
  status: string;
}

export interface ClientView {
  id: string;
  client: string;
  orders: string[];
  contact: string;
}

export interface PayrollRun {
  id: string;
  period: string;
  employees: number;
  gross: number;
  deductions: number;
  net: number;
  status: string;
  paydate: string;
}

export interface Commission {
  id: string;
  employee: string;
  source: string;
  revenue: number;
  rate: number;
  amount: number;
  status: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: string;
  currency: string;
  book: number;
  statement: number;
  status: string;
}

export interface Journal {
  id: string;
  date: string;
  memo: string;
  debit: string;
  credit: string;
  amount: number;
  status: string;
}

export type ChartAccount = [string, string, string, string];
export type AuditEntry = [string, string, string, string];
export type NotificationEntry = [string, string];

export interface Asset {
  id: string;
  name: string;
  category: string;
  cost: number;
  salvage: number;
  life: number;
  acquired: string;
  book: number;
  status: string;
}

export interface Approval {
  id: string;
  type: string;
  ref: string;
  subject: string;
  requester: string;
  approver: string;
  amount: number;
  status: string;
}

export interface FinanceData {
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  vendors: VendorBill[];
  budgets: Budget[];
  wallets: Wallet[];
  projects: Project[];
  serviceOrders: ServiceOrder[];
  orderCosts: OrderCost[];
  estateProjects: EstateProject[];
  cashOpening: number;
  cashbook: CashbookEntry[];
  clientViews: ClientView[];
  payroll: PayrollRun[];
  commissions: Commission[];
  banks: BankAccount[];
  journals: Journal[];
  coa: ChartAccount[];
  assets: Asset[];
  approvals: Approval[];
  audit: AuditEntry[];
  notifications: NotificationEntry[];
}

export interface NavItem {
  id: ScreenId;
  label: string;
  icon: string;
  badge?: 'i' | 'e' | 'a';
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface ModalContent {
  title: string;
  body: string;
  foot: string;
  xl: boolean;
}

export interface LegacyRuntime {
  roles: string[];
  navGroups: NavGroup[];
  titles: Record<ScreenId, [string, string]>;
  seed: FinanceData;
  renderScreen: (screen: ScreenId) => string;
  openInvoice: () => void;
  openPayment: (invoice?: string) => void;
  openExpense: (order?: string) => void;
  openVendorBill: () => void;
  openWallet: () => void;
  openBudget: () => void;
  openServiceOrder: () => void;
  openEstate: () => void;
  openJournal: () => void;
  showOrder: (id: string) => void;
  showEstate: (id: string) => void;
}
