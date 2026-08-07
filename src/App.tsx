import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryCard } from './components/CategoryCard';
import { AddCategoryModal } from './components/AddCategoryModal';
import { AddTierModal } from './components/AddTierModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { ExportModal } from './components/ExportModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { BottomActionBar } from './components/BottomActionBar';
import { Category, PriceTier, SavedInventoryRecord } from './types';
import { INITIAL_CATEGORIES } from './initialData';
import { formatFrenchDate } from './utils/pdfGenerator';
import { Search, Plus, Filter } from 'lucide-react';

const STORAGE_KEY_CATEGORIES = 'inventaire_boutique_categories_v1';
const STORAGE_KEY_HISTORY = 'inventaire_boutique_history_v1';

export default function App() {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading categories from localStorage:', e);
    }
    return INITIAL_CATEGORIES;
  });

  const [savedRecords, setSavedRecords] = useState<SavedInventoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading history from localStorage:', e);
    }
    return [];
  });

  // Load daily quantities from localStorage whenever selectedDate or categories change
  useEffect(() => {
    try {
      const dailyKey = `inventaire_quantities_${selectedDate}`;
      const savedQuantities = localStorage.getItem(dailyKey);
      if (savedQuantities) {
        const qtyMap: Record<string, number> = JSON.parse(savedQuantities);
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            tiers: cat.tiers.map((t) => ({
              ...t,
              quantity: qtyMap[t.id] !== undefined ? qtyMap[t.id] : 0,
            })),
          }))
        );
      }
    } catch (e) {
      console.error('Error loading daily quantities:', e);
    }
  }, [selectedDate]);

  // Persist category structure (names and price tiers) to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  }, [categories]);

  // Modals state
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [addTierModalState, setAddTierModalState] = useState<{
    isOpen: boolean;
    categoryId: string;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: '',
    categoryName: '',
  });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyShowActive, setOnlyShowActive] = useState(false);

  // Calculate total articles count across all categories
  const totalArticles = categories.reduce(
    (acc, cat) => acc + cat.tiers.reduce((tAcc, t) => tAcc + (t.quantity || 0), 0),
    0
  );

  // Helper to persist current quantities for active date
  const saveDailyQuantities = (updatedCategories: Category[]) => {
    try {
      const qtyMap: Record<string, number> = {};
      updatedCategories.forEach((cat) => {
        cat.tiers.forEach((t) => {
          qtyMap[t.id] = t.quantity || 0;
        });
      });
      localStorage.setItem(`inventaire_quantities_${selectedDate}`, JSON.stringify(qtyMap));
    } catch (e) {
      console.error('Error persisting daily quantities:', e);
    }
  };

  // Helper to save current state to history
  const handleAutoSaveToHistory = () => {
    if (totalArticles === 0) return;
    const newRecord: SavedInventoryRecord = {
      id: `rec-${selectedDate}-${Date.now()}`,
      date: selectedDate,
      formattedDate: formatFrenchDate(selectedDate),
      totalQuantity: totalArticles,
      categories: JSON.parse(JSON.stringify(categories)),
      savedAt: new Date().toISOString(),
    };

    // Filter out previous record for the exact same date to keep most recent snapshot for that date
    const updatedHistory = [newRecord, ...savedRecords.filter((r) => r.id !== newRecord.id && r.date !== selectedDate)];
    setSavedRecords(updatedHistory);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));
  };

  // Handler: Update quantity for a specific category + tier
  const handleUpdateQuantity = (categoryId: string, tierId: string, quantity: number) => {
    const updated = categories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        tiers: cat.tiers.map((tier) => (tier.id === tierId ? { ...tier, quantity } : tier)),
      };
    });
    setCategories(updated);
    saveDailyQuantities(updated);
  };

  // Handler: Add new Category
  const handleAddCategory = (categoryName: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: categoryName,
      tiers: [],
    };
    const updated = [...categories, newCategory];
    setCategories(updated);
    saveDailyQuantities(updated);
  };

  // Handler: Add new Price Tier to Category
  const handleAddTier = (price: number) => {
    const categoryId = addTierModalState.categoryId;
    if (!categoryId) return;

    const newTier: PriceTier = {
      id: `tier-${Date.now()}`,
      price,
      quantity: 0,
    };

    const updated = categories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      // Keep price tiers ordered descending by price
      const updatedTiers = [...cat.tiers, newTier].sort((a, b) => b.price - a.price);
      return {
        ...cat,
        tiers: updatedTiers,
      };
    });

    setCategories(updated);
    saveDailyQuantities(updated);
  };

  // Handler: Rename Category
  const handleRenameCategory = (categoryId: string, newName: string) => {
    const updated = categories.map((cat) =>
      cat.id === categoryId ? { ...cat, name: newName } : cat
    );
    setCategories(updated);
  };

  // Handler: Delete Category
  const handleDeleteCategory = (categoryId: string) => {
    const target = categories.find((c) => c.id === categoryId);
    if (!target) return;

    if (window.confirm(`Voulez-vous vraiment supprimer la catégorie "${target.name}" ?`)) {
      const updated = categories.filter((c) => c.id !== categoryId);
      setCategories(updated);
      saveDailyQuantities(updated);
    }
  };

  // Handler: Delete Price Tier
  const handleDeleteTier = (categoryId: string, tierId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const tier = category?.tiers.find((t) => t.id === tierId);
    if (!tier) return;

    if (window.confirm(`Supprimer la tranche de prix ${tier.price.toLocaleString('fr-FR')} FCFA ?`)) {
      const updated = categories.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          tiers: cat.tiers.filter((t) => t.id !== tierId),
        };
      });
      setCategories(updated);
      saveDailyQuantities(updated);
    }
  };

  // Handler: Confirm Reset Sheet
  const handleConfirmReset = (saveToHistory: boolean) => {
    if (saveToHistory && totalArticles > 0) {
      handleAutoSaveToHistory();
    }

    // Reset all quantities to 0
    const resetCategories = categories.map((cat) => ({
      ...cat,
      tiers: cat.tiers.map((t) => ({ ...t, quantity: 0 })),
    }));

    setCategories(resetCategories);
    saveDailyQuantities(resetCategories);
  };

  // Filter categories by search term and "only active" toggle
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.tiers.some((t) => t.price.toString().includes(searchTerm));

    if (!matchesSearch) return false;

    if (onlyShowActive) {
      return cat.tiers.some((t) => t.quantity > 0);
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-28 font-sans antialiased">
      {/* Top Header */}
      <Header
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        categories={categories}
        totalArticles={totalArticles}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-5 sm:px-6 space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une catégorie ou un prix..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded-md"
              >
                Effacer
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setOnlyShowActive(!onlyShowActive)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 ${
                onlyShowActive
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Saisies uniquement</span>
            </button>
          </div>
        </div>

        {/* Categories List */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
            <p className="text-base font-semibold text-slate-600">
              {searchTerm
                ? 'Aucune catégorie ou tranche de prix ne correspond à la recherche.'
                : 'Aucune catégorie disponible.'}
            </p>
            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors inline-flex items-center space-x-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une catégorie</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onUpdateQuantity={handleUpdateQuantity}
                onAddTier={(catId) =>
                  setAddTierModalState({
                    isOpen: true,
                    categoryId: catId,
                    categoryName: category.name,
                  })
                }
                onDeleteCategory={handleDeleteCategory}
                onDeleteTier={handleDeleteTier}
                onRenameCategory={handleRenameCategory}
              />
            ))}

            {/* Restored "+ Ajouter une nouvelle catégorie" button at the bottom of the list */}
            <div className="pt-2 text-center">
              <button
                onClick={() => setIsAddCategoryOpen(true)}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-emerald-700 font-bold text-sm rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-400 transition-all flex items-center justify-center space-x-2 shadow-2xs active:scale-[0.99]"
              >
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>Ajouter une nouvelle catégorie</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Bar */}
      <BottomActionBar
        onOpenPdfExport={() => setIsPdfExportOpen(true)}
        onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
        totalArticles={totalArticles}
      />

      {/* Modals & Overlays */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAddCategory={handleAddCategory}
      />

      <AddTierModal
        isOpen={addTierModalState.isOpen}
        categoryName={addTierModalState.categoryName}
        onClose={() => setAddTierModalState((prev) => ({ ...prev, isOpen: false }))}
        onAddTier={handleAddTier}
      />

      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirmReset={handleConfirmReset}
        totalArticles={totalArticles}
      />

      <ExportModal
        isOpen={isPdfExportOpen}
        onClose={() => setIsPdfExportOpen(false)}
        categories={categories}
        selectedDate={selectedDate}
        onAutoSaveToHistory={handleAutoSaveToHistory}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedRecords={savedRecords}
        onLoadRecord={(record) => {
          setSelectedDate(record.date);
          setCategories(record.categories);
        }}
        onDeleteRecord={(recId) => {
          const updated = savedRecords.filter((r) => r.id !== recId);
          setSavedRecords(updated);
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
        }}
        onClearHistory={() => {
          if (window.confirm("Voulez-vous vraiment effacer tout l'historique ?")) {
            setSavedRecords([]);
            localStorage.removeItem(STORAGE_KEY_HISTORY);
          }
        }}
      />
    </div>
  );
}
