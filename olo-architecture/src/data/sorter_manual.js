// ═══════════════════════════════════════════════════════════════════════════
// DATOS · Manual de Usuario SORTER CLIRO (CliroSorter) — Mecalux · Cross-docking EPA
// Fuente: "Manual SORTER CLIRO (Mecalux).docx" (septiembre 2026): 12 capturas con
// su pie de figura, subidas a Detalles_Porcesos/sorter-manual/.
// Todo lo de aquí es funcional y real (origen "mecalux_sorter"). La integración
// TÉCNICA del sorter con eFlow WMS / EPA (cómo llegan las órdenes y cómo vuelve el
// resultado) NO está documentada: es un GAP y así se marca.
// ═══════════════════════════════════════════════════════════════════════════

export const SORTER_META = {
  nombre: "SORTER CLIRO (CliroSorter)", vendor: "Mecalux", url: "http://10.17.225.85:2030/",
  tipo: "Sistema de clasificación automática (sorter) / cross-docking",
};

export const SORTER_INTRO = "El SORTER CLIRO (CliroSorter, de Mecalux) es el sistema de clasificación automática que realiza el cross-docking para EPA. Cada expediente u orden de recepción que ingresa se divide por producto y tienda de destino, y el sorter asigna cada bulto a una bajada, de forma automática o manual. Así la mercancía que llega consolidada se reparte hacia las tiendas sin pasar por almacenaje. Nivel 1 recibe y clasifica; Planta Baja agrupa lo clasificado en viajes de despacho.";

export const SORTER_CONCEPTOS = [
  { termino: "Bajada", definicion: "Salida del sorter que corresponde a un destino (tienda / viaje). Planta Baja tiene 7 bajadas y Nivel 1 tiene 6." },
  { termino: "Automático vs. Manual", definicion: "Unidades que el sorter clasificó solo frente a las que se clasificaron a mano; mide qué porción se resolvió sin intervención humana." },
  { termino: "DESVIADO / Desvío OK", definicion: "Estatus de la lectura de una caja en Planta Baja: la caja fue desviada a su bajada y el desvío se confirmó." },
  { termino: "RECHAZADA", definicion: "Estatus de una lectura en el escaner de Nivel 1 cuando el bulto no corresponde." },
];

export const SORTER_MODULOS = [
  { name: "Home", info: "Panel de estatus en tiempo real de todas las bajadas (Planta Baja y Nivel 1) con accesos directos al control y los reportes de cada nivel." },
  { name: "Nivel 1", info: "Recepción y clasificación: la orden de recepción (expediente) se descompone por producto y tienda de destino y cada bulto se clasifica hacia una bajada." },
  { name: "Planta Baja", info: "Despacho: los bultos ya clasificados se agrupan en viajes por bajada y cliente." },
];

const sc = (id, modulo, nombre, url, figura, descripcion, extra = {}) =>
  ({ id, modulo, nombre, url, figura, descripcion, img: `sorter__${id}.jpg`, columnas: [], campos: [], acciones: [], ...extra });

const COMUNES = [["Exportar a Excel", "Exporta el grid"]];

export const SORTER_PANTALLAS = [
  sc("home", "Home", "Home · estatus de bajadas", "/", "Home: estatus de bajadas de Planta Baja y Nivel 1.",
    "Estado en tiempo real de todas las bajadas con su avance (procesado / total y %): 7 bajadas en Planta Baja y 6 en Nivel 1. Accesos a Control de viajes y Reportes (Planta Baja) y a Control de recepciones y Reportes (Nivel 1).",
    { campos: ["Estatus Planta Baja · 7 bajadas", "Estatus Nivel 1 · 6 bajadas", "Avance por bajada (procesado de total, %)"] }),
  sc("n1_control_ordenes", "Nivel 1", "Control de órdenes de recepción", "/N1/ControlN1", "Nivel 1 › Control de órdenes de recepción (pestaña Orden de recepción).",
    "Gestiona las órdenes de recepción (expedientes). Pestañas: Estatus de bajadas, Orden de recepción y Líneas.",
    { columnas: ["Orden de recepción", "Código de Cliente", "Cantidad", "Automático", "Manual", "Estatus", "Descripción de cliente", "Fecha de creación", "Porcentaje"],
      acciones: [["Guardar", "Guarda los cambios"], ["Transferir Bajada", "Reasigna una bajada"], ...COMUNES] }),
  sc("n1_estatus_bajadas", "Nivel 1", "Control de órdenes · Estatus de bajadas", "/N1/ControlN1", "Pestaña Estatus de bajadas: avance por bajada y órdenes asignadas.",
    "Avance de cada bajada de Nivel 1 y las órdenes asignadas a ella."),
  sc("n1_lineas", "Nivel 1", "Control de órdenes · Líneas (cross-docking)", "/N1/ControlN1", "Pestaña Líneas: desglose por producto y tienda (cross-docking).",
    "La vista clave del sistema: descompone cada orden en sus líneas; por cada producto muestra a qué tienda va, en qué bajada cae y cuánto se clasificó automática o manualmente.",
    { columnas: ["Número de orden", "Producto", "Bajada", "Cliente", "Cantidad", "Automático", "Manual", "Proveedor", "Tienda", "Estatus", "Fecha de creación", "Porcentaje"], acciones: COMUNES }),
  sc("n1_escaner", "Nivel 1", "Escaner (Nivel 1)", "/N1/EscanerN1", "Nivel 1 › Escaner.",
    "Lecturas del escaner en recepción, en vivo e histórico. El Estatus refleja el resultado de la lectura (RECHAZADA cuando el bulto no corresponde).",
    { campos: ["Pestañas: Escaner (en vivo) · Historico"], columnas: ["ID", "Orden de recepción", "Etiqueta", "Producto", "Proveedor", "Bajada", "Tránsito", "Estatus", "Fecha de creación"], acciones: COMUNES }),
  sc("n1_catalogo", "Nivel 1", "Catálogo de productos", "/N1/CatalogoN1", "Nivel 1 › Catálogo de productos.",
    "Productos manejados en Nivel 1, usados para validar las lecturas del escaner.",
    { columnas: ["Producto", "Etiqueta", "Descripción", "Cantidad", "Proveedor", "Fecha de creación"], acciones: COMUNES }),
  sc("n1_reportes", "Nivel 1", "Reportes (Nivel 1)", "/N1/ReportesN1", "Nivel 1 › Reportes.",
    "Histórico de órdenes de recepción y sus líneas con el tiempo de proceso; las columnas Productos pedidos y Tiempo miden el rendimiento del sorter.",
    { campos: ["Pestañas: Orden de recepción · Líneas"], columnas: ["Productos pedidos", "Tiempo"], acciones: COMUNES }),
  sc("pb_control_viajes", "Planta Baja", "Control de viajes", "/PB/ControlPB", "Planta Baja › Control de viajes (pestaña Viajes).",
    "Gestiona los viajes de despacho. Pestañas: Estatus de bajadas, Viajes y Cajas.",
    { columnas: ["Viaje", "Bajada", "Cod Cliente", "Cliente", "Cantidad", "Cant Actual", "Estatus", "Fecha Creación"],
      acciones: [["Guardar", "Guarda los cambios"], ["Transferir Bajada", "Reasigna un viaje a otra bajada"], ...COMUNES] }),
  sc("pb_estatus_bajadas", "Planta Baja", "Control de viajes · Estatus de bajadas", "/PB/ControlPB", "Pestaña Estatus de bajadas: avance por bajada y viajes asignados.",
    "Avance de cada bajada de Planta Baja y los viajes asignados a ella."),
  sc("pb_cajas", "Planta Baja", "Control de viajes · Cajas", "/PB/ControlPB", "Pestaña Cajas: detalle de bultos (Etiqueta, Peso, Código Tránsito, Bajada, Estatus DESVIADO/Desvío OK).",
    "Detalle de cada bulto del viaje y su estatus de desvío.",
    { columnas: ["Etiqueta", "Peso", "Código Tránsito", "Bajada", "Estatus (DESVIADO / Desvío OK)"], acciones: COMUNES }),
  sc("pb_reportes", "Planta Baja", "Reportes (Planta Baja)", "/PB/ReportesPB", "Planta Baja › Reportes.",
    "Histórico de viajes y cajas con el tiempo de proceso; la columna Tiempo mide la duración del despacho.",
    { campos: ["Pestañas: Viajes · Cajas"], columnas: ["Tiempo"], acciones: COMUNES }),
  sc("pb_escaner", "Planta Baja", "Escaner (Planta Baja)", "/PB/EscanerPB", "Planta Baja › Escaner.",
    "Lecturas del escaner en el despacho, en vivo e histórico.",
    { campos: ["Pestañas: Escaner · Historico"], columnas: ["ID", "Viaje", "Etiqueta", "Bajada", "Tránsito", "Estatus (DESVIADO / Desvío OK)", "Fecha de creación"], acciones: COMUNES }),
];

// Flujo de cross-docking de extremo a extremo (sección 5 del manual)
export const SORTER_FLUJO = [
  { texto: "Ingresa el expediente / orden de recepción (por ejemplo, CONSOL) con miles de unidades de múltiples productos.", pantalla: "n1_control_ordenes" },
  { texto: "En Nivel 1 se escanea cada bulto (Escaner N1) y se valida contra el Catálogo de productos.", pantalla: "n1_escaner" },
  { texto: "El sistema descompone la orden en Líneas por Producto y Tienda de destino (Control de órdenes › Líneas).", pantalla: "n1_lineas" },
  { texto: "Cada bulto se clasifica hacia una Bajada del sorter: Automático (por el sorter) o Manual.", pantalla: "n1_estatus_bajadas" },
  { texto: "En Planta Baja los bultos clasificados se agrupan en Viajes por bajada y cliente (Control de viajes).", pantalla: "pb_control_viajes" },
  { texto: "Se despacha el viaje y queda el registro histórico con tiempos (Reportes de PB y N1).", pantalla: "pb_reportes" },
];

export const SORTER_BY_ID = Object.fromEntries(SORTER_PANTALLAS.map(p => [p.id, p]));
