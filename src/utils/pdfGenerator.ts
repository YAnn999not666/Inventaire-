import { jsPDF } from 'jspdf';
import { Category } from '../types';

export function formatPrice(price: number): string {
  // Format with thousands separator using standard spaces to avoid PDF font rendering issues (/ or missing glyphs)
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatFrenchDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  } catch {
    return dateString;
  }
}

export function generateInventoryPdf(categories: Category[], selectedDate: string): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const formattedDate = formatFrenchDate(selectedDate);
  const dateFormattedShort = selectedDate.split('-').reverse().join('/');
  const filename = `Inventaire_${selectedDate}.pdf`;

  // Colors
  const primaryColor = [30, 41, 59]; // Slate 800
  const secondaryColor = [71, 85, 105]; // Slate 600
  const accentColor = [15, 118, 110]; // Teal 700
  const lightBg = [248, 250, 252]; // Slate 50

  let y = 18;

  // Header Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(14, y, 182, 30, 3, 3, 'F');
  
  // Title
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Inventaire du jour', 20, y + 11);

  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Date : ${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)} (${dateFormattedShort})`, 20, y + 21);

  y += 38;

  // Filter categories that have at least one tier with quantity > 0
  const activeCategories = categories
    .map(cat => {
      const activeTiers = cat.tiers.filter(t => t.quantity > 0);
      const catTotal = activeTiers.reduce((acc, t) => acc + t.quantity, 0);
      return {
        ...cat,
        activeTiers,
        catTotal,
      };
    })
    .filter(cat => cat.activeTiers.length > 0);

  const grandTotal = activeCategories.reduce((acc, cat) => acc + cat.catTotal, 0);

  if (activeCategories.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Aucun produit enregistré pour cette journée.', 20, y + 10);
  } else {
    activeCategories.forEach((cat) => {
      // Check page height limit
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      // Category Title Header with category total
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      
      const catTotalText = `Total : ${cat.catTotal} unité${cat.catTotal > 1 ? 's' : ''}`;
      const totalWidth = doc.getTextWidth(catTotalText);
      const maxTitleWidth = 182 - totalWidth - 10;
      const titleLines = doc.splitTextToSize(cat.name.toUpperCase(), maxTitleWidth);
      const boxHeight = Math.max(9, titleLines.length * 4.5 + 4);

      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.roundedRect(14, y, 182, boxHeight, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.text(titleLines, 18, y + 5.5);

      doc.text(catTotalText, 190, y + 5.5, { align: 'right' });

      y += boxHeight + 4;

      // Table of Tiers
      cat.activeTiers.forEach((tier) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.line(18, y + 5, 192, y + 5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        
        // Format: [Prix] FCFA — [Quantité] unité(s)
        const priceLabel = `${formatPrice(tier.price)} FCFA`;
        const unitText = `${tier.quantity} unité${tier.quantity > 1 ? 's' : ''}`;
        
        doc.text(priceLabel, 22, y + 2);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(`—   ${unitText}`, 85, y + 2);

        y += 8;
      });

      y += 6; // Spacing after category
    });

    // Grand Total Summary Box at the end
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    y += 4;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(14, y, 182, 12, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL GÉNÉRAL DES PRODUITS', 20, y + 8);
    doc.text(`${grandTotal} unité${grandTotal > 1 ? 's' : ''}`, 190, y + 8, { align: 'right' });
  }

  // Footer (Page numbers)
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      `Document d'inventaire — Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
      20,
      287
    );
    doc.text(`Page ${i} / ${pageCount}`, 180, 287, { align: 'right' });
  }

  return { doc, filename };
}

export function generateWhatsAppSummary(categories: Category[], selectedDate: string): string {
  const formattedDate = formatFrenchDate(selectedDate);
  const activeCategories = categories
    .map(cat => {
      const activeTiers = cat.tiers.filter(t => t.quantity > 0);
      const catTotal = activeTiers.reduce((acc, t) => acc + t.quantity, 0);
      return {
        ...cat,
        activeTiers,
        catTotal,
      };
    })
    .filter(cat => cat.activeTiers.length > 0);

  const grandTotal = activeCategories.reduce((acc, cat) => acc + cat.catTotal, 0);

  let text = `📋 *INVENTAIRE DU JOUR*\n📅 ${formattedDate}\n\n`;

  if (activeCategories.length === 0) {
    text += `*Aucun produit enregistré pour ce jour.*`;
  } else {
    activeCategories.forEach(cat => {
      text += `📦 *${cat.name.toUpperCase()}* (Total: ${cat.catTotal} unit${cat.catTotal > 1 ? 'és' : 'é'})\n`;
      cat.activeTiers.forEach(tier => {
        text += `• ${formatPrice(tier.price)} FCFA — ${tier.quantity} unité${tier.quantity > 1 ? 's' : ''}\n`;
      });
      text += `\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📊 *TOTAL GÉNÉRAL : ${grandTotal} unité${grandTotal > 1 ? 's' : ''}*`;
  }

  return text;
}
