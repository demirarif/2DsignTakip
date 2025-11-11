import { jsPDF } from 'jspdf';
import { Record, Stats } from '../types';
import { supabase } from './supabaseClient';
import logo from '../assets/2Dsign.png';

// 📄 PDF oluşturma (logo, kutular, görseller, QR dahil)
export const generatePDFPreview = async (
  projectName: string,
  records: Record[],
  stats: Stats
): Promise<string> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 🔹 Logo ekle (sol üst)
  try {
    const logoImg = await fetch(logo).then((res) => res.blob());
    const logoData = await blobToBase64(logoImg);
    doc.addImage(logoData, 'PNG', 15, 10, 25, 25);
  } catch (e) {
    console.warn('Logo eklenemedi:', e);
  }

  // 🔸 Başlık ve Tarih
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(encodeURIComponent(`${projectName} - Proje Raporu`), 45, 25, { decodeURI: true });

  doc.setFontSize(11);
  const today = new Date().toLocaleDateString('tr-TR');
  doc.text(`Rapor Tarihi: ${today}`, 45, 32);

  // 🔸 Genel istatistik kutuları
  const boxY = 40;
  const boxWidth = 40;
  const boxHeight = 18;
  const boxes = [
    { title: 'Açık', value: stats.acik, color: [66, 133, 244] },
    { title: 'Hatalı', value: stats.hatali, color: [234, 67, 53] },
    { title: 'Kapalı', value: stats.kapali, color: [128, 128, 128] },
    { title: 'Tamamlandı', value: stats.tamamlandi, color: [52, 168, 83] },
  ];

  boxes.forEach((b, i) => {
    const x = 15 + i * (boxWidth + 10);
    doc.setFillColor(b.color[0], b.color[1], b.color[2]);
    doc.roundedRect(x, boxY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(b.title, x + 5, boxY + 8);
    doc.setFontSize(14);
    doc.text(String(b.value), x + 5, boxY + 15);
  });

  doc.setTextColor(0, 0, 0);

  // 🔸 İçerik
  let yPos = 70;
  const marginBottom = 30;

  for (const record of records) {
    if (yPos > 270 - marginBottom) {
      doc.addPage();
      yPos = 20;
    }

    // Başlık
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`Kayıt #${record.id} - ${record.lokasyon}`, 15, yPos);
    yPos += 6;

    // Bilgiler
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Atanan: ${record.atanan}`, 15, yPos);
    yPos += 5;
    doc.text(`Durum: ${record.durum}`, 15, yPos);
    yPos += 5;
    doc.text(`Tarih: ${record.tarih}`, 15, yPos);
    yPos += 6;

    // QR Kod
    if (record.qrKod) {
      try {
        const QR = await import('qrcode');
        const qrCanvas = document.createElement('canvas');
        await QR.toCanvas(qrCanvas, record.qrKod);
        const qrData = qrCanvas.toDataURL('image/png');
        doc.addImage(qrData, 'PNG', 165, yPos - 25, 25, 25);
      } catch (e) {
        console.warn('QR oluşturulamadı:', e);
      }
    }

    // Açıklama
    if (record.aciklama) {
      const aciklamaLines = doc.splitTextToSize(`Açıklama: ${record.aciklama}`, 170);
      doc.text(aciklamaLines, 15, yPos);
      yPos += aciklamaLines.length * 5 + 4;
    }

    // Yorum
    if (record.yorum) {
      const yorumLines = doc.splitTextToSize(`Yorum: ${record.yorum}`, 170);
      doc.text(yorumLines, 15, yPos);
      yPos += yorumLines.length * 5 + 4;
    }

    // Fotoğraf
    if (record.photo) {
      try {
        doc.addImage(record.photo, 'JPEG', 15, yPos, 60, 40);
        yPos += 45;
      } catch (e) {
        console.warn('Fotoğraf eklenemedi:', e);
      }
    }

    // Ayırıcı çizgi
    doc.setDrawColor(180, 180, 180);
    doc.line(15, yPos, 195, yPos);
    yPos += 10;
  }

  return doc.output('dataurlstring');
};

// 🔹 Blob → Base64 dönüştürücü
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// 🧾 PDF Supabase’e yükle (otomatik)
export const savePDFToSupabase = async (
  projectName: string,
  recordId: number,
  pdfDataUrl: string
) => {
  try {
    const pdfBlob = await fetch(pdfDataUrl).then((res) => res.blob());
    const fileName = `${projectName}_${recordId}_${Date.now()}.pdf`;

    // Upload
    const { data, error } = await supabase.storage
      .from('2Dsign360')
      .upload(`pdfs/${fileName}`, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) throw error;

    // Public URL al
    const { data: publicUrlData } = supabase.storage
      .from('2Dsign360')
      .getPublicUrl(`pdfs/${fileName}`);

    const pdfUrl = publicUrlData?.publicUrl;

    // Veritabanında ilgili kayda pdf_url yaz
    const { error: updateError } = await supabase
      .from('records')
      .update({ pdf_url: pdfUrl })
      .eq('id', recordId);

    if (updateError) throw updateError;

    console.log('✅ PDF Supabase’e yüklendi:', pdfUrl);
    return pdfUrl;
  } catch (err) {
    console.error('❌ PDF yükleme hatası:', err);
    throw err;
  }
};
