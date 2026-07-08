-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — BPA-BOT: permite a cada usuario borrar su propio
-- historial de chat (botón "Nueva conversación" en la burbuja flotante).
-- Run en Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to commit: solo política, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

drop policy if exists "bpabot_mensajes_own_delete" on public.bpabot_mensajes;
create policy "bpabot_mensajes_own_delete" on public.bpabot_mensajes
  for delete using (auth.uid() = user_id);
