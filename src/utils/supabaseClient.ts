// src/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Öncelikle çevre değişkenlerinden oku
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
let supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// Eğer .env'den okunamazsa fallback olarak elle tanımla
if (!supabaseUrl || !supabaseKey) {
  console.warn('Env değişkenleri bulunamadı, manuel değerler kullanılacak.')

  // 👇 Kendi Supabase link ve key'ini buraya elinle ekle
  supabaseUrl = 'https://uzmoywbuhhwitjcqokqm.supabase.co'
  supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bW95d2J1aGh3aXRqY3Fva3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDk3MzQsImV4cCI6MjA3ODA4NTczNH0.wYeQVWF072DOTtXua6rWeEAUZw7qjaHjKzGTA7mBsVk'
}

export const supabase = createClient(supabaseUrl, supabaseKey)
