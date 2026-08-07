import React from 'react';
import { X, HelpCircle, Plus, Minus, FileText, RotateCcw } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold">Comment utiliser l'application ?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-slate-700 text-sm leading-relaxed max-h-[75vh] overflow-y-auto">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 font-bold">
              1
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">Saisie des ventes</strong>
              Pour chaque tranche de prix, cliquez sur le bouton <strong className="text-emerald-700">+</strong> ou <strong className="text-rose-700">-</strong> pour ajuster la quantité. Vous pouvez aussi cliquer directement sur la case chiffrée pour taper un nombre au clavier.
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 font-bold">
              2
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">Ajouter des articles ou prix</strong>
              Utilisez le bouton <strong className="text-emerald-700 font-bold">+ Catégorie</strong> pour ajouter un nouveau type d'article, ou <strong className="text-emerald-700 font-bold">+ Prix</strong> dans une catégorie pour ajouter un nouveau tarif.
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 font-bold">
              3
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">Générer le PDF ou WhatsApp</strong>
              En fin de journée, cliquez sur <strong className="text-emerald-700 font-bold">Générer le PDF</strong> pour télécharger le document récapitulatif ou le partager directement sur WhatsApp.
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 font-bold">
              4
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">Réinitialiser pour le lendemain</strong>
              Cliquez sur <strong className="text-amber-700 font-bold">Réinitialiser la feuille</strong> pour remettre toutes les quantités à 0. Vos catégories et tranches de prix restent intactes !
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
            💡 <strong>Remarque :</strong> Cet outil ne calcule aucun montant ni sous-total. Il enregistre uniquement le nombre d'articles vendus par tranche de prix.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors"
          >
            J'ai compris !
          </button>
        </div>
      </div>
    </div>
  );
};
