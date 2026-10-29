import React, { useMemo } from 'react';
import { Account, Transaction } from '../types/finance';
import { calculateHistoricalTimeline, calculateMonthlySummaries } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon } from 'lucide-react';

interface ChartsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  balances?: Record<string, number>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#64748b'];

export const ChartsView: React.FC<ChartsViewProps> = ({
  accounts,
  transactions,
}) => {
  const timelineData = useMemo(() => {
    return calculateHistoricalTimeline(accounts, transactions);
  }, [accounts, transactions]);

  const monthlyData = useMemo(() => {
    return calculateMonthlySummaries(transactions);
  }, [transactions]);

  // Répartition des dépenses par catégorie
  const categoryExpenses = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      });

    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalExpenses = categoryExpenses.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-8">
      
      {/* 1. Graphique Principal : Évolution des soldes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Évolution de vos soldes & épargne</span>
            </h2>
            <p className="text-xs text-slate-400">
              Historique combiné : Compte Courant, Livret A et Patrimoine Global
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span className="text-slate-300">Patrimoine Total</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
              <span className="text-slate-300">Courant</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-400 inline-block" />
              <span className="text-slate-300">Livret A</span>
            </span>
          </div>
        </div>

        <div className="h-80 w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCourant" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorLivret" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${val}€`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label) => `Date : ${label}`}
              />

              <Area
                type="monotone"
                dataKey="total"
                name="Patrimoine Total"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
              <Area
                type="monotone"
                dataKey="livretA"
                name="Livret A"
                stroke="#14b8a6"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorLivret)"
              />
              <Area
                type="monotone"
                dataKey="compteCourant"
                name="Compte Courant"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCourant)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Deuxième rangée : Comparatif mensuel & Répartition des dépenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Comparatif Revenus vs Dépenses vs Épargne */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Flux mensuels (Revenus / Dépenses / Épargne)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparatif par mois des entrées, sorties et virements Livret A
              </p>
            </div>
          </div>

          <div className="h-64 w-full mt-4">
            {monthlyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Pas encore assez de données mensuelles.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(m) => m.slice(5)} // Affiche seulement le mois
                  />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => formatCurrency(val)}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="income" name="Revenus (Salaires)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Dépenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="savings" name="Viré vers Livret A" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Répartition des dépenses par catégorie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-400" />
                <span>Répartition des dépenses</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total des dépenses : <strong className="text-white">{formatCurrency(totalExpenses)}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mt-4">
            <div className="h-56 w-full">
              {categoryExpenses.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Aucune dépense enregistrée.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {categoryExpenses.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                      formatter={(val: number) => formatCurrency(val)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Légende détaillée des catégories */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
              {categoryExpenses.map((cat, idx) => {
                const pct = totalExpenses > 0 ? Math.round((cat.value / totalExpenses) * 100) : 0;
                return (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="text-slate-300 truncate">{cat.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <span className="font-semibold text-white">{formatCurrency(cat.value, { hideDecimals: true })}</span>
                      <span className="text-slate-500 ml-1.5">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
