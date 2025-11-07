import { createClient } from '@supabase/supabase-js'

// Çevre değişkenlerinden değerleri okuyoruz
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// Eğer değişkenler tanımlı değilse uyarı verelim
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are missing.')
}

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl, supabaseKey)
