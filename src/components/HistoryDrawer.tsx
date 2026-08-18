import React, { useState } from 'react';
import { X, History, FileText, Trash2, Calendar, Download, Share2, Copy, Check, MessageSquare, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { SavedInventoryRecord } from '../types';
import { generateInventoryPdf, generateWhatsAppSummary, formatPrice } from '../utils/pdfGenerator';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedRecords: SavedInventoryRecord[];
  onLoadRecord: (record: SavedInventoryRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedRecords,
  onLoadRecord,
  onDeleteRecord,
  onClearHistory,
}) => {
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [previewPdfRecord, setPreviewPdfRecord] = useState<SavedInventoryRecord | null>(null);

  if (!isOpen) return null;

  const handleDownloadPdf = (record: SavedInventoryRecord) => {
    const { doc, filename } = generateInventoryPdf(record.categories, record.date);
    doc.save(filename);
  };

  const handlePreviewPdf = (record: SavedInventoryRecord) => {
    const { doc } = generateInventoryPdf(record.categories, record.date);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleShareWhatsApp = (record: SavedInventoryRecord) => {
    const summaryText = generateWhatsAppSummary(record.categories, record.date);
    const encodedText = encodeURIComponent(summaryText);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold">Historique des Inventaires</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {savedRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <History className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-base font-semibold text-slate-600">Aucun inventaire dans l'historique.</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Chaque fois que vous générez un PDF ou réinitialisez la feuille, l'inventaire est conservé ici.
              </p>
            </div>
          ) : (
            savedRecords.map((record) => {
              const isExpanded = expandedRecordId === record.id;
              const activeCats = record.categories
                .map((cat) => {
                  const activeTiers = cat.tiers.filter((t) => t.quantity > 0);
                  const catTotal = activeTiers.reduce((sum, t) => sum + t.quantity, 0);
                  return {
                    ...cat,
                    activeTiers,
                    catTotal,
                  };
                })
                .filter((cat) => cat.activeTiers.length > 0);

              return (
                <div
                  key={record.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-emerald-300 transition-colors shadow-2xs"
                >
                  {/* Record Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-900 text-sm break-words">{record.formattedDate}</span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                        Total : {record.totalQuantity} {record.totalQuantity > 1 ? 'unités' : 'unité'}
                      </span>
                      <button
                        onClick={() => onDeleteRecord(record.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                        title="Supprimer cet élément de l'historique"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    Enregistré le : {new Date(record.savedAt).toLocaleDateString('fr-FR')} à {new Date(record.savedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Toggle Detailed View */}
                  <button
                    onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                    className="w-full text-left py-1 text-xs font-semibold text-emerald-700 hover:underline flex items-center justify-between"
                  >
                    <span>{isExpanded ? 'Masquer le détail' : 'Consulter le détail du contenu'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
                      {activeCats.length === 0 ? (
                        <div className="text-slate-400 italic">Aucun produit renseigné.</div>
                      ) : (
                        activeCats.map((cat) => (
                          <div key={cat.id} className="space-y-1 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                            <div className="font-bold text-emerald-400 uppercase flex items-center justify-between gap-2">
                              <span className="break-words min-w-0 flex-1">[{cat.name}]</span>
                              <span className="text-slate-300 font-normal shrink-0 whitespace-nowrap">Total: {cat.catTotal} u.</span>
                            </div>
                            {cat.activeTiers.map((t) => (
                              <div key={t.id} className="pl-2 text-slate-200 flex justify-between gap-2">
                                <span className="whitespace-nowrap">• {formatPrice(t.price)} FCFA</span>
                                <span className="font-bold text-emerald-300 shrink-0 whitespace-nowrap">
                                  — {t.quantity} {t.quantity > 1 ? 'unités' : 'unité'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Action Buttons: Preview, Load, PDF, Share */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handlePreviewPdf(record)}
                      className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1 shadow-2xs"
                      title="Aperçu du PDF"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Aperçu</span>
                    </button>

                    <button
                      onClick={() => {
                        onLoadRecord(record);
                        onClose();
                      }}
                      className="py-2 px-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center space-x-1 shadow-2xs"
                      title="Saisir ou modifier cet inventaire"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>Saisir</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPdf(record)}
                      className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1 shadow-2xs"
                      title="Télécharger le PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(record)}
                      className="py-2 px-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1 shadow-2xs"
                      title="Partager sur WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {savedRecords.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">
              {savedRecords.length} enregistrement{savedRecords.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              Vider tout l'historique
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
