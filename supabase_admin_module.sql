-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Módulo Administración (roles, permisos, usuarios)
-- Requiere haber corrido supabase_bootstrap.sql antes.
-- Run en Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to commit: contiene solo definiciones de esquema/políticas, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Tabla de roles (extensible — no solo los 3 fijos originales) ───────────
create table if not exists public.roles (
  key text primary key,
  label text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.roles (key, label, description, is_system) values
  ('admin',  'Admin',  'Acceso total: gestiona usuarios, roles y permisos.', true),
  ('editor', 'Editor', 'Puede navegar y consultar todo el contenido habilitado para su rol.', true),
  ('viewer', 'Viewer', 'Acceso de solo consulta a lo habilitado para su rol.', true)
on conflict (key) do nothing;

alter table public.roles enable row level security;

drop policy if exists "roles_select_authenticated" on public.roles;
create policy "roles_select_authenticated" on public.roles
  for select using (auth.uid() is not null);

drop policy if exists "roles_write_if_admin" on public.roles;
create policy "roles_write_if_admin" on public.roles
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Protege los 3 roles del sistema: no se pueden borrar ni renombrar su key.
create or replace function public.protect_system_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    if old.is_system then raise exception 'No se puede eliminar un rol del sistema (%).', old.key; end if;
    return old;
  end if;
  if old.is_system and new.key is distinct from old.key then
    raise exception 'No se puede renombrar la clave de un rol del sistema (%).', old.key;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_system_role_trigger on public.roles;
create trigger protect_system_role_trigger
  before update or delete on public.roles
  for each row execute procedure public.protect_system_role();

-- ── profiles.role ahora referencia roles.key en vez de un CHECK fijo ────────
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_fkey foreign key (role) references public.roles(key) on update cascade;

-- ── Matriz de permisos: qué tabs ve cada rol ────────────────────────────────
create table if not exists public.role_permissions (
  role_key text not null references public.roles(key) on delete cascade on update cascade,
  tab_id text not null,
  access text not null default 'view' check (access in ('none','view')),
  primary key (role_key, tab_id)
);

alter table public.role_permissions enable row level security;

drop policy if exists "role_permissions_select_authenticated" on public.role_permissions;
create policy "role_permissions_select_authenticated" on public.role_permissions
  for select using (auth.uid() is not null);

drop policy if exists "role_permissions_write_if_admin" on public.role_permissions;
create policy "role_permissions_write_if_admin" on public.role_permissions
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Seed: todos los roles existentes ven las 7 secciones principales por defecto
-- (comportamiento actual sin cambios). "admin" se gestiona aparte en el
-- frontend (hardcoded), no vive en esta matriz — evita que un admin se
-- bloquee a sí mismo el panel de Administración por error de permisos.
insert into public.role_permissions (role_key, tab_id, access)
select r.key, t.tab_id, 'view'
from public.roles r
cross join (values
  ('bpa'), ('olo-arch'), ('ecosystem'), ('softland'), ('ops'), ('integrations'), ('context')
) as t(tab_id)
on conflict (role_key, tab_id) do nothing;
