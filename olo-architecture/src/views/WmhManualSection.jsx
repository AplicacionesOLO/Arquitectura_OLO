// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN · Manual Control Tower (WMH) — dentro de Operación › Torre de Control.
// 17 pantallas del manual (ver data/wmh_manual.js) con el componente genérico
// ManualSistema; los pasos "torre" de los procesos se ligan por palabras clave.
// ═══════════════════════════════════════════════════════════════════════════
import { ManualSistema } from "../components/ManualSistema.jsx";
import { WMH_INTRO, WMH_MODULOS, WMH_PANTALLAS, WMH_BY_ID, WMH_FLUJO, pantallaWmhDePaso } from "../data/wmh_manual.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { wmhImgUrl } from "../lib/presentacion.js";

// Pasos de procesos que ocurren en cada pantalla de Torre de Control (datos estáticos)
function usosPorPantalla() {
  const out = {};
  for (const p of Object.values(PROCESOS)) {
    p.pasos.forEach((s, i) => {
      if (s.sistema !== "torre") return;
      const id = pantallaWmhDePaso(s.texto);
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
  titulo: "Manual de Usuario · Control Tower (WMH)", subtitulo: "eflow Cloud Suite v4.18.4.4 · 17 pantallas · septiembre 2026",
  intro: WMH_INTRO, accent: "#1abc9c", sistema: "Torre de Control", idKey: "wmhId",
  modulos: WMH_MODULOS, pantallas: WMH_PANTALLAS, byId: WMH_BY_ID, imgUrl: wmhImgUrl,
  flujo: WMH_FLUJO, flujoLabel: "Flujo operativo típico", usos: usosPorPantalla(),
};

export function WmhManualSection({ focusScreen }) {
  return <ManualSistema cfg={CFG} focusScreen={focusScreen}/>;
}
