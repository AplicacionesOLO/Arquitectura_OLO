-- ═════════════════════════════════════════════════════════════════════════
-- Asesor · Conocimiento abstracto: correos, chats, imágenes, notas y
-- documentos sueltos que se pegan o cargan en el BPA. La Edge Function
-- asesor-abstracto los clasifica, resume, interpreta y enlaza con lo que ya
-- existe, y los publica en asesor_docs (tipo «abstracto») para el asesor.
-- Todo SOLO ADMIN. Los archivos van a un bucket PRIVADO.
-- ═════════════════════════════════════════════════════════════════════════
create table if not exists public.asesor_abstracto (
  id             uuid primary key default gen_random_uuid(),
  titulo         text,
  fuente         text not null default 'nota',        -- correo | chat | imagen | documento | nota
  contenido      text,                                 -- texto pegado o extraído en el navegador
  archivo_path   text,                                 -- ruta en el bucket privado asesor-abstracto
  archivo_nombre text,
  mime           text,
  estado         text not null default 'pendiente' check (estado in ('pendiente','procesando','listo','error')),
  categoria      text,
  resultado      jsonb,                                -- clasificación completa del modelo
  error          text,
  modelo         text,
  tokens_entrada int, tokens_salida int,
  created_by     uuid default auth.uid(),
  created_at     timestamptz not null default now(),
  procesado_at   timestamptz
);
create index if not exists asesor_abstracto_fecha_idx on public.asesor_abstracto (created_at desc);
alter table public.asesor_abstracto enable row level security;
drop policy if exists asesor_abstracto_admin on public.asesor_abstracto;
create policy asesor_abstracto_admin on public.asesor_abstracto for all
  using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

-- bucket privado (no público) y acceso solo admin
insert into storage.buckets (id, name, public, file_size_limit)
values ('asesor-abstracto', 'asesor-abstracto', false, 15728640)
on conflict (id) do update set public = false, file_size_limit = 15728640;
drop policy if exists asesor_abstracto_objetos_admin on storage.objects;
create policy asesor_abstracto_objetos_admin on storage.objects for all to authenticated
  using (bucket_id = 'asesor-abstracto' and current_user_role() = 'admin')
  with check (bucket_id = 'asesor-abstracto' and current_user_role() = 'admin');
