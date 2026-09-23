// ═══════════════════════════════════════════════════════════════════════════
// VISTA · Manual SORTER CLIRO (Mecalux) — dentro de Operación. Cross-docking
// EPA: 12 pantallas (Home, Nivel 1, Planta Baja) con el componente ManualSistema.
// Los procesos del silo Cross Docking citan estas pantallas en sus pasos.
// ═══════════════════════════════════════════════════════════════════════════
import { ManualSistema } from "../components/ManualSistema.jsx";
import { SORTER_META, SORTER_INTRO, SORTER_MODULOS, SORTER_PANTALLAS, SORTER_BY_ID, SORTER_FLUJO, SORTER_CONCEPTOS } from "../data/sorter_manual.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { sorterImgUrl } from "../lib/presentacion.js";

function usosPorPantalla() {
  const out = {};
  for (const p of Object.values(PROCESOS)) {
    p.pasos.forEach((s, i) => {
      if (s.sistema !== "sorter" || !SORTER_BY_ID[s.screen]) return;
      const arr = (out[s.screen] ||= []);
      let e = arr.find(x => x.codigo === p.codigo);
      if (!e) arr.push(e = { codigo: p.codigo, pasos: [] });
      e.pasos.push(i + 1);
    });
  }
  return out;
}

const CFG = {
  titulo: `Manual de Usuario · ${SORTER_META.nombre}`, subtitulo: `${SORTER_META.vendor} · Cross-docking EPA · ${SORTER_META.url} · 12 pantallas · septiembre 2026`,
  intro: SORTER_INTRO, accent: "#ea580c", sistema: "SORTER CLIRO", idKey: "sorterId",
  aviso: "GAP de integración: el mapeo es funcional. No está documentado cómo llegan al sorter las órdenes de recepción de eFlow WMS / EPA ni cómo vuelve el resultado de la clasificación.",
  modulos: SORTER_MODULOS, pantallas: SORTER_PANTALLAS, byId: SORTER_BY_ID, imgUrl: sorterImgUrl,
  flujo: SORTER_FLUJO, flujoLabel: "Flujo de cross-docking", usos: usosPorPantalla(), conceptos: SORTER_CONCEPTOS,
};

export function SorterManualView({ focus }) {
  return <ManualSistema cfg={CFG} focusScreen={focus?.sorterScreen}/>;
}
