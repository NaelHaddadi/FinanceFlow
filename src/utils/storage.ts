import { AppData } from '../types/finance';

const STORAGE_KEY = 'finance_manager_data_v1';

export const DEFAULT_DATA: AppData = {
  accounts: [
    {
      id: 'checking',
      name: 'Compte Courant',
      type: 'checking',
      initialBalance: 1450,
      interestRate: 0,
      color: '#3b82f6',
      description: 'Opérations courantes, salaire et prélèvements',
    },
    {
      id: 'livret_a',
      name: 'Livret A',
      type: 'savings',
      initialBalance: 6500,
      interestRate: 3.0, // Taux officiel Livret A
      color: '#10b981',
      description: 'Épargne de précaution disponible, 3.0% net',
    },
  ],
  transactions: [
    // Mois précédent
    {
      id: 'tx-1',
      date: '2026-09-28',
      title: 'Salaire Entreprise',
      amount: 2500,
      type: 'income',
      category: 'Salaire',
      accountId: 'checking',
      isRecurring: true,
    },
    {
      id: 'tx-2',
      date: '2026-10-01',
      title: 'Virement mensuel épargne vers Livret A',
      amount: 350,
      type: 'transfer',
      category: 'Virement Livret A',
      accountId: 'checking',
      toAccountId: 'livret_a',
      isRecurring: true,
    },
    {
      id: 'tx-3',
      date: '2026-10-05',
      title: 'Loyer Appartement',
      amount: 780,
      type: 'expense',
      category: 'Logement',
      accountId: 'checking',
      isRecurring: true,
    },
    {
      id: 'tx-4',
      date: '2026-10-08',
      title: 'Courses Supermarché',
      amount: 142.5,
      type: 'expense',
      category: 'Alimentation',
      accountId: 'checking',
    },
    {
      id: 'tx-5',
      date: '2026-10-12',
      title: 'Abonnement Internet & Mobile',
      amount: 39.99,
      type: 'expense',
      category: 'Abonnements',
      accountId: 'checking',
      isRecurring: true,
    },
    {
      id: 'tx-6',
      date: '2026-10-15',
      title: 'Restaurant & Sortie entre amis',
      amount: 68.0,
      type: 'expense',
      category: 'Loisirs',
      accountId: 'checking',
    },
    {
      id: 'tx-7',
      date: '2026-10-20',
      title: 'Plein Essence',
      amount: 72.0,
      type: 'expense',
      category: 'Transports',
      accountId: 'checking',
    },
    {
      id: 'tx-8',
      date: '2026-10-28',
      title: 'Salaire Entreprise',
      amount: 2500,
      type: 'income',
      category: 'Salaire',
      accountId: 'checking',
      isRecurring: true,
    },
  ],
  recurring: [
    {
      id: 'rec-1',
      title: 'Salaire mensuel',
      type: 'income',
      amount: 2500,
      category: 'Salaire',
      accountId: 'checking',
      dayOfMonth: 28,
      active: true,
    },
    {
      id: 'rec-2',
      title: 'Virement épargne Livret A',
      type: 'transfer',
      amount: 350,
      category: 'Virement Livret A',
      accountId: 'checking',
      toAccountId: 'livret_a',
      dayOfMonth: 1,
      active: true,
    },
    {
      id: 'rec-3',
      title: 'Loyer & Charges',
      type: 'expense',
      amount: 780,
      category: 'Logement',
      accountId: 'checking',
      dayOfMonth: 5,
      active: true,
    },
    {
      id: 'rec-4',
      title: 'Box & Forfaits mobiles',
      type: 'expense',
      amount: 40,
      category: 'Abonnements',
      accountId: 'checking',
      dayOfMonth: 12,
      active: true,
    },
    {
      id: 'rec-5',
      title: 'Budget alimentation mensuel estimé',
      type: 'expense',
      amount: 400,
      category: 'Alimentation',
      accountId: 'checking',
      dayOfMonth: 10,
      active: true,
    },
  ],
  forecastConfig: {
    horizonMonths: 12, // 1 an par défaut
    extraMonthlyIncome: 0,
    extraMonthlyExpenses: 0,
    extraMonthlySavingsTransfer: 0,
    livretAInterestRate: 3.0,
    checkingAlertThreshold: 200,
  },
  lastUpdated: new Date().toISOString(),
};

export const loadAppData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppData(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    const parsed = JSON.parse(raw);
    
    // Assurer la rétrocompatibilité si des champs manquent
    return {
      accounts: parsed.accounts || DEFAULT_DATA.accounts,
      transactions: parsed.transactions || DEFAULT_DATA.transactions,
      recurring: parsed.recurring || DEFAULT_DATA.recurring,
      forecastConfig: {
        ...DEFAULT_DATA.forecastConfig,
        ...(parsed.forecastConfig || {}),
      },
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Erreur de lecture du stockage local:', err);
    return DEFAULT_DATA;
  }
};

export const saveAppData = (data: AppData): void => {
  try {
    const toSave: AppData = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error('Erreur d\'écriture dans le stockage local:', err);
  }
};

export const exportToJsonFile = (data: AppData): void => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `finances_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
