import React, { useRef } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  ArrowRightLeft, 
  Download, 
  Upload, 
  RotateCcw,
  TrendingUp,
  LayoutDashboard,
  PieChart,
  CalendarClock
} from 'lucide-react';
import { AppData } from '../types/finance';
import { exportToJsonFile } from '../utils/storage';

interface HeaderProps {
  appData: AppData;
  activeTab: 'dashboard' | 'charts' | 'forecast' | 'recurring';
  setActiveTab: (tab: 'dashboard' | 'charts' | 'forecast' | 'recurring') => void;
  onOpenNewTransaction: (type?: 'income' | 'expense' | 'transfer') => void;
  onImportData: (data: AppData) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appData,
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onImportData,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.accounts && parsed.transactions) {
          onImportData(parsed);
          alert('Données restaurées avec succès !');
        } else {
          alert('Format de fichier JSON invalide.');
        }
      } catch (err) {
        alert('Erreur lors de la lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Logo & Titre */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">FinanceFlow</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Courant & Livret A
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestion bancaire, épargne & simulations prévisionnelles
              </p>
            </div>
          </div>

          {/* Boutons d'actions rapides */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenNewTransaction('transfer')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 border border-teal-500/30 transition-colors shadow-sm"
              title="Effectuer un virement rapide vers le Livret A"
            >
              <ArrowRightLeft className="w-4 h-4 text-teal-400" />
              <span>Virement Livret A</span>
            </button>

            <button
              onClick={() => onOpenNewTransaction('income')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors shadow-sm"
              title="Ajouter un salaire ou une rentrée d'argent"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>+ Salaire / Revenu</span>
            </button>

            <button
              onClick={() => onOpenNewTransaction('expense')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition-colors shadow-sm"
              title="Ajouter une dépense ou un paiement"
            >
              <PlusCircle className="w-4 h-4 text-rose-400" />
              <span>+ Paiement</span>
            </button>

            {/* Menu utilitaires persistance */}
            <div className="flex items-center border-l border-slate-800 pl-2 ml-1 gap-1">
              <button
                onClick={() => exportToJsonFile(appData)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title="Exporter mes données en fichier JSON (sauvegarde locale)"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title="Importer des données depuis un fichier JSON"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                onClick={() => {
                  if (confirm('Voulez-vous réinitialiser les données avec l\'exemple de démonstration ?')) {
                    onResetData();
                  }
                }}
                className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Recharger les données de démonstration"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-800/80 pt-2 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tableau de bord</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'charts'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Graphiques & Analyse</span>
          </button>

          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'forecast'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Prévisualisations & Simulateur</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
              Futur
            </span>
          </button>

          <button
            onClick={() => setActiveTab('recurring')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'recurring'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            <span>Règles récurrentes</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
              {appData.recurring.filter((r) => r.active).length}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
