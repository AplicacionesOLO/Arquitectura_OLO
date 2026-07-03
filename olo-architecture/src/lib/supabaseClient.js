// ═══════════════════════════════════════════════════════════════════════════
// Cliente Supabase — SOLO la llave anon/publishable. Nunca importar aquí la
// service_role key: esta app es un SPA estático, todo lo que se importe en
// src/ termina en el bundle público servido al navegador.
// ═══════════════════════════════════════════════════════════════════════════
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — revisa olo-architecture/.env");
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
