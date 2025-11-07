export interface Record {
  id: number;
  lokasyon: string;
  atanan: string;
  durum: 'Açık' | 'Hatalı' | 'Kapalı' | 'Tamamlandı';
  aciklama: string;
  yorum: string;
  qrKod: string;
  photo: string; // Base64
  dosya: string;
  tarih: string;
}

export interface ProjectData {
  [projectName: string]: Record[];
}

export interface Stats {
  acik: number;
  hatali: number;
  kapali: number;
  tamamlandi: number;
  toplam: number;
}
