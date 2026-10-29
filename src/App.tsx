import React, { useState, useEffect, useMemo } from 'react';
import { AppData, Transaction, RecurringTransaction, ForecastConfig, TransactionType } from './types/finance';
import { loadAppData, saveAppData, DEFAULT_DATA } from './utils/storage';
import { calculateAccountBalances } from './utils/calculations';
import { Header } from './components/Header';
import { AccountsOverview } from './components/AccountsOverview';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { ChartsView } from './components/ChartsView';
import { ForecastSimulator } from './components/ForecastSimulator';
import { RecurringManager } from './components/RecurringManager';

export const App: React.FC = () => {
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'charts' | 'forecast' | 'recurring'>('dashboard');
  
  // Contrôle de la modal de transaction
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<TransactionType>('expense');

  // Sauvegarde automatique dans le LocalStorage dès que appData change
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Calcul dynamique des soldes actuels en temps réel
  const balances = useMemo(() => {
    return calculateAccountBalances(appData.accounts, appData.transactions);
  }, [appData.accounts, appData.transactions]);

  // Ajouter une transaction
  const handleAddTransaction = (
    txData: Omit<Transaction, 'id'>,
    addToRecurring?: { dayOfMonth: number }
  ) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    };

    let updatedRecurring = [...appData.recurring];

    if (addToRecurring) {
      const newRec: RecurringTransaction = {
        id: 'rec-' + Date.now(),
        title: txData.title,
        type: txData.type,
        amount: txData.amount,
        category: txData.category,
        accountId: txData.accountId,
        toAccountId: txData.toAccountId,
        dayOfMonth: addToRecurring.dayOfMonth,
        active: true,
      };
      updatedRecurring.push(newRec);
    }

    setAppData((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      recurring: updatedRecurring,
    }));
  };

  // Supprimer une transaction
  const handleDeleteTransaction = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  };

  // Modifier le solde initial d'un compte (ex: Livret A ou Compte Courant)
  const handleUpdateAccountInitialBalance = (
    accountId: string,
    newInitial: number,
    interestRate?: number
  ) => {
    setAppData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) => {
        if (acc.id === accountId) {
          return {
            ...acc,
            initialBalance: newInitial,
            interestRate: interestRate !== undefined ? interestRate : acc.interestRate,
          };
        }
        return acc;
      }),
    }));
  };

  // Mettre à jour la configuration du simulateur prévisionnel
  const handleUpdateForecastConfig = (newConfig: ForecastConfig) => {
    setAppData((prev) => ({
      ...prev,
      forecastConfig: newConfig,
    }));
  };

  // Basculer l'état d'activation d'une règle récurrente
  const handleToggleRecurringActive = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      recurring: prev.recurring.map((r) =>
        r.id === id ? { ...r, active: !r.active } : r
      ),
    }));
  };

  // Supprimer une règle récurrente
  const handleDeleteRecurring = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      recurring: prev.recurring.filter((r) => r.id !== id),
    }));
  };

  // Ajouter une règle récurrente
  const handleAddRecurring = (item: Omit<RecurringTransaction, 'id'>) => {
    const newRec: RecurringTransaction = {
      ...item,
      id: 'rec-' + Date.now(),
    };
    setAppData((prev) => ({
      ...prev,
      recurring: [...prev.recurring, newRec],
    }));
  };

  // Réinitialiser les données
  const handleResetData = () => {
    setAppData(DEFAULT_DATA);
    saveAppData(DEFAULT_DATA);
  };

  // Importer un fichier de données
  const handleImportData = (imported: AppData) => {
    setAppData(imported);
    saveAppData(imported);
  };

  const openNewTransaction = (type: TransactionType = 'expense') => {
    setModalInitialType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Header persistant */}
      <Header
        appData={appData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={openNewTransaction}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Contenu principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Vue 1 : Tableau de bord (Vue d'ensemble + Dernières opérations) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Cartes des comptes (Courant, Livret A, Patrimoine) */}
            <AccountsOverview
              accounts={appData.accounts}
              balances={balances}
              transactions={appData.transactions}
              onUpdateAccountInitialBalance={handleUpdateAccountInitialBalance}
              onOpenTransferModal={() => openNewTransaction('transfer')}
            />

            {/* Aperçu rapide des prévisions à 1 an */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  💡 Aperçu de vos prévisions futures
                </span>
                <p className="text-sm text-slate-200 mt-0.5">
                  Visualisez la trajectoire de votre Livret A et de votre compte courant sur 3 mois, 1 an ou 5 ans.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('forecast')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 whitespace-nowrap self-start sm:self-auto"
              >
                Ouvrir le simulateur →
              </button>
            </div>

            {/* Historique des transactions */}
            <TransactionList
              transactions={appData.transactions}
              accounts={appData.accounts}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenNewTransaction={openNewTransaction}
            />
          </div>
        )}

        {/* Vue 2 : Graphiques & Historique */}
        {activeTab === 'charts' && (
          <div className="animate-in fade-in">
            <ChartsView
              accounts={appData.accounts}
              transactions={appData.transactions}
              balances={balances}
            />
          </div>
        )}

        {/* Vue 3 : Prévisualisations & Simulateur */}
        {activeTab === 'forecast' && (
          <div className="animate-in fade-in">
            <ForecastSimulator
              accounts={appData.accounts}
              balances={balances}
              recurring={appData.recurring}
              config={appData.forecastConfig}
              onUpdateConfig={handleUpdateForecastConfig}
            />
          </div>
        )}

        {/* Vue 4 : Règles récurrentes */}
        {activeTab === 'recurring' && (
          <div className="animate-in fade-in">
            <RecurringManager
              recurring={appData.recurring}
              accounts={appData.accounts}
              onToggleActive={handleToggleRecurringActive}
              onDeleteRecurring={handleDeleteRecurring}
              onAddRecurring={handleAddRecurring}
            />
          </div>
        )}

      </main>

      {/* Modal d'ajout d'opération */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        accounts={appData.accounts}
        initialType={modalInitialType}
      />

      {/* Footer sobre */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <span>FinanceFlow — Gestion financière, Livret A et simulations patrimoniales</span>
        <span className="mx-2">•</span>
        <span>Données stockées localement en toute confidentialité</span>
      </footer>

    </div>
  );
};

export default App;
