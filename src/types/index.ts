// src/types/index.ts

// Supabase'ten dönen kayıt tipi
export interface Record {
  id: number;
  lokasyon: string;
  atanan: string;
  durum: 'Açık' | 'Hatalı' | 'Kapalı' | 'Tamamlandı';
  aciklama?: string | null;
  yorum?: string | null;
  qrKod?: string | null;
  photo?: string | null;  // Artık Base64 değil, Supabase URL
  dosya?: string | null;
  created_at?: string;    // Supabase timestamp (önceden tarih)
}

// Proje bazlı grouping yapısı (kullanıyorsan)
export interface ProjectData {
  [projectName: string]: Record[];
}

// Dashboard istatistikleri
export interface Stats {
  acik: number;
  hatali: number;
  kapali: number;
  tamamlandi: number;
  toplam: number;
}
