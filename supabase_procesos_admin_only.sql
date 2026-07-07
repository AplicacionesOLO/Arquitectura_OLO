-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Procesos: escritura para admin + editor
-- (revertido — se probó restringir a solo admin y se decidió mantener
-- también a editor, igual que el resto del módulo Procesos).
-- Run en Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to commit: solo políticas, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

drop policy if exists "procesos_nodes_write_if_admin" on public.procesos_nodes;
drop policy if exists "procesos_nodes_write_if_editor" on public.procesos_nodes;
create policy "procesos_nodes_write_if_editor" on public.procesos_nodes
  for all using (public.current_user_role() in ('admin','editor'))
  with check (public.current_user_role() in ('admin','editor'));

drop policy if exists "procesos_archivos_write_if_admin" on public.procesos_archivos;
drop policy if exists "procesos_archivos_write_if_editor" on public.procesos_archivos;
create policy "procesos_archivos_write_if_editor" on public.procesos_archivos
  for all using (public.current_user_role() in ('admin','editor'))
  with check (public.current_user_role() in ('admin','editor'));

drop policy if exists "procesos_categorias_write_if_admin" on public.procesos_categorias;
drop policy if exists "procesos_categorias_write_if_editor" on public.procesos_categorias;
create policy "procesos_categorias_write_if_editor" on public.procesos_categorias
  for all using (public.current_user_role() in ('admin','editor'))
  with check (public.current_user_role() in ('admin','editor'));

drop policy if exists "detalles_procesos_insert_if_admin" on storage.objects;
drop policy if exists "detalles_procesos_insert_if_editor" on storage.objects;
create policy "detalles_procesos_insert_if_editor" on storage.objects
  for insert with check (bucket_id = 'Detalles_Porcesos' and public.current_user_role() in ('admin','editor'));

drop policy if exists "detalles_procesos_delete_if_admin" on storage.objects;
drop policy if exists "detalles_procesos_delete_if_editor" on storage.objects;
create policy "detalles_procesos_delete_if_editor" on storage.objects
  for delete using (bucket_id = 'Detalles_Porcesos' and public.current_user_role() in ('admin','editor'));
-- detalles_procesos_select_public queda igual (lectura pública, sin cambios)
