import { supabase } from './supabaseClient'

// Yeni kayıt ekleme (fotoğraf ve pdf ile)
export async function saveRecord(
  projectName: string,
  description: string,
  imageFile?: File,
  pdfFile?: File
) {
  try {
    let photoUrl: string | null = null
    let pdfUrl: string | null = null

    // Fotoğraf yükleme
    if (imageFile) {
      const { data, error } = await supabase.storage
        .from('2Dsign360')
        .upload(`photos/${Date.now()}_${imageFile.name}`, imageFile)

      if (error) throw error

      // Public URL oluştur
      const { data: publicUrl } = supabase.storage
        .from('2Dsign360')
        .getPublicUrl(`photos/${Date.now()}_${imageFile.name}`)

      photoUrl = publicUrl.publicUrl
    }

    // PDF yükleme
    if (pdfFile) {
      const { data, error } = await supabase.storage
        .from('2Dsign360')
        .upload(`pdfs/${Date.now()}_${pdfFile.name}`, pdfFile)

      if (error) throw error

      const { data: publicUrl } = supabase.storage
        .from('2Dsign360')
        .getPublicUrl(`pdfs/${Date.now()}_${pdfFile.name}`)

      pdfUrl = publicUrl.publicUrl
    }

    // Veritabanına ekleme
    const { error: insertError } = await supabase
      .from('records')
      .insert([
        {
          project_name: projectName,
          description,
          photo: photoUrl,
          pdf: pdfUrl,
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError

    console.log('✅ Yeni kayıt başarıyla eklendi.')
  } catch (err) {
    console.error('❌ Kayıt ekleme hatası:', err)
  }
}
