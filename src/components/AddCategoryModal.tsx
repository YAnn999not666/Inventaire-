import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (categoryName: string) => void;
}

const PRESET_SUGGESTIONS = [
  'Bijoux',
  'Chapeaux',
  'Chaussettes',
  'Lingerie',
  'Pantalons',
  'T-Shirts',
  'Parfums',
  'Accessoires',
  'Casquettes',
  'Chaussons',
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
}) => {
  const [categoryName, setCategoryName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onAddCategory(categoryName.trim());
      setCategoryName('');
      onClose();
    }
  };

  const handleSelectPreset = (preset: string) => {
    onAddCategory(preset);
    setCategoryName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold">Ajouter une nouvelle catégorie</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nom de la catégorie :
            </label>
            <input
              type="text"
              placeholder="Ex: Bijoux, Pantalons..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 text-lg font-medium border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Preset Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Suggestions rapides :
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_SUGGESTIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 rounded-xl text-sm font-medium border border-slate-200 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!categoryName.trim()}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Créer la catégorie</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
