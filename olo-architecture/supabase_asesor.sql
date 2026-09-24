-- ═════════════════════════════════════════════════════════════════════════
-- Asesor de cambios — agente que razona sobre cambios al WMS con todo lo que
-- el BPA sabe: estructura de las bases, manuales, procesos y el historial de
-- solicitudes de cambio a ePRAC. Todo es de acceso SOLO ADMIN.
--   · solicitudes_cambio : catálogo de solicitudes (estado editable)
--   · asesor_docs        : base de conocimiento (búsqueda de texto completo)
--   · asesor_consultas   : cada consulta y su respuesta (historial)
-- La ingesta la hace asesor/ingestar.mjs con la clave de servicio.
-- ═════════════════════════════════════════════════════════════════════════
create extension if not exists unaccent;

-- unaccent no es IMMUTABLE: envoltorio para poder indexar
create or replace function public.asesor_norm(t text) returns text
language sql immutable parallel safe as $$ select lower(public.unaccent('public.unaccent', coalesce(t, ''))) $$;

create table if not exists public.solicitudes_cambio (
  id               text primary key,             -- SC-001… (o el número de ePRAC si lo trae)
  titulo           text not null,
  archivo          text,                         -- nombre del documento de origen
  numero_eprac     text,
  cliente          text, almacen text, compania text,
  solicitante      text, fecha date, modulo text, prioridad text,
  como             text, necesito text, para text,
  situacion_actual text,
  descripcion      text,
  atencion         jsonb not null default '{}'::jsonb,  -- lo que llena ePRAC: fecha, atendido por, proforma, factura
  entidades        jsonb not null default '{}'::jsonb,  -- tablas, reglas, pantallas y procesos detectados
  estado           text not null default 'por_definir'
                   check (estado in ('aplicada','en_desarrollo','pendiente','rechazada','por_definir')),
  notas            text,
  hash             text,                         -- para no duplicar el mismo documento
  updated_at       timestamptz not null default now(),
  updated_by       uuid
);

create table if not exists public.asesor_docs (
  id        text primary key,                    -- tipo:ref
  tipo      text not null,                       -- solicitud | tabla | pantalla_wms | pantalla_wmh | pantalla_sorter | pantalla_softland | proceso | regla | contexto | estandar
  ref       text not null,
  titulo    text not null,
  texto     text not null,
  meta      jsonb not null default '{}'::jsonb,
  fts       tsvector generated always as (
              setweight(to_tsvector('spanish', public.asesor_norm(titulo)), 'A') ||
              setweight(to_tsvector('spanish', public.asesor_norm(left(texto, 200000))), 'B')) stored,
  updated_at timestamptz not null default now()
);
create index if not exists asesor_docs_fts_idx on public.asesor_docs using gin (fts);
create index if not exists asesor_docs_tipo_idx on public.asesor_docs (tipo, ref);

create table if not exists public.asesor_consultas (
  id          bigserial primary key,
  pregunta    text not null,
  respuesta   jsonb,
  modelo      text,
  tokens_entrada int, tokens_salida int,
  herramientas jsonb,                            -- qué consultó el agente
  duracion_ms int,
  user_id     uuid default auth.uid(),
  created_at  timestamptz not null default now()
);

-- Búsqueda: texto completo en español sin acentos; OR entre palabras, ordenado por relevancia
create or replace function public.asesor_buscar(q text, tipos text[] default null, lim int default 10)
returns table (id text, tipo text, ref text, titulo text, fragmento text, meta jsonb, rango real)
language sql stable security invoker as $$
  with consulta as (
    select to_tsquery('spanish', string_agg(w || ':*', ' | ')) tq
    from regexp_split_to_table(public.asesor_norm(q), '[^a-z0-9_]+') w
    where length(w) >= 3
  )
  select d.id, d.tipo, d.ref, d.titulo,
         ts_headline('spanish', left(d.texto, 20000), c.tq, 'MaxFragments=2, MaxWords=35, MinWords=12, StartSel=«, StopSel=»') fragmento,
         d.meta, ts_rank(d.fts, c.tq) rango
  from public.asesor_docs d, consulta c
  where c.tq is not null and d.fts @@ c.tq and (tipos is null or d.tipo = any(tipos))
  order by rango desc
  limit greatest(1, least(lim, 25));
$$;

alter table public.solicitudes_cambio enable row level security;
alter table public.asesor_docs enable row level security;
alter table public.asesor_consultas enable row level security;
do $$ declare t text; begin
  foreach t in array array['solicitudes_cambio','asesor_docs','asesor_consultas'] loop
    execute format('drop policy if exists %I on public.%I', t || '_admin', t);
    execute format('create policy %I on public.%I for all using (current_user_role() = ''admin'') with check (current_user_role() = ''admin'')', t || '_admin', t);
  end loop;
end $$;

-- quién cambió el estado de una solicitud lo pone la base
create or replace function public.solicitudes_cambio_autor() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then new.updated_by := auth.uid(); end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists solicitudes_cambio_autor on public.solicitudes_cambio;
create trigger solicitudes_cambio_autor before update on public.solicitudes_cambio for each row execute function public.solicitudes_cambio_autor();

-- el módulo lo ve solo admin
insert into public.role_permissions (role_key, tab_id, access)
select 'admin', 'asesor', 'view'
where not exists (select 1 from public.role_permissions where role_key = 'admin' and tab_id = 'asesor');
