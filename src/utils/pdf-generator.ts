import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Record, Stats } from '../types';

// Türkçe karakter desteği için custom font ekle
const addTurkishFont = (doc: jsPDF) => {
  // jsPDF'e Türkçe karakter desteği eklemek için
  // Varsayılan font'u kullanacağız ve karakterleri encode edeceğiz
};

export const generatePDFPreview = (
  projectName: string,
  records: Record[],
  stats: Stats
): string => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Başlık
  doc.setFontSize(20);
  doc.text(`${projectName} - Proje Raporu`, 15, 20);

  // Tarih
  doc.setFontSize(12);
  const today = new Date().toLocaleDateString('tr-TR');
  doc.text(`Rapor Tarihi: ${today}`, 15, 30);

  // İstatistikler
  doc.setFontSize(11);
  doc.text(`Toplam Kayit: ${stats.toplam}`, 15, 40);
  doc.text(`Acik: ${stats.acik}`, 60, 40);
  doc.text(`Hatali: ${stats.hatali}`, 95, 40);
  doc.text(`Kapali: ${stats.kapali}`, 130, 40);
  doc.text(`Tamamlandi: ${stats.tamamlandi}`, 165, 40);

  // Çizgi
  doc.setLineWidth(0.5);
  doc.line(15, 45, 282, 45);

  let yPos = 55;
  const pageHeight = 210; // A4 landscape height
  const marginBottom = 20;

  records.forEach((record, index) => {
    // Sayfa kontrolü
    if (yPos > pageHeight - marginBottom) {
      doc.addPage();
      yPos = 20;
    }

    // Kayıt başlığı
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Kayit #${record.id}`, 15, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yPos += 7;

    // Sol taraf - Bilgiler
    const leftX = 15;
    const rightX = 190;
    
    doc.text(`Lokasyon: ${record.lokasyon}`, leftX, yPos);
    yPos += 6;
    doc.text(`Atanan: ${record.atanan}`, leftX, yPos);
    yPos += 6;
    doc.text(`Durum: ${record.durum}`, leftX, yPos);
    yPos += 6;
    doc.text(`Tarih: ${record.tarih}`, leftX, yPos);
    yPos += 6;
    
    if (record.qrKod) {
      doc.text(`QR Kod: ${record.qrKod}`, leftX, yPos);
      yPos += 6;
    }

    const startY = yPos;
    
    if (record.aciklama) {
      doc.text(`Aciklama:`, leftX, yPos);
      yPos += 6;
      const aciklamaLines = doc.splitTextToSize(record.aciklama, 160);
      doc.text(aciklamaLines, leftX + 5, yPos);
      yPos += aciklamaLines.length * 5;
    }

    if (record.yorum) {
      doc.text(`Yorum:`, leftX, yPos);
      yPos += 6;
      const yorumLines = doc.splitTextToSize(record.yorum, 160);
      doc.text(yorumLines, leftX + 5, yPos);
      yPos += yorumLines.length * 5;
    }

    // Sağ taraf - Fotoğraf
    if (record.photo) {
      try {
        const imgY = startY - 20;
        doc.addImage(record.photo, 'JPEG', rightX, imgY, 70, 50);
      } catch (error) {
        console.error('Fotograf yuklenemedi:', error);
      }
    }

    // Ayırıcı çizgi
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos, 282, yPos);
    yPos += 10;
  });

  // PDF'i blob olarak döndür
  return doc.output('dataurlstring');
};

export const downloadPDF = (pdfData: string, projectName: string) => {
  const link = document.createElement('a');
  link.href = pdfData;
  link.download = `${projectName}_Rapor_${new Date().toLocaleDateString('tr-TR')}.pdf`;
  link.click();
};
