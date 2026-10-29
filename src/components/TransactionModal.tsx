import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Account } from '../types/finance';
import { CATEGORIES } from '../utils/formatters';
import { X, ArrowRight, ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (
    tx: Omit<Transaction, 'id'>,
    addToRecurring?: { dayOfMonth: number }
  ) => void;
  accounts: Account[];
  initialType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  accounts,
  initialType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('checking');
  const [toAccountId, setToAccountId] = useState('livret_a');
  const [category, setCategory] = useState('');
  const [addToRecurring, setAddToRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState<number>(new Date().getDate());

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setRecurringDay(new Date().getDate());

      if (initialType === 'income') {
        setTitle('Salaire mensuel');
        setAccountId('checking');
        setCategory('Salaire');
      } else if (initialType === 'transfer') {
        setTitle('Virement vers Livret A');
        setAccountId('checking');
        setToAccountId('livret_a');
        setCategory('Virement Livret A');
      } else {
        setTitle('');
        setAccountId('checking');
        setCategory('Alimentation');
      }
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Veuillez saisir un montant valide et supérieur à 0.');
      return;
    }

    if (!title.trim()) {
      alert('Veuillez renseigner un titre pour l\'opération.');
      return;
    }

    const txData: Omit<Transaction, 'id'> = {
      title: title.trim(),
      amount: parsedAmount,
      date,
      type,
      category: category || (type === 'income' ? 'Salaire' : type === 'transfer' ? 'Virement Livret A' : 'Autre Dépense'),
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      isRecurring: addToRecurring,
    };

    onAddTransaction(
      txData,
      addToRecurring ? { dayOfMonth: Math.min(31, Math.max(1, recurringDay)) } : undefined
    );

    // Reset and close
    setTitle('');
    setAmount('');
    onClose();
  };

  const currentCategories =
    type === 'income'
      ? CATEGORIES.income
      : type === 'transfer'
      ? CATEGORIES.transfer
      : CATEGORIES.expense;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {type === 'income' && <ArrowDownLeft className="w-5 h-5 text-emerald-400" />}
            {type === 'expense' && <ArrowUpRight className="w-5 h-5 text-rose-400" />}
            {type === 'transfer' && <ArrowRightLeft className="w-5 h-5 text-teal-400" />}
            <span>
              {type === 'income'
                ? 'Ajouter un Salaire / Revenu'
                : type === 'expense'
                ? 'Ajouter un Paiement / Dépense'
                : 'Effectuer un Virement vers Livret A'}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Sélecteur de type d'opération */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salaire');
                if (!title) setTitle('Salaire mensuel');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Salaire</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Alimentation');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Paiement</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('transfer');
                setCategory('Virement Livret A');
                setTitle('Virement vers Livret A');
                setAccountId('checking');
                setToAccountId('livret_a');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'transfer'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Virement</span>
            </button>
          </div>

          {/* Titre / Description */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Libellé de l'opération :
            </label>
            <input
              type="text"
              required
              placeholder={
                type === 'income'
                  ? 'ex: Salaire du mois, Prime...'
                  : type === 'transfer'
                  ? 'ex: Épargne mensuelle Livret A'
                  : 'ex: Courses Carrefour, Loyer, Abonnement...'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Montant & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Montant (€) :
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 text-sm font-bold">€</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Date :
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Comptes impliqués */}
          {type === 'transfer' ? (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-medium text-teal-400 block">
                Comptes pour le virement :
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      De : {acc.name}
                    </option>
                  ))}
                </select>

                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />

                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      Vers : {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                {type === 'income' ? 'Compte crédité :' : 'Compte débité :'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Catégorie */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Catégorie :
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {currentCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Option de récurrence pour les prévisions */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={addToRecurring}
                onChange={(e) => setAddToRecurring(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-950"
              />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Répéter chaque mois (Intégrer aux prévisions futures)
                </span>
                <span className="text-[11px] text-slate-400">
                  Cette règle sera prise en compte automatiquement dans le simulateur prévisionnel.
                </span>
              </div>
            </label>

            {addToRecurring && (
              <div className="mt-2.5 flex items-center gap-2 pl-6">
                <span className="text-xs text-slate-300">Jour du mois :</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={recurringDay}
                  onChange={(e) => setRecurringDay(parseInt(e.target.value) || 1)}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-lg ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                  : type === 'transfer'
                  ? 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/30'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30'
              }`}
            >
              Enregistrer l'opération
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
