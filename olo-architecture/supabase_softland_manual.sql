-- ═════════════════════════════════════════════════════════════════════════
-- Manual Softland ERP de OLO (compañía OVERSEAS): capturas en un bucket
-- PRIVADO. Las capturas muestran datos reales (clientes, saldos, facturas),
-- así que NO van al bucket público Detalles_Porcesos.
-- Lectura: usuarios activos cuyo rol puede ver «Módulos ERP» (tab softland)
-- o admin. Escritura: solo admin (la carga se hace con la service key).
-- El frontend pide URLs firmadas (createSignedUrls) con vencimiento.
-- ═════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit)
values ('softland-manual', 'softland-manual', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists softland_manual_leer on storage.objects;
create policy softland_manual_leer on storage.objects for select to authenticated
  using (bucket_id = 'softland-manual' and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'active'
      and (p.role = 'admin' or exists (select 1 from public.role_permissions rp
            where rp.role_key = p.role and rp.tab_id = 'softland' and rp.access <> 'none'))));

drop policy if exists softland_manual_admin on storage.objects;
create policy softland_manual_admin on storage.objects for all to authenticated
  using (bucket_id = 'softland-manual' and public.current_user_role() = 'admin')
  with check (bucket_id = 'softland-manual' and public.current_user_role() = 'admin');
