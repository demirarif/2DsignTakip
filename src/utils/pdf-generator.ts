import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Record, Stats } from '../types';
import logo from '../assets/2Dsign.png'; // ✅ senin logon
const LOGO_BASE64 = logo;

// Türkçe karakter desteği
const sanitizeText = (text?: string) => {
  if (!text) return '';
  return text
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');
};

// Ana PDF oluşturucu
export const generatePDFPreview = async (
  projectName: string,
  records: Record[],
  stats: Stats
): Promise<string> => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Logo
  doc.addImage(LOGO_BASE64, 'PNG', 10, 8, 40, 18);

  // Başlık
  doc.setFontSize(20);
  doc.text(sanitizeText(`${projectName} - Proje Raporu`), 60, 20);

  // Tarih
  doc.setFontSize(12);
  const today = new Date().toLocaleDateString('tr-TR');
  doc.text(`Rapor Tarihi: ${today}`, 60, 28);

  // Çizgi
  doc.setDrawColor(50, 50, 50);
  doc.line(10, 32, 285, 32);

  // İstatistik kutuları
  const statsY = 38;
  const boxWidth = 50;
  const boxHeight = 18;
  const boxGap = 10;
  const colors = ['#3B82F6', '#EF4444', '#6B7280', '#10B981', '#8B5CF6'];
  const labels = ['Açık', 'Hatalı', 'Kapalı', 'Tamamlandı', 'Toplam'];
  const values = [
    stats.acik,
    stats.hatali,
    stats.kapali,
    stats.tamamlandi,
    stats.toplam,
  ];

  labels.forEach((label, i) => {
    const x = 10 + i * (boxWidth + boxGap);
    doc.setFillColor(colors[i]);
    doc.roundedRect(x, statsY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(label, x + 5, statsY + 7);
    doc.setFontSize(14);
    doc.text(String(values[i]), x + 5, statsY + 15);
  });

  // Kayıt listesi
  let yPos = statsY + boxHeight + 12;
  const marginBottom = 15;
  const pageHeight = 210;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    // Sayfa dolarsa yeni sayfa
    if (yPos > pageHeight - marginBottom) {
      doc.addPage();
      yPos = 20;
    }

    // Kutunun dış çerçevesi
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.roundedRect(10, yPos, 270, 60, 2, 2);

    // Başlık
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text(`Kayıt #${record.id}`, 15, yPos + 8);

    // Sol sütun bilgileri
    let textY = yPos + 16;
    const leftX = 15;
    const info = [
      `Lokasyon: ${sanitizeText(record.lokasyon)}`,
      `Atanan: ${sanitizeText(record.atanan)}`,
      `Durum: ${sanitizeText(record.durum)}`,
      `Tarih: ${sanitizeText(record.tarih)}`,
      record.qrKod ? `QR Kod: ${sanitizeText(record.qrKod)}` : '',
    ].filter(Boolean);

    doc.setFontSize(10);
    info.forEach((line) => {
      doc.text(line, leftX, textY);
      textY += 6;
    });

    // Açıklama
    if (record.aciklama) {
      doc.setFontSize(10);
      doc.text('Açıklama:', leftX, textY);
      const wrapped = doc.splitTextToSize(
        sanitizeText(record.aciklama),
        110
      );
      doc.text(wrapped, leftX + 10, textY + 5);
      textY += wrapped.length * 5 + 5;
    }

    // Yorum
    if (record.yorum) {
      doc.setFontSize(10);
      doc.text('Yorum:', leftX, textY);
      const wrapped = doc.splitTextToSize(
        sanitizeText(record.yorum),
        110
      );
      doc.text(wrapped, leftX + 10, textY + 5);
    }

    // Sağ tarafa fotoğraf
    if (record.photo) {
      try {
        doc.addImage(record.photo, 'JPEG', 150, yPos + 10, 60, 45);
      } catch (err) {
        console.error('Fotoğraf yüklenemedi:', err);
      }
    }

    // QR kod (varsa)
    if (record.qrKod) {
      try {
        const qrDataUrl = await QRCode.toDataURL(record.qrKod);
        doc.addImage(qrDataUrl, 'PNG', 220, yPos + 10, 40, 40);
      } catch (err) {
        console.error('QR kod üretilemedi:', err);
      }
    }

    yPos += 70; // kutular arası boşluk
  }

  return doc.output('dataurlstring');
};

// PDF indirici
export const downloadPDF = (pdfData: string, projectName: string) => {
  const link = document.createElement('a');
  link.href = pdfData;
  link.download = `${projectName}_Rapor_${new Date().toLocaleDateString('tr-TR')}.pdf`;
  link.click();
};
