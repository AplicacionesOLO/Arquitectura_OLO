-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Procesos BORRADOR de los silos de referencia (P1.x)
-- GENERADO por gen_procesos_silos_sql.mjs desde src/data/procesos_silos.js.
-- No son procedimientos aprobados de OLO: los pasos citan pantallas reales de
-- eFlow WMS (origen eflow_wms) y lo demás es práctica 3PL (origen inferido);
-- el detalle y el origen de cada paso están en la ficha del frontend.
-- · Proceso (nivel 1) bajo el macroproceso existente del silo, con su codigo.
-- · Subprocesos = pasos numerados; los que citan una pantalla llevan su captura.
-- · Idempotente (por codigo). No borra ni modifica nada existente.
-- Safe to commit: solo datos de procesos, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
  v_macro uuid;
  v_proc  uuid;
  v_sub   uuid;
begin

  -- INV-01 · Toma física cíclica por ubicación  (P1.5 · Gestión de inventario físico › S1 · Conteos cíclicos)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_inventario' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S1 · Conteos cíclicos'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S1 · Conteos cíclicos', 'log_inventario'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'INV-01') then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      select 'log_inventario', v_macro, 1, 'Toma física cíclica por ubicación', coalesce(max(sort_order), -1) + 1, 'INV-01'
      from public.procesos_nodes where parent_id = v_macro
      returning id into v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '1. Definir qué ubicaciones o artículos se cuentan en el ciclo (por rotación, valor o zona) según el calendario de conteos', 0, 'INV-01.01') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '2. Crear la toma en Inventario › Generación de Tomas Físicas con «Agregar», indicando compañía, sucursal, tipo de toma y modo', 1, 'INV-01.02') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '3. Excluir del conteo ubicaciones o artículos que no aplican desde la pestaña «Exclusiones» (botón «Excluir»)', 2, 'INV-01.03') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '4. Ejecutar el conteo físico ubicación por ubicación con el handheld', 3, 'INV-01.04') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '5. Revisar el avance en la pestaña «Conteo de la Toma» y los indicadores REF CONTADAS / REF CORRECTAS / UBICACION CONTADAS del grid', 4, 'INV-01.05') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '6. Analizar las diferencias en las pestañas «Diferencia por Ubicación» y «Diferencia por Artículo»', 5, 'INV-01.06') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '7. Generar un reconteo de lo que quedó con diferencia con «Genera T.F. Diferencias»', 6, 'INV-01.07') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '8. Aplicar el resultado con «Ajustar» o, si la diferencia no se explica, pasar a investigación de diferencias', 7, 'INV-01.08') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '9. Exportar los reportes «Diferencia Ubicación Artículo» y «Conteo» desde el menú «…» › Reportes como respaldo', 8, 'INV-01.09') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
  end if;
  v_macro := null; v_proc := null;

  -- INV-02 · Inventario general del almacén  (P1.5 · Gestión de inventario físico › S2 · Inventario general)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_inventario' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S2 · Inventario general'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S2 · Inventario general', 'log_inventario'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'INV-02') then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      select 'log_inventario', v_macro, 1, 'Inventario general del almacén', coalesce(max(sort_order), -1) + 1, 'INV-02'
      from public.procesos_nodes where parent_id = v_macro
      returning id into v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '1. Programar el inventario con el cliente y congelar movimientos (recepciones, despachos, reposiciones) durante el conteo', 0, 'INV-02.01') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '2. Verificar en Control › Acciones de Trabajo que no queden tareas abiertas sobre las ubicaciones a contar', 1, 'INV-02.02') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_control__acciones_de_trabajo.jpg', 'eFlow WMS · Control › Acciones de Trabajo.jpg', 'image/jpeg', 229646);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '3. Crear la toma general en Inventario › Generación de Tomas Físicas con «Agregar» por compañía y sucursal', 2, 'INV-02.03') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '4. Contar por zonas con el handheld; cada ubicación se cuenta y se cierra', 3, 'INV-02.04') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '5. Unir conteos parciales de la misma toma con «Combinar» cuando se contó por equipos o por fases', 4, 'INV-02.05') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '6. Revisar las pestañas «Diferencia por Artículo», «Diferencia por Ubicación» y «Diferencias por Lote»', 5, 'INV-02.06') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '7. Comparar dos tomas (conteo y reconteo) en Inventario › Comparador de Tomas Físicas', 6, 'INV-02.07') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__comparador_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Comparador de Tomas Físicas.jpg', 'image/jpeg', 54192);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '8. Aplicar el resultado con «Ajustar» o cancelar la toma con «Cancelar Toma» si debe repetirse', 7, 'INV-02.08') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '9. Firmar el acta de inventario con el cliente y liberar la operación', 8, 'INV-02.09') returning id into v_sub;
  end if;
  v_macro := null; v_proc := null;

  -- INV-03 · Investigación de diferencias de inventario  (P1.5 · Gestión de inventario físico › S3 · Investigación de diferencias)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_inventario' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S3 · Investigación de diferencias'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S3 · Investigación de diferencias', 'log_inventario'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'INV-03') then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      select 'log_inventario', v_macro, 1, 'Investigación de diferencias de inventario', coalesce(max(sort_order), -1) + 1, 'INV-03'
      from public.procesos_nodes where parent_id = v_macro
      returning id into v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '1. Identificar el artículo y la ubicación con diferencia en las pestañas de diferencias de la toma física', 0, 'INV-03.01') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '2. Consultar el inventario actual del artículo en Inventario › Consulta de Inventario (pestañas «Inventario» y «Artículos»)', 1, 'INV-03.02') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__consulta_de_inventario.jpg', 'eFlow WMS · Inventario › Consulta de Inventario.jpg', 'image/jpeg', 80735);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '3. Revisar los cambios hechos sobre el inventario en la pestaña «Modificaciones» de la consulta', 2, 'INV-03.03') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__consulta_de_inventario.jpg', 'eFlow WMS · Inventario › Consulta de Inventario.jpg', 'image/jpeg', 80735);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '4. Rastrear las entradas y salidas del período en Control › Movimientos (filtro por artículo o palet)', 3, 'INV-03.04') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_control__movimientos.jpg', 'eFlow WMS · Control › Movimientos.jpg', 'image/jpeg', 59568);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '5. Revisar el saldo día a día en Reportes › Kardex Diario o Rep. Kardex Diario Rango', 4, 'INV-03.05') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_reportes__rep_kardex_diario_rango.jpg', 'eFlow WMS · Reportes › Rep. Kardex Diario Rango.jpg', 'image/jpeg', 49397);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '6. Validar el contenido físico del palet en Inventario › Palets y Palets Artículos', 5, 'INV-03.06') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__palets.jpg', 'eFlow WMS · Inventario › Palets.jpg', 'image/jpeg', 76601);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '7. Clasificar la causa (error de conteo, de ubicación, de recepción, de picking o merma) y documentarla', 6, 'INV-03.07') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '8. Si la diferencia se explica por un error de ubicación, corregir con un traslado; si es real, pasar a ajuste', 7, 'INV-03.08') returning id into v_sub;
  end if;
  v_macro := null; v_proc := null;

  -- INV-04 · Ajuste individual de inventario  (P1.5 · Gestión de inventario físico › S4 · Ajustes de inventario)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_inventario' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S4 · Ajustes de inventario'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S4 · Ajustes de inventario', 'log_inventario'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'INV-04') then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      select 'log_inventario', v_macro, 1, 'Ajuste individual de inventario', coalesce(max(sort_order), -1) + 1, 'INV-04'
      from public.procesos_nodes where parent_id = v_macro
      returning id into v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '1. Obtener la aprobación del ajuste (según monto o política del cliente)', 0, 'INV-04.01') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '2. Abrir Inventario › Ajustes de Inventario y crear el documento con «Agregar»', 1, 'INV-04.02') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__ajustes_de_inventario.jpg', 'eFlow WMS · Inventario › Ajustes de Inventario.jpg', 'image/jpeg', 66694);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '3. Indicar Compañía, Tipo de Ajuste y una Descripción que explique la causa', 2, 'INV-04.03') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__ajustes_de_inventario.jpg', 'eFlow WMS · Inventario › Ajustes de Inventario.jpg', 'image/jpeg', 66694);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '4. Agregar cada artículo con «Agregar Línea» (ubicación, palet y cantidad a ajustar)', 3, 'INV-04.04') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__ajustes_de_inventario.jpg', 'eFlow WMS · Inventario › Ajustes de Inventario.jpg', 'image/jpeg', 66694);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '5. Cerrar el documento con «Finalizar» para que el ajuste afecte el inventario', 4, 'INV-04.05') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__ajustes_de_inventario.jpg', 'eFlow WMS · Inventario › Ajustes de Inventario.jpg', 'image/jpeg', 66694);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '6. Verificar la existencia corregida en Inventario › Consulta de Inventario', 5, 'INV-04.06') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__consulta_de_inventario.jpg', 'eFlow WMS · Inventario › Consulta de Inventario.jpg', 'image/jpeg', 80735);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '7. Informar el ajuste al cliente y, si aplica, reflejarlo en su ERP', 6, 'INV-04.07') returning id into v_sub;
  end if;
  v_macro := null; v_proc := null;

  -- INV-05 · Ajuste masivo desde toma física o archivo  (P1.5 · Gestión de inventario físico › S4 · Ajustes de inventario)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_inventario' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S4 · Ajustes de inventario'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S4 · Ajustes de inventario', 'log_inventario'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'INV-05') then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      select 'log_inventario', v_macro, 1, 'Ajuste masivo desde toma física o archivo', coalesce(max(sort_order), -1) + 1, 'INV-05'
      from public.procesos_nodes where parent_id = v_macro
      returning id into v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '1. Abrir Inventario › Ajustes Masivos', 0, 'INV-05.01') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__ajustes_masivos.jpg', 'eFlow WMS · Inventario › Ajustes Masivos.jpg', 'image/jpeg', 55058);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '2. Traer las diferencias con «Cargar Toma» o importar un archivo con «Cargar Archivo»', 1, 'INV-05.02') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__ajustes_masivos.jpg', 'eFlow WMS · Inventario › Ajustes Masivos.jpg', 'image/jpeg', 55058);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '3. Revisar el detalle cargado contra el acta de inventario aprobada', 2, 'INV-05.03') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '4. Aplicar con «Aplicar Ajustes» (o descartar con «Cancelar»)', 3, 'INV-05.04') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__ajustes_masivos.jpg', 'eFlow WMS · Inventario › Ajustes Masivos.jpg', 'image/jpeg', 55058);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '5. Confirmar las existencias resultantes en Reportes › Inventario por Artículo y exportarlo a Excel', 4, 'INV-05.05') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_reportes__inventario_por_articulo.jpg', 'eFlow WMS · Reportes › Inventario por Artículo.jpg', 'image/jpeg', 49586);
  end if;
  v_macro := null; v_proc := null;

  -- INV-06 · Control de vencimientos y alertas de inventario  (P1.5 · Gestión de inventario físico › S5 · Gestión de obsoletos)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_inventario' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S5 · Gestión de obsoletos'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S5 · Gestión de obsoletos', 'log_inventario'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'INV-06') then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      select 'log_inventario', v_macro, 1, 'Control de vencimientos y alertas de inventario', coalesce(max(sort_order), -1) + 1, 'INV-06'
      from public.procesos_nodes where parent_id = v_macro
      returning id into v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '1. Revisar en Inicio los indicadores «Cant Vencida», «20 % Vencimiento» y «Ant. Inventario» del panel de operación', 0, 'INV-06.01') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inicio__inicio.jpg', 'eFlow WMS · Inicio › Panel de Inicio.jpg', 'image/jpeg', 127686);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '2. Abrir Paneles › Alerta Inventario y revisar las alertas con «Ver hoja de datos»', 1, 'INV-06.02') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_paneles__alerta_inventario.jpg', 'eFlow WMS · Paneles › Alerta Inventario.jpg', 'image/jpeg', 81846);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '3. Consultar lote y ubicación de lo alertado en Inventario › Consulta de Inventario', 2, 'INV-06.03') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__consulta_de_inventario.jpg', 'eFlow WMS · Inventario › Consulta de Inventario.jpg', 'image/jpeg', 80735);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '4. Informar al cliente el inventario vencido o sin movimiento y acordar la acción (destrucción, devolución, liquidación)', 3, 'INV-06.04') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '5. Bloquear o segregar físicamente la mercancía vencida', 4, 'INV-06.05') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '6. Ejecutar la salida acordada (expedición de destrucción o devolución) y el ajuste correspondiente', 5, 'INV-06.06') returning id into v_sub;
  end if;
  v_macro := null; v_proc := null;

  -- INV-07 · Trazabilidad de un artículo, palet o serie  (P1.5 · Gestión de inventario físico › S6 · Trazabilidad de movimientos)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_inventario' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S6 · Trazabilidad de movimientos'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S6 · Trazabilidad de movimientos', 'log_inventario'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'INV-07') then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      select 'log_inventario', v_macro, 1, 'Trazabilidad de un artículo, palet o serie', coalesce(max(sort_order), -1) + 1, 'INV-07'
      from public.procesos_nodes where parent_id = v_macro
      returning id into v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '1. Buscar el palet o el artículo en Inventario › Palets (recepción de origen, cliente propietario, fechas)', 0, 'INV-07.01') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__palets.jpg', 'eFlow WMS · Inventario › Palets.jpg', 'image/jpeg', 76601);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '2. Si el artículo se controla por serie, ubicarlo en Inventario › Pallets Series', 1, 'INV-07.02') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__pallets_series.jpg', 'eFlow WMS · Inventario › Pallets Series.jpg', 'image/jpeg', 207659);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '3. Revisar todos sus movimientos en Control › Movimientos (tipo de movimiento, tipo de trabajo, fecha)', 2, 'INV-07.03') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_control__movimientos.jpg', 'eFlow WMS · Control › Movimientos.jpg', 'image/jpeg', 59568);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '4. Para series, revisar Control › Movimientos Series (incluye el número de viaje de salida)', 3, 'INV-07.04') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_control__movimientos_series.jpg', 'eFlow WMS · Control › Movimientos Series.jpg', 'image/jpeg', 75315);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '5. Confirmar saldos por fecha en Reportes › Kardex Diario', 4, 'INV-07.05') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_reportes__kardex_diario.jpg', 'eFlow WMS · Reportes › Kardex Diario.jpg', 'image/jpeg', 48947);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '6. Documentar la trazabilidad y responder al cliente o al auditor', 5, 'INV-07.06') returning id into v_sub;
  end if;
  v_macro := null; v_proc := null;

  -- INV-08 · Medición de exactitud de inventario (IRA)  (P1.5 · Gestión de inventario físico › S7 · Exactitud de inventario (IRA))
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_inventario' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S7 · Exactitud de inventario (IRA)'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S7 · Exactitud de inventario (IRA)', 'log_inventario'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'INV-08') then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      select 'log_inventario', v_macro, 1, 'Medición de exactitud de inventario (IRA)', coalesce(max(sort_order), -1) + 1, 'INV-08'
      from public.procesos_nodes where parent_id = v_macro
      returning id into v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '1. Tomar de la toma física cerrada los valores REF CONTADAS, REF CORRECTAS y UBICACION CONTADAS del grid', 0, 'INV-08.01') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__generacion_de_tomas_fisicas.jpg', 'eFlow WMS · Inventario › Generación de Tomas Físicas.jpg', 'image/jpeg', 134057);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '2. Calcular el IRA = referencias correctas ÷ referencias contadas (y por ubicación si se requiere)', 1, 'INV-08.02') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '3. Comparar el IRA con la meta acordada con el cliente y con el mes anterior', 2, 'INV-08.03') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '4. Si el IRA está bajo la meta, priorizar las zonas con más diferencias para el próximo ciclo de conteo', 3, 'INV-08.04') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '5. Reportar el IRA en la revisión mensual con el cliente', 4, 'INV-08.05') returning id into v_sub;
  end if;
  v_macro := null; v_proc := null;

  -- INV-09 · Conciliación de existencias WMS vs. ERP del cliente  (P1.5 · Gestión de inventario físico › S8 · Conciliación WMS-ERP)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_inventario' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S8 · Conciliación WMS-ERP'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S8 · Conciliación WMS-ERP', 'log_inventario'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'INV-09') then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      select 'log_inventario', v_macro, 1, 'Conciliación de existencias WMS vs. ERP del cliente', coalesce(max(sort_order), -1) + 1, 'INV-09'
      from public.procesos_nodes where parent_id = v_macro
      returning id into v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '1. Exportar a Excel las existencias por artículo desde Reportes › Inventario por Artículo', 0, 'INV-09.01') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_reportes__inventario_por_articulo.jpg', 'eFlow WMS · Reportes › Inventario por Artículo.jpg', 'image/jpeg', 49586);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '2. Obtener el reporte de existencias del ERP del cliente para la misma fecha de corte', 1, 'INV-09.02') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '3. Cruzar ambos reportes por código de artículo e identificar diferencias', 2, 'INV-09.03') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '4. Revisar en Control › Movimientos las transacciones en tránsito (recibidas o despachadas pero no reflejadas en el ERP)', 3, 'INV-09.04') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_control__movimientos.jpg', 'eFlow WMS · Control › Movimientos.jpg', 'image/jpeg', 59568);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '5. Separar diferencias de tiempo (en tránsito) de diferencias reales y enviar estas últimas a investigación', 4, 'INV-09.05') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '6. Firmar la conciliación con el cliente', 5, 'INV-09.06') returning id into v_sub;
  end if;
  v_macro := null; v_proc := null;

  -- INV-10 · Carga de inventario inicial de un cliente  (P1.5 · Gestión de inventario físico › S2 · Inventario general)
  select id into v_macro from public.procesos_nodes
    where categoria_id = 'log_inventario' and level = 0 and lower(regexp_replace(trim(name), '\s+', ' ', 'g')) = lower(regexp_replace(trim('S2 · Inventario general'), '\s+', ' ', 'g'))
    order by sort_order limit 1;
  if v_macro is null then raise exception 'No existe el macroproceso % en %', 'S2 · Inventario general', 'log_inventario'; end if;
  if not exists (select 1 from public.procesos_nodes where codigo = 'INV-10') then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      select 'log_inventario', v_macro, 1, 'Carga de inventario inicial de un cliente', coalesce(max(sort_order), -1) + 1, 'INV-10'
      from public.procesos_nodes where parent_id = v_macro
      returning id into v_proc;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '1. Contar físicamente la mercancía inicial y armar la lista por artículo, lote y ubicación', 0, 'INV-10.01') returning id into v_sub;
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '2. Abrir Inventario › Inventario Inicial y capturar Presentación, Cantidad, Factor, Lote de Producción y fechas de producción/caducidad', 1, 'INV-10.02') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__inventario_inicial.jpg', 'eFlow WMS · Inventario › Inventario Inicial.jpg', 'image/jpeg', 86928);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '3. Registrar cada línea con «Insertar» y crear el palet con «Crear Palet»', 2, 'INV-10.03') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__inventario_inicial.jpg', 'eFlow WMS · Inventario › Inventario Inicial.jpg', 'image/jpeg', 86928);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '4. Validar el inventario cargado en Inventario › Consulta de Inventario', 3, 'INV-10.04') returning id into v_sub;
    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', 'wms-manual/screen_inventario__consulta_de_inventario.jpg', 'eFlow WMS · Inventario › Consulta de Inventario.jpg', 'image/jpeg', 80735);
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values ('log_inventario', v_proc, 2, '5. Conciliar el total cargado con el inventario del cliente antes de iniciar operación', 4, 'INV-10.05') returning id into v_sub;
  end if;
  v_macro := null; v_proc := null;
end $$;
