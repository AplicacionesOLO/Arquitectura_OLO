-- Monitor › Jobs: catálogo de jobs automáticos del BPA y su historial.
-- La configuración (activo, frecuencia, modelo, tope de gasto) se edita desde
-- el BPA (solo admin) y el despachador (jobs/despachador.js, tarea de Windows
-- cada 15 min) la lee en cada revisión: el BPA es la fuente de verdad.
create table if not exists public.bpa_jobs (
  id                text primary key,
  nombre            text not null,
  descripcion       text,
  tipo              text not null,                 -- cómo corre: nativo Windows, rutina en la nube…
  motor             text,                          -- qué ejecuta (Node, Claude Code…)
  ubicacion         jsonb not null default '{}'::jsonb,  -- { equipo, ruta, comando, tarea_windows }
  config            jsonb not null default '{}'::jsonb,  -- { activo, frecuencia, modelo, limite_mensual_usd, solo_si_cambios, timeout_min }
  limitaciones      jsonb not null default '[]'::jsonb,
  ejecutar_ahora    boolean not null default false,
  ultima_ejecucion  timestamptz,
  ultima_revision   timestamptz,                   -- último latido del despachador
  orden             int not null default 0,
  updated_at        timestamptz not null default now(),
  updated_by        uuid
);
create table if not exists public.bpa_job_runs (
  id              bigserial primary key,
  job_id          text not null references public.bpa_jobs(id) on delete cascade,
  inicio          timestamptz not null,
  fin             timestamptz,
  duracion_ms     int,
  estado          text not null check (estado in ('ok','error','omitido')),
  disparo         text,                            -- programado | manual
  modelo          text,
  costo_usd       numeric(10,4) not null default 0,
  tokens_entrada  int,
  tokens_salida   int,
  mensaje         text
);
create index if not exists bpa_job_runs_job_idx on public.bpa_job_runs (job_id, inicio desc);

alter table public.bpa_jobs enable row level security;
alter table public.bpa_job_runs enable row level security;
drop policy if exists bpa_jobs_select on public.bpa_jobs;
create policy bpa_jobs_select on public.bpa_jobs for select using (auth.uid() is not null);
drop policy if exists bpa_jobs_update_admin on public.bpa_jobs;
create policy bpa_jobs_update_admin on public.bpa_jobs for update
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');
drop policy if exists bpa_job_runs_select on public.bpa_job_runs;
create policy bpa_job_runs_select on public.bpa_job_runs for select using (auth.uid() is not null);

-- quién editó la configuración lo pone la base
create or replace function public.bpa_jobs_autor() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then new.updated_by := auth.uid(); end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists bpa_jobs_autor on public.bpa_jobs;
create trigger bpa_jobs_autor before update on public.bpa_jobs for each row execute function public.bpa_jobs_autor();

-- Jobs actuales
insert into public.bpa_jobs (id, nombre, descripcion, tipo, motor, ubicacion, config, limitaciones, orden) values
('schema_watch', 'Monitoreo de bases de datos',
 'Foto de metadatos de las 6 instancias SQL Server, comparación contra el BPA y contra la corrida anterior, análisis en español con Claude si hubo cambios y publicación en Monitor › Cambios en bases.',
 'Nativo Windows · Programador de tareas', 'Node.js + Claude Code (claude -p, solo lectura)',
 '{"equipo":"OLOL-03N0013192","ruta":"C:\\GitHub\\Arquitectura_OLO\\schema_watch","comando":"node schema_watch/run.js","tarea_windows":"BPA OLO - Despachador de jobs"}',
 '{"activo":true,"frecuencia":{"tipo":"semanal","dias":[1,2,3,4,5],"hora":"07:00"},"modelo":"claude-opus-5-5","limite_mensual_usd":20,"solo_si_cambios":true,"timeout_min":20}',
 '["Corre en el equipo indicado: debe estar encendido, con la sesión del usuario iniciada y dentro de la red de OLO o con VPN (las bases usan IPs privadas).",
   "Necesita Node.js, las credenciales en .env y Claude Code con sesión iniciada en ese equipo.",
   "El usuario de integración hoy no ve EFLOW_OLO ni SOFTLANDQA: esos esquemas quedan sin verificar hasta que TI devuelva los permisos.",
   "Claude solo lee y explica: no modifica los datos del BPA; las actualizaciones se aplican a mano.",
   "El costo es el que informa Claude Code; con plan de suscripción es una estimación equivalente a la API."]', 1),
('despachador', 'Despachador de jobs',
 'Revisa cada 15 minutos la configuración de los jobs en el BPA y ejecuta los que tocan (o los pedidos con «Ejecutar ahora»). Registra cada corrida con su duración y costo.',
 'Nativo Windows · Programador de tareas', 'Node.js',
 '{"equipo":"OLOL-03N0013192","ruta":"C:\\GitHub\\Arquitectura_OLO\\jobs","comando":"node jobs/despachador.js","tarea_windows":"BPA OLO - Despachador de jobs"}',
 '{"activo":true,"frecuencia":{"tipo":"cada_minutos","minutos":15},"modelo":null,"limite_mensual_usd":0,"timeout_min":60}',
 '["Su frecuencia la fija la tarea de Windows (cada 15 min): cambiarla requiere volver a ejecutar jobs/instalar_tarea.cmd en el equipo.",
   "Si el equipo está apagado o sin sesión, ningún job corre; al volver, ejecuta los que quedaron pendientes (una sola vez).",
   "Los jobs pueden llegar hasta 15 minutos tarde respecto a su hora programada."]', 0)
on conflict (id) do nothing;

-- El módulo lo ven admin y editor; la configuración solo la cambia admin (RLS)
insert into public.role_permissions (role_key, tab_id, access)
select r, 'monitor', 'view' from unnest(array['admin','editor']) r
where not exists (select 1 from public.role_permissions x where x.role_key = r and x.tab_id = 'monitor');
