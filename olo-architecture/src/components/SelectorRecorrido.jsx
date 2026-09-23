// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE · Selector de recorrido guiado por proceso — reemplaza la lista de
// botones (que con 40+ procesos empujaba el contenido fuera de la vista) por un
// selector agrupado + botón Presentar. Con pocos procesos muestra botones.
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { DESIGN } from "../data/constants.js";
import { PROCESOS } from "../data/procesos_fichas.js";

const grupo = (p) => p.silo === "cross_docking" ? "Cross Docking · SORTER" : p.borrador ? "Borradores de silos de referencia" : "Procedimientos CEDI";

export function SelectorRecorrido({ codigos, onPlay, accent = "#0891b2", extra = null }) {
  const [sel, setSel] = useState(codigos[0] || "");
  const btnPlay = { fontSize:13, fontWeight:700, color:"#fff", background:accent, border:"none", borderRadius:7, padding:"7px 14px", cursor:"pointer", fontFamily:DESIGN.font, whiteSpace:"nowrap" };
  const pocos = codigos.length <= 5;
  const grupos = {};
  codigos.forEach(c => (grupos[grupo(PROCESOS[c])] ||= []).push(c));

  return <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
    <span style={{ fontSize:13, fontWeight:700, color:DESIGN.ink }}>▶ Recorridos guiados</span>
    {extra}
    {codigos.length > 0 && (pocos
      ? codigos.map(c => <button key={c} onClick={()=>onPlay(c)} title={`Presentar ${PROCESOS[c].nombre}`}
          style={{ fontSize:13, color:DESIGN.inkSoft, background:DESIGN.sunken, border:`1px solid ${DESIGN.border}`, borderRadius:7, padding:"6px 10px", cursor:"pointer", fontFamily:DESIGN.font }}>
          <b>{c}</b> {PROCESOS[c].nombre}
        </button>)
      : <>
          <label style={{ fontSize:13, color:DESIGN.muted }} htmlFor="sel-recorrido">por proceso</label>
          <select id="sel-recorrido" value={sel} onChange={e=>setSel(e.target.value)}
            style={{ fontSize:13, padding:"7px 10px", borderRadius:7, border:`1px solid ${DESIGN.borderStrong}`, fontFamily:DESIGN.font, color:DESIGN.ink, background:"#fff", minWidth:260, maxWidth:"100%" }}>
            {Object.entries(grupos).map(([g, cs]) => <optgroup key={g} label={`${g} · ${cs.length}`}>
              {cs.map(c => <option key={c} value={c}>{c} · {PROCESOS[c].nombre}</option>)}
            </optgroup>)}
          </select>
          <button onClick={()=>sel && onPlay(sel)} style={btnPlay}>▶ Presentar</button>
          <span style={{ fontSize:12, color:DESIGN.mutedSoft }}>{codigos.length} procesos con pantallas en este sistema</span>
        </>)}
  </div>;
}
