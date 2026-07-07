-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Procesos: categorías dinámicas (antes hardcodeadas)
-- Requiere haber corrido supabase_procesos_module.sql antes.
-- Run en Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to commit: solo esquema/políticas/semilla, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.procesos_categorias (
  id text primary key,
  num int not null,
  label text not null default '',
  color text not null default '#00838f',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.procesos_categorias enable row level security;

drop policy if exists "procesos_categorias_select_authenticated" on public.procesos_categorias;
create policy "procesos_categorias_select_authenticated" on public.procesos_categorias
  for select using (auth.uid() is not null);

drop policy if exists "procesos_categorias_write_if_editor" on public.procesos_categorias;
create policy "procesos_categorias_write_if_editor" on public.procesos_categorias
  for all using (public.current_user_role() in ('admin','editor'))
  with check (public.current_user_role() in ('admin','editor'));

-- Semilla: las 6 categorías ya en uso, con los mismos ids que procesos_nodes.categoria_id ya referencia.
insert into public.procesos_categorias (id, num, label, color) values
  ('inbound',          1, 'Inbound',          '#2980b9'),
  ('outbound',         2, 'Outbound',         '#27ae60'),
  ('crossdocking',     3, 'CrossDocking',     '#8e44ad'),
  ('no_nacionalizado', 4, 'No Nacionalizado', '#d35400'),
  ('comercio',         5, 'Comercio',         '#00838f'),
  ('administrativo',   6, 'Administrativo',  '#7f8c8d')
on conflict (id) do nothing;

-- procesos_nodes.categoria_id pasa de un CHECK fijo a una FK contra la nueva
-- tabla — así "Agregar proceso" no requiere tocar ninguna restricción de esquema.
alter table public.procesos_nodes drop constraint if exists procesos_nodes_categoria_id_check;
alter table public.procesos_nodes
  add constraint procesos_nodes_categoria_id_fkey
  foreign key (categoria_id) references public.procesos_categorias(id) on update cascade;
