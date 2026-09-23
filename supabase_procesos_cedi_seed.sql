-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Procesos: fichas de los 14 procedimientos del CEDI
-- (P1–P14) sobre el árbol REAL (silos P1.2, P1.3, P1.4 y P1.12).
-- YA APLICADO en la base en vivo el 23/09/2026. Generado junto con
-- src/data/procesos_cedi.js (las fichas) — mantener ambos en sincronía.
--
-- · Agrega procesos_nodes.codigo (texto, único) para ligar cada nodo con su
--   ficha en el frontend — no depende del nombre, que el usuario puede editar.
-- · P1–P13 YA existían (creados por el equipo, con su diagrama drawio): solo
--   se les asigna el codigo; no se mueven, renombran ni borran.
-- · P14 (Devoluciones Cofersa) se crea en P1.4 › S7 · Logística inversa.
-- · Subprocesos nuevos por proceso: Procedimiento y Manual de usuario (con
--   archivo en el bucket Detalles_Porcesos) + un subproceso por paso (P#.NN).
-- · Idempotente: todo se inserta solo si su codigo no existe todavía.
-- Requiere que los archivos ya estén subidos al bucket (apply.mjs lo hace).
-- Safe to commit: solo datos de procesos, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.procesos_nodes add column if not exists codigo text;
create unique index if not exists procesos_nodes_codigo_key on public.procesos_nodes(codigo) where codigo is not null;

do $$
declare
  v_macro uuid;
  v_proc  uuid;
  v_sub   uuid;
  v_next  int;
begin

  -- P11 · Almacenaje REPI  (P1.2 · Almacenaje › S1 · Acomodo (putaway))
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_almacenaje' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S1 · Acomodo (putaway)'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S1 · Acomodo (putaway)', 'log_almacenaje'; end if;
  update public.procesos_nodes set codigo = 'P11'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Almacenaje REPI'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P11');
  select id into v_proc from public.procesos_nodes where codigo = 'P11';
  if v_proc is null then raise exception 'No se encontró el proceso P11 (Almacenaje REPI)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P11.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_almacenaje', v_proc, 2, 'Procedimiento', v_next, 'P11.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P11 - Almacenaje REPI.docx', 'P11 - Almacenaje REPI.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 8454);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P11.MAN') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_almacenaje', v_proc, 2, 'Manual de usuario', v_next, 'P11.MAN') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'manuales/P11 - Manual Almacenaje REPI.docx', 'Manual - Almacenaje REPI.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 2443697);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P11.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_almacenaje', v_proc, 2, '1. Ingresar al sistema WMS con usuario, contraseña e información extra del encargado', v_next + 0, 'P11.01'),
      ('log_almacenaje', v_proc, 2, '2. El proveedor entrega el producto; recepción verifica referencias y cantidad y valida a qué cliente pertenece', v_next + 1, 'P11.02'),
      ('log_almacenaje', v_proc, 2, '3. Recepción valida el producto y lo ubica a nivel de sistema en una zona de almacenaje', v_next + 2, 'P11.03'),
      ('log_almacenaje', v_proc, 2, '4. Con picking en nivel mínimo el sistema genera la reposición; si es pedido extraordinario, traslado directo a picking', v_next + 3, 'P11.04'),
      ('log_almacenaje', v_proc, 2, '5. El apilador espera la solicitud de reposición; para Cofersa, Torre de Control genera la acción correspondiente', v_next + 4, 'P11.05'),
      ('log_almacenaje', v_proc, 2, '6. Una vez asignada la reposición, el apilador ubica el artículo en la posición indicada', v_next + 5, 'P11.06'),
      ('log_almacenaje', v_proc, 2, '7. Validar que la cantidad y el artículo correspondan exactamente a lo solicitado por el sistema', v_next + 6, 'P11.07'),
      ('log_almacenaje', v_proc, 2, '8. En el handheld leer la ubicación de almacenaje, la cantidad y el código del artículo', v_next + 7, 'P11.08'),
      ('log_almacenaje', v_proc, 2, '9. Colocar el producto en la ubicación temporal (ej. ASCEN01-C001-N01-1)', v_next + 8, 'P11.09'),
      ('log_almacenaje', v_proc, 2, '10. En paralelo, consultar en WMS el detalle de cada reposición pendiente para planificar la carga de trabajo', v_next + 9, 'P11.10');
  end if;
  v_macro := null; v_proc := null;

  -- P12 · Almacenaje UBCO  (P1.2 · Almacenaje › S3 · Reabastecimiento a picking)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_almacenaje' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S3 · Reabastecimiento a picking'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S3 · Reabastecimiento a picking', 'log_almacenaje'; end if;
  update public.procesos_nodes set codigo = 'P12'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Almacenaje UBCO'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P12');
  select id into v_proc from public.procesos_nodes where codigo = 'P12';
  if v_proc is null then raise exception 'No se encontró el proceso P12 (Almacenaje UBCO)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P12.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_almacenaje', v_proc, 2, 'Procedimiento', v_next, 'P12.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P12 - Almacenaje UBCO.docx', 'P12 - Almacenaje UBCO.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 8360);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P12.MAN') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_almacenaje', v_proc, 2, 'Manual de usuario', v_next, 'P12.MAN') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'manuales/P12 - Manual Almacenaje UBCO.docx', 'Manual - Almacenaje UBCO.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 2820904);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P12.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_almacenaje', v_proc, 2, '1. Ingresar al sistema WMS con usuario, contraseña e información extra del encargado', v_next + 0, 'P12.01'),
      ('log_almacenaje', v_proc, 2, '2. En WMS ir a Control > Acciones de Trabajo y filtrar por tipo de trabajo las reposiciones pendientes de almacenaje', v_next + 1, 'P12.02'),
      ('log_almacenaje', v_proc, 2, '3. Seleccionar la reposición a atender y asignarle prioridad; recepción notifica antes los pedidos extraordinarios', v_next + 2, 'P12.03'),
      ('log_almacenaje', v_proc, 2, '4. Esperar a que el sistema asigne la reposición en el handheld', v_next + 3, 'P12.04'),
      ('log_almacenaje', v_proc, 2, '5. Validar que el palet, el artículo y la cantidad indicados sean correctos', v_next + 4, 'P12.05'),
      ('log_almacenaje', v_proc, 2, '6. Tomar el artículo y escanear el palet: si es correcto se marca en verde, si no, no permite continuar', v_next + 5, 'P12.06'),
      ('log_almacenaje', v_proc, 2, '7. Ubicar la zona de almacenaje correspondiente al artículo', v_next + 6, 'P12.07'),
      ('log_almacenaje', v_proc, 2, '8. Escanear el código de la ubicación requerida para finalizar el proceso', v_next + 7, 'P12.08'),
      ('log_almacenaje', v_proc, 2, '9. Colocar el artículo junto a otros de la misma referencia, manteniendo el orden de la zona', v_next + 8, 'P12.09'),
      ('log_almacenaje', v_proc, 2, '10. Al finalizar, el sistema asigna automáticamente el siguiente producto por atender', v_next + 9, 'P12.10');
  end if;
  v_macro := null; v_proc := null;

  -- P13 · Traslado libre  (P1.2 · Almacenaje › S2 · Gestión de ubicaciones)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_almacenaje' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S2 · Gestión de ubicaciones'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S2 · Gestión de ubicaciones', 'log_almacenaje'; end if;
  update public.procesos_nodes set codigo = 'P13'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Traslado libre'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P13');
  select id into v_proc from public.procesos_nodes where codigo = 'P13';
  if v_proc is null then raise exception 'No se encontró el proceso P13 (Traslado libre)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P13.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_almacenaje', v_proc, 2, 'Procedimiento', v_next, 'P13.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P13 - Traslado libre.docx', 'P13 - Traslado libre.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 8185);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P13.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_almacenaje', v_proc, 2, '1. Ingresar al sistema WMS con usuario, contraseña e información extra del encargado', v_next + 0, 'P13.01'),
      ('log_almacenaje', v_proc, 2, '2. El apilador ingresa el producto en la ubicación del ascensor', v_next + 1, 'P13.02'),
      ('log_almacenaje', v_proc, 2, '3. Colocar la mercancía para su traslado al mesanín', v_next + 2, 'P13.03'),
      ('log_almacenaje', v_proc, 2, '4. Si es un palet, escanearlo y realizar la ubicación directamente en la zona de picking', v_next + 3, 'P13.04'),
      ('log_almacenaje', v_proc, 2, '5. Si es consulta: en Consulta de Inventario filtrar y copiar la ubicación; se muestran los artículos de la zona temporal', v_next + 4, 'P13.05');
  end if;
  v_macro := null; v_proc := null;

  -- P1 · Torre de Control Cofersa  (P1.4 · Transporte › S1 · Planificación de rutas)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_transporte' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S1 · Planificación de rutas'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S1 · Planificación de rutas', 'log_transporte'; end if;
  update public.procesos_nodes set codigo = 'P1'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Torre de control Cofersa'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P1');
  select id into v_proc from public.procesos_nodes where codigo = 'P1';
  if v_proc is null then raise exception 'No se encontró el proceso P1 (Torre de control Cofersa)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P1.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_transporte', v_proc, 2, 'Procedimiento', v_next, 'P1.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P1 - Torre de Control Cofersa.docx', 'P1 - Torre de Control Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 9784);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P1.MAN') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_transporte', v_proc, 2, 'Manual de usuario', v_next, 'P1.MAN') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'manuales/P1 - Manual Torre de Control Cofersa.docx', 'Manual - Torre de Control Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 7700091);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P1.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_transporte', v_proc, 2, '1. Trabajar diariamente respetando el horario de corte: 3:30 p. m. rutas GAM y 5:30 p. m. rutas rurales', v_next + 0, 'P1.01'),
      ('log_transporte', v_proc, 2, '2. Ingresar a eFLOW WMS con las credenciales del encargado (conexión y almacén 0001 - CEDI OLO)', v_next + 1, 'P1.02'),
      ('log_transporte', v_proc, 2, '3. Dirigirse al módulo Documentos > Órdenes de Expedición', v_next + 2, 'P1.03'),
      ('log_transporte', v_proc, 2, '4. Filtrar por Situación = Disponible y Compañía = Cofersa', v_next + 3, 'P1.04'),
      ('log_transporte', v_proc, 2, '5. Identificar las rutas del día: GAM todos los días; rurales según programación', v_next + 4, 'P1.05'),
      ('log_transporte', v_proc, 2, '6. En la pestaña Salida enviar los pedidos vía Torre de Control (mesanín debe pasar por la banda de su ruta y muelle)', v_next + 5, 'P1.06'),
      ('log_transporte', v_proc, 2, '7. Ingresar a Torre de Control con las credenciales del encargado', v_next + 6, 'P1.07'),
      ('log_transporte', v_proc, 2, '8. Crear el viaje: Nuevo Viaje con almacén OLO, compañía Cofersa y ruta; primero rurales y luego GAM', v_next + 7, 'P1.08'),
      ('log_transporte', v_proc, 2, '9. Regresar a eFLOW y verificar prioridad, banda asignada y número de viaje generados automáticamente', v_next + 8, 'P1.09'),
      ('log_transporte', v_proc, 2, '10. Ingresar a Control > Acciones de Trabajo, filtrar Situación de Trabajo = Disponible y Compañía = Cofersa; Consultar', v_next + 9, 'P1.10'),
      ('log_transporte', v_proc, 2, '11. Generar desde la pestaña Acciones los pedidos resultantes para iniciar su alistamiento', v_next + 10, 'P1.11'),
      ('log_transporte', v_proc, 2, '12. Repetir por cada ruta sin mezclarlas, salvo que la observación del pedido lo permita', v_next + 11, 'P1.12'),
      ('log_transporte', v_proc, 2, '13. Gestionar material pesado de Zona 1 / Zona 2; todo viaje de pesado se asigna a la puerta 29', v_next + 12, 'P1.13'),
      ('log_transporte', v_proc, 2, '14. Registrar los viajes del día en el Excel de control, imprimirlo y entregarlo a Empaque y Despacho', v_next + 13, 'P1.14'),
      ('log_transporte', v_proc, 2, '15. Continuar con el siguiente viaje: revisar rutas pendientes en el detalle del viaje en Torre de Control', v_next + 14, 'P1.15'),
      ('log_transporte', v_proc, 2, '16. Agregar rutas pendientes con Detalles > Agregar Órdenes, filtrando por almacén y ruta', v_next + 15, 'P1.16'),
      ('log_transporte', v_proc, 2, '17. Verificar que las expediciones no tengan cambio de ruta/dirección ni sean órdenes del pasado (van en viaje aparte)', v_next + 16, 'P1.17'),
      ('log_transporte', v_proc, 2, '18. Seleccionar las expediciones, presionar Añadir y asignar prioridad alta para ordenarlas en Acciones de eFLOW', v_next + 17, 'P1.18'),
      ('log_transporte', v_proc, 2, '19. Distribuir al personal disponible entre las zonas de trabajo según la necesidad operativa', v_next + 18, 'P1.19'),
      ('log_transporte', v_proc, 2, '20. Verificar en Comparación Alistó vs Packing (compañía y fecha) que pedidas, preparadas y chequeadas coincidan 100 %', v_next + 19, 'P1.20'),
      ('log_transporte', v_proc, 2, '21. Revisar el Reporte de Palets Pendientes por Chequear (mesas superiores e inferiores) para asignar chequeadores', v_next + 20, 'P1.21'),
      ('log_transporte', v_proc, 2, '22. Reenviar el mismo día pedidos incompletos por stock: filtrar por compañía y viaje, generar acciones, prioridad alta', v_next + 21, 'P1.22'),
      ('log_transporte', v_proc, 2, '23. Revisar las rutas ocultas por el filtro de la pestaña Salida para confirmar que no tengan cambios de ruta pendientes', v_next + 22, 'P1.23');
  end if;
  v_macro := null; v_proc := null;

  -- P2 · Torre de Control EPA  (P1.3 · Preparación de pedidos › S2 · Picking por pedido, lote o zona)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_preparacion' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S2 · Picking por pedido, lote o zona'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S2 · Picking por pedido, lote o zona', 'log_preparacion'; end if;
  update public.procesos_nodes set codigo = 'P2'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Torre de control EPA'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P2');
  select id into v_proc from public.procesos_nodes where codigo = 'P2';
  if v_proc is null then raise exception 'No se encontró el proceso P2 (Torre de control EPA)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P2.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_preparacion', v_proc, 2, 'Procedimiento', v_next, 'P2.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P2 - Torre de Control EPA.docx', 'P2 - Torre de Control EPA.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 9111);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P2.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_preparacion', v_proc, 2, '1. Organizar el trabajo en programación semanal; cada lunes ingresan los pedidos de tienda, priorizando suministros', v_next + 0, 'P2.01'),
      ('log_preparacion', v_proc, 2, '2. Distribuir los cinco alistadores: uno en suministros, dos en originales y dos en sobredimensionado', v_next + 1, 'P2.02'),
      ('log_preparacion', v_proc, 2, '3. Ingresar a eFLOW WMS con las credenciales del encargado', v_next + 2, 'P2.03'),
      ('log_preparacion', v_proc, 2, '4. Ir a Documentos > Órdenes de Expedición, filtrar Tipo = Expedición ERP y Compañía = Ferretería EPA S.A.; Consultar', v_next + 3, 'P2.04'),
      ('log_preparacion', v_proc, 2, '5. Excluir de la vista las expediciones terminadas (cierre automático al 100 % o manual) y las anuladas', v_next + 4, 'P2.05'),
      ('log_preparacion', v_proc, 2, '6. Mantener una sola prioridad para picking; solo cambia ante una venta puntual (pagada por adelantado)', v_next + 5, 'P2.06'),
      ('log_preparacion', v_proc, 2, '7. Ir a Control > Acciones de Trabajo, filtrar Situación = Disponible y Compañía = Ferretería EPA; Consultar', v_next + 6, 'P2.07'),
      ('log_preparacion', v_proc, 2, '8. La mercancía de gran peso se despacha en carretas por la puerta norte', v_next + 7, 'P2.08'),
      ('log_preparacion', v_proc, 2, '9. Filtrar los resultados para descartar lo que no corresponde trabajar (p. ej. mercancía en recepción)', v_next + 8, 'P2.09'),
      ('log_preparacion', v_proc, 2, '10. Asignar a cada colaborador las líneas de trabajo según la zona en la que se desempeña', v_next + 9, 'P2.10'),
      ('log_preparacion', v_proc, 2, '11. Para asignar un recurso: Seguridad > Almacén Recursos, verificar situación disponible y habilitar su zona de trabajo', v_next + 10, 'P2.11'),
      ('log_preparacion', v_proc, 2, '12. Revisar constantemente el correo para ventas puntuales, pedidos urgentes o cambios de prioridad de artículos', v_next + 11, 'P2.12'),
      ('log_preparacion', v_proc, 2, '13. Reasignar a los colaboradores de zona al terminar su asignación para que no queden sin líneas', v_next + 12, 'P2.13'),
      ('log_preparacion', v_proc, 2, '14. Coordinar con despacho la priorización de las tiendas que requieran cargarse con urgencia', v_next + 13, 'P2.14');
  end if;
  v_macro := null; v_proc := null;

  -- P5 · Alisto Cofersa  (P1.3 · Preparación de pedidos › S2 · Picking por pedido, lote o zona)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_preparacion' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S2 · Picking por pedido, lote o zona'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S2 · Picking por pedido, lote o zona', 'log_preparacion'; end if;
  update public.procesos_nodes set codigo = 'P5'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Alisto de Cofersa'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P5');
  select id into v_proc from public.procesos_nodes where codigo = 'P5';
  if v_proc is null then raise exception 'No se encontró el proceso P5 (Alisto de Cofersa)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P5.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_preparacion', v_proc, 2, 'Procedimiento', v_next, 'P5.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P5 - Alisto Cofersa.docx', 'P5 - Alisto Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 8231);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P5.MAN') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_preparacion', v_proc, 2, 'Manual de usuario', v_next, 'P5.MAN') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'manuales/P5 - Manual Alisto Cofersa.docx', 'Manual - Alisto Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1393214);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P5.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_preparacion', v_proc, 2, '1. Ingresar al WMS en el handheld con las credenciales del alistador (usuario, recurso, almacén)', v_next + 0, 'P5.01'),
      ('log_preparacion', v_proc, 2, '2. Recibir y aceptar el pedido; el sistema indica la cantidad de palets requeridos y el tamaño del pedido', v_next + 1, 'P5.02'),
      ('log_preparacion', v_proc, 2, '3. Visualizar el picking del pedido y su número de líneas (cada línea: ubicación, artículo o palet)', v_next + 2, 'P5.03'),
      ('log_preparacion', v_proc, 2, '4. En la primera línea leer, en orden, ubicación, artículo y palet; el palet debe ser de la ruta asignada', v_next + 3, 'P5.04'),
      ('log_preparacion', v_proc, 2, '5. Repetir el procedimiento con cada línea restante hasta completar el pedido', v_next + 4, 'P5.05'),
      ('log_preparacion', v_proc, 2, '6. Al finalizar, dejar los palets en el área de chequeo', v_next + 5, 'P5.06'),
      ('log_preparacion', v_proc, 2, '7. Continuar con el alistamiento del siguiente pedido repitiendo los pasos anteriores', v_next + 6, 'P5.07');
  end if;
  v_macro := null; v_proc := null;

  -- P6 · Chequeo Cofersa  (P1.3 · Preparación de pedidos › S3 · Control de exactitud)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_preparacion' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S3 · Control de exactitud'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S3 · Control de exactitud', 'log_preparacion'; end if;
  update public.procesos_nodes set codigo = 'P6'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Chequeo de Cofersa'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P6');
  select id into v_proc from public.procesos_nodes where codigo = 'P6';
  if v_proc is null then raise exception 'No se encontró el proceso P6 (Chequeo de Cofersa)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P6.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_preparacion', v_proc, 2, 'Procedimiento', v_next, 'P6.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P6 - Chequeo Cofersa.docx', 'P6 - Chequeo Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 8127);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P6.MAN') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_preparacion', v_proc, 2, 'Manual de usuario', v_next, 'P6.MAN') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'manuales/P6 - Manual Chequeo Cofersa.docx', 'Manual - Chequeo Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 4165668);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P6.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_preparacion', v_proc, 2, '1. Ingresar al WMS con usuario, contraseña e información extra del encargado', v_next + 0, 'P6.01'),
      ('log_preparacion', v_proc, 2, '2. Escanear con el handheld el palet junto con la ruta asignada', v_next + 1, 'P6.02'),
      ('log_preparacion', v_proc, 2, '3. Verificar en la estación de chequeo que artículos y cantidades correspondan a la tarima (rurales al centro, GAM a los lados)', v_next + 2, 'P6.03'),
      ('log_preparacion', v_proc, 2, '4. Revisar una tarima a la vez; al finalizar, continuar con la siguiente', v_next + 3, 'P6.04'),
      ('log_preparacion', v_proc, 2, '5. Escaneada toda la tarima, imprimir el palet máster, pegarlo en una sola caja y enviar la tarima a despacho', v_next + 4, 'P6.05');
  end if;
  v_macro := null; v_proc := null;

  -- P7 · Facturación Cofersa  (P1.12 · Facturación › S1 · Generación de la factura electrónica)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'neg_facturacion' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S1 · Generación de la factura electrónica'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S1 · Generación de la factura electrónica', 'neg_facturacion'; end if;
  update public.procesos_nodes set codigo = 'P7'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Facturación Cofersa'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P7');
  select id into v_proc from public.procesos_nodes where codigo = 'P7';
  if v_proc is null then raise exception 'No se encontró el proceso P7 (Facturación Cofersa)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P7.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('neg_facturacion', v_proc, 2, 'Procedimiento', v_next, 'P7.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P7 - Facturacion Cofersa.docx', 'P7 - Facturación Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 8471);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P7.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('neg_facturacion', v_proc, 2, '1. Ingresar a Softland con usuario, contraseña e información extra del encargado', v_next + 0, 'P7.01'),
      ('neg_facturacion', v_proc, 2, '2. Cerrado el pedido en empaque, este ingresa automáticamente a Softland en la ventana de Pedidos', v_next + 1, 'P7.02'),
      ('neg_facturacion', v_proc, 2, '3. Verificar que el pedido esté lo más completo posible', v_next + 2, 'P7.03'),
      ('neg_facturacion', v_proc, 2, '4. En Refrescar Existencia revisar la disponibilidad real en bodega y confirmar lo que puede facturarse', v_next + 3, 'P7.04'),
      ('neg_facturacion', v_proc, 2, '5. Generar la factura con la opción Generar Factura', v_next + 4, 'P7.05'),
      ('neg_facturacion', v_proc, 2, '6. Retirar la opción "Usa Despacho" (mercancía no liquidada o no encontrada; se reincorpora si aparece)', v_next + 5, 'P7.06'),
      ('neg_facturacion', v_proc, 2, '7. Presionar Generar y esperar a que el proceso cargue', v_next + 6, 'P7.07'),
      ('neg_facturacion', v_proc, 2, '8. Verificar la factura en Comprobantes Enviados (Hacienda); con check de enviado se imprimen dos copias', v_next + 7, 'P7.08'),
      ('neg_facturacion', v_proc, 2, '9. Con la copia impresa, el área de despacho queda habilitada para despachar la mercancía', v_next + 8, 'P7.09'),
      ('neg_facturacion', v_proc, 2, '10. Colocar el documento físico en la bandeja correspondiente según la ruta', v_next + 9, 'P7.10'),
      ('neg_facturacion', v_proc, 2, '11. Trasladar el documento al área de Transportes', v_next + 10, 'P7.11');
  end if;
  v_macro := null; v_proc := null;

  -- P8 · Despacho de bandas Cofersa  (P1.4 · Transporte › S3 · Despacho)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_transporte' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S3 · Despacho'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S3 · Despacho', 'log_transporte'; end if;
  update public.procesos_nodes set codigo = 'P8'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Despacho de bandas Cofersa'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P8');
  select id into v_proc from public.procesos_nodes where codigo = 'P8';
  if v_proc is null then raise exception 'No se encontró el proceso P8 (Despacho de bandas Cofersa)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P8.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_transporte', v_proc, 2, 'Procedimiento', v_next, 'P8.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P8 - Despacho de bandas Cofersa.docx', 'P8 - Despacho de bandas Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 8256);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P8.MAN') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_transporte', v_proc, 2, 'Manual de usuario', v_next, 'P8.MAN') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'manuales/P8 - Manual Despacho de bandas Cofersa.docx', 'Manual - Despacho de bandas Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1818241);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P8.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_transporte', v_proc, 2, '1. Ingresar al WMS con usuario, contraseña e información extra del encargado', v_next + 0, 'P8.01'),
      ('log_transporte', v_proc, 2, '2. En Contenedor Máster escanear un máster vacío', v_next + 1, 'P8.02'),
      ('log_transporte', v_proc, 2, '3. Leer la información del código del producto proveniente de la banda', v_next + 2, 'P8.03'),
      ('log_transporte', v_proc, 2, '4. Confirmar incluir en el mismo máster productos de la misma tienda aunque sean de pedidos distintos', v_next + 3, 'P8.04'),
      ('log_transporte', v_proc, 2, '5. Una vez escaneados, retirar los productos de la banda', v_next + 4, 'P8.05'),
      ('log_transporte', v_proc, 2, '6. Finalizar el máster desde el menú de tres puntos con la opción Finalizar Máster', v_next + 5, 'P8.06'),
      ('log_transporte', v_proc, 2, '7. Ubicar el máster en la posición libre correspondiente y trasladarlo a la puerta asignada', v_next + 6, 'P8.07'),
      ('log_transporte', v_proc, 2, '8. Ingresar a Despacho, escanear la puerta y seleccionar el viaje correspondiente', v_next + 7, 'P8.08'),
      ('log_transporte', v_proc, 2, '9. Despachar el máster completo y escanearlo nuevamente para confirmar', v_next + 8, 'P8.09'),
      ('log_transporte', v_proc, 2, '10. Al final del día (nocturno) verificar que todos los pedidos estén finalizados y cerrar los viajes', v_next + 9, 'P8.10');
  end if;
  v_macro := null; v_proc := null;

  -- P10 · Despacho de original Cofersa  (P1.4 · Transporte › S3 · Despacho)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_transporte' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S3 · Despacho'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S3 · Despacho', 'log_transporte'; end if;
  update public.procesos_nodes set codigo = 'P10'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Despacho de original Cofersa'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P10');
  select id into v_proc from public.procesos_nodes where codigo = 'P10';
  if v_proc is null then raise exception 'No se encontró el proceso P10 (Despacho de original Cofersa)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P10.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_transporte', v_proc, 2, 'Procedimiento', v_next, 'P10.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P10 - Despacho de original Cofersa.docx', 'P10 - Despacho de original Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 8288);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P10.MAN') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_transporte', v_proc, 2, 'Manual de usuario', v_next, 'P10.MAN') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'manuales/P10 - Manual Despacho de original Cofersa.docx', 'Manual - Despacho de original Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 2086992);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P10.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_transporte', v_proc, 2, '1. Verificar que los artículos de la tarima correspondan al mismo cliente', v_next + 0, 'P10.01'),
      ('log_transporte', v_proc, 2, '2. Ingresar al WMS con usuario, contraseña e información extra del encargado', v_next + 1, 'P10.02'),
      ('log_transporte', v_proc, 2, '3. En el handheld usar la opción Ubicación Libre y escanear el palet máster', v_next + 2, 'P10.03'),
      ('log_transporte', v_proc, 2, '4. Revisar la ruta asignada a esa tarima', v_next + 3, 'P10.04'),
      ('log_transporte', v_proc, 2, '5. Trasladar la tarima a la posición de su número de ruta (rutas-puertas se actualizan a diario)', v_next + 4, 'P10.05'),
      ('log_transporte', v_proc, 2, '6. Escanear el código de la puerta de destino', v_next + 5, 'P10.06'),
      ('log_transporte', v_proc, 2, '7. Ingresar a Despacho e indicar el muelle correspondiente (código de puerta)', v_next + 6, 'P10.07'),
      ('log_transporte', v_proc, 2, '8. Seleccionar el número de viaje correspondiente', v_next + 7, 'P10.08'),
      ('log_transporte', v_proc, 2, '9. En el menú de tres puntos seleccionar Despachar Máster Completo', v_next + 8, 'P10.09'),
      ('log_transporte', v_proc, 2, '10. Escanear el máster para confirmar el despacho', v_next + 9, 'P10.10'),
      ('log_transporte', v_proc, 2, '11. Acomodar la tarima junto a la puerta correspondiente', v_next + 10, 'P10.11');
  end if;
  v_macro := null; v_proc := null;

  -- P4 · Despacho EPA  (P1.4 · Transporte › S3 · Despacho)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_transporte' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S3 · Despacho'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S3 · Despacho', 'log_transporte'; end if;
  update public.procesos_nodes set codigo = 'P4'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Despacho EPA'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P4');
  select id into v_proc from public.procesos_nodes where codigo = 'P4';
  if v_proc is null then raise exception 'No se encontró el proceso P4 (Despacho EPA)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P4.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_transporte', v_proc, 2, 'Procedimiento', v_next, 'P4.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P4 - Despacho EPA.docx', 'P4 - Despacho EPA.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 9689);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P4.MAN') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_transporte', v_proc, 2, 'Manual de usuario', v_next, 'P4.MAN') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'manuales/P4 - Manual Despacho EPA.docx', 'Manual - Despacho EPA.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 18980923);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P4.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_transporte', v_proc, 2, '1. Iniciar el proceso diariamente a las 5:00 a. m.', v_next + 0, 'P4.01'),
      ('log_transporte', v_proc, 2, '2. Ingresar a la app Apolo con las credenciales del encargado', v_next + 1, 'P4.02'),
      ('log_transporte', v_proc, 2, '3. En Despacho EPA controlar la mercancía que sale y la que no; cada tarima tiene dos fotos (esquina y general)', v_next + 2, 'P4.03'),
      ('log_transporte', v_proc, 2, '4. Ingresar a eFLOW WMS con las credenciales del encargado', v_next + 3, 'P4.04'),
      ('log_transporte', v_proc, 2, '5. En Documentos usar Carga Camión y Asignación de Expediciones de Camión', v_next + 4, 'P4.05'),
      ('log_transporte', v_proc, 2, '6. En el handheld, dentro de Carga Camión, filtrar las expediciones por compañía y tienda', v_next + 5, 'P4.06'),
      ('log_transporte', v_proc, 2, '7. Seleccionar la tienda, ver sus expediciones y presionar "+" para incluirlas (filtro asignadas / no asignadas)', v_next + 6, 'P4.07'),
      ('log_transporte', v_proc, 2, '8. Asignar al contenedor el marchamo correspondiente, anotando el número de tienda', v_next + 7, 'P4.08'),
      ('log_transporte', v_proc, 2, '9. Crear el despacho del viaje: Nuevo > Agregar, ingresar la información del contenedor y guardar', v_next + 8, 'P4.09'),
      ('log_transporte', v_proc, 2, '10. En Detalles Despacho ver tarimas cargadas por color: azul (sencilla), naranja (doble), gris (vacío)', v_next + 9, 'P4.10'),
      ('log_transporte', v_proc, 2, '11. Por tarima: Tomar Foto (dos fotos) y escanear el QR; tipo S verde, D azul, T gris, C rojo', v_next + 10, 'P4.11'),
      ('log_transporte', v_proc, 2, '12. Completar en el handheld Muelle (puerta), Placa (tienda), Cédula (placa del contenedor) y Marchamo', v_next + 11, 'P4.12'),
      ('log_transporte', v_proc, 2, '13. Escanear el palet dos veces con el handheld para confirmar la carga y el despacho', v_next + 12, 'P4.13'),
      ('log_transporte', v_proc, 2, '14. Trasladar las tarimas (de dos en dos si es posible) desde las líneas por tienda hasta la puerta', v_next + 13, 'P4.14'),
      ('log_transporte', v_proc, 2, '15. Repetir el procedimiento hasta completar la carga del contenedor', v_next + 14, 'P4.15'),
      ('log_transporte', v_proc, 2, '16. Imprimir el Reporte de Carga Camión (para cobro) y entregarlo al chofer; retorna sellado por la tienda', v_next + 15, 'P4.16'),
      ('log_transporte', v_proc, 2, '17. En Carga Camión, menú de tres puntos > Insumos Carga Camión, descontar las tarimas aplicadas a EPA', v_next + 16, 'P4.17'),
      ('log_transporte', v_proc, 2, '18. Generar en Reportes > Carga el Reporte de Carga Camión con cédula, marchamo y número de viaje (CC)', v_next + 17, 'P4.18'),
      ('log_transporte', v_proc, 2, '19. Al finalizar la carga el sistema envía un correo automático con el reporte a la tienda y jefes de OLO', v_next + 18, 'P4.19'),
      ('log_transporte', v_proc, 2, '20. Generar el Excel de control con lo cargado (unidad, artículo, palet y referencia)', v_next + 19, 'P4.20');
  end if;
  v_macro := null; v_proc := null;

  -- P9 · Transporte Cofersa  (P1.4 · Transporte › S4 · Ejecución de la entrega)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_transporte' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S4 · Ejecución de la entrega'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S4 · Ejecución de la entrega', 'log_transporte'; end if;
  update public.procesos_nodes set codigo = 'P9'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Transporte Cofersa'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P9');
  select id into v_proc from public.procesos_nodes where codigo = 'P9';
  if v_proc is null then raise exception 'No se encontró el proceso P9 (Transporte Cofersa)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P9.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_transporte', v_proc, 2, 'Procedimiento', v_next, 'P9.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P9 - Transporte Cofersa.docx', 'P9 - Transporte Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 8219);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P9.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_transporte', v_proc, 2, '1. Ingresar al sistema con usuario, contraseña e información extra del encargado', v_next + 0, 'P9.01'),
      ('log_transporte', v_proc, 2, '2. En WMH (Torre de Control) asignar un chofer a la ruta correspondiente', v_next + 1, 'P9.02'),
      ('log_transporte', v_proc, 2, '3. En eFLOW ingresar a Carga Camión Directa y seleccionar todo para realizar la carga del camión', v_next + 2, 'P9.03'),
      ('log_transporte', v_proc, 2, '4. En Solo Carga Camión filtrar por viaje', v_next + 3, 'P9.04'),
      ('log_transporte', v_proc, 2, '5. Generar la guía del viaje filtrado (clientes, factura, nombre del pedido); una guía por ruta', v_next + 4, 'P9.05'),
      ('log_transporte', v_proc, 2, '6. Reunir las facturas emitidas por Softland (Hacienda) y asignarlas al chofer correspondiente', v_next + 5, 'P9.06'),
      ('log_transporte', v_proc, 2, '7. Entregar al chofer la hoja de despacho junto con la carga', v_next + 6, 'P9.07'),
      ('log_transporte', v_proc, 2, '8. Recibir del chofer la factura firmada, verificarla y entregarla a Cofersa', v_next + 7, 'P9.08');
  end if;
  v_macro := null; v_proc := null;

  -- P3 · Cross Docking  (P1.2 · Almacenaje › S1 · Acomodo (putaway))
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_almacenaje' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S1 · Acomodo (putaway)'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S1 · Acomodo (putaway)', 'log_almacenaje'; end if;
  update public.procesos_nodes set codigo = 'P3'
    where id = (select id from public.procesos_nodes where parent_id = v_macro and level = 1
                  and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('Cross Docking'), '\s+', ' ', 'g')) and codigo is null order by created_at limit 1)
      and not exists (select 1 from public.procesos_nodes where codigo = 'P3');
  select id into v_proc from public.procesos_nodes where codigo = 'P3';
  if v_proc is null then raise exception 'No se encontró el proceso P3 (Cross Docking)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P3.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_almacenaje', v_proc, 2, 'Procedimiento', v_next, 'P3.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P3 - Cross Docking.docx', 'P3 - Cross Docking.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 8677);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P3.MAN') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_almacenaje', v_proc, 2, 'Manual de usuario', v_next, 'P3.MAN') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'manuales/P3 - Manual Cross Docking.docx', 'Manual - Cross Docking.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 4560170);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P3.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_almacenaje', v_proc, 2, '1. Ingresar al WMS en el handheld con las credenciales del encargado (usuario, recurso, almacén)', v_next + 0, 'P3.01'),
      ('log_almacenaje', v_proc, 2, '2. Verificar el expediente del pedido en el handheld', v_next + 1, 'P3.02'),
      ('log_almacenaje', v_proc, 2, '3. Transportar la tarima al buffer', v_next + 2, 'P3.03'),
      ('log_almacenaje', v_proc, 2, '4. Ingresar en el handheld los datos del personal que ejecutará la actividad', v_next + 3, 'P3.04'),
      ('log_almacenaje', v_proc, 2, '5. Ingresar a la opción Recibo (en cross docking siempre se accede por esta vía)', v_next + 4, 'P3.05'),
      ('log_almacenaje', v_proc, 2, '6. Ingresar a Validación Cross Docking (todas las tiendas) y luego a Validación General (expedientes abiertos)', v_next + 5, 'P3.06'),
      ('log_almacenaje', v_proc, 2, '7. Ingresar a Artículo para iniciar la distribución y escanear el código del producto', v_next + 6, 'P3.07'),
      ('log_almacenaje', v_proc, 2, '8. Escanear paleta/licencia y revisar el Packing List impreso (orden, cantidad, bultos, peso, volumen)', v_next + 7, 'P3.08'),
      ('log_almacenaje', v_proc, 2, '9. Escanear el código de cada artículo a medida que se retira de la tarima', v_next + 8, 'P3.09'),
      ('log_almacenaje', v_proc, 2, '10. Revisar cliente, tienda, referencia y cantidad solicitada para calcular el número de cajas necesarias', v_next + 9, 'P3.10'),
      ('log_almacenaje', v_proc, 2, '11. Distribuir los artículos y escanear el palet de destino para registrar lo acomodado físicamente', v_next + 10, 'P3.11'),
      ('log_almacenaje', v_proc, 2, '12. Verificar en eFLOW el progreso del expediente, con avance mínimo aceptable del 99 %', v_next + 11, 'P3.12'),
      ('log_almacenaje', v_proc, 2, '13. Cerrar y emplasticar el palet', v_next + 12, 'P3.13'),
      ('log_almacenaje', v_proc, 2, '14. Reportar al cliente sobrantes o mermas; el cliente decide si cierra o no el expediente', v_next + 13, 'P3.14'),
      ('log_almacenaje', v_proc, 2, '15. Trasladar la tarima al despacho de la tienda correspondiente', v_next + 14, 'P3.15'),
      ('log_almacenaje', v_proc, 2, '16. Continuar con el siguiente pedido sin esperar la confirmación del cliente', v_next + 15, 'P3.16');
  end if;
  v_macro := null; v_proc := null;

  -- P14 · Devoluciones Cofersa  (P1.4 · Transporte › S7 · Logística inversa (recolección de devoluciones))
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_transporte' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S7 · Logística inversa (recolección de devoluciones)'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S7 · Logística inversa (recolección de devoluciones)', 'log_transporte'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P14') then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      select 'log_transporte', v_macro, 1, 'Devoluciones Cofersa', coalesce(max(sort_order), -1) + 1, 'P14'
      from public.procesos_nodes where parent_id = v_macro;
  end if;
  select id into v_proc from public.procesos_nodes where codigo = 'P14';
  if v_proc is null then raise exception 'No se encontró el proceso P14 (None)'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P14.DIA') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_transporte', v_proc, 2, 'Diagrama de flujo (interactivo)', v_next, 'P14.DIA') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'diagramas-flujo/14 - Devoluciones Cofersa.drawio', '14 - Devoluciones Cofersa.drawio', 'application/vnd.jgraph.mxfile', 166854);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P14.DOC') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_transporte', v_proc, 2, 'Procedimiento', v_next, 'P14.DOC') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'procedimientos/P14 - Devoluciones Cofersa.docx', 'P14 - Devoluciones Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 10059);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P14.MAN') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_transporte', v_proc, 2, 'Manual de usuario', v_next, 'P14.MAN') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'manuales/P14 - Manual Devoluciones Cofersa.docx', 'Manual - Devoluciones Cofersa.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 5146298);
  end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'P14.01') then
    select coalesce(max(sort_order), -1) + 1 into v_next from public.procesos_nodes where parent_id = v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo) values
      ('log_transporte', v_proc, 2, '1. Los choferes con devoluciones siempre llegan a la puerta 10', v_next + 0, 'P14.01'),
      ('log_transporte', v_proc, 2, '2. Revisar con el chofer que la boleta coincida con lo físico, producto por producto; si coincide, firmar boletas', v_next + 1, 'P14.02'),
      ('log_transporte', v_proc, 2, '3. Si no coincide no se recibe; si la boleta está mal elaborada, Cofersa la anula y la rehace', v_next + 2, 'P14.03'),
      ('log_transporte', v_proc, 2, '4. Identificar el respaldo: RPM (parcial), boleta Cofersa o factura completa (total); toda devolución trae boleta', v_next + 3, 'P14.04'),
      ('log_transporte', v_proc, 2, '5. Registrar el número de boleta en el cuaderno del chofer, o el chofer envía formulario con fotos a transporte', v_next + 4, 'P14.05'),
      ('log_transporte', v_proc, 2, '6. Clasificar la devolución: bueno, taller, dañado/merma o garantías; cada una con acomodo específico', v_next + 5, 'P14.06'),
      ('log_transporte', v_proc, 2, '7. Mercancía pesada: se revisa en puerta 10, se entrega por puerta de pesado y se traslada a su zona', v_next + 6, 'P14.07'),
      ('log_transporte', v_proc, 2, '8. Garantías: identificar la marca autorizada, guardar en su lugar y registrar código y cantidad en el Drive', v_next + 7, 'P14.08'),
      ('log_transporte', v_proc, 2, '9. Ingresar los datos de la devolución en el Drive general de devoluciones', v_next + 8, 'P14.09'),
      ('log_transporte', v_proc, 2, '10. Registrar lo de taller en un Drive aparte y enviarlo directamente a taller', v_next + 9, 'P14.10'),
      ('log_transporte', v_proc, 2, '11. Las devoluciones clasificadas como merma se envían a destrucción directa', v_next + 10, 'P14.11'),
      ('log_transporte', v_proc, 2, '12. Recepcionar la devolución en el handheld: Recibo > Recepción, verificando contra lo declarado', v_next + 11, 'P14.12'),
      ('log_transporte', v_proc, 2, '13. Usar el código de confirmación según el estado del producto (bueno o merma)', v_next + 12, 'P14.13'),
      ('log_transporte', v_proc, 2, '14. Ingresar al sistema WMS con usuario, contraseña e información extra del encargado', v_next + 13, 'P14.14'),
      ('log_transporte', v_proc, 2, '15. Escanear el palet o tarima; mercancía de mesanín no va en el mismo palet que la de zona baja', v_next + 14, 'P14.15'),
      ('log_transporte', v_proc, 2, '16. Escanear cada artículo, registrar la cantidad, confirmar y seleccionar Finalizar Palet', v_next + 15, 'P14.16'),
      ('log_transporte', v_proc, 2, '17. Al finalizar un palet, continuar con el siguiente', v_next + 16, 'P14.17'),
      ('log_transporte', v_proc, 2, '18. El personal de almacén retira la devolución recepcionada para su almacenamiento definitivo', v_next + 17, 'P14.18');
  end if;
  v_macro := null; v_proc := null;
end $$;
