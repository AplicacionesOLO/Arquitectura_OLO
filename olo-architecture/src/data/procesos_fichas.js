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

function normalizarBorrador(p) {
  return {
    compania: "Borrador", documentos: [], pantallas: [], notas: [], decisiones: [], relacionados: [],
    entradaDe: [], salidaA: [], registros: [], noConformidades: [], datosClave: [], conceptos: [],
    ...p,
    // la pantalla del paso se muestra con su ruta en el manual
    pasos: p.pasos.map(s => ({ ...s, pantalla: s.screen && WMS_INDEX[s.screen] ? `${WMS_INDEX[s.screen].module} › ${WMS_INDEX[s.screen].option}` : null })),
  };
}

export const PROCESOS = {
  ...PROCESOS_CEDI,
  ...Object.fromEntries(Object.entries(PROCESOS_SILOS).map(([c, p]) => [c, normalizarBorrador(p)])),
};
