// Diapositivas para el componente Presentacion (components/Presentacion.jsx):
// recorrido de un proceso (sus pasos en orden), de una pantalla del manual
// eFlow WMS (la ventana, sus pestañas y lo que abre) o del flujo operativo de
// Torre de Control (WMH).
import { supabase } from "./supabaseClient.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { WMS_INDEX, PASO_PANTALLA } from "../data/wms_links.js";
import { WMH_BY_ID, pantallaWmhDePaso } from "../data/wmh_manual.js";
import { SORTER_BY_ID } from "../data/sorter_manual.js";

export const wmsImgUrl = (name) => supabase.storage.from("Detalles_Porcesos").getPublicUrl(`wms-manual/${name}`).data.publicUrl;
export const wmhImgUrl = (name) => supabase.storage.from("Detalles_Porcesos").getPublicUrl(`wmh-manual/${name}`).data.publicUrl;
export const sorterImgUrl = (name) => supabase.storage.from("Detalles_Porcesos").getPublicUrl(`sorter-manual/${name}`).data.publicUrl;

const SIS = { eflow:"eFlow WMS", handheld:"Handheld RF", torre:"Torre de Control", sorter:"SORTER CLIRO", softland:"Softland ERP", apolo:"Apolo",
  correo:"Correo", excel_drive:"Excel / Drive", fisico:"Acción física" };

// Diapositivas de un proceso: una por paso (en orden). Si un paso de eFlow
// abre la misma pantalla que el anterior, se muestra igual: el texto del paso
// explica qué se hace en ella en ese momento. Los pasos en Torre de Control
// muestran la pantalla del manual de WMH que corresponde al texto del paso.
export function slidesProceso(codigo) {
  const p = PROCESOS[codigo];
  const links = PASO_PANTALLA[codigo] || {};
  return p.pasos.map((s, i) => {
    const id = links[i]?.[0];
    const w = id && WMS_INDEX[id];
    const wmh = !w && s.sistema === "torre" ? WMH_BY_ID[pantallaWmhDePaso(s.texto)] : null;
    const srt = !w && s.sistema === "sorter" ? SORTER_BY_ID[s.screen] : null;
    if (srt) return {
      img: sorterImgUrl(srt.img), titulo: `Paso ${i + 1} de ${p.pasos.length}`, texto: s.texto,
      donde: `SORTER CLIRO › ${srt.modulo} › ${srt.nombre}`, sistema: SIS.sorter,
      contexto: `${codigo} · ${p.nombre}${p.borrador ? " · borrador" : ""}`, origen: s.origen || null, sorterId: srt.id,
    };
    if (wmh) return {
      img: wmhImgUrl(wmh.img), titulo: `Paso ${i + 1} de ${p.pasos.length}`, texto: s.texto,
      donde: `Torre de Control › ${wmh.modulo === wmh.nombre ? wmh.nombre : `${wmh.modulo} › ${wmh.nombre}`}`, sistema: SIS.torre,
      contexto: `${codigo} · ${p.nombre}${p.borrador ? " · borrador" : ""}`, origen: s.origen || null, wmhId: wmh.id,
    };
    return {
      img: w?.img ? wmsImgUrl(w.img) : null,
      titulo: `Paso ${i + 1} de ${p.pasos.length}`,
      texto: s.texto,
      donde: w ? `${w.module} › ${w.option}` : (s.pantalla || null),
      sistema: SIS[s.sistema] || null,
      contexto: `${codigo} · ${p.nombre}${p.borrador ? " · borrador" : ""}`,
      origen: s.origen || null,
      screenId: id || null,
    };
  });
}

// Diapositivas de una pantalla: la ventana, sus pestañas y lo que abre.
export function slidesPantalla(s) {
  const base = { contexto: `${s.module} › ${s.option}` };
  const out = [];
  if (s.img) out.push({ ...base, img: wmsImgUrl(s.img), titulo: s.title || s.option, texto: "Ventana principal de la opción.", donde: `${s.module} › ${s.option}`, screenId: s.id });
  for (const t of s.subtabs) if (t.img) out.push({ ...base, img: wmsImgUrl(t.img), titulo: `Pestaña «${t.name}»`, texto: `Se abre desde la pestaña «${t.name}» de la misma ventana.`, donde: `${s.option} › ${t.name}` });
  for (const n of s.nav) if (n.img && !s.subtabs.some(t => t.img === n.img)) out.push({ ...base, img: wmsImgUrl(n.img), titulo: n.toTitle, texto: `Se abre con: ${n.action}.`, donde: n.toTitle });
  return out;
}
