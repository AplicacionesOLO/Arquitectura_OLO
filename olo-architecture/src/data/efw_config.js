// ═══════════════════════════════════════════════════════════════════════════
// EFW · Configuración — Menú "Configuración" de eflow-WMS (Costa Rica, CEDI
// GENERAL · almacén 0001). Extraído del esquema real (EFLOW_OLO) y anotado
// contra la Guía de Configuración de ePRAC: Almacenes → Compañías → Sucursales
// → Zonas (5 tipos) → Almacenamientos → Ubicaciones → Rutas/Secuencias de
// Picking. 12 tablas, jerarquía 1:1 con los 12 capítulos de la guía.
// ═══════════════════════════════════════════════════════════════════════════

export const EFW_CONFIG_MOD = new Set([
  "ALMACENES", "COMPANIA", "SUCURSAL",
  "ZONAALMACENAJE", "ZONAPICKING", "ZONATRABAJORECURSOS", "ZONATRABAJOPREPARACION", "ZONACOLAPREPARACION",
  "ALMACENAMIENTOS", "ALMACENAMIENTOSUBICACIONES",
  "ZONARUTAPICKING", "ZONARUTAPICKINGSECUENCIA",
]);

export const EFW_CONFIG_GROUPS = {
  organizacion: {
    label: "Organización",
    color: "#546E7A",
    tables: ["ALMACENES", "COMPANIA", "SUCURSAL"],
  },
  zonificacion: {
    label: "Zonificación",
    color: "#1976D2",
    tables: ["ZONAALMACENAJE", "ZONAPICKING", "ZONATRABAJORECURSOS", "ZONATRABAJOPREPARACION", "ZONACOLAPREPARACION"],
  },
  almacenamiento: {
    label: "Almacenamiento & Ubicaciones",
    color: "#E65100",
    tables: ["ALMACENAMIENTOS", "ALMACENAMIENTOSUBICACIONES"],
  },
  picking: {
    label: "Rutas & Secuencias de Picking",
    color: "#388E3C",
    tables: ["ZONARUTAPICKING", "ZONARUTAPICKINGSECUENCIA"],
  },
};

export const EFW_CONFIG_COLORS = {};
Object.values(EFW_CONFIG_GROUPS).forEach(g => { g.tables.forEach(t => { EFW_CONFIG_COLORS[t] = g.color; }); });

export const EFW_CONFIG_TABLE_DEFS = {
  ALMACENES: { pk: "IDALMACEN", cols: ["IDALMACEN", "IDCATEGORIA", "PAIS", "CIUDAD", "DESCRIPCION", "TPALSI", "DIRECCION", "CONTACTO"] },
  COMPANIA: { pk: "IDCOMPANIA", cols: ["IDCOMPANIA", "IDCATEGORIA→REGLASCATEGORIAS", "DESCRIPCION", "TPCPSI", "DIRECCION", "CONTACTO", "TELEFONO", "FAX"] },
  SUCURSAL: { pk: "IDCOMPANIA", cols: ["IDCOMPANIA→COMPANIA", "IDSUCURSAL", "NOMBRELARGOSUCURSAL", "NUMEROIDENTIFICACION", "PAIS", "PROVINCIA", "CIUDAD", "DIRECCION"] },
  ZONAALMACENAJE: { pk: "IDALMACEN", cols: ["IDALMACEN→ALMACENES", "IDZONAALMACENAJE", "DESCRIPCION"] },
  ZONAPICKING: { pk: "IDALMACEN", cols: ["IDALMACEN→ALMACENES", "IDZONAPICKING", "DESCRIPCION", "IDRUTAPICKING", "CLASIFICACION"] },
  ZONATRABAJORECURSOS: { pk: "IDALMACEN", cols: ["IDALMACEN→ALMACENES", "IDZONATRABAJORECURSOS", "DESCRIPCION"] },
  ZONATRABAJOPREPARACION: { pk: "IDALMACEN", cols: ["IDALMACEN→ALMACENES", "IDZONATRABAJOPREPARACION", "DESCRIPCION"] },
  ZONACOLAPREPARACION: { pk: "IDALMACEN", cols: ["IDALMACEN→ALMACENES", "IDZONACOLAPREPARACION", "DESCRIPCION"] },
  ALMACENAMIENTOS: { pk: "IDALMACEN", cols: ["IDALMACEN→ALMACENES", "IDALMACENAMIENTO", "POSINIX", "POSINIY", "POSFINX", "POSFINY", "NUMNIVZ", "DESCRIPCION"] },
  ALMACENAMIENTOSUBICACIONES: { pk: "IDALMACEN", cols: ["IDALMACEN→ZONATRABAJORECURSOS", "IDALMACENAMIENTO→ALMACENAMIENTOS", "IDDIMENSION→DIMENSIONCAMPOS", "IDZONAALMACENAJE→ZONAALMACENAJE", "IDZONAPICKING→ZONAPICKING", "IDZONATRABAJORECURSOS→ZONATRABAJORECURSOS", "IDZONATRABAJOPREPARACION→ZONATRABAJOPREPARACION", "IDZONACOLAPREPARACION→ZONACOLAPREPARACION"] },
  ZONARUTAPICKING: { pk: "IDALMACEN", cols: ["IDALMACEN→ZONAPICKING", "IDZONAPICKING→ZONAPICKING", "IDRUTAPICKING", "DESCRIPCION", "TPRPSI"] },
  ZONARUTAPICKINGSECUENCIA: { pk: "IDALMACEN", cols: ["IDALMACEN→ZONARUTAPICKING", "IDZONAPICKING→ZONARUTAPICKING", "IDRUTAPICKING→ZONARUTAPICKING", "RUTASEQUENCIA", "RUTAORDEN", "IDALMACENAMIENTOINICIAL", "IDALMACENAMIENTOFINAL", "CAMPOINICIAL1"] },
};

// Enlace tabla → capítulo/Subproceso real dentro de Procesos › P1.2 Almacenaje
// › S9 Configuración del sistema (eflow WMS). El PDF de cada capítulo vive en
// el bucket Detalles_Porcesos (mismo storage que usa Procesos para "Detalle"),
// subido y referenciado ahí mismo — path fijo, no cambia salvo que alguien
// reemplace el archivo en Procesos.
const BUCKET = "Detalles_Porcesos";
const CAP = (n, titulo, file) => ({
  capitulo: n, titulo, bucket: BUCKET,
  path: `wms-config-guide/capitulos/${file}`,
  fileName: file,
});

export const EFW_CONFIG_CAPITULOS = {
  ALMACENES:                  CAP(1,  "Almacenes",                       "01 - Almacenes.pdf"),
  COMPANIA:                   CAP(2,  "Compañías",                       "02 - Companias.pdf"),
  SUCURSAL:                   CAP(3,  "Sucursales",                      "03 - Sucursales.pdf"),
  ZONAALMACENAJE:             CAP(4,  "Zonas de Almacenaje",              "04 - Zonas de Almacenaje.pdf"),
  ZONAPICKING:                CAP(5,  "Zonas de Picking",                 "05 - Zonas de Picking.pdf"),
  ZONATRABAJORECURSOS:        CAP(6,  "Zonas de Trabajo Recursos",        "06 - Zonas de Trabajo Recursos.pdf"),
  ZONATRABAJOPREPARACION:     CAP(7,  "Zonas de Trabajo de Preparación",  "07 - Zonas de Trabajo de Preparacion.pdf"),
  ZONACOLAPREPARACION:        CAP(8,  "Zonas Cola de Preparación",        "08 - Zonas Cola de Preparacion.pdf"),
  ALMACENAMIENTOS:            CAP(9,  "Almacenamientos",                 "09 - Almacenamientos.pdf"),
  ALMACENAMIENTOSUBICACIONES: CAP(10, "Almacenamientos Ubicaciones",     "10 - Almacenamientos Ubicaciones.pdf"),
  ZONARUTAPICKING:            CAP(11, "Rutas de Picking",                 "11 - Rutas de Picking.pdf"),
  ZONARUTAPICKINGSECUENCIA:   CAP(12, "Secuencias de Picking",            "12 - Secuencias de Picking.pdf"),
};
