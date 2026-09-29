-- ═════════════════════════════════════════════════════════════════════════
-- Asesor · Documentación oficial ePRAC: documentos que el admin carga desde el
-- BPA (solicitudes de cambio, manuales, formatos, actas de ePRAC).
-- Los archivos van a un bucket PRIVADO; cada carga queda en eprac_cargas y la
-- procesa asesor/ingestar.mjs (job «eprac_docs» del despachador) con la misma
-- lógica que la carpeta local: plantilla de ePRAC, detección de tablas,
-- pantallas y procesos, y sin duplicar documentos. Todo SOLO ADMIN.
-- ═════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit)
values ('eprac-docs', 'eprac-docs', false, 20971520)
on conflict (id) do update set public = false, file_size_limit = 20971520;

drop policy if exists eprac_docs_admin on storage.objects;
create policy eprac_docs_admin on storage.objects for all to authenticated
  using (bucket_id = 'eprac-docs' and public.current_user_role() = 'admin')
  with check (bucket_id = 'eprac-docs' and public.current_user_role() = 'admin');

create table if not exists public.eprac_cargas (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,                 -- nombre original del archivo
  path         text not null unique,          -- ruta en el bucket eprac-docs
  tamano       int,
  estado       text not null default 'pendiente'
               check (estado in ('pendiente','procesado','duplicado','error')),
  tipo         text,                          -- solicitud | estandar | contexto (lo decide la ingesta)
  solicitud_id text,                          -- solicitudes_cambio.id si resultó una solicitud
  mensaje      text,
  subido_por   uuid default auth.uid(),
  subido_nombre text,
  created_at   timestamptz not null default now(),
  procesado_at timestamptz
);
create index if not exists eprac_cargas_fecha_idx on public.eprac_cargas (created_at desc);
alter table public.eprac_cargas enable row level security;
drop policy if exists eprac_cargas_admin on public.eprac_cargas;
create policy eprac_cargas_admin on public.eprac_cargas for all to authenticated
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

-- Job del despachador: procesa las cargas pendientes (solo corre si hay alguna)
insert into public.bpa_jobs (id, nombre, descripcion, tipo, motor, ubicacion, config, limitaciones, orden)
values ('eprac_docs', 'Documentación ePRAC cargada',
  'Procesa los documentos que el admin carga en Asesor › Documentación oficial ePRAC: extrae el texto, lo estructura con la plantilla de ePRAC, detecta tablas, pantallas y procesos y actualiza la base de conocimiento del asesor. Si no hay cargas pendientes, termina de inmediato.',
  'Nativo Windows · Programador de tareas', 'Node.js (sin IA)',
  '{"ruta":"C:\\GitHub\\Arquitectura_OLO\\asesor","equipo":"OLOL-03N0013192","comando":"node asesor/ingestar.mjs --solo-si-pendientes","tarea_windows":"BPA OLO - Despachador de jobs"}'::jsonb,
  '{"activo":true,"modelo":null,"frecuencia":{"tipo":"cada_minutos","minutos":15},"timeout_min":20,"limite_mensual_usd":0}'::jsonb,
  to_jsonb(array['Corre en el equipo indicado, encendido y con sesión iniciada: una carga se procesa en la siguiente revisión del despachador (hasta 15 minutos).',
        'Los PDF necesitan pdftotext (Poppler) instalado en ese equipo; los PDF escaneados sin texto no se pueden leer.',
        'La carpeta local de solicitudes (Desktop\\ar\\Eprac) se sigue leyendo en cada corrida: los documentos cargados se suman a ella.']),
  4)
on conflict (id) do nothing;
