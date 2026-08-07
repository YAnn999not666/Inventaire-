import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { Category } from '../types';

interface HeaderProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  categories: Category[];
  totalArticles: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  setSelectedDate,
  categories,
  totalArticles,
  onOpenHistory,
}) => {
  const handlePrevDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day - 1);
    setSelectedDate(dateObj.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day + 1);
    setSelectedDate(dateObj.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Calculate detailed category breakdown
  const categoryTotals = categories
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      total: cat.tiers.reduce((sum, t) => sum + (t.quantity || 0), 0),
    }))
    .filter((c) => c.total > 0);

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6">
        {/* Top bar: Title & History Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Inventaire Quotidien
            </h1>
          </div>

          <button
            onClick={onOpenHistory}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center space-x-1.5 border border-slate-700/80 active:scale-95"
            title="Historique des inventaires"
            aria-label="Historique"
          >
            <History className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold hidden sm:inline">Historique</span>
          </button>
        </div>

        {/* Date Selector */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 bg-slate-800/90 rounded-2xl p-1.5 border border-slate-700/60 shadow-inner w-full sm:w-auto">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors active:scale-95"
              title="Jour précédent"
              aria-label="Jour précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 flex items-center justify-center space-x-2 px-2">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors active:scale-95"
              title="Jour suivant"
              aria-label="Jour suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {!isToday && (
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
              >
                Aujourd'hui
              </button>
            )}
          </div>
        </div>

        {/* Category Breakdown & Grand Total Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Récapitulatif par catégorie :
            </span>
            <div className="bg-emerald-950/90 border border-emerald-500/50 px-2.5 py-1 rounded-xl flex items-center space-x-1.5 shrink-0">
              <span className="text-xs font-bold text-emerald-200">Total général :</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">
                {totalArticles} {totalArticles > 1 ? 'unités' : 'unité'}
              </span>
            </div>
          </div>

          {categoryTotals.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-2 bg-slate-800/50 px-3 rounded-xl border border-slate-800">
              Aucun produit saisi pour l'instant.
            </div>
          ) : (
            <div className="space-y-1.5 bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 max-h-48 overflow-y-auto">
              {categoryTotals.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-900/90 text-xs hover:bg-slate-900 border border-slate-700/80 transition-colors"
                >
                  <span className="font-semibold text-slate-200 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{cat.name}</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    {cat.total} {cat.total > 1 ? 'unités' : 'unité'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
