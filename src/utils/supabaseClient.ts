import { createClient } from '@supabase/supabase-js'

// .env varsa ordan oku, yoksa fallback değerlere dön
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL?.trim() ||
  'https://uzmoywbuhhwitjcqokqm.supabase.co'

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY?.trim() ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bW95d2J1aGh3aXRqY3Fva3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDk3MzQsImV4cCI6MjA3ODA4NTczNH0.wYeQVWF072DOTtXua6rWeEAUZw7qjaHjKzGTA7mBsVk'

// Tek bir client oluştur
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
})

// Debug amaçlı kontrol (opsiyonel, prod'da silebilirsin)
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️ Supabase URL veya KEY eksik olabilir. Varsayılan değerler kullanılıyor.')
}
