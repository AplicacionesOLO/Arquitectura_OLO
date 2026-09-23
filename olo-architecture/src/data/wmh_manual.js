// ═══════════════════════════════════════════════════════════════════════════
// DATOS · Manual de Usuario Control Tower (WMH) — eflow Cloud Suite v4.18.4.4
// Fuente: "Manual Control Tower (WMH).docx" (septiembre 2026): 17 capturas con
// su pie de figura, subidas a Detalles_Porcesos/wmh-manual/. En la captura de
// Usuarios la columna Email está difuminada (el bucket es público).
// ═══════════════════════════════════════════════════════════════════════════

export const WMH_INTRO = "Control Tower (WMH) es la torre de control de la operación de distribución de OLO. Permite planificar, monitorear y despachar viajes de transporte en tiempo real, gestionando órdenes, rutas, unidades, choferes y compañías de transporte. Mientras el eflow WMS ejecuta la operación física del almacén, WMH coordina la salida de la mercancía hacia el cliente.";

export const WMH_MODULOS = [
  { name: "Dashboard", info: "Pantalla de inicio: estado global de la operación de viajes con KPIs y la lista de viajes activos. Desde aquí se crean, anulan y fusionan viajes." },
  { name: "Catálogos", info: "Datos maestros de la distribución. Todas las pantallas comparten el patrón: tabla con buscador, control de página y botón Crear. Deben estar cargados antes de planificar viajes." },
  { name: "Documentos", info: "Las órdenes (la materia prima) y los viajes (el resultado de la planificación)." },
  { name: "Reportes", info: "Seguimiento y control posterior de los viajes." },
  { name: "Seguridad", info: "Reglas de comportamiento del sistema y administración de usuarios." },
];

const sc = (id, modulo, nombre, url, figura, descripcion, extra = {}) =>
  ({ id, modulo, nombre, url, figura, descripcion, img: `wmh__${id}.jpg`, columnas: [], campos: [], acciones: [], ...extra });

export const WMH_PANTALLAS = [
  sc("dashboard", "Dashboard", "Operación en tiempo real (Viajes)", "/dashboard", "Dashboard con indicadores en tiempo real y viajes activos.",
    "Estado global de la operación: KPIs de viajes, rutas, órdenes y líneas (con % de avance), montos total y asignado, clientes, peso, volumen y unidades de transporte, más la tabla de viajes activos.",
    { columnas: ["#Viaje", "#Muelle", "ID Bajada", "Avance (%)", "Almacenes"],
      campos: ["Viajes", "Rutas", "Órdenes", "Líneas", "Monto Total / Asignado", "Clientes", "Peso / Volumen", "Unidades de Transporte"],
      acciones: [["Nuevo Viaje", "Abre el constructor de viajes"], ["Anular Viaje", "Cancela el/los viajes seleccionados; se habilita al marcar un viaje"], ["Fusionar", "Combina dos o más viajes seleccionados en uno solo"]] }),
  sc("catalogos_almacenes", "Catálogos", "Almacenes", "/catalog/warehouses", "Catálogos › Almacenes.",
    "Almacenes / centros desde donde se despacha. Cada almacén tiene su propia conexión a la base de datos.",
    { columnas: ["ID Almacén", "Código Almacén", "Nombre Almacén", "Conexión", "Estado"], acciones: [["Crear", "Alta de un almacén"]] }),
  sc("catalogos_bajadas", "Catálogos", "Bajadas", "/catalog/incline-belt", "Catálogos › Bajadas.",
    "Bajadas (bandas de descarga / incline-belt) asociadas a la operación; la regla USEINCLINEBELT pide una bajada al crear el viaje.",
    { columnas: ["ID Bajada", "Estado"] }),
  sc("catalogos_choferes", "Catálogos", "Choferes", "/catalog/drivers", "Catálogos › Choferes, con filtro por compañía.",
    "Lista de choferes filtrada por compañía de transporte: se elige la compañía y se pulsa Buscar.",
    { campos: ["Compañía de transporte"], acciones: [["Buscar", "Muestra los choferes de la compañía"], ["Crear", "Abre el formulario de alta"]] }),
  sc("catalogos_crear_choferes", "Catálogos", "Crear Choferes", "/catalog/drivers", "Catálogos › Crear Choferes (formulario).",
    "Formulario de alta de un chofer.",
    { campos: ["Nombre del Chofer", "ID de la Tarjeta del Chofer", "Código del Chofer", "Situación", "Estado", "Compañía Transporte ID"], acciones: [["Cancelar", "Descarta el alta"], ["Limpiar", "Vacía el formulario"]] }),
  sc("catalogos_companias_transporte", "Catálogos", "Compañías de Transporte", "/catalog/transportation-companies", "Catálogos › Compañías de Transporte.",
    "Empresas transportistas.",
    { columnas: ["Compañía Transporte ID", "Código de la Empresa", "Nombre de la Empresa", "Estado"] }),
  sc("catalogos_rutas_distribucion", "Catálogos", "Rutas de Distribución", "/catalog/distribution-routes", "Catálogos › Rutas de Distribución.",
    "Rutas de reparto; cada ruta pertenece a una zona.",
    { columnas: ["ID Ruta", "ID Zona", "Código Ruta", "Nombre Ruta", "Alias Ruta", "Estado"] }),
  sc("catalogos_unidades_transporte", "Catálogos", "Unidades de Transporte", "/catalog/transport-units", "Catálogos › Unidades de Transporte.",
    "Vehículos, filtrados por compañía de transporte. Las capacidades de peso y volumen son las que valida la planificación del viaje.",
    { campos: ["Compañía de transporte"], acciones: [["Crear", "Registra una nueva unidad"]] }),
  sc("catalogos_zonas_distribucion", "Catálogos", "Zonas de Distribución", "/catalog/distribution-zones", "Catálogos › Zonas de Distribución.",
    "Agrupa rutas en zonas geográficas.",
    { columnas: ["ID Zona", "Código Zona", "Nombre Zona", "Alias Zona", "Estado"] }),
  sc("documentos_ordenes", "Documentos", "Órdenes", "/documents/orders", "Documentos › Órdenes, con panel de filtros.",
    "Órdenes disponibles para distribuir (las que llegan desde eFlow).",
    { campos: ["Almacenes", "Compañías", "Sucursales", "Rutas"], acciones: [["Buscar", "Aplica los filtros"]] }),
  sc("documentos_ordenes_inactivas", "Documentos", "Órdenes Inactivas", "/documents/inactive-orders", "Documentos › Órdenes Inactivas.",
    "Órdenes que ya no están activas en la operación (históricas, anuladas o no planificadas).",
    { campos: ["Expedición", "Almacenes", "Compañías", "Sucursales", "Fecha de inicio", "Fecha de fin"], acciones: [["Buscar", "Aplica los filtros"]] }),
  sc("documentos_visor_viajes", "Documentos", "Visor de viajes", "/documents/journeys-visor", "Documentos › Visor de viajes (filtros).",
    "Consulta de los viajes planificados.",
    { campos: ["ID Viaje", "Almacenes", "Compañías", "Sucursales", "Situación", "Rango de fechas"], acciones: [["Buscar", "Puebla la tabla de viajes"], ["Filtrar", "Aplica los criterios sobre la tabla"]] }),
  sc("documentos_visor_viajes_resultado", "Documentos", "Visor de viajes · resultado", "/documents/journeys-visor", "Visor de viajes tras ejecutar la búsqueda: acciones Despachar y Guía de Carga habilitadas.",
    "Con viajes en la tabla se habilitan el despacho y la guía de carga.",
    { acciones: [["Despachar", "Confirma la salida del viaje seleccionado"], ["Guía de Carga PDF", "Genera el documento de carga para imprimir"], ["Guía de Carga Excel", "Exporta el documento de carga"]] }),
  sc("documentos_nuevo_viaje", "Documentos", "Nuevo Viaje", "/documents/trips", "Documentos › Nuevo Viaje (constructor).",
    "Constructor de viajes (motor de planificación): se eligen almacenes, compañías, sucursales, rutas y prioridad y se agregan órdenes. Arriba muestra contadores en vivo del viaje en construcción.",
    { campos: ["Almacenes", "Compañías", "Sucursales", "Rutas", "Prioridad", "Rutas · Almacén · Total de Líneas · Clientes · Peso · Volumen · Monto Total (en vivo)"],
      acciones: [["Crear", "Genera el viaje con las órdenes seleccionadas"], ["Añadir", "Agrega órdenes al viaje en construcción"], ["Cancelar", "Descarta el viaje sin guardarlo"]] }),
  sc("reportes_reporte_viaje", "Reportes", "Reporte de viaje", "/analytics/journey-report", "Reportes › Reporte de viaje.",
    "Reporte de uno o varios viajes.",
    { campos: ["ID Viaje", "Expedición ID", "Fecha de Inicio", "Fecha de Fin"], acciones: [["Buscar", "Genera el reporte"]] }),
  sc("seguridad_reglas_sistema", "Seguridad", "Reglas del sistema", "/security/systemRules", "Seguridad › Reglas del sistema.",
    "Reglas de comportamiento del sistema (8 reglas FLOW: ADMPASS, MECALUX, MENUDENCIAORDERS, PROGRESSTYPE, RESTRICTACTIVITIES, USECARGACAMION, USECHEQUEO, USEINCLINEBELT).",
    { columnas: ["ID Regla", "Tipo de regla", "Descripción", "Fecha de instalación", "Fecha de mantenimiento", "Versión"], acciones: [["Crear", "Añade una regla"]] }),
  sc("seguridad_usuarios", "Seguridad", "Usuarios", "/security/users", "Seguridad › Usuarios (columna Email difuminada).",
    "Administración de los usuarios del sistema.",
    { columnas: ["ID del usuario", "Código del usuario", "Nombre", "Apellidos", "Email", "Activo"], acciones: [["Crear", "Alta de usuario"], ["Cambiar contraseña", "Se habilita al seleccionar un usuario"]] }),
];

// Flujo operativo típico (sección 7 del manual) → recorrido guiado
export const WMH_FLUJO = [
  { texto: "Verificar en el Dashboard el estado de la operación (órdenes, viajes, avance).", pantalla: "dashboard" },
  { texto: "Revisar las Órdenes pendientes de distribuir (Documentos › Órdenes).", pantalla: "documentos_ordenes" },
  { texto: "Crear un viaje con Nuevo Viaje, seleccionando almacén, rutas y órdenes.", pantalla: "documentos_nuevo_viaje" },
  { texto: "Monitorear el viaje en el Visor de viajes y generar su Guía de Carga.", pantalla: "documentos_visor_viajes" },
  { texto: "Despachar el viaje cuando la carga esté lista.", pantalla: "documentos_visor_viajes_resultado" },
  { texto: "Consultar el Reporte de viaje para el seguimiento y control posterior.", pantalla: "reportes_reporte_viaje" },
];

// Para ligar pasos de procesos que ocurren en Torre de Control (sistema "torre")
// con su pantalla: palabras clave del texto del paso → pantalla. El orden importa
// (la primera que coincide gana).
export const WMH_CLAVES = [
  [/nuevo viaje|crear (el )?viaje|constructor|repetir por cada ruta/i, "documentos_nuevo_viaje"],
  [/despach/i, "documentos_visor_viajes_resultado"],
  [/visor|gu[ií]a de carga/i, "documentos_visor_viajes"],
  [/reporte de viaje/i, "reportes_reporte_viaje"],
  [/[óo]rdenes inactivas/i, "documentos_ordenes_inactivas"],
  [/chofer/i, "catalogos_choferes"],
  [/unidad(es)? de transporte|capacidad/i, "catalogos_unidades_transporte"],
  [/bajada|banda/i, "catalogos_bajadas"],
  [/regla/i, "seguridad_reglas_sistema"],
  // Detalle del viaje, Agregar Órdenes y Cambiar muelle son ventanas que se abren sobre el Dashboard
  [/dashboard|detalles?|agregar [óo]rdenes|a[ñn]adir|cambiar muelle|muelle|puerta|pesado|cambio de ruta|viajes activos|anular|fusionar|ingresar a torre|torre de control/i, "dashboard"],
];

export const WMH_BY_ID = Object.fromEntries(WMH_PANTALLAS.map(p => [p.id, p]));

export function pantallaWmhDePaso(texto) {
  for (const [re, id] of WMH_CLAVES) if (re.test(texto || "")) return id;
  return null;
}
