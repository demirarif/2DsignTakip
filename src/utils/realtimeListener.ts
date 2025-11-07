import { supabase } from './supabaseClient'

export function subscribeToRecords(onChange: () => void) {
  const channel = supabase
    .channel('records-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'records' },
      () => {
        onChange()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
