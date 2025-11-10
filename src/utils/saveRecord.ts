import { supabase } from './supabaseClient';

export async function saveRecord(
  lokasyon: string,
  atanan: string,
  durum: string,
  photoFile?: File,
  pdfFile?: File
) {
  try {
    let photoUrl: string | null = null;
    let pdfUrl: string | null = null;

    // 📸 Fotoğraf yükleme
    if (photoFile) {
      const fileName = `photos/${Date.now()}_${photoFile.name}`;
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, photoFile, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      // Public URL üret
      const { data: publicUrl } = supabase.storage.from('uploads').getPublicUrl(fileName);
      photoUrl = publicUrl?.publicUrl || null;
    }

    // 📄 PDF yükleme (isteğe bağlı)
    if (pdfFile) {
      const fileName = `pdfs/${Date.now()}_${pdfFile.name}`;
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, pdfFile, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage.from('uploads').getPublicUrl(fileName);
      pdfUrl = publicUrl?.publicUrl || null;
    }

    // 💾 Veritabanına kayıt ekleme
    const { error: insertError } = await supabase.from('records').insert({
      lokasyon,
      atanan,
      durum,
      photo: photoUrl,
      pdf: pdfUrl,
      created_at: new Date().toISOString(),
    });

    if (insertError) throw insertError;

    console.log('✅ Kayıt başarıyla eklendi!');
  } catch (err) {
    console.error('❌ Kayıt ekleme hatası:', err);
  }
}
