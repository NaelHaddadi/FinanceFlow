import React, { useState } from 'react';
import { RecurringTransaction, Account } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { 
  CalendarClock, 
  Plus, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowRightLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface RecurringManagerProps {
  recurring: RecurringTransaction[];
  accounts?: Account[];
  onToggleActive: (id: string) => void;
  onDeleteRecurring: (id: string) => void;
  onAddRecurring: (item: Omit<RecurringTransaction, 'id'>) => void;
}

export const RecurringManager: React.FC<RecurringManagerProps> = ({
  recurring,
  onToggleActive,
  onDeleteRecurring,
  onAddRecurring,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [category, setCategory] = useState('Logement');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Veuillez saisir un montant valide.');
      return;
    }

    onAddRecurring({
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      accountId: 'checking',
      toAccountId: type === 'transfer' ? 'livret_a' : undefined,
      dayOfMonth: Math.min(31, Math.max(1, dayOfMonth)),
      active: true,
    });

    setTitle('');
    setAmount('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-emerald-400" />
            <span>Règles récurrentes & Budgets prévisionnels</span>
          </h2>
          <p className="text-xs text-slate-400">
            Ces montants mensuels (salaires, loyers, virements Livret A) alimentent les prévisualisations futures.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ajouter une règle</span>
        </button>
      </div>

      {/* Formulaire d'ajout rapide */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-950/80 rounded-xl border border-emerald-500/30 space-y-3">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Nouvelle règle mensuelle
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-300 block mb-1">Type :</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="income">Revenu / Salaire</option>
                <option value="expense">Paiement / Charge</option>
                <option value="transfer">Virement Livret A</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-300 block mb-1">Libellé :</label>
              <input
                type="text"
                required
                placeholder="ex: Salaire, Loyer, Virement Livret A..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">Montant (€) :</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="ex: 2500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-300 block mb-1">Jour du mois (1-31) :</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">Catégorie :</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
            >
              Créer la règle
            </button>
          </div>
        </form>
      )}

      {/* Liste des règles récurrentes */}
      <div className="space-y-3">
        {recurring.map((rec) => {
          const isIncome = rec.type === 'income';
          const isTransfer = rec.type === 'transfer';

          return (
            <div
              key={rec.id}
              className={`p-4 rounded-xl border transition flex items-center justify-between ${
                rec.active
                  ? 'bg-slate-950/70 border-slate-800'
                  : 'bg-slate-950/30 border-slate-800/40 opacity-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isIncome
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : isTransfer
                      ? 'bg-teal-500/10 text-teal-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {isIncome && <ArrowDownLeft className="w-4 h-4" />}
                  {isTransfer && <ArrowRightLeft className="w-4 h-4" />}
                  {!isIncome && !isTransfer && <ArrowUpRight className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{rec.title}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                      Chaque {rec.dayOfMonth} du mois
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    <span>{rec.category}</span>
                    {isTransfer && (
                      <span className="text-teal-400 ml-1.5">• Vers Livret A</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span
                  className={`text-sm font-bold ${
                    isIncome ? 'text-emerald-400' : isTransfer ? 'text-teal-400' : 'text-rose-400'
                  }`}
                >
                  {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}
                  {formatCurrency(rec.amount)} / mois
                </span>

                <button
                  onClick={() => onToggleActive(rec.id)}
                  className={`p-1.5 rounded-lg text-xs font-medium transition ${
                    rec.active
                      ? 'text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-slate-500 hover:bg-slate-800'
                  }`}
                  title={rec.active ? 'Désactiver cette règle' : 'Activer cette règle'}
                >
                  {rec.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => onDeleteRecurring(rec.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  title="Supprimer la règle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
