import { AppData } from '../types/finance';

const STORAGE_KEY = 'finance_manager_data_v2';
const LEGACY_STORAGE_KEY = 'finance_manager_data_v1';

export const EMPTY_DATA: AppData = {
  accounts: [
    {
      id: 'checking',
      name: 'Compte Courant',
      type: 'checking',
      initialBalance: 0,
      interestRate: 0,
      color: '#3b82f6',
      description: 'Opérations courantes, salaire et prélèvements',
    },
    {
      id: 'livret_a',
      name: 'Livret A',
      type: 'savings',
      initialBalance: 0,
      interestRate: 3.0, // Taux officiel Livret A
      color: '#10b981',
      description: 'Épargne de précaution disponible, 3.0% net',
    },
  ],
  transactions: [],
  recurring: [],
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
    // Si l'ancienne clé avec le jeu de démo existe, on la supprime pour partir from scratch
    if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
      saveAppData(EMPTY_DATA);
      return EMPTY_DATA;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppData(EMPTY_DATA);
      return EMPTY_DATA;
    }
    const parsed = JSON.parse(raw);
    
    return {
      accounts: parsed.accounts || EMPTY_DATA.accounts,
      transactions: parsed.transactions || [],
      recurring: parsed.recurring || [],
      forecastConfig: {
        ...EMPTY_DATA.forecastConfig,
        ...(parsed.forecastConfig || {}),
      },
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Erreur de lecture du stockage local:', err);
    return EMPTY_DATA;
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
