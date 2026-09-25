// Diapositivas para el componente Presentacion (components/Presentacion.jsx):
// recorrido de un proceso (sus pasos en orden), de una pantalla del manual
// eFlow WMS (la ventana, sus pestañas y lo que abre) o del flujo operativo de
// Torre de Control (WMH).
import { supabase } from "./supabaseClient.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { WMS_INDEX, PASO_PANTALLA } from "../data/wms_links.js";
import { WMH_BY_ID, pantallaWmhDePaso } from "../data/wmh_manual.js";
import { SORTER_BY_ID } from "../data/sorter_manual.js";
import { HH_BY_ID, pantallaHhDePaso } from "../data/hh_manual.js";
import { SFL_MANUAL_INDEX, SFL_PASO_PANTALLA } from "../data/softland_manual_links.js";
import { privImg } from "./imgPrivada.js";

export const wmsImgUrl = (name) => supabase.storage.from("Detalles_Porcesos").getPublicUrl(`wms-manual/${name}`).data.publicUrl;
export const wmhImgUrl = (name) => supabase.storage.from("Detalles_Porcesos").getPublicUrl(`wmh-manual/${name}`).data.publicUrl;
export const sorterImgUrl = (name) => supabase.storage.from("Detalles_Porcesos").getPublicUrl(`sorter-manual/${name}`).data.publicUrl;
// Manual Softland de OLO: bucket PRIVADO (datos reales) → se firma al mostrarse
export const sflImg = (name) => privImg("softland-manual", name);
export const hhImgUrl = (name) => supabase.storage.from("Detalles_Porcesos").getPublicUrl(`hh-manual/${name}`).data.publicUrl;

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
    const hh = !w && s.sistema === "handheld" ? HH_BY_ID[pantallaHhDePaso(s, codigo)] : null;
    const sflId = !w && s.sistema === "softland" ? SFL_PASO_PANTALLA[codigo]?.[i] : null, sfl = sflId && SFL_MANUAL_INDEX[sflId];
    if (srt) return {
      img: sorterImgUrl(srt.img), titulo: `Paso ${i + 1} de ${p.pasos.length}`, texto: s.texto,
      donde: `SORTER CLIRO › ${srt.modulo} › ${srt.nombre}`, sistema: SIS.sorter,
      contexto: `${codigo} · ${p.nombre}${p.borrador ? " · borrador" : ""}`, origen: s.origen || null, sorterId: srt.id,
    };
    if (sfl) return {
      img: sflImg(sfl.img), titulo: `Paso ${i + 1} de ${p.pasos.length}`, texto: s.texto,
      donde: `Softland (OVERSEAS) › ${sfl.ruta}`, sistema: SIS.softland,
      contexto: `${codigo} · ${p.nombre}${p.borrador ? " · borrador" : ""}`, origen: s.origen || null, sflId,
    };
    if (hh) return {
      img: hhImgUrl(hh.img), titulo: `Paso ${i + 1} de ${p.pasos.length}`, texto: s.texto,
      donde: `Handheld › ${hh.url}${s.pantalla && s.pantalla !== hh.url ? ` · ${s.pantalla}` : ""}`, sistema: SIS.handheld,
      contexto: `${codigo} · ${p.nombre}${p.borrador ? " · borrador" : ""}`, origen: s.origen || null, hhId: hh.id,
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
  // Lo que se ve en la ventana, con los datos reales del crawl
  const cols = s.tables.flatMap(t => t.columns.filter(c => !c.hidden).map(c => c.name));
  const detalle = [
    s.tabs.length && { k: "Pestañas", v: s.tabs.join(" · ") },
    s.fields.length && { k: "Campos", v: s.fields.map(f => f.label).filter(Boolean).slice(0, 14).join(" · ") },
    s.buttons.length && { k: "Acciones", v: s.buttons.map(b => b.name).join(" · ") },
    cols.length && { k: "Columnas", v: cols.slice(0, 16).join(" · ") + (cols.length > 16 ? ` · +${cols.length - 16}` : "") },
  ].filter(Boolean);
  const resumen = [s.buttons.length && `${s.buttons.length} acciones`, cols.length && `${cols.length} columnas`, s.tabs.length > 1 && `${s.tabs.length} pestañas`].filter(Boolean).join(" · ");
  if (s.img) out.push({ ...base, img: wmsImgUrl(s.img), titulo: s.title || s.option, texto: `Ventana «${s.title || s.option}» de ${s.module} › ${s.option}${resumen ? ` — ${resumen}` : ""}.`, donde: `${s.module} › ${s.option}`, screenId: s.id, detalle });
  for (const t of s.subtabs) if (t.img) out.push({ ...base, img: wmsImgUrl(t.img), titulo: `Pestaña «${t.name}»`, texto: `Se abre desde la pestaña «${t.name}» de la misma ventana.`, donde: `${s.option} › ${t.name}` });
  for (const n of s.nav) if (n.img && !s.subtabs.some(t => t.img === n.img)) out.push({ ...base, img: wmsImgUrl(n.img), titulo: n.toTitle, texto: `Se abre con: ${n.action}.`, donde: n.toTitle });
  return out;
}
