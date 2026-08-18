import React, { useState } from 'react';
import { Plus, Minus, Trash2, Edit2, Check, X, Tag } from 'lucide-react';
import { Category, PriceTier } from '../types';
import { formatPrice } from '../utils/pdfGenerator';

interface CategoryCardProps {
  category: Category;
  onUpdateQuantity: (categoryId: string, tierId: string, quantity: number) => void;
  onAddTier: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteTier: (categoryId: string, tierId: string) => void;
  onRenameCategory: (categoryId: string, newName: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onUpdateQuantity,
  onAddTier,
  onDeleteCategory,
  onDeleteTier,
  onRenameCategory,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(category.name);

  const totalCategoryItems = category.tiers.reduce((acc, tier) => acc + (tier.quantity || 0), 0);

  const handleSaveName = () => {
    if (editedName.trim()) {
      onRenameCategory(category.id, editedName.trim());
      setIsEditingName(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') {
      setEditedName(category.name);
      setIsEditingName(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow overflow-hidden">
      {/* Category Card Header */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-3 sm:px-5 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          <div className="p-2 rounded-xl bg-slate-200/80 text-slate-700 shrink-0">
            <Tag className="w-4 h-4" />
          </div>

          {isEditingName ? (
            <div className="flex items-center space-x-1.5 flex-1 w-full max-w-sm">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full px-2.5 py-1 text-sm sm:text-base font-bold text-slate-800 bg-white border-2 border-emerald-500 rounded-lg focus:outline-none"
              />
              <button
                onClick={handleSaveName}
                className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shrink-0"
                title="Enregistrer"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditedName(category.name);
                  setIsEditingName(false);
                }}
                className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 shrink-0"
                title="Annuler"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 break-words leading-tight">
                {category.name}
              </h2>
              {totalCategoryItems > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 whitespace-nowrap">
                  {totalCategoryItems} {totalCategoryItems > 1 ? 'unités' : 'unité'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Category Controls */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => onAddTier(category.id)}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-semibold flex items-center space-x-1 border border-emerald-200/80 transition-colors"
            title="Ajouter une tranche de prix"
          >
            <Plus className="w-4 h-4" />
            <span className="inline">Prix</span>
          </button>

          {!isEditingName && (
            <button
              onClick={() => {
                setEditedName(category.name);
                setIsEditingName(true);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Renommer la catégorie"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onDeleteCategory(category.id)}
            className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Supprimer la catégorie"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price Tiers List */}
      <div className="divide-y divide-slate-100 p-2 sm:p-3">
        {category.tiers.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            Aucune tranche de prix configurée.
            <br />
            <button
              onClick={() => onAddTier(category.id)}
              className="mt-2 text-emerald-600 font-semibold hover:underline"
            >
              + Ajouter une tranche de prix
            </button>
          </div>
        ) : (
          category.tiers.map((tier) => (
            <PriceTierRow
              key={tier.id}
              tier={tier}
              onIncrement={() => onUpdateQuantity(category.id, tier.id, tier.quantity + 1)}
              onDecrement={() => onUpdateQuantity(category.id, tier.id, Math.max(0, tier.quantity - 1))}
              onChangeQuantity={(val) => onUpdateQuantity(category.id, tier.id, val)}
              onDelete={() => onDeleteTier(category.id, tier.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface PriceTierRowProps {
  tier: PriceTier;
  onIncrement: () => void;
  onDecrement: () => void;
  onChangeQuantity: (value: number) => void;
  onDelete: () => void;
}

const PriceTierRow: React.FC<PriceTierRowProps> = ({
  tier,
  onIncrement,
  onDecrement,
  onChangeQuantity,
  onDelete,
}) => {
  const isFilled = tier.quantity > 0;

  return (
    <div
      className={`flex items-center justify-between gap-1.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl transition-colors ${
        isFilled ? 'bg-emerald-50/60 border border-emerald-100' : 'hover:bg-slate-50'
      }`}
    >
      {/* Price Label */}
      <div className="flex items-baseline space-x-1 sm:space-x-1.5 min-w-0 pr-1 shrink-0">
        <span className="text-base sm:text-lg font-extrabold text-slate-800 font-mono tracking-tight whitespace-nowrap">
          {formatPrice(tier.price)}
        </span>
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">FCFA</span>
      </div>

      {/* Quantity Adjustment Controls */}
      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        {/* Decrement (-) Button */}
        <button
          onClick={onDecrement}
          disabled={tier.quantity <= 0}
          className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl active:scale-95 transition-all select-none ${
            tier.quantity <= 0
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : 'bg-rose-100 text-rose-700 hover:bg-rose-200 active:bg-rose-300 border border-rose-200 shadow-2xs'
          }`}
          title="Diminuer la quantité (-1)"
          aria-label="Diminuer"
        >
          <Minus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </button>

        {/* Editable Numeric Input Field */}
        <div className="relative">
          <input
            type="number"
            min="0"
            step="1"
            value={tier.quantity === 0 ? '' : tier.quantity}
            placeholder="0"
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChangeQuantity(isNaN(val) ? 0 : Math.max(0, val));
            }}
            className={`w-12 sm:w-14 md:w-16 h-10 sm:h-11 md:h-12 text-center text-base sm:text-lg md:text-xl font-extrabold rounded-xl border-2 transition-all font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isFilled
                ? 'bg-white border-emerald-500 text-emerald-900 shadow-2xs'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
            aria-label={`Quantité pour ${tier.price} FCFA`}
          />
        </div>

        {/* Increment (+) Button */}
        <button
          onClick={onIncrement}
          className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center font-bold text-lg sm:text-xl shadow-xs active:shadow-none border border-emerald-700 select-none"
          title="Augmenter la quantité (+1)"
          aria-label="Augmenter"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </button>

        {/* Delete Tier Button */}
        <button
          onClick={onDelete}
          className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          title="Supprimer cette tranche de prix"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};
