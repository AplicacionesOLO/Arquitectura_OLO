// ═══════════════════════════════════════════════════════════════════════════
// DATOS · Registro único de fichas de proceso: los 14 procedimientos del CEDI
// (procesos_cedi.js, fuente: documentos de OLO) + los borradores de los silos
// de referencia (procesos_silos.js, fuente: pantallas de eFlow WMS + inferido).
// Los consumidores (ficha, árbol, Integraciones, manual WMS, presentación) leen
// de aquí para no tener que distinguir el origen.
// ═══════════════════════════════════════════════════════════════════════════
import { PROCESOS_CEDI } from "./procesos_cedi.js";
import { PROCESOS_SILOS } from "./procesos_silos.js";
import { WMS_INDEX } from "./wms_links.js";
import { SORTER_BY_ID } from "./sorter_manual.js";

function normalizarBorrador(p) {
  return {
    compania: "Borrador", documentos: [], pantallas: [], notas: [], decisiones: [], relacionados: [],
    entradaDe: [], salidaA: [], registros: [], noConformidades: [], datosClave: [], conceptos: [],
    ...p,
    // la pantalla del paso se muestra con su ruta en el manual
    pasos: p.pasos.map(s => ({ ...s, pantalla:
      s.sistema === "sorter" && SORTER_BY_ID[s.screen] ? `SORTER CLIRO › ${SORTER_BY_ID[s.screen].modulo} › ${SORTER_BY_ID[s.screen].nombre}`
      : s.screen && WMS_INDEX[s.screen] ? `${WMS_INDEX[s.screen].module} › ${WMS_INDEX[s.screen].option}` : s.pantalla ?? null })),
  };
}

// Etiqueta de cada silo de referencia (para mostrar a qué silo apunta un "relacionado")
export const SILO_LABELS = {
  log_planificacion: "OL.1 · Planificación logística", log_almacenaje: "OL.2 · Almacenaje", log_preparacion: "OL.3 · Preparación de pedidos",
  log_transporte: "OL.4 · Transporte", log_inventario: "OL.5 · Inventario físico", log_servicio_cliente: "OL.6 · Servicio logístico",
  log_desempeno: "OL.8 · Desempeño logístico", neg_facturacion: "P1.12 · Facturación", neg_almacenamiento: "P1.13 · Almacenamiento ZF-nacional",
  neg_transporte_local: "P1.18 · Transporte local", neg_seguimiento_operacion: "P1.19 · Seguimiento de la operación",
  neg_valor_agregado: "P1.21 · Valor agregado", cross_docking: "OL.9 · Cross Docking",
  neg_fin_contable: "P1.10 · Financiero contable a clientes", neg_cobro: "P1.11 · Cobro", neg_comercializacion: "P1.14 · Comercialización",
};

export const PROCESOS = {
  ...PROCESOS_CEDI,
  ...Object.fromEntries(Object.entries(PROCESOS_SILOS).map(([c, p]) => [c, normalizarBorrador(p)])),
};

// Conexiones simétricas: si A «sigue en» B, B «viene de» A (una sola verdad para
// la ficha, Workflows y el asesor, aunque el documento de origen declare solo un lado).
for (const p of Object.values(PROCESOS)) for (const d of p.salidaA || []) {
  const b = PROCESOS[d]; if (!b) continue;
  if (!(b.entradaDe || []).includes(p.codigo)) b.entradaDe = [...(b.entradaDe || []), p.codigo];
}
