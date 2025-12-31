import { createClient } from '@supabase/supabase-js'

// En proyectos de Vite, las variables deben empezar con VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validación de seguridad para tu ecosistema
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Error de Configuración: No se encontraron las variables de entorno de Supabase. " +
    "Asegúrate de que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén en Vercel."
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
