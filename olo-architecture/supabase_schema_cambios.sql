-- Monitoreo de bases de datos (schema_watch): cada corrida del job publica aquí
-- su informe. Lectura para usuarios autenticados; escritura solo con la clave de
-- servicio (el job), por eso no hay política de escritura.
create table if not exists public.bpa_schema_cambios (
  id           bigserial primary key,
  generado     timestamptz not null,
  anterior     timestamptz,
  resumen      jsonb not null default '{}'::jsonb,
  detalle      jsonb not null default '{}'::jsonb,
  informe_md   text,
  analisis_md  text,
  created_at   timestamptz not null default now()
);
create index if not exists bpa_schema_cambios_generado_idx on public.bpa_schema_cambios (generado desc);
alter table public.bpa_schema_cambios enable row level security;
drop policy if exists bpa_schema_cambios_select_authenticated on public.bpa_schema_cambios;
create policy bpa_schema_cambios_select_authenticated on public.bpa_schema_cambios
  for select using (auth.uid() is not null);
