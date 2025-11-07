import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { StatsCard } from './components/StatsCard';
import { RecordForm } from './components/RecordForm';
import { RecordsTable } from './components/RecordsTable';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { getProjectData, saveProjectData, getCounter, saveCounter } from './utils/storage';
import { generatePDFPreview, downloadPDF } from './utils/pdf-generator';
import { Record, ProjectData, Stats } from './types';
import { FileText, FileDown, Search, Filter } from 'lucide-react';
import { Label } from './components/ui/label';

const PROJECTS = ['Emek Projesi', 'Bilkent Projesi', 'Çankaya Projesi'];

export default function App() {
  const [selectedProject, setSelectedProject] = useState<string>(PROJECTS[0]);
  const [projectData, setProjectData] = useState<ProjectData>({});
  const [recordCounter, setRecordCounter] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<string>('Tümü');
  const [searchText, setSearchText] = useState<string>('');
  const [pdfPreviewData, setPdfPreviewData] = useState<string>('');
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);

  // LocalStorage'dan veri yükle
  useEffect(() => {
    const data = getProjectData();
    const counter = getCounter();
    setProjectData(data);
    setRecordCounter(counter);
  }, []);

  // Veri değiştiğinde localStorage'a kaydet
  useEffect(() => {
    saveProjectData(projectData);
  }, [projectData]);

  useEffect(() => {
    saveCounter(recordCounter);
  }, [recordCounter]);

  // Seçili projenin kayıtları
  const currentRecords = projectData[selectedProject] || [];

  // Filtrelenmiş kayıtlar
  const filteredRecords = currentRecords.filter((record) => {
    const statusMatch = filterStatus === 'Tümü' || record.durum === filterStatus;
    const textMatch = 
      searchText === '' ||
      record.lokasyon.toLowerCase().includes(searchText.toLowerCase()) ||
      record.atanan.toLowerCase().includes(searchText.toLowerCase()) ||
      record.aciklama.toLowerCase().includes(searchText.toLowerCase());
    return statusMatch && textMatch;
  });

  // İstatistikler
  const calculateStats = (): Stats => {
    const stats = {
      acik: 0,
      hatali: 0,
      kapali: 0,
      tamamlandi: 0,
      toplam: currentRecords.length
    };

    currentRecords.forEach((record) => {
      switch (record.durum) {
        case 'Açık':
          stats.acik++;
          break;
        case 'Hatalı':
          stats.hatali++;
          break;
        case 'Kapalı':
          stats.kapali++;
          break;
        case 'Tamamlandı':
          stats.tamamlandi++;
          break;
      }
    });

    return stats;
  };

  const stats = calculateStats();
  const progress = stats.toplam > 0 ? (stats.tamamlandi / stats.toplam) * 100 : 0;

  // Kayıt ekle
  const handleAddRecord = (record: Omit<Record, 'id' | 'tarih'>) => {
    const newRecord: Record = {
      ...record,
      id: recordCounter,
      tarih: new Date().toLocaleDateString('tr-TR')
    };

    setProjectData((prev) => ({
      ...prev,
      [selectedProject]: [...(prev[selectedProject] || []), newRecord]
    }));

    setRecordCounter((prev) => prev + 1);
  };

  // Kayıt sil
  const handleDeleteRecord = (id: number) => {
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      setProjectData((prev) => ({
        ...prev,
        [selectedProject]: prev[selectedProject].filter((record) => record.id !== id)
      }));
    }
  };

  // PDF Önizleme
  const handlePDFPreview = () => {
    const pdfData = generatePDFPreview(selectedProject, filteredRecords, stats);
    setPdfPreviewData(pdfData);
    setShowPdfPreview(true);
  };

  // PDF İndir
  const handlePDFDownload = () => {
    if (pdfPreviewData) {
      downloadPDF(pdfPreviewData, selectedProject);
    }
  };

  // CSV Export
  const handleCSVExport = () => {
    const headers = ['ID', 'Lokasyon', 'Atanan', 'Durum', 'Açıklama', 'Yorum', 'QR Kod', 'Tarih'];
    const csvData = [
      headers.join(','),
      ...filteredRecords.map((record) =>
        [
          record.id,
          `"${record.lokasyon}"`,
          `"${record.atanan}"`,
          record.durum,
          `"${record.aciklama}"`,
          `"${record.yorum}"`,
          record.qrKod,
          record.tarih
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedProject}_${new Date().toLocaleDateString('tr-TR')}.csv`);
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <header className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h1 className="text-3xl mb-4">Proje Yönetim Sistemi</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label>Proje Seç</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECTS.map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tümü">Tümü</SelectItem>
                <SelectItem value="Açık">Açık</SelectItem>
                <SelectItem value="Hatalı">Hatalı</SelectItem>
                <SelectItem value="Kapalı">Kapalı</SelectItem>
                <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Arama</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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

      {/* İstatistikler */}
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
        <p className="text-center mt-2 text-gray-600">
          %{progress.toFixed(1)} Tamamlandı
        </p>
      </div>

      {/* Export Butonları */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={handlePDFPreview} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          PDF Rapor Önizle
        </Button>
        <Button onClick={handleCSVExport} variant="outline" className="flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          CSV Çıkar
        </Button>
      </div>

      {/* Form */}
      <div className="mb-6">
        <RecordForm onSubmit={handleAddRecord} />
      </div>

      {/* Tablo */}
      <RecordsTable records={filteredRecords} onDelete={handleDeleteRecord} />

      {/* PDF Önizleme Modal */}
      <PDFPreviewModal
        isOpen={showPdfPreview}
        onClose={() => setShowPdfPreview(false)}
        pdfData={pdfPreviewData}
        onDownload={handlePDFDownload}
      />
    </div>
  );
}
