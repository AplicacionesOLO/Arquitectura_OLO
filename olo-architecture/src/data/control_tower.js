// ═══════════════════════════════════════════════════════════════════════════
// DATOS · TORRE DE CONTROL (Control Tower / WMH)
// Fuente: documentos de levantamiento en vivo de http://10.17.225.22:8080
//  · "Control Tower — Documento Maestro" (22/09/2026) — mapeo funcional + datos reales
//  · "Mapeo Funcional — Gestión y Priorización del Alistamiento de Pedidos COFERSA"
//    (Kristen Sofia Lopez Vargas, 23/09/2026)
// Omitido a propósito: el valor de la regla ADMPASS (es una contraseña) y los
// correos de usuarios.
// ═══════════════════════════════════════════════════════════════════════════

export const CT_META = {
  nombre: "Control Tower (Torre de Control)",
  tipo: "TMS — Transportation Management System",
  version: "4.18.4.4",
  marca: "WMH / Cloud Suite",
  proveedor: "eprac.com",
  url: "http://10.17.225.22:8080",
  stack: "Angular + Angular Material + AG Grid",
  bd: "EFLOW_OLO (conexión por almacén)",
  levantamiento: "22/09/2026",
};

export const CT_RESUMEN =
  "Control Tower es un TMS cuyo objetivo central es planificar y controlar viajes de distribución. Toma órdenes de despacho (pedidos de clientes) que llegan desde un almacén, permite agruparlas en viajes, asignarlas a unidades de transporte y choferes según rutas y zonas, y monitorea la operación en tiempo real mediante un dashboard con KPIs.";

export const CT_FLUJO = [
  "Entran órdenes desde el almacén (ERP/WMS → EFLOW_OLO).",
  "El planificador filtra órdenes por almacén / compañía / sucursal / ruta / prioridad.",
  "Selecciona órdenes y las añade a un viaje. El sistema recalcula en vivo: rutas, líneas, clientes, peso, volumen, monto.",
  "Crea el viaje → pasa a \"activo/pendiente\" y aparece en el Dashboard.",
  "Se monitorea el avance de preparación (%), días transcurridos y estado.",
  "Se pueden anular o fusionar viajes.",
  "Al cerrar, alimenta el reporte de viaje.",
];

export const CT_KPIS = [
  { label: "Viajes activos", value: "30" },
  { label: "Rutas involucradas", value: "56" },
  { label: "Órdenes en viajes", value: "766" },
  { label: "Líneas de detalle", value: "3,165" },
];

// Mapa de navegación · sección, módulo, ruta, qué hace
export const CT_NAV = [
  { seccion: "—",          modulo: "Dashboard",               url: "/dashboard",                          desc: "Operación en tiempo real de viajes activos: KPIs, Nuevo Viaje, Anular, Fusionar, Detalles." },
  { seccion: "Catálogos",  modulo: "Almacenes",               url: "/catalog/warehouses",                 desc: "Cada almacén tiene su propia cadena de conexión a BD (multi-almacén)." },
  { seccion: "Catálogos",  modulo: "Bajadas",                 url: "/catalog/incline-belt",               desc: "Bandas / puntos de carga (estado DISP = disponible)." },
  { seccion: "Catálogos",  modulo: "Choferes",                url: "/catalog/drivers",                    desc: "Choferes por compañía de transporte; filtro por compañía + Crear." },
  { seccion: "Catálogos",  modulo: "Compañías de Transporte", url: "/catalog/transportation-companies",   desc: "Transportistas (código de 4 dígitos, ACTIVE/INACTIVE)." },
  { seccion: "Catálogos",  modulo: "Rutas de Distribución",   url: "/catalog/distribution-routes",        desc: "Rutas con FK a zona (ruta 4 → zona 18 Alajuela)." },
  { seccion: "Catálogos",  modulo: "Unidades de Transporte",  url: "/catalog/transport-units",            desc: "Flota: matrícula, marca, tipo, capacidad de peso y volumen." },
  { seccion: "Catálogos",  modulo: "Zonas de Distribución",   url: "/catalog/distribution-zones",         desc: "Zonas (cantones CR) con código de 2 dígitos." },
  { seccion: "Documentos", modulo: "Órdenes",                 url: "/documents/orders",                   desc: "Órdenes de despacho activas. Requiere al menos un filtro (almacén, compañía, sucursal, ruta)." },
  { seccion: "Documentos", modulo: "Órdenes Inactivas",       url: "/documents/inactive-orders",          desc: "Órdenes históricas / anuladas / no planificadas, con rango de fechas." },
  { seccion: "Documentos", modulo: "Visor de viajes",         url: "/documents/journeys-visor",           desc: "Consulta de viajes por ID, almacén, compañía, sucursal, situación y fechas." },
  { seccion: "Documentos", modulo: "Nuevo Viaje",             url: "/documents/trips",                    desc: "MOTOR DE PLANIFICACIÓN: filtrar → seleccionar → Añadir → validar contra capacidad → Crear.", key: true },
  { seccion: "Reportes",   modulo: "Reporte de viaje",        url: "/analytics/journey-report",           desc: "Filtro por ID Viaje, Expedición ID y rango de fechas." },
  { seccion: "Seguridad",  modulo: "Reglas del sistema",      url: "/security/systemRules",               desc: "Motor de parámetros configurable (el valor va en Rango alfanumérico 1)." },
  { seccion: "Seguridad",  modulo: "Usuarios",                url: "/security/users",                     desc: "Usuarios: Crear, Cambiar contraseña, activo/inactivo." },
];

export const CT_UI_GLOBAL = [
  "Header: logo, menú (colapsa sidebar), búsqueda global y bloque de credenciales del usuario.",
  "Sidebar en 4 secciones (Catálogos, Documentos, Reportes, Seguridad) + Dashboard.",
  "Tablas AG Grid: encabezados ordenables, paginación de 500, First/Prev/Next/Last y contador Total.",
  "Formularios Material: pestaña General, campos de texto y selectores, botones Cancelar/Limpiar.",
  "Detalle del viaje y Agregar Órdenes se abren como ventanas sobre el dashboard (5 a 500 filas por página).",
];

export const CT_DASHBOARD_ACCIONES = [
  { boton: "Nuevo Viaje",  func: "Abre el motor de planificación (/documents/trips)", estado: "Activo" },
  { boton: "Anular Viaje", func: "Cancela el viaje seleccionado",                     estado: "Deshabilitado hasta seleccionar" },
  { boton: "Fusionar",     func: "Combina dos o más viajes",                          estado: "Deshabilitado hasta seleccionar ≥ 2" },
  { boton: "Detalles",     func: "Abre el detalle del viaje (por fila)",              estado: "Activo" },
];

export const CT_NUEVO_VIAJE_INDICADORES = [
  ["Rutas", "Rutas del viaje en construcción"],
  ["Almacén", "Almacén origen"],
  ["Total de Líneas", "Líneas acumuladas"],
  ["Clientes", "Clientes distintos"],
  ["Peso (Total)", "Peso vs capacidad"],
  ["Volumen (Total)", "Volumen vs capacidad"],
  ["Monto Total", "Valor acumulado"],
];

// Datos reales por columna — muestra extraída de la app en vivo (22/09/2026)
export const CT_DATOS = [
  {
    id: "viajes", label: "Viajes activos (Dashboard)", total: 32, url: "/dashboard",
    cols: ["#Viaje","#Muelle","ID Bajada","Avance","Líneas","ID Ruta","Nombre Ruta","Zona","Órdenes","Monto Total","Monto Prep.","Peso Total","Peso Prep.","Vol. Total","Vol. Prep.","Estado","Días"],
    rows: [
      ["8951","PURT23","4","100","26","15","TURRIALBA","Turrialba","9","1,382,749.26","491,918.26","34.70","9.67","1,353.90","1,335.42","Pendiente","5"],
      ["8952","PURT17","1","98.32","86","20","PURISCAL RUTA 27-STA ANA-C.COLON-PURIS-ATEN-TURRU","Santa Ana","24","4,115,961.57","3,690,588.97","1,146.95","1,083.59","552.68","489.51","Pendiente","5"],
      ["8954","PURT29","4","100","124","33","","","6","4,492,785.69","3,810,592.69","1,796.58","1,001.90","33.12","33.11","Pendiente","5"],
      ["8956","PURT21","4","99.78","138","34","","","5","5,943,740.14","5,250,112.14","1,980.32","1,084.18","1.65","1.61","Pendiente","5"],
      ["8957","PURT21","4","100","97","35","","","6","3,234,849.20","2,600,229.20","1,212.16","551.32","3.07","3.05","Pendiente","5"],
    ],
    nota: "Avance = % (0–100, hasta 2 decimales). Si el viaje tiene varias rutas, Nombre Ruta y Zona pueden venir vacíos. Métricas Total vs Prep. (preparado) para peso, volumen y monto.",
  },
  {
    id: "almacenes", label: "Almacenes", total: 1, url: "/catalog/warehouses",
    cols: ["ID Almacén","Código Almacén","Nombre Almacén","Conexión","Estado"],
    rows: [["1","0001","OLO","[conn]://10.17.224.20?database=EFLOW_OLO","ACTIVE"]],
    nota: "Cada almacén tiene su propia conexión a BD → arquitectura multi-almacén con data source propio.",
  },
  {
    id: "bajadas", label: "Bajadas", total: 7, url: "/catalog/incline-belt",
    cols: ["ID Bajada","Estado"],
    rows: [["1","DISP"],["2","DISP"],["3","DISP"],["4","DISP"],["5","DISP"],["6","DISP"],["7","DISP"]],
    nota: "DISP = disponible. La regla USEINCLINEBELT obliga a pedir una bajada al crear el viaje.",
  },
  {
    id: "choferes", label: "Choferes", total: "7 (TRANSOSA)", url: "/catalog/drivers",
    cols: ["ID","Empresa","Código","ID Tarjeta","Nombre","Estado","Situación","Número"],
    rows: [
      ["4","TRANSOSA DE ALAJUELA S.A.","264","204300699","LUIS DIEGO SOLORZANO GOMEZ","ACTIVE","FREE","004"],
      ["5","TRANSOSA DE ALAJUELA S.A.","296","205400666","GERARDO ALONSO DURAN ALFARO","ACTIVE","FREE","005"],
      ["7","TRANSOSA DE ALAJUELA S.A.","375","601730907","VICTOR MANUEL VEGA CHAVES","ACTIVE","FREE","007"],
      ["10","TRANSOSA DE ALAJUELA S.A.","186","C136919","OMAR ASDRUBAL VILLAGRA","ACTIVE","FREE","010"],
    ],
    nota: "ID de la Tarjeta suele ser la cédula (9 dígitos). Número con ceros a la izquierda (004) → STRING.",
  },
  {
    id: "companias", label: "Compañías de Transporte", total: 22, url: "/catalog/transportation-companies",
    cols: ["ID","Código Empresa","Nombre de la Empresa","Estado"],
    rows: [
      ["1","2614","CHRISTOPHER EDUARTE TORRES","INACTIVE"],
      ["2","3404","VENTA DE CAMIONES PORTILLO S.A","INACTIVE"],
      ["3","3407","TRANSOSA DE ALAJUELA SOCIEDAD ANONIMA","ACTIVE"],
      ["4","3759","LUIS CARLOS MARTIN MORA CASTILLO","ACTIVE"],
      ["8","3952","INVERSIONES ACUÑA Y SALAZAR DEL CARIBE S.R.L","ACTIVE"],
      ["9","3963","EDISON MIGUEL UREÑA UREÑA","ACTIVE"],
    ],
  },
  {
    id: "rutas", label: "Rutas de Distribución", total: 22, url: "/catalog/distribution-routes",
    cols: ["ID Ruta","ID Zona","Código","Nombre Ruta","Alias","Estado"],
    rows: [
      ["1","1","01","CASCO CENTRAL","CASCO CENTRAL","ACTIVE"],
      ["2","1","02","DESAMPARADOS SAN JOSE SUR-OESTE","SAN JOSE SUR-OESTE","ACTIVE"],
      ["4","18","04","ALAJUELA","ALAJUELA","ACTIVE"],
      ["6","34","06","CARTAGO","CARTAGO","ACTIVE"],
      ["9","72","09","LIMÓN","LIMÓN","ACTIVE"],
      ["11","1","1000","SAN JOSE","SAN JOSE","ACTIVE"],
    ],
    nota: "ID Zona es FK (ruta 4 → zona 18 Alajuela; ruta 6 → zona 34 Cartago).",
  },
  {
    id: "unidades", label: "Unidades de Transporte", total: "10 (TRANSOSA)", url: "/catalog/transport-units",
    cols: ["Unidad Id","Empresa","Código","Descripción","Matrícula","Marca","Tipo","Cap. Peso","Cap. Volumen"],
    rows: [
      ["12","TRANSOSA DE ALAJUELA S.A.","520","IZUSU NPR","CL190087","IZUSU NPR","CAMION","0","0"],
      ["13","TRANSOSA DE ALAJUELA S.A.","766","IZUSU NPR","CL213786","IZUSU NPR","CAMION","0","0"],
      ["14","TRANSOSA DE ALAJUELA S.A.","744","NISSAN UD","C132239","NISSAN UD","CAMION","0","0"],
      ["18","TRANSOSA DE ALAJUELA S.A.","548","ISUZU NPR","CL233545","ISUZU NPR.","CAMION","0","0"],
    ],
    nota: "CRÍTICO: Capacidad Peso y Capacidad Volumétrica están en 0 → hay que poblarlas antes de automatizar la asignación por capacidad.",
    critico: true,
  },
  {
    id: "zonas", label: "Zonas de Distribución", total: 22, url: "/catalog/distribution-zones",
    cols: ["ID Zona","Código","Nombre Zona","Alias","Estado"],
    rows: [
      ["1","01","San José","San José","ACTIVE"],
      ["2","02","Nicoya","Nicoya","ACTIVE"],
      ["3","03","Escazú","Escazú","ACTIVE"],
      ["5","05","Puriscal","Puriscal","ACTIVE"],
      ["9","09","Santa Ana","Santa Ana","ACTIVE"],
    ],
  },
  {
    id: "ordenes", label: "Órdenes", total: 185, url: "/documents/orders",
    cols: ["Número de Orden","Almacén","Fecha de Pedido","Ruta","ID Cliente","Cliente","Compañía","Sucursal"],
    rows: [
      ["7353","0001","2025-07-09T16:51:05.597Z","","0000475","UNILEVER","0010","0001"],
      ["Error de KPO con picking inverso","0001","2025-04-15T10:55:51.81Z","","1000169","KPO ALPHA INC, S.A","0010","0002"],
      ["CD250512082728-0000208","0001","2025-05-14T12:14:32.123Z","","0000208","AERO T1 SANT MARÍA","0010","0003"],
      ["2000018103","0001","2026-09-22T00:00:00Z","","005","T005 TIBÁS","0029","0001"],
      ["2000018104","0001","2026-09-22T00:00:00Z","","006","T006 DESAMPARADOS","0029","0001"],
      ["2000018106","0001","2026-09-22T00:00:00Z","","008","T008 Cartago","0029","0001"],
      ["Salida Mamalucille 24-2-2025","0001","2025-02-21T10:06:23.087Z","","0000327","CEDI Automercado","0042","0001"],
    ],
    nota: "\"Número de Orden\" acepta texto libre (ej. \"Error de KPO con picking inverso\") → STRING largo, no numérico. La ruta se asigna al planificar. Factura y Referencia 1/2 venían vacías.",
  },
  {
    id: "reglas", label: "Reglas del sistema", total: 8, url: "/security/systemRules",
    cols: ["ID Regla","Tipo","Descripción","Versión","Rango","Valor (alfa 1)"],
    rows: [
      ["ADMPASS","FLOW","Contraseña para procesos que requieran autorización.","4.17.0.2","A1","•••• (oculto)"],
      ["MECALUX","FLOW","Indica si el cliente usa interfaces de MECALUX.","4.17.0.2","L",""],
      ["PROGRESSTYPE","FLOW","Define el tipo de trabajo que determina el progreso de un viaje.","4.17.0.3","A1","CHEQDK"],
      ["USECARGACAMION","FLOW","Indica si valida carga de camión al cerrar viaje.","4.18.4.4","L",""],
      ["USEINCLINEBELT","FLOW","Modifica el flujo de creación de viajes para pedir una bajada de cinta transportadora.","4.17.0.2","L",""],
    ],
    nota: "Motor de parámetros configurable. Relevantes: USECARGACAMION, USEINCLINEBELT, PROGRESSTYPE, USECHEQUEO. Rango L = lógico, A1 = alfanumérico.",
  },
];

export const CT_MODELO = [
  "ZONA (1) --< RUTA (N)",
  "RUTA (1) --< ORDEN (N)",
  "ALMACEN (1) --< ORDEN (N)   [conexión BD propia]",
  "CLIENTE (1) --< ORDEN (N)",
  "ORDEN (1) --< LINEA (N)",
  "COMPANIA_TRANSPORTE (1) --< CHOFER (N)",
  "COMPANIA_TRANSPORTE (1) --< UNIDAD (N)",
  "UNIDAD: capacidad_peso, capacidad_volumen  [restricciones]",
  "VIAJE (1) --< ORDEN (N)",
  "VIAJE -- ligado a: RUTA(s), ZONA, BAJADA/MUELLE, UNIDAD, CHOFER",
  "VIAJE: avance %, peso/vol/monto total y prep., estado, días",
  "REGLA_SISTEMA · USUARIO",
];

export const CT_FORMATO = [
  ["Códigos con ceros a la izquierda", "0001, 0000475, 004", "STRING, no entero"],
  ["Fechas ISO 8601 UTC con milisegundos", "2025-07-09T16:51:05.597Z", "TIMESTAMP en UTC"],
  ["Montos con miles y 2 decimales", "5,943,740.14", "DECIMAL(18,2)"],
  ["Pesos / volúmenes", "1,980.32 · 1,353.90", "2 decimales"],
  ["Número de Orden con texto libre", "Error de KPO con picking inverso", "STRING largo (riesgo de calidad)"],
  ["Enums observados", "ACTIVE/INACTIVE · DISP · FREE · Pendiente", "Catálogo de estados"],
  ["Capacidades de unidades en 0", "Cap. Peso = 0 · Cap. Volumen = 0", "Poblar antes de automatizar"],
];

export const CT_RECOMENDACIONES = [
  ["Automatizar \"Nuevo Viaje\"", "Motor de ruteo/consolidación que agrupe órdenes por zona/ruta respetando capacidad de peso/volumen, prioridad y reglas, y proponga los viajes (con ajuste manual)."],
  ["Motor de reglas configurable", "Parámetros de negocio editables sin desplegar código, como Reglas del sistema."],
  ["Multi-almacén", "Orígenes de datos por almacén; capa de integración/ETL hacia ERP/WMS."],
  ["KPIs en tiempo real", "Vía WebSocket/eventos con agregados cacheados."],
  ["Estados de viaje definidos", "Pendiente → En preparación → En ruta → Entregado → Cerrado/Anulado, con % de avance sobre líneas preparadas."],
  ["Trazabilidad", "Mantener Órdenes Inactivas e histórico de viajes (Visor + Reportes) para auditoría."],
  ["Seguridad / roles", "Permisos por módulo (Catálogos/Documentos/Reportes/Seguridad) como base para RBAC."],
  ["Integración OMS ↔ TMS", "El OMS gestiona órdenes; el TMS gestiona viajes. La frontera está en \"Nuevo Viaje\"."],
  ["Saneamiento de datos", "Normalizar Número de Orden y poblar capacidades de flota."],
];

// ── Proceso COFERSA: Gestión y Priorización del Alistamiento de Pedidos ──
export const COFERSA_META = {
  titulo: "Gestión y Priorización del Alistamiento de Pedidos COFERSA",
  autora: "Kristen Sofia Lopez Vargas",
  fecha: "23/09/2026",
  procedimiento: "Manual de Procedimiento v01 (23/09/2026)",
  apps: [
    "eFlow WMS 3.2.8.5 · escritorio Windows · almacén 0001 - CEDI OLO",
    "Control Tower 4.18.4.4 · web · BD EFLOW_OLO",
  ],
  alcance: "Aplica a los pedidos de COFERSA que se procesan por banda transportadora y mesanín. No aplica a Ferretería EPA.",
};

export const COFERSA_RESUMEN =
  "En eFlow WMS se consultan las expediciones disponibles, se identifican las rutas del día, se generan las acciones de trabajo que inician el alistamiento y se controla el resultado (Alistó vs Packing y palets pendientes por chequear). En Torre de Control se crean los viajes, se agregan órdenes a viajes existentes y se asigna el muelle, lo que devuelve a eFlow la prioridad, la banda asignada y el número de viaje.";

// sys: "eflow" | "ct" | "ambos" | "fuera"
export const COFERSA_PASOS = [
  { paso: "4.1",  sys: "fuera", pantalla: "",                                        accion: "Respetar corte: 3:30 p. m. GAM, 5:30 p. m. rurales",                                   resultado: "Horario de corte respetado" },
  { paso: "4.2",  sys: "eflow", pantalla: "Ingreso eFlow 3.2.8.5",                   accion: "Conexión, Usuario, Contraseña, Almacén > Aceptar",                                     resultado: "Acceso a eFlow" },
  { paso: "4.3",  sys: "eflow", pantalla: "Documentos > Órdenes de Expedición",      accion: "Abrir la opción",                                                                       resultado: "Pestaña \"Salidas\" abierta" },
  { paso: "4.4",  sys: "eflow", pantalla: "Expediciones (Salidas) > Filtro",         accion: "Situación = Disponible y Compañía = COFERSA > Consultar",                              resultado: "Expediciones filtradas" },
  { paso: "4.5",  sys: "eflow", pantalla: "Expediciones (Salidas) > fila de filtro", accion: "Filtrar la columna Ruta; revisar el detalle de cada expedición",                        resultado: "Rutas del día identificadas" },
  { paso: "4.6",  sys: "eflow", pantalla: "Expediciones (Salidas)",                  accion: "Enviar los pedidos a Torre de Control",                                                 resultado: "Pedidos enviados a Torre de Control" },
  { paso: "4.7",  sys: "ct",    pantalla: "/login",                                  accion: "Usuario, Contraseña > Ingresar",                                                        resultado: "Acceso a Torre de Control" },
  { paso: "4.8",  sys: "ct",    pantalla: "Dashboard > Nuevo Viaje",                 accion: "Almacén OLO, Compañía COFERSA, Ruta > Añadir > Crear (rurales primero, luego GAM)",     resultado: "Viaje creado" },
  { paso: "4.9",  sys: "eflow", pantalla: "Expediciones (Salidas) > Refrescar",      accion: "Verificar prioridad, banda y número de viaje",                                          resultado: "Datos generados automáticamente" },
  { paso: "4.10", sys: "eflow", pantalla: "Control > Acciones de Trabajo > Filtro",  accion: "Situación del Trabajo = Disponible, Compañía = COFERSA > Consultar",                   resultado: "Acciones filtradas" },
  { paso: "4.11", sys: "eflow", pantalla: "Acciones de Trabajo",                     accion: "Generar los pedidos",                                                                   resultado: "Pedidos generados para alistamiento" },
  { paso: "4.12", sys: "ambos", pantalla: "Pasos 4.4 a 4.11",                        accion: "Repetir por cada ruta sin mezclarlas",                                                  resultado: "Cada ruta procesada por separado" },
  { paso: "4.13", sys: "ct",    pantalla: "Detalles > ⋮ > Cambiar muelle",           accion: "Asignar puerta 29 a viajes de material pesado (Zona 1 / Zona 2)",                       resultado: "Pesado en puerta 29" },
  { paso: "4.14", sys: "fuera", pantalla: "Excel de control",                        accion: "Registrar, imprimir y entregar",                                                        resultado: "Excel entregado a Empaque y Despacho" },
  { paso: "4.15", sys: "ct",    pantalla: "Dashboard > Detalles",                    accion: "Abrir el detalle del viaje correspondiente",                                            resultado: "Detalle revisado" },
  { paso: "4.16", sys: "ct",    pantalla: "Detalles > ⋮ > Agregar órdenes",          accion: "Filtrar por almacén y ruta > Lupa",                                                     resultado: "Órdenes filtradas" },
  { paso: "4.17", sys: "ct",    pantalla: "Agregar Órdenes",                         accion: "Revisar Observaciones y Fecha de Creación / Entrega",                                   resultado: "Sin cambios de ruta ni órdenes de fechas pasadas" },
  { paso: "4.18", sys: "ct",    pantalla: "Agregar Órdenes",                         accion: "Seleccionar > Añadir; asignar prioridad alta",                                          resultado: "Expediciones agregadas con prioridad alta" },
  { paso: "4.19", sys: "fuera", pantalla: "",                                        accion: "Distribuir personal por zonas",                                                         resultado: "Personal distribuido" },
  { paso: "4.20", sys: "eflow", pantalla: "Documentos > Comparat. Alistó vs Packing", accion: "Filtrar por Compañía y fecha > Consultar; investigar discrepancias",                  resultado: "Coincidencia 100 % o discrepancia identificada" },
  { paso: "4.21", sys: "eflow", pantalla: "Reportes > Rpt. Palets Pend x Chequear",  accion: "Revisar palets por ubicación (mesas superiores / inferiores)",                          resultado: "Apoyo de chequeadores asignado" },
  { paso: "4.22", sys: "eflow", pantalla: "Expediciones (Salidas)",                  accion: "Filtrar por compañía y número de viaje; seleccionar incompletas; generar acciones; prioridad alta", resultado: "Incompletos enviados el mismo día" },
  { paso: "4.23", sys: "eflow", pantalla: "Expediciones (Salidas) > filtro de Ruta", accion: "Revisar las rutas excluidas por el filtro",                                              resultado: "Sin cambios de ruta pendientes" },
];

// El número de viaje es el dato que une ambos sistemas
export const COFERSA_VIAJE_NOMBRES = [
  ["Torre de Control — Dashboard y Detalle", "#Viaje / Viaje# (ej. 8870)"],
  ["eFlow — Acciones de Trabajo (grilla)", "Viaje WM"],
  ["eFlow — Selección de criterios (Expediciones, Acciones, ePacking)", "NúmeroViaje WMH / Número Viaje WMH"],
  ["eFlow — Rpt. Palets Pend x Chequear", "NUMEROVIAJEWMH"],
];

export const COFERSA_INTEGRACION = [
  { dato: "Expediciones / órdenes disponibles", from: "eFlow WMS",       to: "Torre de Control", momento: "Paso 4.6" },
  { dato: "Número de viaje",                    from: "Torre de Control", to: "eFlow WMS",       momento: "Paso 4.9" },
  { dato: "Prioridad",                          from: "Torre de Control", to: "eFlow WMS",       momento: "Paso 4.9" },
  { dato: "Banda asignada",                     from: "Torre de Control", to: "eFlow WMS",       momento: "Paso 4.9" },
  { dato: "Muelle (puerta 29 para pesado)",     from: "Torre de Control", to: "—",               momento: "Paso 4.13" },
];

export const COFERSA_REGLAS = [
  ["Horario de corte: 3:30 p. m. rutas GAM; 5:30 p. m. rutas rurales", "Fuera de sistema (verificación del encargado)"],
  ["Solo pedidos de COFERSA por banda transportadora y mesanín; no aplica a Ferretería EPA", "Filtro Compañía = COFERSA"],
  ["Todo pedido de COFERSA debe pasar por Torre de Control", "Pasos 4.6 y 4.8"],
  ["Rutas GAM se atienden todos los días; rurales según programación", "Filtro de columna Ruta en Expediciones"],
  ["Enviar primero rutas rurales y después GAM", "Orden de creación de viajes en Nuevo Viaje"],
  ["No mezclar rutas entre sí, salvo que la observación del pedido lo permita", "Nuevo Viaje / Agregar Órdenes (filtro de ruta)"],
  ["Todo viaje de material pesado va a la puerta 29, independientemente de la banda", "Detalle > ⋮ > Cambiar muelle"],
  ["Zona 1 y Zona 2 de pesado se trabajan diariamente, alternando el día de carga según demanda", "—"],
  ["Excluir expediciones con observación de cambio de ruta o dirección", "Columna Observaciones (Expediciones y Agregar Órdenes)"],
  ["Órdenes de fechas pasadas se gestionan como viajes independientes", "Fecha de Creación / Fecha de Entrega en Agregar Órdenes"],
  ["Expediciones agregadas y pedidos incompletos llevan prioridad alta", "Prioridad en Acciones de Trabajo"],
  ["Unidades pedidas, preparadas y chequeadas deben coincidir al 100 %", "Comparación de ePacking Vs Alistó"],
];

export const COFERSA_RIESGOS = [
  ["Expediciones sin la observación de cambio de ruta → envío a destino incorrecto", "Columna Observaciones Expedición (eFlow) y Observaciones (Agregar Órdenes)", "4.17, 4.23"],
  ["Envío de una ruta a un destino erróneo por error humano", "Filtro de Ruta en Nuevo Viaje / Agregar Órdenes; columnas ID Ruta y Sector", "4.8, 4.16"],
  ["Envío de mercadería por la línea de producción sin pasar por Torre de Control", "Número de viaje (Viaje WM) visible en eFlow antes de generar acciones", "4.9"],
  ["Procesar un pedido de COFERSA con el procedimiento de EPA", "Filtro Compañía = COFERSA", "4.4, 4.10"],
  ["Envío de pedidos fuera del horario de corte", "Sin control en sistema", "4.1"],
];

// Datos que el mapeo COFERSA dejó sin identificar — se muestran como pendientes
export const COFERSA_PENDIENTES = [
  "Botón o acción de eFlow con la que se envían los pedidos a Torre de Control (4.6).",
  "Columnas de eFlow donde se ven la prioridad, la banda asignada y el número de viaje (4.9).",
  "Botón con el que se \"generan\" los pedidos desde Acciones de Trabajo (4.11) y valor que equivale a \"prioridad alta\".",
  "Campos de la ventana Cambiar muelle y forma de seleccionar la puerta 29 (4.13).",
  "Pantalla o campo donde se asigna la prioridad alta tras Añadir (4.18).",
  "Mecanismo técnico de la integración eFlow ↔ Torre de Control.",
  "Significado de los tipos de trabajo EXES, PICK, REPI, UBCO, UBRE.",
];

export const CT_DOCUMENTOS = [
  { titulo: "Mapeo Funcional — Control Tower", desc: "Pantalla por pantalla con capturas, botones, indicadores y formularios.", file: "docs/wmh/control-tower-mapeo-funcional.docx", tipo: "Word" },
  { titulo: "Mapeo Funcional — Alistamiento de Pedidos COFERSA", desc: "eFlow WMS + Torre de Control con capturas del proceso (23/09/2026).", file: "docs/wmh/mapeo-alistamiento-cofersa.docx", tipo: "Word" },
];
