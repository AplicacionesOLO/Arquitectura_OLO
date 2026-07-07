-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Módulo Procesos (árbol persistente + archivos)
-- Requiere haber corrido supabase_bootstrap.sql y supabase_admin_module.sql.
-- Run en Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to commit: solo esquema/políticas, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Árbol Subproceso → Sub-subproceso → Detalle, por categoría fija ────────
create table if not exists public.procesos_nodes (
  id uuid primary key default gen_random_uuid(),
  categoria_id text not null check (categoria_id in
    ('inbound','outbound','crossdocking','no_nacionalizado','comercio','administrativo')),
  parent_id uuid references public.procesos_nodes(id) on delete cascade,
  level int not null check (level in (0,1,2)), -- 0=Subproceso 1=Sub-subproceso 2=Detalle
  name text not null default '',
  sort_order int not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists procesos_nodes_parent_idx on public.procesos_nodes(parent_id);
create index if not exists procesos_nodes_categoria_idx on public.procesos_nodes(categoria_id);

alter table public.procesos_nodes enable row level security;

drop policy if exists "procesos_nodes_select_authenticated" on public.procesos_nodes;
create policy "procesos_nodes_select_authenticated" on public.procesos_nodes
  for select using (auth.uid() is not null);

drop policy if exists "procesos_nodes_write_if_editor" on public.procesos_nodes;
create policy "procesos_nodes_write_if_editor" on public.procesos_nodes
  for all using (public.current_user_role() in ('admin','editor'))
  with check (public.current_user_role() in ('admin','editor'));

-- ── Archivos adjuntos por nodo (nivel Detalle, aunque no se restringe a nivel) ─
create table if not exists public.procesos_archivos (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.procesos_nodes(id) on delete cascade,
  bucket text not null default 'Detalles_Porcesos',
  path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists procesos_archivos_node_idx on public.procesos_archivos(node_id);

alter table public.procesos_archivos enable row level security;

drop policy if exists "procesos_archivos_select_authenticated" on public.procesos_archivos;
create policy "procesos_archivos_select_authenticated" on public.procesos_archivos
  for select using (auth.uid() is not null);

drop policy if exists "procesos_archivos_write_if_editor" on public.procesos_archivos;
create policy "procesos_archivos_write_if_editor" on public.procesos_archivos
  for all using (public.current_user_role() in ('admin','editor'))
  with check (public.current_user_role() in ('admin','editor'));

-- ── Storage: quién puede subir/borrar en el bucket Detalles_Porcesos ───────
-- El bucket ya es público (lectura libre vía URL); esto solo gobierna quién
-- puede escribir/eliminar objetos a través de la API (no afecta el link público).
drop policy if exists "detalles_procesos_insert_if_editor" on storage.objects;
create policy "detalles_procesos_insert_if_editor" on storage.objects
  for insert with check (bucket_id = 'Detalles_Porcesos' and public.current_user_role() in ('admin','editor'));

drop policy if exists "detalles_procesos_select_public" on storage.objects;
create policy "detalles_procesos_select_public" on storage.objects
  for select using (bucket_id = 'Detalles_Porcesos');

drop policy if exists "detalles_procesos_delete_if_editor" on storage.objects;
create policy "detalles_procesos_delete_if_editor" on storage.objects
  for delete using (bucket_id = 'Detalles_Porcesos' and public.current_user_role() in ('admin','editor'));

-- ── Semilla: contenido ya cargado a mano en el frontend (Inbound, Outbound,
-- CrossDocking, No Nacionalizado) — solo se inserta si la tabla está vacía,
-- para no duplicar si alguien ya corrió esta migración antes.
do $$
begin
  if not exists (select 1 from public.procesos_nodes limit 1) then

    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order) values
      ('inbound', null, 0, 'Recepción', 0),
      ('inbound', null, 0, 'Almacenaje', 1),
      ('inbound', null, 0, 'Recepción', 2),
      ('outbound', null, 0, 'Alisto', 0),
      ('outbound', null, 0, 'Empaque/Chequeo', 1),
      ('outbound', null, 0, 'Valor agregado', 2),
      ('outbound', null, 0, 'Transporte', 3),
      ('outbound', null, 0, 'Despacho', 4),
      ('crossdocking', null, 0, 'Distribución', 0),
      ('no_nacionalizado', null, 0, 'Recibo', 0),
      ('no_nacionalizado', null, 0, 'Distribución', 1),
      ('no_nacionalizado', null, 0, 'Almacenaje', 2),
      ('no_nacionalizado', null, 0, 'Alisto', 3),
      ('no_nacionalizado', null, 0, 'Despacho', 4);

  end if;
end $$;
