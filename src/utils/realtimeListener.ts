import { supabase } from './supabaseClient'

/**
 * Supabase Realtime Listener
 * - records tablosundaki her INSERT, UPDATE, DELETE olayını yakalar.
 * - onChange callback'ini tetikler.
 * - otomatik temizlenebilir (unsubscribe dönüşü verir).
 */
export function subscribeToRecords(onChange: () => void) {
  const channel = supabase
    .channel('records-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'records',
      },
      () => {
        console.log('🔄 Realtime değişiklik algılandı.')
        onChange()
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime bağlantısı aktif.')
      } else if (status === 'CHANNEL_ERROR') {
        console.warn('⚠️ Realtime kanal hatası oluştu.')
      }
    })

  // cleanup
  return () => {
    console.log('🧹 Realtime bağlantısı kapatılıyor.')
    supabase.removeChannel(channel)
  }
}
