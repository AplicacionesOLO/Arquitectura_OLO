-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Procesos: 8 nuevos procesos de Operación Logística
-- (P1.1–P1.8), adaptados del Macroproceso MP4 "Distribución" (Stock-to-
-- Delivery) del modelo B2R de Grupo Mayoreo — cuyo silo de origen es
-- literalmente "Logística (OLO)". Reescrito en términos propios de OLO
-- (clientes en vez de "casas", etc.) como borrador inicial editable.
--
-- No modifica ni elimina las categorías existentes (Inbound, Outbound,
-- CrossDocking, No Nacionalizado, Comercio, Administrativo) ni sus
-- subprocesos/archivos ya adjuntos — solo agrega 8 categorías nuevas
-- (num 7–14) con sus 8 subprocesos cada una (S1–S8).
--
-- Ya ejecutado contra la base de datos en vivo — este archivo documenta el
-- seed para el historial del repo. Re-ejecutable de forma segura gracias a
-- "on conflict do nothing".
-- Run en Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to commit: solo datos de procesos, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.procesos_categorias (id, num, label, color) values
  ('log_planificacion',    7,  'P1.1 · Planificación logística',           '#c0392b'),
  ('log_almacenaje',       8,  'P1.2 · Almacenaje',                        '#16a085'),
  ('log_preparacion',      9,  'P1.3 · Preparación de pedidos',            '#f39c12'),
  ('log_transporte',       10, 'P1.4 · Transporte',                        '#5B21B6'),
  ('log_inventario',       11, 'P1.5 · Gestión de inventario físico',      '#2980b9'),
  ('log_servicio_cliente', 12, 'P1.6 · Servicio logístico a clientes',     '#27ae60'),
  ('log_mantenimiento',    13, 'P1.7 · Mantenimiento de Activos',          '#8e44ad'),
  ('log_desempeno',        14, 'P1.8 · Desempeño logístico',               '#d35400')
on conflict (id) do nothing;

insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order) values
  -- P1.1 · Planificación logística
  ('log_planificacion', null, 0, 'S1 · Diseño de la red logística', 0),
  ('log_planificacion', null, 0, 'S2 · Planificación de capacidad del centro de distribución', 1),
  ('log_planificacion', null, 0, 'S3 · Slotting', 2),
  ('log_planificacion', null, 0, 'S4 · Planificación de mano de obra', 3),
  ('log_planificacion', null, 0, 'S5 · Presupuesto logístico', 4),
  ('log_planificacion', null, 0, 'S6 · Tarifario de servicios a clientes', 5),
  ('log_planificacion', null, 0, 'S7 · Planificación de temporada alta', 6),
  ('log_planificacion', null, 0, 'S8 · Continuidad operativa', 7),
  -- P1.2 · Almacenaje
  ('log_almacenaje', null, 0, 'S1 · Acomodo (putaway)', 0),
  ('log_almacenaje', null, 0, 'S2 · Gestión de ubicaciones', 1),
  ('log_almacenaje', null, 0, 'S3 · Reabastecimiento a picking', 2),
  ('log_almacenaje', null, 0, 'S4 · Control de condiciones (peso, volumen, fragilidad)', 3),
  ('log_almacenaje', null, 0, 'S5 · Gestión de lotes', 4),
  ('log_almacenaje', null, 0, 'S6 · Optimización de ocupación', 5),
  ('log_almacenaje', null, 0, 'S7 · Gestión de mermas', 6),
  ('log_almacenaje', null, 0, 'S8 · Seguridad del almacén', 7),
  -- P1.3 · Preparación de pedidos
  ('log_preparacion', null, 0, 'S1 · Liberación de olas de picking', 0),
  ('log_preparacion', null, 0, 'S2 · Picking por pedido, lote o zona', 1),
  ('log_preparacion', null, 0, 'S3 · Control de exactitud', 2),
  ('log_preparacion', null, 0, 'S4 · Empaque', 3),
  ('log_preparacion', null, 0, 'S5 · Consolidación por ruta', 4),
  ('log_preparacion', null, 0, 'S6 · Documentación de despacho', 5),
  ('log_preparacion', null, 0, 'S7 · Gestión de pendientes (backorders)', 6),
  ('log_preparacion', null, 0, 'S8 · Productividad de preparación', 7),
  -- P1.4 · Transporte
  ('log_transporte', null, 0, 'S1 · Planificación de rutas', 0),
  ('log_transporte', null, 0, 'S2 · Asignación de flota', 1),
  ('log_transporte', null, 0, 'S3 · Despacho', 2),
  ('log_transporte', null, 0, 'S4 · Ejecución de la entrega', 3),
  ('log_transporte', null, 0, 'S5 · Prueba de entrega (POD)', 4),
  ('log_transporte', null, 0, 'S6 · Novedades en ruta', 5),
  ('log_transporte', null, 0, 'S7 · Logística inversa (recolección de devoluciones)', 6),
  ('log_transporte', null, 0, 'S8 · Liquidación de rutas', 7),
  -- P1.5 · Gestión de inventario físico
  ('log_inventario', null, 0, 'S1 · Conteos cíclicos', 0),
  ('log_inventario', null, 0, 'S2 · Inventario general', 1),
  ('log_inventario', null, 0, 'S3 · Investigación de diferencias', 2),
  ('log_inventario', null, 0, 'S4 · Ajustes de inventario', 3),
  ('log_inventario', null, 0, 'S5 · Gestión de obsoletos', 4),
  ('log_inventario', null, 0, 'S6 · Trazabilidad de movimientos', 5),
  ('log_inventario', null, 0, 'S7 · Exactitud de inventario (IRA)', 6),
  ('log_inventario', null, 0, 'S8 · Conciliación WMS-ERP', 7),
  -- P1.6 · Servicio logístico a clientes
  ('log_servicio_cliente', null, 0, 'S1 · Acuerdos de nivel de servicio', 0),
  ('log_servicio_cliente', null, 0, 'S2 · Facturación de servicios logísticos', 1),
  ('log_servicio_cliente', null, 0, 'S3 · Costeo por actividad (Slotting → Almacenaje → Picking)', 2),
  ('log_servicio_cliente', null, 0, 'S4 · Recuperación del costo por SKU', 3),
  ('log_servicio_cliente', null, 0, 'S5 · Reclamos de servicio', 4),
  ('log_servicio_cliente', null, 0, 'S6 · Comités de servicio con el cliente', 5),
  ('log_servicio_cliente', null, 0, 'S7 · Mejora del costo por servir', 6),
  ('log_servicio_cliente', null, 0, 'S8 · Rentabilidad del servicio logístico', 7),
  -- P1.7 · Mantenimiento de Activos
  ('log_mantenimiento', null, 0, 'S1 · Equipos de manejo de materiales', 0),
  ('log_mantenimiento', null, 0, 'S2 · Mantenimiento preventivo', 1),
  ('log_mantenimiento', null, 0, 'S3 · Mantenimiento correctivo', 2),
  ('log_mantenimiento', null, 0, 'S4 · Infraestructura de almacenaje', 3),
  ('log_mantenimiento', null, 0, 'S5 · Gestión de flota', 4),
  ('log_mantenimiento', null, 0, 'S6 · Gestión de consumos', 5),
  ('log_mantenimiento', null, 0, 'S7 · Renovación de activos', 6),
  ('log_mantenimiento', null, 0, 'S8 · Seguridad de activos', 7),
  -- P1.8 · Desempeño logístico
  ('log_desempeno', null, 0, 'S1 · OTIF de entrega', 0),
  ('log_desempeno', null, 0, 'S2 · Costo logístico por unidad', 1),
  ('log_desempeno', null, 0, 'S3 · Productividad por proceso', 2),
  ('log_desempeno', null, 0, 'S4 · Semáforos operativos del centro de distribución', 3),
  ('log_desempeno', null, 0, 'S5 · Nivel de servicio por cliente', 4),
  ('log_desempeno', null, 0, 'S6 · Análisis de fallas de servicio', 5),
  ('log_desempeno', null, 0, 'S7 · Planes de acción logísticos', 6),
  ('log_desempeno', null, 0, 'S8 · Revisión mensual logística', 7)
on conflict do nothing;
