-- Módulo Workflows: ediciones de cada lienzo (posiciones de tarjetas y conexiones
-- agregadas u ocultas). Los pasos y procesos NO se guardan aquí: salen de las
-- fichas de proceso; esta tabla solo guarda cómo se acomodan en el lienzo.
create table if not exists public.workflow_layouts (
  id          text primary key,                 -- lienzo: 'maestro' o id del silo
  posiciones  jsonb not null default '{}'::jsonb, -- { nodoId: {x,y} }
  conexiones  jsonb not null default '[]'::jsonb, -- [{ from, to }] agregadas a mano
  ocultas     jsonb not null default '[]'::jsonb, -- claves 'from>to' de flechas ocultadas
  updated_by  uuid default auth.uid(),
  updated_at  timestamptz not null default now()
);
alter table public.workflow_layouts enable row level security;
drop policy if exists workflow_layouts_select_authenticated on public.workflow_layouts;
create policy workflow_layouts_select_authenticated on public.workflow_layouts
  for select using (auth.uid() is not null);
drop policy if exists workflow_layouts_write_if_editor on public.workflow_layouts;
create policy workflow_layouts_write_if_editor on public.workflow_layouts
  for all using (current_user_role() = any (array['admin','editor']))
  with check (current_user_role() = any (array['admin','editor']));

-- El módulo lo ven los mismos roles que ven Procesos
insert into public.role_permissions (role_key, tab_id, access)
select role_key, 'workflows', access from public.role_permissions r
where tab_id = 'olo-arch'
  and not exists (select 1 from public.role_permissions x where x.role_key = r.role_key and x.tab_id = 'workflows');

-- Fase 2: rol asignado a mano a un paso ({ nodoId: rol }); sin entrada = el inferido
alter table public.workflow_layouts add column if not exists roles jsonb not null default '{}'::jsonb;
