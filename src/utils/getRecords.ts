import { supabase } from './supabaseClient'

export async function getRecords() {
  try {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Veriler çekilemedi:', err)
    return []
  }
}
