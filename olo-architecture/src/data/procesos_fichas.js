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
      : s.screen && WMS_INDEX[s.screen] ? `${WMS_INDEX[s.screen].module} › ${WMS_INDEX[s.screen].option}` : null })),
  };
}

// Etiqueta de cada silo de referencia (para mostrar a qué silo apunta un "relacionado")
export const SILO_LABELS = {
  log_planificacion: "P1.1 · Planificación logística", log_almacenaje: "P1.2 · Almacenaje", log_preparacion: "P1.3 · Preparación de pedidos",
  log_transporte: "P1.4 · Transporte", log_inventario: "P1.5 · Inventario físico", log_servicio_cliente: "P1.6 · Servicio logístico",
  log_desempeno: "P1.8 · Desempeño logístico", neg_facturacion: "P1.12 · Facturación", neg_almacenamiento: "P1.13 · Almacenamiento ZF-nacional",
  neg_transporte_local: "P1.18 · Transporte local", neg_seguimiento_operacion: "P1.19 · Seguimiento de la operación",
  neg_valor_agregado: "P1.21 · Valor agregado", cross_docking: "Cross Docking",
};

export const PROCESOS = {
  ...PROCESOS_CEDI,
  ...Object.fromEntries(Object.entries(PROCESOS_SILOS).map(([c, p]) => [c, normalizarBorrador(p)])),
};
