-- ═════════════════════════════════════════════════════════════════════════
-- Softland · «Qué hace» cada opción del menú / pantalla del manual de OLO.
-- La primera versión la infiere un modelo (origen «inferido») a partir del
-- manual, el mapeo funcional de Softland y el conocimiento de un ERP; el admin
-- la corrige o valida (origen «editado»). Lectura: usuarios activos.
-- Escritura: solo admin. El id es el de softland_opciones_lista.json.
-- ═════════════════════════════════════════════════════════════════════════
create table if not exists public.softland_opciones (
  id             text primary key,
  descripcion    text not null,
  origen         text not null default 'inferido' check (origen in ('inferido','editado')),
  modelo         text,
  editado_por    uuid,
  editado_nombre text,
  updated_at     timestamptz not null default now()
);
alter table public.softland_opciones enable row level security;

drop policy if exists softland_opciones_leer on public.softland_opciones;
create policy softland_opciones_leer on public.softland_opciones for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active'));

drop policy if exists softland_opciones_admin on public.softland_opciones;
create policy softland_opciones_admin on public.softland_opciones for all to authenticated
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
