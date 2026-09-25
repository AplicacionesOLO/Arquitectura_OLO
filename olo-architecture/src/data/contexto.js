// ═══════════════════════════════════════════════════════════════════════════
// DATOS · CONTEXTO — lo que se sabe de OLO fuera del árbol de procesos:
// localizaciones, aplicaciones y versiones, clientes y sus reglas operativas,
// fuentes del levantamiento y puntos de extensión de eflow / WMH.
// Cada hecho cita de dónde sale (procedimiento, manual, levantamiento o base).
// Los conteos (pantallas, tablas, pasos, glosario) NO están aquí: la vista los
// calcula de los datos vivos para que no se desactualicen.
// ═══════════════════════════════════════════════════════════════════════════

export const LOCALIZACIONES = [
  { pais: "Costa Rica", estado: "confirmed", etiqueta: "Operación activa",
    detalle: "CEDI OLO (almacén 0001 en eflow WMS) con los clientes COFERSA (compañía 0109) y Ferretería EPA. Stack completo: Softland v7.00 calibrado para Costa Rica (BNCR, Ministerio de Hacienda, D104, Ley 9635, Monitor Fiscal), eflow WMS de escritorio y handheld, Torre de Control WMH y el SORTER CLIRO de Mecalux para el cross-docking de EPA.",
    sistemas: ["Softland v7.00", "eflow WMS 3.2.8.5", "WMH 4.18.4.4", "SORTER CLIRO", "Apolo", "eIntegra (EPA / COFERSA)"] },
  { pais: "Venezuela", estado: "partial", etiqueta: "Próxima expansión",
    detalle: "Instancias propias de eflow por compañía (Beval, Febeca, Sillaca) y una Torre de Control WMH; Softland por compañía (Beval, Febeca, Sillaca, Trexa, Prisma) y middleware eIntegra. Pendiente: requerimientos SENIAT, IVA venezolano y formato de libros fiscales en Monitor Fiscal.",
    sistemas: ["eflow Beval · Febeca · Sillaca", "WMH VE", "Softland ×5 compañías", "eIntegra VE"] },
];

// vista: a dónde lleva el botón dentro del BPA
export const APLICACIONES = [
  { nombre: "Softland ERP", version: "v7.00 · motor Exactus", tipo: "ERP (contabilidad, facturación, compras, inventario contable)", uso: "Maestros, facturación electrónica (Hacienda), cuentas por cobrar y pagar. OLO usa su propia compañía OVERSEAS (Overseas Logistics Operations S A)", fuente: "17 manuales Softland + manual del Softland de OLO (OVERSEAS, 25/09/2026)", vista: { tab: "softland", view: "manual" } },
  { nombre: "eflow WMS · Desktop", version: "v3.2.8.5 · Windows", tipo: "WMS de escritorio (ePRAC)", uso: "Órdenes de recepción y expedición, acciones de trabajo, inventario, configuración, reportes", fuente: "Crawl de la app (23/09/2026)", vista: { tab: "ops", view: "wms" } },
  { nombre: "eflow WMS · RF (handheld)", version: "3.1.73.1 · Android (Xamarin)", tipo: "Terminal de piso", uso: "Recibo, almacenaje, picking, despacho, carga camión, inventario y control: 5 módulos, 18 opciones", fuente: "Mapa de la app en el teléfono (25/09/2026) + capturas de los manuales CEDI", vista: { tab: "ops", view: "hh" } },
  { nombre: "WMH · Torre de Control", version: "v4.18.4.4 · web (Angular)", tipo: "TMS de distribución (ePRAC)", uso: "Viajes, rutas, muelles, bajadas, choferes y unidades", fuente: "Levantamiento (22/09/2026) + manual (09/2026)", vista: { tab: "ops", view: "wmh" } },
  { nombre: "SORTER CLIRO (CliroSorter)", version: "web · http://10.17.225.85:2030/", tipo: "Sorter de cross-docking (Mecalux)", uso: "Clasificación por bajada / tienda de EPA (Nivel 1 y Planta Baja)", fuente: "Manual SORTER CLIRO (09/2026)", vista: { tab: "ops", view: "sorter" } },
  { nombre: "Apolo", version: "app móvil", tipo: "Control de despacho EPA", uso: "Registro de tarimas con dos fotografías y control de lo que sale a tienda", fuente: "Procedimiento CEDI-04 · Despacho EPA", vista: { tab: "olo-arch", codigo: "CEDI-04" } },
  { nombre: "eIntegra", version: "middleware", tipo: "Integración ERP ↔ WMS", uso: "Bases EINTEGRA_COFERSA / EINTEGRA_MAYOREO (CR) y eIntegra VE", fuente: "Backbone SQL · esquema eIntegra VE", vista: { tab: "integrations" } },
  { nombre: "Excel / Drive", version: "—", tipo: "Controles manuales", uso: "Control diario de viajes, devoluciones, garantías, taller, cargas de contenedor", fuente: "Procedimientos CEDI-01, CEDI-04, CEDI-14", vista: { tab: "olo-arch", codigo: "CEDI-14" } },
];

export const CLIENTES = [
  { nombre: "COFERSA", codigo: "Compañía 0109 en eflow", color: "#1d4ed8",
    operacion: "Se procesa por banda transportadora y mesanín: todo pedido pasa por Torre de Control, que asigna viaje, prioridad y banda. Se factura en Softland y se despacha por banda (máster) u original (tarima).",
    procesos: ["CEDI-01", "CEDI-05", "CEDI-06", "CEDI-07", "CEDI-08", "CEDI-10", "CEDI-09", "CEDI-11", "CEDI-12", "CEDI-14"] },
  { nombre: "Ferretería EPA", codigo: "Tiendas EPA", color: "#b45309",
    operacion: "No usa banda ni mesanín, por eso no pasa por Torre de Control. Programación semanal por tienda, cross-docking en el SORTER CLIRO y despacho a tienda con Apolo y Carga Camión de eflow.",
    procesos: ["CEDI-02", "CEDI-03", "CEDI-04", "XDK-01", "XDK-02"] },
];

// Reglas operativas tomadas de los procedimientos (codigo → abre la ficha)
export const REGLAS_OPERATIVAS = [
  { regla: "Horario de corte: 3:30 p. m. para rutas GAM y 5:30 p. m. para rutas rurales.", cliente: "COFERSA", codigo: "CEDI-01" },
  { regla: "Todo pedido de COFERSA debe pasar por Torre de Control (la mercancía del mesanín va por la banda de su ruta y muelle).", cliente: "COFERSA", codigo: "CEDI-01" },
  { regla: "Se crean primero los viajes de rutas rurales y después los de GAM; no se mezclan rutas salvo que la observación del pedido lo permita.", cliente: "COFERSA", codigo: "CEDI-01" },
  { regla: "Todo viaje de material pesado se asigna a la puerta 29, sin importar la banda.", cliente: "COFERSA", codigo: "CEDI-01" },
  { regla: "Los pedidos incompletos por falta de stock se envían el mismo día con prioridad alta.", cliente: "COFERSA", codigo: "CEDI-01" },
  { regla: "Unidades pedidas, preparadas y chequeadas deben coincidir al 100 % (Comparación Alistó vs Packing).", cliente: "COFERSA", codigo: "CEDI-01" },
  { regla: "En el alisto no se combinan rutas dentro de un mismo pedido: el palet debe ser de la ruta asignada.", cliente: "COFERSA", codigo: "CEDI-05" },
  { regla: "La factura se envía a Hacienda antes de despachar; con la copia impresa el despacho queda habilitado.", cliente: "COFERSA", codigo: "CEDI-07" },
  { regla: "EPA no tiene banda ni mesanín: su alistamiento no pasa por Torre de Control.", cliente: "EPA", codigo: "CEDI-02" },
  { regla: "Programación semanal: los lunes ingresan todos los pedidos de tienda, con prioridad a los suministros.", cliente: "EPA", codigo: "CEDI-02" },
  { regla: "Una venta puntual (pagada por adelantado en tienda) tiene prioridad sobre cualquier otro pedido.", cliente: "EPA", codigo: "CEDI-02" },
  { regla: "El despacho a tiendas inicia diariamente a las 5:00 a. m.; cada tarima lleva dos fotografías (esquina y general) como respaldo ante reclamos.", cliente: "EPA", codigo: "CEDI-04" },
  { regla: "En cross-docking el avance mínimo aceptable del expediente en eflow es 99 %; el cliente decide si cierra el expediente con sobrantes o mermas.", cliente: "EPA", codigo: "CEDI-03" },
  { regla: "Los choferes con devoluciones llegan siempre a la puerta 10; sin boleta que coincida con lo entregado, no se recibe.", cliente: "COFERSA", codigo: "CEDI-14" },
  { regla: "Solo aplican para garantía las marcas Eagle, Bticino, Schneider, Lorenzetti, Coflex, Fanal, 3M y Henkel (acuerdo COFERSA–OLO).", cliente: "COFERSA", codigo: "CEDI-14" },
  { regla: "La mercancía de mesanín no se ingresa en el mismo palet que la de la zona baja.", cliente: "COFERSA", codigo: "CEDI-14" },
];

// Reglas FLOW de la Torre de Control (Seguridad › Reglas del sistema). El valor
// de ADMPASS es una contraseña y no se muestra.
export const REGLAS_WMH = [
  ["ADMPASS", "Contraseña para procesos que requieren autorización (valor oculto)."],
  ["MECALUX", "Indica si el cliente usa interfaces de Mecalux."],
  ["MENUDENCIAORDERS", "Indica expediciones de menudencia (texto truncado en la captura)."],
  ["PROGRESSTYPE", "Tipo de trabajo que determina el avance de un viaje (valor CHEQDK)."],
  ["RESTRICTACTIVITIES", "Habilita el flujo de inserción de actividades (texto truncado en la captura)."],
  ["USECARGACAMION", "Valida la carga del camión al cerrar el viaje."],
  ["USECHEQUEO", "Indica si usa chequeo."],
  ["USEINCLINEBELT", "Pide una bajada de cinta transportadora al crear el viaje."],
];

// Mecanismos para conectar o parametrizar eflow / WMH (se suman a los de Softland)
export const EXTENSION_EFLOW = [
  { tipo: "Interfaz ERP → WMS", detalle: "Las órdenes del ERP entran a eflow y se revisan con «Consultar Interfaz» en Documentos › Ordenes de Recepción.", vista: { tab: "ops", view: "wms", screen: "screen_documentos__ordenes_de_recepcion" } },
  { tipo: "Staging eflow → WMH", detalle: "Torre de Control lee de tablas ext_tms_* (expediciones, clientes, compañías, choferes, pedido-factura) cargadas desde EFLOW_OLO.", vista: { tab: "integrations", cat: "wmh_cr" } },
  { tipo: "Reglas FLOW (WMH)", detalle: "Parámetros de negocio editables sin desplegar código (Seguridad › Reglas del sistema): 8 reglas, valor en «Rango alfanumérico 1».", vista: { tab: "ops", view: "wmh", wmhScreen: "seguridad_reglas_sistema" } },
  { tipo: "Reglas de almacén y compañía (eflow)", detalle: "Seguridad › Reglas Almacén y Reglas Compañía parametrizan el comportamiento por almacén y por compañía.", vista: { tab: "ops", view: "wms", screen: "screen_seguridad__reglas_almacen" } },
  { tipo: "Carga por archivo", detalle: "Ajustes Masivos («Cargar Archivo») e Impresión de Etiquetas EAN («Impresión Archivo») aceptan archivos externos.", vista: { tab: "ops", view: "wms", screen: "screen_inventario__ajustes_masivos" } },
  { tipo: "Exportación de reportes", detalle: "Los 29 reportes del WMS y los grids de WMH y del SORTER exportan a Excel / PDF: base de los controles manuales.", vista: { tab: "ops", view: "wms" } },
  { tipo: "Procedimientos y funciones SQL", detalle: "Stored procedures y funciones reales en WMH (CR) y Softland (VE), más triggers de negocio; ver Backbone SQL.", vista: { tab: "integrations", view: "backbone" } },
  { tipo: "Middleware eIntegra", detalle: "Capa de integración con bases propias por cliente (EINTEGRA_COFERSA, EINTEGRA_MAYOREO en CR; eIntegra VE).", vista: { tab: "integrations" } },
];

// Fuentes del levantamiento: qué aporta cada una y dónde se ve
export const FUENTES = [
  { fuente: "Informe Final Diagnóstico de Procesos OLO", origen: "Cámara de Industrias (CICR) · dic. 2024", aporta: "30 procesos del modelo BPA con madurez, prioridad y dueño", vista: { tab: "bpa" } },
  { fuente: "Manuales de Softland", origen: "17 manuales del proveedor", aporta: "Módulos del ERP, integraciones intra-suite, puntos de extensión", vista: { tab: "softland" } },
  { fuente: "Manual Softland ERP de OLO", origen: "Compañía OVERSEAS · levantado en modo consulta el 25/09/2026", aporta: "Menús de los 14 módulos y 149 pantallas con captura (CI, CO, FA, CC, CP, DE); capturas privadas porque muestran datos reales", vista: { tab: "softland", view: "manual" } },
  { fuente: "Plan de trabajo: Integración WMS – OLO – 3PL Softland", origen: "Presentación del proyecto · febrero 2026", aporta: "Fases y cronograma de la integración con Softland (24 feb – jul 2026, sobre SQL Server): sus entregables de análisis funcional y diseño técnico deberían cerrar la brecha Softland ↔ eflow", vista: { tab: "context" } },
  { fuente: "Guías de configuración eflow (ePRAC)", origen: "Guía de configuración por capítulos", aporta: "Tablas de configuración (almacenes, zonas, rutas y secuencias de picking)", vista: { tab: "integrations", cat: "efw_config" } },
  { fuente: "Crawl de eflow WMS", origen: "App en vivo · 23/09/2026", aporta: "122 pantallas, campos, botones, columnas y navegación con captura", vista: { tab: "ops", view: "wms" } },
  { fuente: "Levantamiento de Control Tower", origen: "App en vivo · 22/09/2026", aporta: "Mapeo funcional, datos reales por columna, modelo de datos y recomendaciones OMS/TMS", vista: { tab: "ops", view: "wmh" } },
  { fuente: "Manual de Usuario Control Tower (WMH)", origen: "Septiembre 2026", aporta: "17 pantallas con captura y el flujo operativo típico", vista: { tab: "ops", view: "wmh", wmhScreen: "dashboard" } },
  { fuente: "Manual de Usuario SORTER CLIRO", origen: "Mecalux · septiembre 2026", aporta: "12 pantallas con captura y el flujo de cross-docking de EPA", vista: { tab: "ops", view: "sorter" } },
  { fuente: "Procedimientos operativos del CEDI", origen: "14 procedimientos · septiembre 2026", aporta: "Objetivo, alcance, responsables, pasos, registros y no conformidades de CEDI-01–CEDI-14", vista: { tab: "olo-arch" } },
  { fuente: "Manuales de usuario del CEDI", origen: "10 manuales con capturas del handheld", aporta: "Pantallas y opciones usadas en cada procedimiento", vista: { tab: "olo-arch" } },
  { fuente: "Mapa de la app handheld", origen: "Captura en teléfono de eFlow WMS HH 3.1.73.1 (25/09/2026): 23 pantallas con su jerarquía de UI", aporta: "Menú completo del handheld, campos de escaneo, datos que muestra y opciones de cada pantalla", vista: { tab: "ops", view: "hh" } },
  { fuente: "Diagramas de flujo (drawio)", origen: "14 diagramas, uno por proceso", aporta: "Decisiones y secuencia de cada procedimiento", vista: { tab: "olo-arch" } },
  { fuente: "Mapeo del alistamiento COFERSA", origen: "23/09/2026", aporta: "Flujo integrado eflow ↔ Torre de Control paso a paso", vista: { tab: "ops", view: "wmh" } },
  { fuente: "Esquemas de base de datos", origen: "Extracción directa de las bases", aporta: "Tablas, claves y relaciones FK de eflow, WMH, SRO, SCO y Venezuela", vista: { tab: "integrations" } },
  { fuente: "Backbone SQL", origen: "Metadata SQL Server · 28/08/2026", aporta: "Procedimientos, funciones y triggers reales por instancia", vista: { tab: "integrations", view: "backbone" } },
];
