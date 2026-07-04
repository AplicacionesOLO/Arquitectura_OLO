-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Aprobación manual de cuentas nuevas
-- Requiere haber corrido supabase_bootstrap.sql y supabase_admin_module.sql.
-- Run en Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to commit: solo esquema/políticas, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── profiles.role deja de ser obligatorio: un usuario pendiente no tiene rol ─
alter table public.profiles alter column role drop not null;
alter table public.profiles alter column role drop default;

-- ── Estado de la cuenta, independiente del rol ─────────────────────────────
alter table public.profiles add column if not exists status text not null default 'pending'
  check (status in ('pending','active','disabled'));

-- Cuentas ya existentes con rol asignado se consideran ya aprobadas.
update public.profiles set status = 'active' where role is not null and status = 'pending';

-- ── Alta: cuentas nuevas quedan SIN rol y en estado pendiente ───────────────
-- Excepción: el correo bootstrap del proyecto entra directo como admin activo,
-- para siempre tener al menos una cuenta capaz de aprobar a las demás.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nombre, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    case when lower(new.email) = 'arojas@ologistics.com' then 'admin' else null end,
    case when lower(new.email) = 'arojas@ologistics.com' then 'active' else 'pending' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ── Extiende la protección anti-escalada de privilegios a la columna status ─
-- Nadie puede auto-aprobarse ni auto-asignarse un rol editando su propio
-- perfil — solo un admin puede cambiar role/status de cualquier fila.
create or replace function public.protect_role_column()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if public.current_user_role() is distinct from 'admin' then
    if new.role is distinct from old.role then new.role := old.role; end if;
    if new.status is distinct from old.status then new.status := old.status; end if;
  end if;
  return new;
end;
$$;
