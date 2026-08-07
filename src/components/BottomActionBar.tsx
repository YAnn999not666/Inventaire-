import React from 'react';
import { FileText, RotateCcw } from 'lucide-react';

interface BottomActionBarProps {
  onOpenPdfExport: () => void;
  onOpenResetConfirm: () => void;
  totalArticles: number;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  onOpenPdfExport,
  onOpenResetConfirm,
  totalArticles,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Reset Button */}
        <button
          onClick={onOpenResetConfirm}
          className="flex-1 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-amber-400 font-bold rounded-2xl text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-sm"
          title="Remettre les quantités à zéro"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span className="truncate">Réinitialiser</span>
        </button>

        {/* Generate PDF Button (Primary CTA) */}
        <button
          onClick={onOpenPdfExport}
          className="flex-2 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center space-x-2 active:scale-95 border border-emerald-500"
          title="Générer le rapport PDF d'inventaire"
        >
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="truncate">Générer le PDF</span>
        </button>
      </div>
    </div>
  );
};
