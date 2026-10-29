import React, { useState, useMemo } from 'react';
import { Transaction, Account } from '../types/finance';
import { formatCurrency, formatDateFr } from '../utils/formatters';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowRightLeft, 
  Trash2, 
  Search, 
  Calendar,
  PiggyBank
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction: (type?: 'income' | 'expense' | 'transfer') => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  onDeleteTransaction,
  onOpenNewTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Obtenir la liste des mois uniques présents dans les transactions
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    transactions.forEach((tx) => {
      monthsSet.add(tx.date.substring(0, 7));
    });
    return Array.from(monthsSet).sort().reverse();
  }, [transactions]);

  // Filtrer les transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (filterType !== 'all' && tx.type !== filterType) return false;
        if (selectedMonth !== 'all' && !tx.date.startsWith(selectedMonth)) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchTitle = tx.title.toLowerCase().includes(q);
          const matchCat = tx.category.toLowerCase().includes(q);
          return matchTitle || matchCat;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // Du plus récent au plus ancien
  }, [transactions, filterType, selectedMonth, searchQuery]);

  const getAccountName = (accId: string) => {
    return accounts.find((a) => a.id === accId)?.name || accId;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      
      {/* Entête avec Filtres et Recherche */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Historique des opérations</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">
              {filteredTransactions.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Salaires, paiements quotidiens et virements vers le Livret A
          </p>
        </div>

        {/* Barre de recherche et filtre mois */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Recherche */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-36 sm:w-44"
            />
          </div>

          {/* Filtre mois */}
          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tous les mois</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs filtres types d'opérations */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            filterType === 'all'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Toutes
        </button>

        <button
          onClick={() => setFilterType('income')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
            filterType === 'income'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Salaires & Revenus</span>
        </button>

        <button
          onClick={() => setFilterType('expense')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
            filterType === 'expense'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/60'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
          <span>Paiements</span>
        </button>

        <button
          onClick={() => setFilterType('transfer')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
            filterType === 'transfer'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-teal-400 hover:bg-slate-800/60'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400" />
          <span>Virements Livret A</span>
        </button>
      </div>

      {/* Liste des transactions */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl">
          <PiggyBank className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">Aucune opération trouvée</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ajoutez un salaire, un paiement ou effectuez un virement pour alimenter votre historique.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => onOpenNewTransaction('income')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
            >
              + Salaire
            </button>
            <button
              onClick={() => onOpenNewTransaction('transfer')}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium transition"
            >
              + Virement Livret A
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';
            const isExpense = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-3 rounded-xl transition-colors group"
              >
                {/* Icône & Info */}
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isTransfer
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isIncome && <ArrowDownLeft className="w-5 h-5" />}
                    {isTransfer && <ArrowRightLeft className="w-5 h-5" />}
                    {isExpense && <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {tx.title}
                      </span>
                      {tx.isRecurring && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">
                          Mensuel
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{formatDateFr(tx.date)}</span>
                      <span>•</span>
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[11px] text-slate-300">
                        {tx.category}
                      </span>
                      <span>•</span>
                      {isTransfer ? (
                        <span className="text-teal-400 font-medium">
                          {getAccountName(tx.accountId)} → {getAccountName(tx.toAccountId || 'livret_a')}
                        </span>
                      ) : (
                        <span>{getAccountName(tx.accountId)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Montant & Suppression */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div
                    className={`text-sm sm:text-base font-bold text-right ${
                      isIncome
                        ? 'text-emerald-400'
                        : isTransfer
                        ? 'text-teal-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {isIncome && '+'}
                    {isExpense && '-'}
                    {isTransfer && '⇄ '}
                    {formatCurrency(tx.amount)}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Supprimer l'opération "${tx.title}" ?`)) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition opacity-60 group-hover:opacity-100"
                    title="Supprimer cette opération"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
