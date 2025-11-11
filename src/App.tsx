// src/App.tsx
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './components/ui/select';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { StatsCard } from './components/StatsCard';
import { RecordForm } from './components/RecordForm';
import { RecordsTable } from './components/RecordsTable';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { generatePDFPreview, downloadPDF } from './utils/pdf-generator';
import { supabase } from './utils/supabaseClient';
import { Record, Stats } from './types';
import { FileText, FileDown, Search, Filter } from 'lucide-react';
import { Label } from './components/ui/label';
import { subscribeToRecords } from './utils/realtimeListener';
import { PhotoModal } from './components/PhotoModal';
import logo from './assets/2Dsign.png'; // 🟩 logo importu eklendi

const PROJECTS = ['Emek Projesi', 'Bilkent Projesi', 'Çankaya Projesi'];

export default function App() {
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
  const [records, setRecords] = useState<Record[]>([]);
  const [filterStatus, setFilterStatus] = useState('Tümü');
  const [searchText, setSearchText] = useState('');
  const [pdfPreviewData, setPdfPreviewData] = useState('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [editData, setEditData] = useState<Record | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // 📥 Kayıtları getir
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('project_name', selectedProject)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error('Kayıtlar alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedProject]);

  // 🔁 Realtime dinleyici
  useEffect(() => {
    const unsubscribe = subscribeToRecords(() => fetchRecords());
    return () => unsubscribe();
  }, [selectedProject]);

  const handleAddRecord = async () => fetchRecords();

  const handleDeleteRecord = async (id: number) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;
    try {
      const { error } = await supabase.from('records').delete().eq('id', id);
      if (error) throw error;
      setRecords((prev) => prev.filter((r) => r.id !== id));
      alert('Kayıt silindi.');
    } catch (err) {
      console.error('Silme hatası:', err);
    }
  };

  const handleEditRecord = (record: Record) => {
    setEditData(record);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditDone = async () => {
    setEditData(null);
    await fetchRecords();
  };

  // 🔍 Filtreleme
  const filteredRecords = records.filter((r) => {
    const statusMatch = filterStatus === 'Tümü' || r.durum === filterStatus;
    const textMatch =
      !searchText ||
      r.lokasyon?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.atanan?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.aciklama?.toLowerCase().includes(searchText.toLowerCase());
    return statusMatch && textMatch;
  });

  // 📊 İstatistikler
  const stats: Stats = {
    acik: filteredRecords.filter((r) => r.durum === 'Açık').length,
    hatali: filteredRecords.filter((r) => r.durum === 'Hatalı').length,
    kapali: filteredRecords.filter((r) => r.durum === 'Kapalı').length,
    tamamlandi: filteredRecords.filter((r) => r.durum === 'Tamamlandı').length,
    toplam: filteredRecords.length
  }; // 🔻 calculateStats() fonksiyonuna gerek kalmadı → inline yazıldı

  const progress = stats.toplam ? (stats.tamamlandi / stats.toplam) * 100 : 0;

  // 📄 PDF & CSV
  const handlePDFPreview = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdfData = await generatePDFPreview(selectedProject, filteredRecords, stats);
      setPdfPreviewData(pdfData);
      setShowPdfPreview(true);
    } catch (err) {
      alert('PDF oluşturulurken hata oluştu.');
      console.error(err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePDFDownload = () => pdfPreviewData && downloadPDF(pdfPreviewData, selectedProject);

  const handleCSVExport = () => {
    const headers = ['ID', 'Lokasyon', 'Atanan', 'Durum', 'Açıklama', 'Yorum', 'QR Kod', 'Tarih'];
    const csvData = [
      headers.join(','),
      ...filteredRecords.map((r) =>
        [r.id, `"${r.lokasyon}"`, `"${r.atanan}"`, r.durum, `"${r.aciklama}"`, `"${r.yorum}"`, r.qrKod, r.tarih].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedProject}_${new Date().toLocaleDateString('tr-TR')}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* 🟩 Header kısmı logolu hale getirildi */}
      <header className="bg-white shadow-sm rounded-lg p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="2Dsign360" className="h-10" />
          <h1 className="text-3xl font-semibold">Proje Yönetim Sistemi</h1>
        </div>
        <div className="w-64">
          <Label>Proje Seç</Label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROJECTS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Filtreleme */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5" />
          <h2 className="text-xl">Filtreleme</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Durum</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Tümü', 'Açık', 'Hatalı', 'Kapalı', 'Tamamlandı'].map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Arama</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Lokasyon, atanan veya açıklama ara..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <StatsCard title="Açık" value={stats.acik} color="bg-blue-500" />
        <StatsCard title="Hatalı" value={stats.hatali} color="bg-red-500" />
        <StatsCard title="Kapalı" value={stats.kapali} color="bg-gray-500" />
        <StatsCard title="Tamamlandı" value={stats.tamamlandi} color="bg-green-500" />
        <StatsCard title="Toplam" value={stats.toplam} color="bg-purple-500" />
      </div>

      {/* İlerleme */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h2 className="text-xl mb-4">Proje İlerlemesi</h2>
        <Progress value={progress} className="h-4" />
        <p className="text-center mt-2 text-gray-600">%{progress.toFixed(1)} Tamamlandı</p>
      </div>

      {/* Export Butonları */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={handlePDFPreview} className="flex items-center gap-2" disabled={isGeneratingPDF}>
          <FileText className="h-4 w-4" />
          {isGeneratingPDF ? 'Oluşturuluyor...' : 'PDF Rapor Önizle'}
        </Button>
        <Button onClick={handleCSVExport} variant="outline" className="flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          CSV Çıkar
        </Button>
      </div>

      <div className="mb-6">
        <RecordForm onSubmit={handleAddRecord} editData={editData} onEditDone={handleEditDone} />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Veriler yükleniyor...</p>
      ) : (
        <RecordsTable
          records={filteredRecords}
          onDelete={handleDeleteRecord}
          onEdit={handleEditRecord}
          onPhotoClick={(url) => {
            setSelectedPhoto(url);
            setShowPhotoModal(true);
          }}
        />
      )}

      <PDFPreviewModal
        isOpen={showPdfPreview}
        onClose={() => setShowPdfPreview(false)}
        pdfData={pdfPreviewData}
        onDownload={handlePDFDownload}
      />

      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        photoUrl={selectedPhoto || undefined}
      />
    </div>
  );
}
