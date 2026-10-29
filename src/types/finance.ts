export type AccountType = 'checking' | 'savings' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance?: number;
  interestRate: number; // Taux annuel en %, ex: 3.0 pour Livret A
  color: string;
  description?: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string; // Compte principal débité ou crédité
  toAccountId?: string; // Requis si type === 'transfer' (ex: Livret A)
  note?: string;
  isRecurring?: boolean;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  category: string;
  accountId: string;
  toAccountId?: string;
  dayOfMonth: number; // 1-31
  active: boolean;
}

export interface ForecastPoint {
  date: string; // YYYY-MM-DD or Month Year
  timestamp: number;
  checkingBalance: number;
  savingsBalance: number;
  totalBalance: number;
  accumulatedInterest: number;
  income: number;
  expenses: number;
  savingsTransfer: number;
  isProjected: boolean;
  notes?: string[];
}

export interface ForecastConfig {
  horizonMonths: number; // 3, 6, 12, 24, 36
  extraMonthlyIncome: number; // variation de salaire
  extraMonthlyExpenses: number; // variation de dépenses
  extraMonthlySavingsTransfer: number; // variation de virement livret A
  livretAInterestRate: number; // Taux d'intérêt en %
  checkingAlertThreshold: number; // Seuil minimum compte courant alerte
}

export interface AppData {
  accounts: Account[];
  transactions: Transaction[];
  recurring: RecurringTransaction[];
  forecastConfig: ForecastConfig;
  lastUpdated: string;
}
