import React, { useState } from 'react';
import { Account, Transaction } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { 
  Building2, 
  PiggyBank, 
  Layers, 
  ArrowRightLeft, 
  Edit3, 
  Percent,
  Check,
  X
} from 'lucide-react';

interface AccountsOverviewProps {
  accounts: Account[];
  balances: Record<string, number>;
  transactions: Transaction[];
  onUpdateAccountInitialBalance: (accountId: string, newInitial: number, interestRate?: number) => void;
  onOpenTransferModal: () => void;
}

export const AccountsOverview: React.FC<AccountsOverviewProps> = ({
  accounts,
  balances,
  transactions,
  onUpdateAccountInitialBalance,
  onOpenTransferModal,
}) => {
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editInitialVal, setEditInitialVal] = useState<string>('');
  const [editRateVal, setEditRateVal] = useState<string>('');

  const checkingAccount = accounts.find((a) => a.id === 'checking');
  const livretAAccount = accounts.find((a) => a.id === 'livret_a');

  const checkingBalance = balances['checking'] ?? (checkingAccount?.initialBalance || 0);
  const livretABalance = balances['livret_a'] ?? (livretAAccount?.initialBalance || 0);
  const totalBalance = checkingBalance + livretABalance;

  // Calcul du flux du mois en cours
  const currentMonth = new Date().toISOString().substring(0, 7);
  const thisMonthTxs = transactions.filter((t) => t.date.startsWith(currentMonth));
  const monthIncome = thisMonthTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthExpenses = thisMonthTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthTransfersToSavings = thisMonthTxs
    .filter((t) => t.type === 'transfer' && (t.toAccountId === 'livret_a' || t.category.includes('Livret')))
    .reduce((sum, t) => sum + t.amount, 0);

  // Intérêts annuels estimés pour le Livret A
  const livretARate = livretAAccount?.interestRate || 3.0;
  const estimatedAnnualInterest = (livretABalance * livretARate) / 100;

  const startEditing = (acc: Account) => {
    setEditingAccountId(acc.id);
    setEditInitialVal(acc.initialBalance.toString());
    setEditRateVal(acc.interestRate?.toString() || '0');
  };

  const handleSaveEdit = (accountId: string) => {
    const parsedInitial = parseFloat(editInitialVal);
    const parsedRate = parseFloat(editRateVal);
    if (!isNaN(parsedInitial)) {
      onUpdateAccountInitialBalance(
        accountId,
        parsedInitial,
        !isNaN(parsedRate) ? parsedRate : undefined
      );
    }
    setEditingAccountId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      
      {/* 1. Carte Patrimoine Total */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            Patrimoine Total
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            2 comptes actifs
          </span>
        </div>

        <div className="mt-4">
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compte Courant + Livret A
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400 block">Revenus ce mois :</span>
            <span className="font-semibold text-emerald-400">
              +{formatCurrency(monthIncome, { hideDecimals: true })}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Dépenses ce mois :</span>
            <span className="font-semibold text-rose-400">
              -{formatCurrency(monthExpenses, { hideDecimals: true })}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Carte Compte Courant */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-lg hover:border-blue-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-400" />
            Compte Courant
          </span>
          <button
            onClick={() => checkingAccount && startEditing(checkingAccount)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 p-1 rounded hover:bg-slate-800 transition"
            title="Ajuster le solde de départ du compte courant"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Solde initial</span>
          </button>
        </div>

        {editingAccountId === 'checking' ? (
          <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-blue-500/40">
            <label className="text-xs text-slate-300 block mb-1 font-medium">
              Solde initial (avant opérations) :
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={editInitialVal}
                onChange={(e) => setEditInitialVal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={() => handleSaveEdit('checking')}
                className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingAccountId(null)}
                className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <div className={`text-3xl font-extrabold tracking-tight ${checkingBalance < 0 ? 'text-rose-400' : 'text-blue-300'}`}>
              {formatCurrency(checkingBalance)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>Solde de départ : {formatCurrency(checkingAccount?.initialBalance || 0)}</span>
              {checkingBalance < 200 && (
                <span className="text-amber-400 font-medium">⚠️ Vigilance solde</span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Usage quotidien & prélèvements</span>
          <span className="text-blue-400 font-medium">Carte & RIB</span>
        </div>
      </div>

      {/* 3. Carte Livret A */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-lg hover:border-emerald-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <PiggyBank className="w-4 h-4 text-emerald-400" />
            Livret A (Épargne)
          </span>
          <button
            onClick={() => livretAAccount && startEditing(livretAAccount)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 p-1 rounded hover:bg-slate-800 transition"
            title="Modifier solde initial ou taux"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Paramètres</span>
          </button>
        </div>

        {editingAccountId === 'livret_a' ? (
          <div className="mt-3 p-3 bg-slate-800/80 rounded-xl border border-emerald-500/40 space-y-2">
            <div>
              <label className="text-[11px] text-slate-300 block mb-0.5">Solde initial (€) :</label>
              <input
                type="number"
                step="0.01"
                value={editInitialVal}
                onChange={(e) => setEditInitialVal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-300 block mb-0.5">Taux annuel d'intérêt (%) :</label>
              <input
                type="number"
                step="0.1"
                value={editRateVal}
                onChange={(e) => setEditRateVal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => handleSaveEdit('livret_a')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setEditingAccountId(null)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {formatCurrency(livretABalance)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3 text-emerald-400" />
                Taux {livretARate}% net
              </span>
              <span className="text-emerald-300 font-medium">
                ~{formatCurrency(estimatedAnnualInterest, { hideDecimals: true })} d'intérêts/an
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Viré ce mois : <strong className="text-emerald-300">+{formatCurrency(monthTransfersToSavings, { hideDecimals: true })}</strong>
          </span>
          <button
            onClick={onOpenTransferModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Virer des fonds</span>
          </button>
        </div>
      </div>

    </div>
  );
};
