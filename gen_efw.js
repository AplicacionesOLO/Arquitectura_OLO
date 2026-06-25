const fs = require('fs');
const data = JSON.parse(fs.readFileSync('eflow_schema.json', 'utf8'));
const tables = data.tables.map(t => t.TABLE_NAME);
const columns = data.columns;
const fks = data.fks;

// ── Group / color assignment ──────────────────────────────────────────────────
const GROUP_META = {
  core:          { label: 'Artículos & Maestros',      color: '#0891b2' },
  almacen:       { label: 'Almacén & Ubicaciones',     color: '#0d9488' },
  recepciones:   { label: 'Recepciones',               color: '#2563eb' },
  expediciones:  { label: 'Expediciones & Despacho',   color: '#dc2626' },
  tomafisica:    { label: 'Toma Física',               color: '#9333ea' },
  inventario:    { label: 'Inventario',                color: '#d97706' },
  kardex:        { label: 'Kardex & Movimientos',      color: '#059669' },
  picking:       { label: 'Picking & Reposición',      color: '#db2777' },
  usuarios:      { label: 'Usuarios & Seguridad',      color: '#7c3aed' },
  auditoria:     { label: 'Auditoría & Monitor',       color: '#64748b' },
  contenedores:  { label: 'Contenedores & Palets',     color: '#16a34a' },
  ordenes:       { label: 'Órdenes & Procesos',        color: '#475569' },
  configuracion: { label: 'Configuración',             color: '#475569' },
  integracion:   { label: 'Integración & API',         color: '#475569' },
  otros:         { label: 'Otros',                     color: '#475569' },
};

function classify(name) {
  const n = name.toUpperCase();

  // Core masters
  if (n.startsWith('ARTICULO') || n.startsWith('EFLOW_ARTICULO') || n === 'XX_LO_EFLOW_ARTICULOSEAN') return 'core';
  if (['COMPANIA','SUCURSAL','CLIENTES','PROVEEDORES','VENDEDOR','CLIENTE_MASTER','CLIENTE_3PL',
       'CLIENTE_PRV_CNT_DST','CLIENTEARTICULORESTRICCION','CLIENTE_ARTICULO_DESPACHO',
       'COMPANIALOGO','COMPANIA_CAPACIDAD_OPERATIVA','COMPANIA_MONEDA_AB',
       'EFLOW_PROVEEDOR','EPALETPROVEEDORES','PROVEEDORESDATOSALMACEN','PROVEEDORPAIS',
       'PROVEEDORCITASCABECERA','PROVEEDORCITASDETALLE',
       'PREGUNTASCOMPANIA','PREGUNTASCOMPANIARESPUESTA',
       'GRUPOLOGISTICO','RESTRICCION_FAMILIA','COMPOSICION_ARTICULOS','DESCOMPOSICION_ARTICULOS',
       'COSTOARTICULOBODEGA','TIPOSRECEPCION','TIPOSALMACEN','TIPOSALMACENDETALLE',
       'TIPOSDETALLE','TIPOS','TIPOSISTEMA','TIPOSISTEMADETALLE',
       'TIPOSINTEGRACION','TIPO_TRASLADOS','GROUP_TYPE','TYPE'].includes(n)) return 'core';

  // Almacen & ubicaciones
  if (n.startsWith('ALMACEN') || n.startsWith('ALMACENAMIENTOS') || n.startsWith('ALMACENAMIENTOSUBICACIONES')) return 'almacen';
  if (['ZONAALMACENAJE','ZONAALMACENAJEEXTENCION','ZONAALMACENAJE_ALMACENA_PEDIDOS',
       'ZONAALMACENAJE_DESCARTE_ALISTO',
       'ZONAPICKING','ZONACOLAPREPARACION','ZONAINTERCAMBIO','ZONAINTERCAMBIO_REPI',
       'ZONARUTAPICKING','ZONARUTAPICKINGORDEN','ZONARUTAPICKINGSECUENCIA','ZONARUTASALES',
       'ZONATRABAJOPREPARACION','ZONATRABAJORECURSOS','ZONAMEZCLALOTE',
       'OBSERVACIONES_ZONAS','HOMOLOGACION_ZONAS','MAPEO_ZONAALMACENAJE',
       'PASILLOS_ALMACEN','CAPACIDADBLOQUE','TRASLADOSALMACENES','TRASLADO_INTERNO_CONF',
       'UBICACIONES_BAJADA','UBICACIONES_BAJADA_CROSS','UBICACIONES_GALYS','UBICACIONPEDIDOS',
       'DATOS_ALMACEN_UBICACIONES_AB','NOMBREZONAPICKING',
       'REPOSICIONZONAS','REPOSICIONZONAS_ALTURA','TPEXPE_ZONAS',
       'HSA','HSAHSA','HSA_CAMBIOUBICACIONES','HSA_HSA','RESPALDOHSA','RESPALDITO',
       'REGLASALMACEN','REGLASCATEGORIAS','REGLASISTEMA','REGLASVALORES'].includes(n)) return 'almacen';

  // Recepciones
  if (n.startsWith('RECEPCIONES') || n.startsWith('RECEPCION')) return 'recepciones';
  if (['CROSSDOCKING_PLANTILLA','CROSSDOCKING_PLANTILLA_PED','CROSSDOCKING_UBICACION_CLIENTE',
       'RECCONF_MP','CAMBIOESTADO_MP','SOLICITUD_AFORO','SOLICITUD_AFORO_LINEA',
       'SUPERVISION_ADUANAL','MARCHAMO_INCIDENCIAS'].includes(n)) return 'recepciones';

  // Expediciones
  if (n.startsWith('EXPEDICION')) return 'expediciones';
  if (['CHOFERES','UNIDADESTRANSPORTE','CARGACAMION_TRAMITE','CARCAM_SECUENCIA_CLIENTE',
       'CONFIGURACION_RUTA','MUELLE_X_RUTA',
       'GEOREFERENCIA1','GEOREFERENCIA2','GEOREFERENCIA3','GEOREFERENCIA4','GEOREFERENCIA5',
       'RUTA_DIA_AB','RUTA_PROMESA_AB','COSTO_RUTA',
       'PRIORIDAD_ENTREGA','PRIORIDAD_ENTREGA_REGLA','PRIORIDAD_EXPEDICION',
       'VIAJES_ENC_AB','VIAJE_WMH','ENTREGA_FILL_RATE',
       'DOCUMENTO_CABECERA','DOCUMENTO_DETALLE','DOCUMENTO_CONFIRMACION_ERP',
       'DOCUMENTOIMAGEN','DOCUMENTOS_XML','FIRMADOCUMENTO',
       'ASIGNACION_MESA_EMPAQUE','MATERIAL_EMPAQUEGESTION',
       'INCIDENCIAS_PACKING','PACKING_PRUEBAS','EPACKINGHISTORY',
       'EXECUTE_PICK','DURACION_PICKING','MULTIPICKING_CONF',
       'CONFIRMACION_PARCIAL_CABECERA','CONFIRMACION_PARCIAL_DETALLE',
       'CONFIRMACION_PARCIAL_USUARIO','CONFIRMARSE',
       'SEGUIMIENTOS_PEDIDO_MOVIL_AB','PEDIDOS_ASIGNADOS_MOVIL_AB','ESTADO_PEDIDO_MOVIL_AB'].includes(n)) return 'expediciones';

  // Toma fisica / revision inventario
  if (n.startsWith('TOMAFISICA') || n.startsWith('REVISIONINVENTARIO') || n.startsWith('TOMA_FISICA')) return 'tomafisica';
  if (['CAPTURA_INVENTARIO_DIARIO','CAPTURANDO_ANDO',
       'TF_CONTROL_LOTE_PICK','TF_RACKSXLIBRO','TF_TOMASXLIBRO',
       'POSIBILIDAD_AUDITORIA','CONTROL_PALLET_DIFERENCIAS'].includes(n)) return 'tomafisica';

  // Inventario
  if (n.startsWith('INVENTARIO') || n.startsWith('EINV')) return 'inventario';
  if (['HISTORICO_INVENTARIO_AB','WMS_KPI_FOTO_INVENTARIO',
       'MOTIVOAJUSTES','SERIE_CONTROL','WMSLOTES'].includes(n)) return 'inventario';

  // Kardex / movimientos
  if (n.startsWith('KARDEX') || n.startsWith('MOVIMIENTO')) return 'kardex';
  if (['ALMACENMOVIMIENTOS','ALMACENMOVIMIENTOS_CARCAM','ALMACENMOVIMIENTOSMISC','ALMACENMOVIMIENTOSSERIES',
       'EPALETMOVIMIENTOENTRADA','EPALETMOVIMIENTOENTRADASERIES',
       'EPALETMOVIMIENTOSALIDA','EPALETMOVIMIENTOSALIDASERIES',
       'TRANSACCION','TRANSACCION_BLOQUE','TRANSACCION_DETALLE','TRANSACTION_PROCESS',
       'WMS_TRANSACCION','EBATCH_CONTROLORDENES','BATCH_PROCESS',
       'HISTORY_FIX'].includes(n)) return 'kardex';
  if (n === 'Historial_inv_Kardex_AB') return 'kardex';

  // Picking / despacho
  if (n.startsWith('PICKING') || n.startsWith('DESPACHO') || n.startsWith('ALISTO') || n.startsWith('TOTE')) return 'picking';
  if (['ALERTAPICKING','REPI_SELECCION','REPI_SELECCION_MAX','NECESITA_REPI','NECESITA_REPI_MAX',
       'TIEMPOS_REPI','DESTINO_CONTENEDOR_ALISTO','CONTEXCO','CONTEXCO_REPI',
       'CHEQUEO_PALET','CHEQUEO_PALET_INCIDENCIAS',
       'RENDIMIENTO_USUARIO_ALISTO','RENDIMIENTO_USUARIO_PACKING','RENDIMIENTO_USUARIO_PORCENTAJES',
       'RE_IMPRESION_HH'].includes(n)) return 'picking';

  // Usuarios / seguridad
  if (n.startsWith('USUARIO') || n.startsWith('CCA_')) return 'usuarios';
  if (n === 'eSecurity') return 'usuarios';
  if (['PERFIL','PERMISOS','PERMISOCATALOGO','PERMISOPERFIL','PERMISOSGRUPOS',
       'UNIONPERMISOSPERFIL','UNIONUSUARIOPERFIL','UNIONUSUARIOPERFILRECURSO','UNIONUSUARIOPERFIL_BK',
       'UNIONPRESENTACIONES',
       'TPL_PERMISOS','TPL_PERMISO_CATEGORIA','TPL_USUARIOS','TPL_USUARIO_PERMISO',
       'SEGURIDADFAVORITO','INGRESOAPP','RECURSOSPERFILES','RECURSOSTRABAJOS','RECURSO_EMERGENCIA',
       'INTERFACE_USER','HSA_USUARIOS','HSA_USUARIOS_REAL',
       'MODULOS','ENTIDADES_HABILITADAS'].includes(n)) return 'usuarios';

  // Auditoria
  if (n.startsWith('AUDIT') || n.startsWith('LOG_') || n.startsWith('AUDITORIA')) return 'auditoria';
  if (['MONITORACCIONES','MONITORACTIVIDADES','MONITORLOGS','MONITOREMAIL',
       'MONITORPROCESOALMACEN','MONITORPROCESOS','MONITORSUBPROCESOALMACEN','MONITORSUBPROCESOS',
       'MONITOR_ERROR','MONITORACCION_PROBLEMA_MOTIVO','CONTROLMODIFICACIONES',
       'INTERFACE_TRANSACTION_LOG','VALIDACION_PARCIAL_LOG','HANSELLREGISTRO',
       'IMG_RUTAS_AUDITORIA_AB','SAT','SAT2','SAT_REGISTRY',
       'WMS_RESPUESTA','IRB','ISSSSSSSSSSSSSS','REVISAR','TABLATEMPORAL',
       'DATOS_ACCIONES_AB','DATOS_HORAS_MODULOS_ENTRADAS_SALIDAS_ALMACEN_TAB_AB','DATOS_PALLET_MUELLE_AB'].includes(n)) return 'auditoria';

  // Contenedores / Palets / Bultos
  if (n.startsWith('CONTENEDOR') || n.startsWith('PALET') || n.startsWith('BULTO')) return 'contenedores';
  if (['EPALETTIPOPALETS','EPALETTIPOSMOVIMIENTO','EPALETWAREHOUSE',
       'BK_CONTENEDOR_OLOVIEJO','ASOCIACION_PALETGALYS','PLACAS_CONT',
       'TARIMASGESTION','CONT_ALEX','CONT_ALEX_ARTICULOS','CATALOGOSERVICIOS'].includes(n)) return 'contenedores';

  // Ordenes / Produccion / Procesos
  if (n.startsWith('ORDEN_PRODUCCION')) return 'ordenes';
  if (['EBATCH_CONTROLORDENES','BATCH_PROCESS',
       'SCHEDULE','SCHEDULE_STEP','SCHEDULE_TASK','SCHEDULE_TASK_GROUP',
       'SCHSTEP_CALI','SCHTASK_CALI','PROCESO','PROCESOTEXTO','TAREASMISCELANEAS',
       'AUTOMATION','AUTOMATION_ERROR','AUTORIZACIONES','RAZONES','PROBLEMS',
       'PRIORIDAD_ENTREGA','PRIORIDAD_ENTREGA_REGLA','PRIORIDAD_EXPEDICION'].includes(n)) return 'ordenes';

  // Integracion / API / messaging
  if (['EINTEGRA_CUENTA_CONTABLE','EINTEGRA_DEFAULTS','EINTEGRA_RUTAS',
       'XML_BORRAR','XML_DOCUMENTO','XML_MASTER',
       'GASTOS_ADICIONALES_SBO','ERP_VENTA_DIARIA','WMS_PEDIDO_FACTURA',
       'WMS_ABECEDARIO','WMS_IMPRESORA_USUARIO','WMS_INTERFAZ_CONFIG',
       'ALERTAS_GENERALES','CODIGO_MENSAJE','MENSAJE_ERROR','TRADUCCIONES',
       'CHECKNETWORK','REVISION_RED','SEMAFORO',
       'EMAIL_CONFIGURATION','EMAIL_NOTIFICACIONES','NOTIFIACIONES_EMAIL',
       'COMPANY','GRUPOEMAIL','GRUPOINTERES','GRUPOINTERES_COMPANIA','GRUPOINTERES_INTERESADO',
       'INTERESADO','REGENTES','SERVICIOSESPECIALES',
       'APLICACIONCONTADOR'].includes(n)) return 'integracion';
  if (n === 'ApiLocks') return 'integracion';

  // Configuracion
  if (['RECURSOS','CALENDARIO_LABORAL','FERIADOS','DIAS','DIA_SEMANA_AB','TURNOS','TERMINALES',
       'DIMENSIONCAMPOS','CATALOGO_CURVA','CURVA','TEMPORAL_CURVAS',
       'CONTROLPANELQUERY','ESTOOLS_QUERY','CONSULTA','CONSULTAPARAMETRO',
       'QRY_MAP_CONSULTA','QRY_MAP_CONSULTA_PARAMETROS','QRY_MAP_REPORTE',
       'MANTENIMIENTO_FLETES','TPTRABCONFIGURACION','TRACE_CADUCIDAD',
       'TIPO_CAMBIO_2023_AB','ETIQUETACONTADOR','ETIQUETADO','TPL_TABLA_ARCHIVOS',
       'RESPALDO_ARTICULOSZONAPICKING','TALLER'].includes(n)) return 'configuracion';

  return 'otros';
}

// ── Build grouped map ─────────────────────────────────────────────────────────
const grouped = {};
Object.keys(GROUP_META).forEach(k => { grouped[k] = []; });
tables.forEach(t => grouped[classify(t)].push(t));

// ── EFW_COLORS ────────────────────────────────────────────────────────────────
const lines = ['const EFW_COLORS = {'];
tables.forEach(t => {
  const g = classify(t);
  lines.push('  ' + JSON.stringify(t) + ': ' + JSON.stringify(GROUP_META[g].color) + ',');
});
lines.push('};');
const EFW_COLORS = lines.join('\n');

// ── EFW_MOD ───────────────────────────────────────────────────────────────────
const EFW_MOD = 'const EFW_MOD = new Set([\n' +
  tables.map(t => '  ' + JSON.stringify(t)).join(',\n') +
  '\n]);';

// ── EFW_GROUPS ────────────────────────────────────────────────────────────────
const gLines = ['const EFW_GROUPS = {'];
Object.entries(GROUP_META).forEach(([key, meta]) => {
  const tList = grouped[key].map(t => '      ' + JSON.stringify(t)).join(',\n');
  gLines.push('  ' + key + ': {');
  gLines.push('    label: ' + JSON.stringify(meta.label) + ',');
  gLines.push('    color: ' + JSON.stringify(meta.color) + ',');
  gLines.push('    tables: [');
  if (tList) gLines.push(tList);
  gLines.push('    ]');
  gLines.push('  },');
});
gLines.push('};');
const EFW_GROUPS = gLines.join('\n');

// ── FK indexes ────────────────────────────────────────────────────────────────
// Build FK maps for TABLE_DEFS
const fkFromMap = {}; // table -> [{col, toTable}]
fks.forEach(fk => {
  if (!fkFromMap[fk.from_table]) fkFromMap[fk.from_table] = [];
  fkFromMap[fk.from_table].push({ col: fk.from_col, toTable: fk.to_table });
});

// Count references to decide top-100 tables
const fkToCount = {};
const fkFromCount = {};
fks.forEach(fk => {
  fkToCount[fk.to_table] = (fkToCount[fk.to_table] || 0) + 1;
  fkFromCount[fk.from_table] = (fkFromCount[fk.from_table] || 0) + 1;
});

// Score = references-received * 2 + FKs-sent
const scores = {};
tables.forEach(t => {
  scores[t] = (fkToCount[t] || 0) * 2 + (fkFromCount[t] || 0);
});

// Always include key business tables even if score is low
const alwaysInclude = new Set([
  'ARTICULOSGESTION','ARTICULOSGESTION_DATOS','ARTICULOSPRESENTACIONES','ARTICULOSEAN',
  'ARTICULOSKITS','ARTICULOSPROVEEDOR','ARTICULOSTRANSFORMACION','ARTICULOSCATEGORIA',
  'ARTICULOSZONAALMACENAJE','ARTICULOSZONAPICKING',
  'ALMACENES','ALMACENCOMPANIA','ALMACENUSUARIOS','ALMACENMOVIMIENTOS',
  'ALMACENAMIENTOS','ALMACENAMIENTOSUBICACIONES',
  'RECEPCIONESCABECERA','RECEPCIONESDETALLE','RECEPCIONESDETALLE_SERIES',
  'EXPEDICIONESCABECERA','EXPEDICIONESDETALLE','EXPEDICIONESDETALLE_SERIES',
  'TOMAFISICA_CABECERA','TOMAFISICA_CONTEODETALLE','TOMAFISICA_CONTEOCABECERA',
  'REVISIONINVENTARIO_CABECERA','REVISIONINVENTARIO_CONTEOCABECERA','REVISIONINVENTARIO_CONTEODETALLE',
  'INVENTARIOKARDEX','INVENTARIOKARDEX_DETALLE',
  'CONTENEDOR','CONTENEDORARTICULOS','CONTENEDORSERIES',
  'USUARIOS','PERFIL','PERMISOS','UNIONUSUARIOPERFIL','UNIONPERMISOSPERFIL',
  'COMPANIA','SUCURSAL','CLIENTES','PROVEEDORES','VENDEDOR',
  'ZONAALMACENAJE','ZONAPICKING','RECURSOS',
  'CONFIRMACION_PARCIAL_CABECERA','CONFIRMACION_PARCIAL_DETALLE',
  'PICKINGCABECERA','PICKINGDETALLE',
  'TIPOSINTEGRACION','TIPOSRECEPCION',
]);

const top100 = tables
  .sort((a,b) => {
    const aIn = alwaysInclude.has(a) ? 1000 : 0;
    const bIn = alwaysInclude.has(b) ? 1000 : 0;
    return (bIn + scores[b]) - (aIn + scores[a]);
  })
  .slice(0, 100);

// ── Build column map per table ────────────────────────────────────────────────
const colsByTable = {};
columns.forEach(c => {
  if (!colsByTable[c.TABLE_NAME]) colsByTable[c.TABLE_NAME] = [];
  colsByTable[c.TABLE_NAME].push(c);
});

// Heuristic PK detection: first non-nullable int/bigint col named ID* or ending in ID
function detectPK(tableName) {
  const cols = colsByTable[tableName] || [];
  // Try ID column exactly named after table
  const tShort = tableName.replace(/[^A-Z0-9]/g,'').toUpperCase();
  // Common PK name patterns
  const candidates = cols.filter(c => {
    const cn = c.COLUMN_NAME.toUpperCase();
    return c.IS_NULLABLE === 'NO' && (
      cn === 'ID' + tShort ||
      cn.startsWith('ID') ||
      cn === 'ROWID' ||
      cn === 'PK' ||
      cn === 'PKID'
    );
  });
  if (candidates.length > 0) return candidates[0].COLUMN_NAME;
  // Fallback: first non-nullable int column
  const intCol = cols.find(c => c.IS_NULLABLE === 'NO' && (c.DATA_TYPE === 'int' || c.DATA_TYPE === 'bigint' || c.DATA_TYPE === 'uniqueidentifier'));
  if (intCol) return intCol.COLUMN_NAME;
  // Fallback: first column
  return cols.length > 0 ? cols[0].COLUMN_NAME : null;
}

// ── EFW_TABLE_DEFS ────────────────────────────────────────────────────────────
const tdLines = ['const EFW_TABLE_DEFS = {'];

top100.forEach(tableName => {
  const pk = detectPK(tableName);
  const cols = colsByTable[tableName] || [];
  const fkColsForTable = fkFromMap[tableName] || [];
  const fkColNames = new Set(fkColsForTable.map(f => f.col));
  const fkColToTable = {};
  fkColsForTable.forEach(f => { fkColToTable[f.col] = f.toTable; });

  // Score each column for "importance"
  function colScore(c) {
    const cn = c.COLUMN_NAME.toUpperCase();
    let s = 0;
    if (c.IS_NULLABLE === 'NO') s += 3;
    if (c.DATA_TYPE === 'int' || c.DATA_TYPE === 'bigint') s += 1;
    if (fkColNames.has(c.COLUMN_NAME)) s += 5;
    if (cn.startsWith('ID')) s += 2;
    if (cn === pk) s += 10;
    return s;
  }

  const sorted = [...cols].sort((a,b) => colScore(b) - colScore(a));
  // Take PK first, then up to 7 more
  const pkCol = cols.find(c => c.COLUMN_NAME === pk);
  const rest = sorted.filter(c => c.COLUMN_NAME !== pk).slice(0, 7);
  const selected = pkCol ? [pkCol, ...rest] : sorted.slice(0, 8);

  const colDefs = selected.map(c => {
    if (fkColNames.has(c.COLUMN_NAME)) {
      return c.COLUMN_NAME + '→' + fkColToTable[c.COLUMN_NAME];
    }
    return c.COLUMN_NAME;
  });

  tdLines.push('  ' + JSON.stringify(tableName) + ': {');
  tdLines.push('    pk: ' + JSON.stringify(pk || '') + ',');
  tdLines.push('    cols: [' + colDefs.map(c => JSON.stringify(c)).join(', ') + ']');
  tdLines.push('  },');
});

tdLines.push('};');
const EFW_TABLE_DEFS = tdLines.join('\n');

// ── EFW_INTEGRATIONS ──────────────────────────────────────────────────────────
const intLines = ['const EFW_INTEGRATIONS = ['];
fks.forEach(fk => {
  const what = fk.from_table + '.' + fk.from_col + ' → ' + fk.to_table;
  intLines.push('  { from: ' + JSON.stringify(fk.from_table) +
    ', to: ' + JSON.stringify(fk.to_table) +
    ', what: ' + JSON.stringify(what) +
    ', status: "confirmed" },');
});
intLines.push('];');
const EFW_INTEGRATIONS = intLines.join('\n');

// ── Write output ──────────────────────────────────────────────────────────────
const output = [
  '// AUTO-GENERATED — eFlow WMS (EFW) constants',
  '// Source: eflow_schema.json — ' + tables.length + ' tables, ' + columns.length + ' columns, ' + fks.length + ' FK relationships',
  '// Generated: ' + new Date().toISOString(),
  '',
  EFW_COLORS,
  '',
  EFW_MOD,
  '',
  EFW_GROUPS,
  '',
  EFW_TABLE_DEFS,
  '',
  EFW_INTEGRATIONS,
].join('\n');

fs.writeFileSync('efw_constants.js', output, 'utf8');
process.stderr.write('Written efw_constants.js\n');
process.stderr.write('Lines: ' + output.split('\n').length + '\n');
process.stderr.write('Size: ' + (output.length / 1024).toFixed(1) + ' KB\n');
process.stderr.write('Top-100 tables selected: ' + top100.length + '\n');

// Print group sizes
Object.entries(grouped).forEach(([k, v]) => {
  process.stderr.write(GROUP_META[k].label + ': ' + v.length + ' tables\n');
});
