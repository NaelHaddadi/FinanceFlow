import { Account, Transaction, RecurringTransaction, ForecastConfig, ForecastPoint } from '../types/finance';

/**
 * Calcule les soldes actuels de chaque compte en fonction du solde initial
 * et de l'historique de toutes les transactions enregistrées.
 */
export const calculateAccountBalances = (
  accounts: Account[],
  transactions: Transaction[]
): Record<string, number> => {
  const balances: Record<string, number> = {};

  // Initialisation avec les soldes de départ
  accounts.forEach((acc) => {
    balances[acc.id] = acc.initialBalance;
  });

  // Tri chronologique des transactions
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sorted.forEach((tx) => {
    if (tx.type === 'income') {
      if (balances[tx.accountId] !== undefined) {
        balances[tx.accountId] += tx.amount;
      }
    } else if (tx.type === 'expense') {
      if (balances[tx.accountId] !== undefined) {
        balances[tx.accountId] -= tx.amount;
      }
    } else if (tx.type === 'transfer') {
      // Débit du compte source
      if (balances[tx.accountId] !== undefined) {
        balances[tx.accountId] -= tx.amount;
      }
      // Crédit du compte destination (ex: Livret A)
      if (tx.toAccountId && balances[tx.toAccountId] !== undefined) {
        balances[tx.toAccountId] += tx.amount;
      }
    }
  });

  return balances;
};

/**
 * Calcule les totaux par mois (Revenus, Dépenses, Épargne virée)
 */
export const calculateMonthlySummaries = (transactions: Transaction[]) => {
  const months: Record<string, { month: string; income: number; expenses: number; transfers: number; savings: number }> = {};

  transactions.forEach((tx) => {
    const monthKey = tx.date.substring(0, 7); // YYYY-MM
    if (!months[monthKey]) {
      months[monthKey] = {
        month: monthKey,
        income: 0,
        expenses: 0,
        transfers: 0,
        savings: 0,
      };
    }

    if (tx.type === 'income') {
      months[monthKey].income += tx.amount;
    } else if (tx.type === 'expense') {
      months[monthKey].expenses += tx.amount;
    } else if (tx.type === 'transfer') {
      months[monthKey].transfers += tx.amount;
      // Si c'est un virement vers le livret A / épargne
      if (tx.toAccountId === 'livret_a' || tx.category.toLowerCase().includes('livret') || tx.category.toLowerCase().includes('épargne')) {
        months[monthKey].savings += tx.amount;
      }
    }
  });

  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Calcule l'historique des soldes au fil du temps pour le graphique d'évolution historique
 */
export const calculateHistoricalTimeline = (
  accounts: Account[],
  transactions: Transaction[]
) => {
  if (transactions.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    const checking = accounts.find((a) => a.id === 'checking')?.initialBalance || 0;
    const livretA = accounts.find((a) => a.id === 'livret_a')?.initialBalance || 0;
    return [
      {
        date: today,
        label: 'Aujourd\'hui',
        compteCourant: checking,
        livretA: livretA,
        total: checking + livretA,
      },
    ];
  }

  // Trier les transactions par date croissante
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  const runningBalances: Record<string, number> = {};
  accounts.forEach((acc) => {
    runningBalances[acc.id] = acc.initialBalance;
  });

  // Déterminer la date de début (soit 3 mois avant la 1ere transaction ou la date de la 1ere tx)
  const timeline: {
    date: string;
    label: string;
    compteCourant: number;
    livretA: number;
    total: number;
  }[] = [];

  // Regrouper par jour
  const transactionsByDate: Record<string, Transaction[]> = {};
  sorted.forEach((tx) => {
    if (!transactionsByDate[tx.date]) {
      transactionsByDate[tx.date] = [];
    }
    transactionsByDate[tx.date].push(tx);
  });

  const dates = Object.keys(transactionsByDate).sort();

  dates.forEach((d) => {
    transactionsByDate[d].forEach((tx) => {
      if (tx.type === 'income') {
        if (runningBalances[tx.accountId] !== undefined) {
          runningBalances[tx.accountId] += tx.amount;
        }
      } else if (tx.type === 'expense') {
        if (runningBalances[tx.accountId] !== undefined) {
          runningBalances[tx.accountId] -= tx.amount;
        }
      } else if (tx.type === 'transfer') {
        if (runningBalances[tx.accountId] !== undefined) {
          runningBalances[tx.accountId] -= tx.amount;
        }
        if (tx.toAccountId && runningBalances[tx.toAccountId] !== undefined) {
          runningBalances[tx.toAccountId] += tx.amount;
        }
      }
    });

    const checking = runningBalances['checking'] || 0;
    const livretA = runningBalances['livret_a'] || 0;
    let total = 0;
    Object.values(runningBalances).forEach((val) => {
      total += val;
    });

    timeline.push({
      date: d,
      label: d,
      compteCourant: Math.round(checking * 100) / 100,
      livretA: Math.round(livretA * 100) / 100,
      total: Math.round(total * 100) / 100,
    });
  });

  return timeline;
};

/**
 * Moteur de simulation et prévision financière dans le temps
 * Projette les soldes mois par mois sur la durée choisie (ex: 6 mois, 1 an, 2 ans, 5 ans)
 * en tenant compte :
 * - Du solde actuel du compte courant et du Livret A
 * - Des revenus récurrents (salaires) + ajustements
 * - Des dépenses récurrentes (loyers, factures...) + ajustements
 * - Des virements programmés vers le Livret A
 * - Des intérêts capitalisés du Livret A (au taux annuel paramétré, ex: 3% net d'impôt)
 */
export const calculateForecast = (
  accounts: Account[],
  currentBalances: Record<string, number>,
  recurring: RecurringTransaction[],
  config: ForecastConfig
): {
  points: ForecastPoint[];
  summary: {
    finalTotal: number;
    finalChecking: number;
    finalLivretA: number;
    totalSavingsGrowth: number;
    totalInterestsEarned: number;
    lowestCheckingBalance: number;
    lowestCheckingDate: string;
    hasAlert: boolean;
  };
} => {
  const points: ForecastPoint[] = [];

  let curChecking = currentBalances['checking'] ?? (accounts.find((a) => a.id === 'checking')?.initialBalance || 0);
  let curLivretA = currentBalances['livret_a'] ?? (accounts.find((a) => a.id === 'livret_a')?.initialBalance || 0);

  const livretAAcc = accounts.find((a) => a.id === 'livret_a');
  const annualInterestRate = (config.livretAInterestRate || livretAAcc?.interestRate || 3.0) / 100;
  const monthlyInterestRate = annualInterestRate / 12;

  // Calcul du flux mensuel de base issu des règles récurrentes
  const activeRecurring = recurring.filter((r) => r.active);

  const baseMonthlyIncome = activeRecurring
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const baseMonthlyExpenses = activeRecurring
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const baseMonthlyTransferToLivretA = activeRecurring
    .filter(
      (r) =>
        r.type === 'transfer' &&
        (r.toAccountId === 'livret_a' || r.category.toLowerCase().includes('livret'))
    )
    .reduce((sum, r) => sum + r.amount, 0);

  const effectiveMonthlyIncome = Math.max(0, baseMonthlyIncome + config.extraMonthlyIncome);
  const effectiveMonthlyExpenses = Math.max(0, baseMonthlyExpenses + config.extraMonthlyExpenses);
  const effectiveMonthlyTransfer = Math.max(0, baseMonthlyTransferToLivretA + config.extraMonthlySavingsTransfer);

  // Point de départ (Mois 0 = Aujourd'hui)
  const now = new Date();
  let accumulatedInterest = 0;
  let lowestChecking = curChecking;
  let lowestCheckingDate = 'Aujourd\'hui';

  points.push({
    date: 'M0 (Auj.)',
    timestamp: now.getTime(),
    checkingBalance: Math.round(curChecking * 100) / 100,
    savingsBalance: Math.round(curLivretA * 100) / 100,
    totalBalance: Math.round((curChecking + curLivretA) * 100) / 100,
    accumulatedInterest: 0,
    income: 0,
    expenses: 0,
    savingsTransfer: 0,
    isProjected: false,
    notes: ['Situation actuelle'],
  });

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

  for (let m = 1; m <= config.horizonMonths; m++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const monthLabel = `${monthNames[futureDate.getMonth()]} ${futureDate.getFullYear().toString().slice(-2)}`;

    // Flux de trésorerie sur le compte courant :
    // + Salaire / Revenus
    // - Dépenses
    // - Virement vers Livret A
    curChecking = curChecking + effectiveMonthlyIncome - effectiveMonthlyExpenses - effectiveMonthlyTransfer;

    // Calcul des intérêts du Livret A sur le mois
    const monthInterest = curLivretA * monthlyInterestRate;
    accumulatedInterest += monthInterest;

    // Le Livret A augmente du virement d'épargne + des intérêts générés
    curLivretA = curLivretA + effectiveMonthlyTransfer + monthInterest;

    if (curChecking < lowestChecking) {
      lowestChecking = curChecking;
      lowestCheckingDate = monthLabel;
    }

    const notes: string[] = [];
    if (curChecking < config.checkingAlertThreshold) {
      notes.push(`Attention : solde sous le seuil de sécurité (${config.checkingAlertThreshold}€)`);
    }

    points.push({
      date: `+${m}m (${monthLabel})`,
      timestamp: futureDate.getTime(),
      checkingBalance: Math.round(curChecking * 100) / 100,
      savingsBalance: Math.round(curLivretA * 100) / 100,
      totalBalance: Math.round((curChecking + curLivretA) * 100) / 100,
      accumulatedInterest: Math.round(accumulatedInterest * 100) / 100,
      income: effectiveMonthlyIncome,
      expenses: effectiveMonthlyExpenses,
      savingsTransfer: effectiveMonthlyTransfer,
      isProjected: true,
      notes,
    });
  }

  const initialLivretA = currentBalances['livret_a'] || 0;
  const totalSavingsGrowth = curLivretA - initialLivretA;

  return {
    points,
    summary: {
      finalTotal: Math.round((curChecking + curLivretA) * 100) / 100,
      finalChecking: Math.round(curChecking * 100) / 100,
      finalLivretA: Math.round(curLivretA * 100) / 100,
      totalSavingsGrowth: Math.round(totalSavingsGrowth * 100) / 100,
      totalInterestsEarned: Math.round(accumulatedInterest * 100) / 100,
      lowestCheckingBalance: Math.round(lowestChecking * 100) / 100,
      lowestCheckingDate,
      hasAlert: lowestChecking < config.checkingAlertThreshold,
    },
  };
};
