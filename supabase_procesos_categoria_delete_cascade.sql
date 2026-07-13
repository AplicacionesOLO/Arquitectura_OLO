-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Procesos: permitir eliminar una categoría (silo)
-- aunque tenga subprocesos.
--
-- supabase_procesos_categorias.sql creó procesos_nodes_categoria_id_fkey solo
-- con "on update cascade", sin "on delete cascade". Al borrar un silo con
-- subprocesos, Postgres rechaza el delete con:
--   update or delete on table "procesos_categorias" violates foreign key
--   constraint "procesos_nodes_categoria_id_fkey" on table "procesos_nodes"
--
-- Esta migración agrega "on delete cascade": borrar una categoría ahora
-- borra en cascada sus procesos_nodes (que a su vez ya cascadean a
-- procesos_archivos, ver supabase_procesos_module.sql).
--
-- Run en Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to commit: solo esquema, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.procesos_nodes drop constraint if exists procesos_nodes_categoria_id_fkey;
alter table public.procesos_nodes
  add constraint procesos_nodes_categoria_id_fkey
  foreign key (categoria_id) references public.procesos_categorias(id)
  on update cascade on delete cascade;
