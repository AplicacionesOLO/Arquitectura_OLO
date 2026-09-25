// ═══════════════════════════════════════════════════════════════════════════
// VISTA · Manual eFlow WMS Handheld — dentro de Operación. La app RF del piso:
// 23 pantallas (menú principal, Recibo, Almacenaje, Picking y despacho,
// Inventario, Control) con el componente ManualSistema en formato retrato.
// Los pasos «handheld» de los procesos se ligan con pantallaHhDePaso().
// ═══════════════════════════════════════════════════════════════════════════
import { ManualSistema } from "../components/ManualSistema.jsx";
import { HH_META, HH_INTRO, HH_MODULOS, HH_PANTALLAS, HH_BY_ID, HH_FLUJO, HH_CONCEPTOS, HH_HALLAZGOS, pantallaHhDePaso } from "../data/hh_manual.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { hhImgUrl } from "../lib/presentacion.js";

function usosPorPantalla() {
  const out = {};
  for (const p of Object.values(PROCESOS)) {
    p.pasos.forEach((s, i) => {
      const id = pantallaHhDePaso(s, p.codigo);
      if (!id) return;
      const arr = (out[id] ||= []);
      let e = arr.find(x => x.codigo === p.codigo);
      if (!e) arr.push(e = { codigo: p.codigo, pasos: [] });
      e.pasos.push(i + 1);
    });
  }
  return out;
}

const CFG = {
  titulo: `Manual · ${HH_META.nombre}`, subtitulo: `${HH_META.vendor} · v${HH_META.version} · ${HH_META.tecnologia} · ${HH_PANTALLAS.length} pantallas · mapa del ${HH_META.fecha} (${HH_META.sesion})`,
  intro: HH_INTRO, accent: "#0d9488", sistema: "Handheld", idKey: "hhId", retrato: true,
  aviso: "Pantallas capturadas vacías, sin datos: lo que aparece después de escanear, «Trabajo automático» y «Toma física» aún no está capturado.",
  hallazgos: HH_HALLAZGOS,
  modulos: HH_MODULOS, pantallas: HH_PANTALLAS, byId: HH_BY_ID, imgUrl: hhImgUrl,
  flujo: HH_FLUJO, flujoLabel: "Flujo típico en el piso", usos: usosPorPantalla(), conceptos: HH_CONCEPTOS,
};

export function HhManualView({ focus }) {
  return <ManualSistema cfg={CFG} focusScreen={focus?.hhScreen}/>;
}
