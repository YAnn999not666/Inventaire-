import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, X, CheckSquare, Square } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (saveToHistory: boolean) => void;
  totalArticles: number;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
  totalArticles,
}) => {
  const [saveToHistory, setSaveToHistory] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-amber-500 text-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold">
            <AlertTriangle className="w-5 h-5 text-slate-950" />
            <h3 className="text-lg">Réinitialiser la feuille ?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-amber-600/30 text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            Cette action va remettre <strong className="text-slate-900">toutes les quantités à 0</strong> pour démarrer une nouvelle journée.
          </p>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 text-xs sm:text-sm">
            💡 <strong>Vos catégories et tranches de prix restent conservées.</strong> Seules les quantités saisies repartent à zéro.
          </div>

          {/* Option to Save to History */}
          <div
            onClick={() => setSaveToHistory(!saveToHistory)}
            className="flex items-start space-x-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors select-none"
          >
            <button type="button" className="mt-0.5 text-emerald-600">
              {saveToHistory ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </button>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-slate-800 block">
                Sauvegarder l'inventaire actuel dans l'historique
              </span>
              <span className="text-slate-500">
                Conserve une copie de l'inventaire d'aujourd'hui ({totalArticles} articles).
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmReset(saveToHistory);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Oui, réinitialiser tout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
