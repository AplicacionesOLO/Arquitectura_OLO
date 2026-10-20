-- ═════════════════════════════════════════════════════════════════════════
-- Asesor · memoria de conversaciones. Cada consulta al asesor queda también
-- como documento de la base de conocimiento (asesor_docs, tipo «consulta»):
-- el asesor y el agente de voz la consultan para no volver a analizar lo mismo.
-- Por eso ELIMINAR una conversación (o su documento) es solo para ADMIN, aunque
-- en el futuro otros roles puedan usar el asesor (acceso a la pestaña «asesor»).
-- ═════════════════════════════════════════════════════════════════════════
create or replace function public.puede_usar_asesor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'active'
    and (p.role = 'admin' or exists (select 1 from public.role_permissions rp
          where rp.role_key = p.role and rp.tab_id = 'asesor' and rp.access <> 'none')));
$$;

-- asesor_consultas: leer, crear y actualizar con acceso al asesor; borrar solo admin
drop policy if exists asesor_consultas_admin on public.asesor_consultas;
drop policy if exists asesor_consultas_leer on public.asesor_consultas;
drop policy if exists asesor_consultas_crear on public.asesor_consultas;
drop policy if exists asesor_consultas_actualizar on public.asesor_consultas;
drop policy if exists asesor_consultas_borrar on public.asesor_consultas;
create policy asesor_consultas_leer on public.asesor_consultas for select to authenticated using (public.puede_usar_asesor());
create policy asesor_consultas_crear on public.asesor_consultas for insert to authenticated with check (public.puede_usar_asesor());
create policy asesor_consultas_actualizar on public.asesor_consultas for update to authenticated using (public.puede_usar_asesor()) with check (public.puede_usar_asesor());
create policy asesor_consultas_borrar on public.asesor_consultas for delete to authenticated using (public.current_user_role() = 'admin');

-- asesor_docs: el resto de la base sigue solo admin; los documentos de conversaciones
-- se pueden leer y crear con acceso al asesor, y borrar solo admin
drop policy if exists asesor_docs_consulta_leer on public.asesor_docs;
drop policy if exists asesor_docs_consulta_crear on public.asesor_docs;
create policy asesor_docs_consulta_leer on public.asesor_docs for select to authenticated using (tipo = 'consulta' and public.puede_usar_asesor());
create policy asesor_docs_consulta_crear on public.asesor_docs for insert to authenticated with check (tipo = 'consulta' and public.puede_usar_asesor());
-- (asesor_docs_admin, ya existente, sigue dando todo al admin, incluido borrar)

-- Adjuntos de cada consulta: [{ nombre, tipo, destino («oficial» | «abstracto»), ref }]
-- (el original quedó en Documentación oficial ePRAC o en Conocimiento abstracto)
alter table public.asesor_consultas add column if not exists adjuntos jsonb not null default '[]'::jsonb;
