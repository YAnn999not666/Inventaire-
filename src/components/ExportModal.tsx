import React, { useState, useEffect, useMemo } from 'react';
import { X, FileText, Download, Share2, Copy, Check, MessageSquare, Eye, ExternalLink } from 'lucide-react';
import { Category } from '../types';
import { generateInventoryPdf, generateWhatsAppSummary, formatFrenchDate, formatPrice } from '../utils/pdfGenerator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedDate: string;
  onAutoSaveToHistory?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  categories,
  selectedDate,
  onAutoSaveToHistory,
}) => {
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<'pdf' | 'text'>('pdf');

  useEffect(() => {
    if (isOpen && onAutoSaveToHistory) {
      onAutoSaveToHistory();
    }
  }, [isOpen]);

  // Generate live PDF blob URL for interactive iframe preview
  const pdfPreviewUrl = useMemo(() => {
    if (!isOpen) return '';
    try {
      const { doc } = generateInventoryPdf(categories, selectedDate);
      const blob = doc.output('blob');
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error('Error generating PDF preview URL:', e);
      return '';
    }
  }, [isOpen, categories, selectedDate]);

  // Clean up Blob URL when modal unmounts/closes
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  if (!isOpen) return null;

  const activeCategories = categories
    .map((cat) => {
      const activeTiers = cat.tiers.filter((t) => t.quantity > 0);
      const catTotal = activeTiers.reduce((acc, t) => acc + t.quantity, 0);
      return {
        ...cat,
        activeTiers,
        catTotal,
      };
    })
    .filter((cat) => cat.activeTiers.length > 0);

  const grandTotal = activeCategories.reduce((acc, cat) => acc + cat.catTotal, 0);
  const formattedDate = formatFrenchDate(selectedDate);
  const whatsappSummaryText = generateWhatsAppSummary(categories, selectedDate);

  const handleDownloadPdf = () => {
    if (onAutoSaveToHistory) onAutoSaveToHistory();
    const { doc, filename } = generateInventoryPdf(categories, selectedDate);
    doc.save(filename);
  };

  const handleOpenPdfNewTab = () => {
    if (pdfPreviewUrl) {
      window.open(pdfPreviewUrl, '_blank');
    }
  };

  const handleShareWhatsApp = async () => {
    if (onAutoSaveToHistory) onAutoSaveToHistory();
    const { doc, filename } = generateInventoryPdf(categories, selectedDate);
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Inventaire du jour - ${selectedDate}`,
          text: `Inventaire du jour (${formattedDate})`,
        });
        return;
      } catch (e) {
        console.log('File sharing skipped or failed', e);
      }
    }

    const encodedText = encodeURIComponent(whatsappSummaryText);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const handleCopyText = () => {
    if (onAutoSaveToHistory) onAutoSaveToHistory();
    navigator.clipboard.writeText(whatsappSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold">Prévisualiser & Exporter L'Inventaire</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Date de l'inventaire</span>
            <span className="text-sm sm:text-base font-bold text-slate-900">{formattedDate}</span>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
            <span className="text-xs text-slate-500 font-medium">Total articles :</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-700 font-mono bg-emerald-100 px-3 py-0.5 rounded-lg border border-emerald-200">
              {grandTotal} {grandTotal > 1 ? 'unités' : 'unité'}
            </span>
          </div>
        </div>

        {/* View Mode Toggle Bar */}
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewTab('pdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                previewTab === 'pdf'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aperçu PDF Direct</span>
            </button>
            <button
              onClick={() => setPreviewTab('text')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                previewTab === 'text'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
              <span>Aperçu Texte</span>
            </button>
          </div>

          {pdfPreviewUrl && previewTab === 'pdf' && (
            <button
              onClick={handleOpenPdfNewTab}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center space-x-1"
            >
              <span>Plein écran</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Preview Container */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 min-h-[260px]">
          {activeCategories.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
              ⚠️ Aucune quantité supérieure à 0 enregistrée.
              <br />
              Veuillez d'abord saisir au moins une quantité.
            </div>
          ) : previewTab === 'pdf' && pdfPreviewUrl ? (
            /* PDF Live Iframe Viewer */
            <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-200">
              <iframe
                src={pdfPreviewUrl}
                title="Aperçu PDF de l'inventaire"
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            /* Structured Text Breakdown Preview */
            <div className="space-y-3 bg-slate-900 text-slate-100 p-3 sm:p-4 rounded-2xl font-mono text-xs border border-slate-800 shadow-inner">
              <div className="text-emerald-400 font-bold text-xs sm:text-sm mb-2 border-b border-slate-800 pb-1.5 flex flex-wrap justify-between gap-1">
                <span>INVENTAIRE DU JOUR — {selectedDate}</span>
                <span>TOTAL: {grandTotal} unit.</span>
              </div>
              {activeCategories.map((cat) => (
                <div key={cat.id} className="space-y-1 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="font-bold text-slate-200 uppercase tracking-wide flex items-center justify-between gap-2">
                    <span className="break-words min-w-0 flex-1">📦 [{cat.name}]</span>
                    <span className="text-emerald-400 shrink-0 whitespace-nowrap">Total: {cat.catTotal} u.</span>
                  </div>
                  {cat.activeTiers.map((tier) => (
                    <div key={tier.id} className="pl-3 text-slate-300 flex justify-between gap-2">
                      <span className="whitespace-nowrap">• {formatPrice(tier.price)} FCFA</span>
                      <span className="text-emerald-300 font-bold shrink-0 whitespace-nowrap">
                        — {tier.quantity} unité{tier.quantity > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Download PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={activeCategories.length === 0}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              <span>Télécharger le PDF</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              disabled={activeCategories.length === 0}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageSquare className="w-5 h-5 text-emerald-300" />
              <span>Partager sur WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleCopyText}
              disabled={activeCategories.length === 0}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1 py-1 px-2 rounded-lg hover:bg-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Texte copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier le texte au presse-papier</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 px-3"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
