-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — BPA-BOT: manuales + chat inteligente con permisos
-- por capacidad (no solo por visibilidad de tab).
-- Run en Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to commit: solo esquema/políticas/semilla, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Manuales (metadata; el archivo real vive en Storage + copia indexada en
-- el Vector Store de OpenAI vía openai_file_id) ────────────────────────────
create table if not exists public.bpabot_manuales (
  id uuid primary key default gen_random_uuid(),
  titulo text not null default '',
  file_name text not null,
  bucket text not null default 'BPA_BOT_Manuales',
  path text not null,
  mime_type text,
  size_bytes bigint,
  openai_file_id text,
  status text not null default 'pendiente' check (status in ('pendiente','listo','error')),
  error_msg text,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.bpabot_manuales enable row level security;

-- ── Capacidades por rol dentro del módulo BPA-BOT (matriz configurable,
-- independiente de la visibilidad del tab en role_permissions) ────────────
create table if not exists public.bpabot_role_capabilities (
  role_key text not null references public.roles(key) on delete cascade,
  capability text not null check (capability in ('gestionar_documentos','chat_semantico','consulta_documental')),
  enabled boolean not null default false,
  primary key (role_key, capability)
);
alter table public.bpabot_role_capabilities enable row level security;

-- ── Historial de chat (por usuario) ────────────────────────────────────────
create table if not exists public.bpabot_mensajes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.bpabot_mensajes enable row level security;

-- ── Helper: ¿el rol actual tiene esta capacidad? Admin siempre true. ──────
create or replace function public.bpabot_has_capability(cap text)
returns boolean language sql stable security definer as $$
  select case
    when public.current_user_role() = 'admin' then true
    else coalesce(
      (select enabled from public.bpabot_role_capabilities
       where role_key = public.current_user_role() and capability = cap),
      false
    )
  end;
$$;

-- ── Políticas: bpabot_manuales ──────────────────────────────────────────────
drop policy if exists "bpabot_manuales_select_authenticated" on public.bpabot_manuales;
create policy "bpabot_manuales_select_authenticated" on public.bpabot_manuales
  for select using (auth.uid() is not null);

drop policy if exists "bpabot_manuales_write_if_capable" on public.bpabot_manuales;
create policy "bpabot_manuales_write_if_capable" on public.bpabot_manuales
  for all using (public.bpabot_has_capability('gestionar_documentos'))
  with check (public.bpabot_has_capability('gestionar_documentos'));

-- ── Políticas: bpabot_role_capabilities ─────────────────────────────────────
drop policy if exists "bpabot_caps_select_authenticated" on public.bpabot_role_capabilities;
create policy "bpabot_caps_select_authenticated" on public.bpabot_role_capabilities
  for select using (auth.uid() is not null);

drop policy if exists "bpabot_caps_write_if_admin" on public.bpabot_role_capabilities;
create policy "bpabot_caps_write_if_admin" on public.bpabot_role_capabilities
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- ── Políticas: bpabot_mensajes (cada usuario ve/escribe solo lo suyo;
-- admin puede auditar todo) ─────────────────────────────────────────────────
drop policy if exists "bpabot_mensajes_own_or_admin_select" on public.bpabot_mensajes;
create policy "bpabot_mensajes_own_or_admin_select" on public.bpabot_mensajes
  for select using (auth.uid() = user_id or public.current_user_role() = 'admin');

drop policy if exists "bpabot_mensajes_own_insert" on public.bpabot_mensajes;
create policy "bpabot_mensajes_own_insert" on public.bpabot_mensajes
  for insert with check (auth.uid() = user_id);

-- ── Storage bucket privado para los manuales originales ────────────────────
insert into storage.buckets (id, name, public)
values ('BPA_BOT_Manuales', 'BPA_BOT_Manuales', false)
on conflict (id) do nothing;

drop policy if exists "bpabot_manuales_storage_select" on storage.objects;
create policy "bpabot_manuales_storage_select" on storage.objects
  for select using (bucket_id = 'BPA_BOT_Manuales' and auth.uid() is not null);

drop policy if exists "bpabot_manuales_storage_write" on storage.objects;
create policy "bpabot_manuales_storage_write" on storage.objects
  for insert with check (bucket_id = 'BPA_BOT_Manuales' and public.bpabot_has_capability('gestionar_documentos'));

drop policy if exists "bpabot_manuales_storage_delete" on storage.objects;
create policy "bpabot_manuales_storage_delete" on storage.objects
  for delete using (bucket_id = 'BPA_BOT_Manuales' and public.bpabot_has_capability('gestionar_documentos'));

-- ── Semilla de la matriz de capacidades: admin = todo (además del fallback
-- en bpabot_has_capability), editor = preguntas semánticas + consulta
-- documental, viewer = solo consulta documental (extractos literales) ──────
insert into public.bpabot_role_capabilities (role_key, capability, enabled) values
  ('admin',  'gestionar_documentos', true),
  ('admin',  'chat_semantico',       true),
  ('admin',  'consulta_documental',  true),
  ('editor', 'gestionar_documentos', false),
  ('editor', 'chat_semantico',       true),
  ('editor', 'consulta_documental',  true),
  ('viewer', 'gestionar_documentos', false),
  ('viewer', 'chat_semantico',       false),
  ('viewer', 'consulta_documental',  true)
on conflict (role_key, capability) do nothing;

-- ── Tab "BPA-BOT" visible para todos los roles por defecto (el nivel de
-- capacidad dentro del chat lo regula la matriz de arriba, no esto) ────────
insert into public.role_permissions (role_key, tab_id, access) values
  ('editor', 'bpabot', 'view'),
  ('viewer', 'bpabot', 'view')
on conflict (role_key, tab_id) do update set access = 'view';
