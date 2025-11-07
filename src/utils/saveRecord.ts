import { supabase } from './supabaseClient'

export async function saveRecord(
  projectName: string,
  description: string,
  imageFile?: File,
  pdfFile?: File
) {
  try {
    // Görsel yükleme
    let imageUrl: string | null = null
    if (imageFile) {
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(`images/${Date.now()}_${imageFile.name}`, imageFile)

      if (error) throw error
      imageUrl = data?.path ? data.path : null
    }

    // PDF yükleme
    let pdfUrl: string | null = null
    if (pdfFile) {
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(`pdfs/${Date.now()}_${pdfFile.name}`, pdfFile)

      if (error) throw error
      pdfUrl = data?.path ? data.path : null
    }

    // Veritabanına kayıt ekleme
    const { error: insertError } = await supabase
      .from('records')
      .insert({
        project_name: projectName,
        description,
        image_url: imageUrl,
        pdf_url: pdfUrl,
      })

    if (insertError) throw insertError

    console.log('✅ Kayıt başarıyla eklendi!')
  } catch (err) {
    console.error('❌ Kayıt ekleme hatası:', err)
  }
}
