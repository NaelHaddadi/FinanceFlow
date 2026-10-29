export const formatCurrency = (amount: number, options?: { showSign?: boolean; hideDecimals?: boolean }): string => {
  const { showSign = false, hideDecimals = false } = options || {};
  
  const sign = showSign && amount > 0 ? '+ ' : amount < 0 ? '- ' : '';
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: hideDecimals ? 0 : 2,
    maximumFractionDigits: hideDecimals ? 0 : 2,
  }).format(absAmount);

  return `${sign}${formatted}`;
};

export const formatDateFr = (dateString: string): string => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatMonthFr = (dateString: string): string => {
  try {
    const parts = dateString.split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

export const CATEGORIES = {
  income: [
    { id: 'Salaire', name: 'Salaire & Revenus', icon: 'Briefcase', color: '#10b981' },
    { id: 'Prime', name: 'Prime & Bonus', icon: 'Award', color: '#059669' },
    { id: 'Remboursement', name: 'Remboursement', icon: 'RotateCcw', color: '#14b8a6' },
    { id: 'Vente', name: 'Vente & Occasion', icon: 'ShoppingBag', color: '#06b6d4' },
    { id: 'Autre Revenu', name: 'Autre Revenu', icon: 'PlusCircle', color: '#3b82f6' },
  ],
  expense: [
    { id: 'Logement', name: 'Loyer & Logement', icon: 'Home', color: '#f43f5e' },
    { id: 'Alimentation', name: 'Courses & Alimentation', icon: 'ShoppingCart', color: '#f97316' },
    { id: 'Factures', name: 'Factures, Eau & Énergie', icon: 'Zap', color: '#eab308' },
    { id: 'Transports', name: 'Transports & Carburant', icon: 'Car', color: '#8b5cf6' },
    { id: 'Loisirs', name: 'Sorties & Loisirs', icon: 'Coffee', color: '#ec4899' },
    { id: 'Abonnements', name: 'Abonnements & Internet', icon: 'Tv', color: '#6366f1' },
    { id: 'Santé', name: 'Santé & Bien-être', icon: 'HeartPulse', color: '#14b8a6' },
    { id: 'Shopping', name: 'Shopping & Vêtements', icon: 'Tag', color: '#d946ef' },
    { id: 'Autre Dépense', name: 'Autre Dépense', icon: 'HelpCircle', color: '#94a3b8' },
  ],
  transfer: [
    { id: 'Virement Livret A', name: 'Virement vers Livret A', icon: 'PiggyBank', color: '#10b981' },
    { id: 'Virement Épargne', name: 'Virement Épargne', icon: 'TrendingUp', color: '#3b82f6' },
    { id: 'Virement Compte Courant', name: 'Virement vers Courant', icon: 'ArrowRightLeft', color: '#6366f1' },
    { id: 'Autre Virement', name: 'Virement Interne', icon: 'Repeat', color: '#8b5cf6' },
  ]
};
