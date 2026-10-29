import React, { useMemo } from 'react';
import { Account, RecurringTransaction, ForecastConfig } from '../types/finance';
import { calculateForecast } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { 
  TrendingUp, 
  PiggyBank, 
  Sparkles, 
  AlertTriangle, 
  Sliders, 
  Calendar,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface ForecastSimulatorProps {
  accounts: Account[];
  balances: Record<string, number>;
  recurring: RecurringTransaction[];
  config: ForecastConfig;
  onUpdateConfig: (newConfig: ForecastConfig) => void;
}

export const ForecastSimulator: React.FC<ForecastSimulatorProps> = ({
  accounts,
  balances,
  recurring,
  config,
  onUpdateConfig,
}) => {
  const forecast = useMemo(() => {
    return calculateForecast(accounts, balances, recurring, config);
  }, [accounts, balances, recurring, config]);

  // Calcul du virement d'épargne de base
  const baseMonthlyTransfer = recurring
    .filter((r) => r.active && r.type === 'transfer' && (r.toAccountId === 'livret_a' || r.category.includes('Livret')))
    .reduce((sum, r) => sum + r.amount, 0);

  const effectiveMonthlyTransfer = baseMonthlyTransfer + config.extraMonthlySavingsTransfer;

  const handleHorizonChange = (months: number) => {
    onUpdateConfig({ ...config, horizonMonths: months });
  };

  const resetAdjustments = () => {
    onUpdateConfig({
      ...config,
      extraMonthlyIncome: 0,
      extraMonthlyExpenses: 0,
      extraMonthlySavingsTransfer: 0,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* En-tête avec explication & choix de l'horizon */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Simulateur & Prévisions Financières</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Projection intelligente
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Anticipez l'évolution de votre compte courant, de votre Livret A et de vos intérêts dans le temps.
                </p>
              </div>
            </div>
          </div>

          {/* Choix de l'horizon de prévision */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start lg:self-auto overflow-x-auto">
            <span className="text-xs text-slate-400 px-2 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              Horizon :
            </span>
            {[
              { label: '3 mois', val: 3 },
              { label: '6 mois', val: 6 },
              { label: '1 an', val: 12 },
              { label: '2 ans', val: 24 },
              { label: '5 ans', val: 60 },
            ].map((h) => (
              <button
                key={h.val}
                onClick={() => handleHorizonChange(h.val)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  config.horizonMonths === h.val
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cartes d'indicateurs de résultats prévisionnels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          
          {/* 1. Patrimoine Final Projeté */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Patrimoine Projeté à {config.horizonMonths} mois
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {formatCurrency(forecast.summary.finalTotal)}
            </div>
            <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                +{formatCurrency(forecast.summary.finalTotal - ((balances['checking'] || 0) + (balances['livret_a'] || 0)), { hideDecimals: true })} générés
              </span>
            </div>
          </div>

          {/* 2. Livret A Projeté */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider block flex items-center gap-1">
              <PiggyBank className="w-3.5 h-3.5" />
              Livret A à terme
            </span>
            <div className="text-2xl font-extrabold text-teal-300 mt-1">
              {formatCurrency(forecast.summary.finalLivretA)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Épargne brute : +{formatCurrency(forecast.summary.totalSavingsGrowth, { hideDecimals: true })}
            </div>
          </div>

          {/* 3. Intérêts composés Livret A générés */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Intérêts bancaires offerts
            </span>
            <div className="text-2xl font-extrabold text-emerald-300 mt-1">
              +{formatCurrency(forecast.summary.totalInterestsEarned)}
            </div>
            <div className="text-xs text-emerald-400/80 mt-1">
              Rendement à {config.livretAInterestRate || 3.0}% net sans impôt
            </div>
          </div>

          {/* 4. Trésorerie minimale compte courant */}
          <div
            className={`p-4 rounded-xl border ${
              forecast.summary.hasAlert
                ? 'bg-rose-950/30 border-rose-500/40'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider block flex items-center gap-1 text-slate-400">
              {forecast.summary.hasAlert ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              )}
              Point bas Compte Courant
            </span>
            <div
              className={`text-2xl font-extrabold mt-1 ${
                forecast.summary.lowestCheckingBalance < 0
                  ? 'text-rose-400'
                  : forecast.summary.hasAlert
                  ? 'text-amber-400'
                  : 'text-blue-300'
              }`}
            >
              {formatCurrency(forecast.summary.lowestCheckingBalance)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {forecast.summary.hasAlert ? (
                <span className="text-rose-400 font-medium">Attention : risque de découvert</span>
              ) : (
                <span>Trésorerie saine ({forecast.summary.lowestCheckingDate})</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Graphique de projection temporelle */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Trajectoire prévisionnelle mois par mois</span>
            </h3>
            <p className="text-xs text-slate-400">
              Projection sur {config.horizonMonths} mois basée sur vos salaires, charges récurrentes et versements d'épargne.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-400 inline-block" />
              <span className="text-slate-300">Total Projeté</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-400 inline-block" />
              <span className="text-slate-300">Livret A</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-400 inline-block" />
              <span className="text-slate-300">Compte Courant</span>
            </span>
          </div>
        </div>

        <div className="h-80 w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotalF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorLivretF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCourantF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
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
                formatter={(val: number) => [formatCurrency(val), '']}
              />
              <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="3 3" />
              <ReferenceLine
                y={config.checkingAlertThreshold}
                stroke="#f59e0b"
                strokeDasharray="2 2"
                label={{ value: 'Seuil sécurité', fill: '#f59e0b', fontSize: 10 }}
              />

              <Area
                type="monotone"
                dataKey="totalBalance"
                name="Patrimoine Total"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotalF)"
              />
              <Area
                type="monotone"
                dataKey="savingsBalance"
                name="Livret A"
                stroke="#14b8a6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLivretF)"
              />
              <Area
                type="monotone"
                dataKey="checkingBalance"
                name="Compte Courant"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCourantF)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Panneau de simulation interactive "Et si..." (What-If Analysis) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Simulateur interactif « Et si... »</span>
            </h3>
            <p className="text-xs text-slate-400">
              Modifiez les paramètres en direct pour voir immédiatement l'impact sur vos économies futures.
            </p>
          </div>
          <button
            onClick={resetAdjustments}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition self-start sm:self-auto"
          >
            Réinitialiser les ajustements
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          
          {/* Ajustement 1 : Virement mensuel Livret A */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Virement mensuel vers Livret A :
              </label>
              <span className="text-xs font-bold text-teal-400">
                {formatCurrency(effectiveMonthlyTransfer, { hideDecimals: true })} / mois
              </span>
            </div>
            <input
              type="range"
              min={-baseMonthlyTransfer}
              max={1500}
              step={25}
              value={config.extraMonthlySavingsTransfer}
              onChange={(e) =>
                onUpdateConfig({
                  ...config,
                  extraMonthlySavingsTransfer: parseFloat(e.target.value),
                })
              }
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0 €</span>
              <span>Ajustement : {config.extraMonthlySavingsTransfer >= 0 ? `+${config.extraMonthlySavingsTransfer}€` : `${config.extraMonthlySavingsTransfer}€`}</span>
              <span>+1 500 €</span>
            </div>
          </div>

          {/* Ajustement 2 : Variation de salaire / revenus */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Variation des revenus (salaire / prime) :
              </label>
              <span className="text-xs font-bold text-emerald-400">
                {config.extraMonthlyIncome >= 0 ? `+${config.extraMonthlyIncome} €` : `${config.extraMonthlyIncome} €`}
              </span>
            </div>
            <input
              type="range"
              min={-1000}
              max={2000}
              step={50}
              value={config.extraMonthlyIncome}
              onChange={(e) =>
                onUpdateConfig({
                  ...config,
                  extraMonthlyIncome: parseFloat(e.target.value),
                })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>-1 000 €</span>
              <span>Variation mensuelle</span>
              <span>+2 000 €</span>
            </div>
          </div>

          {/* Ajustement 3 : Variation des dépenses */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Variation des dépenses mensuelles :
              </label>
              <span className="text-xs font-bold text-rose-400">
                {config.extraMonthlyExpenses >= 0 ? `+${config.extraMonthlyExpenses} €` : `${config.extraMonthlyExpenses} €`}
              </span>
            </div>
            <input
              type="range"
              min={-800}
              max={1500}
              step={50}
              value={config.extraMonthlyExpenses}
              onChange={(e) =>
                onUpdateConfig({
                  ...config,
                  extraMonthlyExpenses: parseFloat(e.target.value),
                })
              }
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>-800 € (Économies)</span>
              <span>Variation</span>
              <span>+1 500 € (Inflation)</span>
            </div>
          </div>

          {/* Ajustement 4 : Taux du Livret A */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Taux d'intérêt Livret A :
              </label>
              <span className="text-xs font-bold text-emerald-400">
                {config.livretAInterestRate || 3.0} %
              </span>
            </div>
            <input
              type="range"
              min={1.0}
              max={6.0}
              step={0.25}
              value={config.livretAInterestRate || 3.0}
              onChange={(e) =>
                onUpdateConfig({
                  ...config,
                  livretAInterestRate: parseFloat(e.target.value),
                })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>1.0%</span>
              <span>Officiel : 3.0%</span>
              <span>6.0%</span>
            </div>
          </div>

          {/* Ajustement 5 : Seuil de sécurité compte courant */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Seuil de sécurité d'alerte :
              </label>
              <span className="text-xs font-bold text-amber-400">
                {config.checkingAlertThreshold} €
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1000}
              step={50}
              value={config.checkingAlertThreshold}
              onChange={(e) =>
                onUpdateConfig({
                  ...config,
                  checkingAlertThreshold: parseFloat(e.target.value),
                })
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0 €</span>
              <span>Matelas de sécurité</span>
              <span>1 000 €</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
