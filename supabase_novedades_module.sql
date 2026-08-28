-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Novedades (avisos "¿qué hay de nuevo?")
-- Requiere haber corrido supabase_bootstrap.sql y supabase_admin_module.sql antes
-- (usa public.current_user_role() y los tab_id de role_permissions como "sección").
-- Run en Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to commit: solo esquema/políticas/semilla, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

-- Fila única (singleton): version/titulo/fecha del lote actual + su lista de
-- items en jsonb ({ id, estado, titulo, detalle, seccion }[]). "estado" es
-- candidata|publicada|archivada; "seccion" es un tab_id opcional (null = todos).
create table if not exists public.novedades (
  id int primary key default 1 check (id = 1),
  version text not null default '',
  titulo text not null default 'Novedades',
  fecha text not null default '',
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into public.novedades (id) values (1) on conflict (id) do nothing;

alter table public.novedades enable row level security;

-- Cualquier autenticado puede leer la fila (el cliente filtra "publicada" +
-- sección para usuarios no-admin; el admin ve/edita todo). Mismo criterio de
-- confianza en el cliente que procesos_categorias/role_permissions.
drop policy if exists "novedades_select_authenticated" on public.novedades;
create policy "novedades_select_authenticated" on public.novedades
  for select using (auth.uid() is not null);

drop policy if exists "novedades_write_if_admin" on public.novedades;
create policy "novedades_write_if_admin" on public.novedades
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
