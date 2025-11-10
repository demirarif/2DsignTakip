import { supabase } from './supabaseClient'

export async function updateRecord(
  id: number,
  fields: {
    lokasyon?: string
    atanan?: string
    durum?: string
    aciklama?: string
    yorum?: string
    qrKod?: string
    photo?: string | null
    dosya?: string | null
  },
  newPhotoFile?: File | null
) {
  try {
    let photoUrl = fields.photo || null

    // Yeni fotoğraf seçildiyse yeniden yükle
    if (newPhotoFile) {
      const filePath = `photos/${Date.now()}_${newPhotoFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('2Dsign360')
        .upload(filePath, newPhotoFile)

      if (uploadError) throw uploadError

      const { data: publicUrl } = supabase.storage
        .from('2Dsign360')
        .getPublicUrl(filePath)

      photoUrl = publicUrl.publicUrl
    }

    const { error: updateError } = await supabase
      .from('records')
      .update({ ...fields, photo: photoUrl })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    console.log(`✅ Kayıt (#${id}) başarıyla güncellendi.`)
  } catch (err) {
    console.error('❌ Kayıt güncelleme hatası:', err)
  }
}
