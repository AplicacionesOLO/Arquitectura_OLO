// ═══════════════════════════════════════════════════════════════════════════
// VISTA · Softland — Pendientes por mapear (dentro de Módulos ERP): qué falta,
// por qué no se ha hecho, qué implica y qué se necesita. Los pasos afectados
// se calculan de los procesos (softland_pendientes.js).
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { useNav } from "../lib/nav.js";
import { DESIGN } from "../data/constants.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { SFL_PENDIENTES, TIPO_PEND, PRIORIDAD_PEND, PASOS_SFL_SIN_PANTALLA, pasosAfectados } from "../data/softland_pendientes.js";

const ORDEN = { alta: 0, media: 1, baja: 2 };
const th = { textAlign:"left", fontSize:11.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.06em", textTransform:"uppercase", padding:"8px 10px", borderBottom:`1px solid ${DESIGN.border}`, background:DESIGN.sunken, position:"sticky", top:0, zIndex:1 };
const td = { fontSize:13.5, color:DESIGN.inkSoft, padding:"9px 10px", borderBottom:`1px solid ${DESIGN.border}`, verticalAlign:"top", lineHeight:1.5 };
const Chip = ({ c, children }) => <span style={{ fontSize:11.5, fontWeight:700, color:c, background:c + "14", border:`1px solid ${c}44`, borderRadius:5, padding:"1px 7px", whiteSpace:"nowrap" }}>{children}</span>;

export function SoftlandPendientesView() {
  const [abierto, setAbierto] = useState(null);
  const [filtro, setFiltro] = useState("todas");
  const { navigate } = useNav();
  const lista = [...SFL_PENDIENTES].sort((a, b) => ORDEN[a.prioridad] - ORDEN[b.prioridad]).filter(p => filtro === "todas" || p.prioridad === filtro);
  const sinPantalla = Object.values(PASOS_SFL_SIN_PANTALLA).flat();
  const procesos = new Set(sinPantalla.map(x => x.codigo));
  const kpi = (n, l, c) => <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:9, padding:"8px 14px", minWidth:130 }}>
    <div style={{ fontSize:22, fontWeight:800, color:c || DESIGN.ink }}>{n}</div><div style={{ fontSize:12.5, color:DESIGN.muted }}>{l}</div></div>;

  return <div>
    <p style={{ fontSize:14, color:DESIGN.inkSoft, lineHeight:1.6, margin:"0 0 12px", maxWidth:960 }}>
      Lo que todavía no está mapeado del ERP, <b>por qué no se ha hecho</b> y <b>qué implica</b> para el BPA. Incluye el Softland propio de OLO (OVERSEAS), el de los clientes y la interfaz con eFlow. Los pasos afectados son pasos de procesos que usan Softland y aún no muestran su pantalla real.
    </p>
    <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
      {kpi(SFL_PENDIENTES.length, "pendientes")}
      {kpi(SFL_PENDIENTES.filter(p => p.prioridad === "alta").length, "de prioridad alta", PRIORIDAD_PEND.alta.color)}
      {kpi(sinPantalla.length, `pasos sin pantalla · ${procesos.size} procesos`, "#b45309")}
      <div style={{ display:"flex", gap:6, alignItems:"center", marginLeft:"auto" }}>
        {[["todas", "Todas"], ["alta", "Alta"], ["media", "Media"], ["baja", "Baja"]].map(([id, l]) => {
          const on = filtro === id;
          return <button key={id} onClick={() => setFiltro(id)} style={{ fontSize:13, fontWeight:on ? 700 : 500, color:on ? "#fff" : DESIGN.inkSoft, background:on ? DESIGN.ink : "#fff", border:`1px solid ${on ? DESIGN.ink : DESIGN.border}`, borderRadius:7, padding:"5px 11px", cursor:"pointer", fontFamily:DESIGN.font }}>{l}</button>;
        })}
      </div>
    </div>

    <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:980 }}>
        <thead><tr>{["Prioridad", "Qué falta", "Por qué no se ha hecho", "Qué implica", "Qué se necesita"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{lista.map(p => {
          const af = pasosAfectados(p), open = abierto === p.id;
          return <tr key={p.id}>
            <td style={{ ...td, width:92 }}><div style={{ display:"grid", gap:5, justifyItems:"start" }}>
              <Chip c={PRIORIDAD_PEND[p.prioridad].color}>{PRIORIDAD_PEND[p.prioridad].label}</Chip><Chip c={TIPO_PEND[p.tipo].color}>{TIPO_PEND[p.tipo].label}</Chip></div></td>
            <td style={{ ...td, width:"23%" }}><div style={{ fontWeight:700, color:DESIGN.ink }}>{p.que}</div><div style={{ fontSize:12.5, color:DESIGN.muted, marginTop:3 }}>{p.estado}</div></td>
            <td style={{ ...td, width:"21%" }}>{p.porque}</td>
            <td style={{ ...td, width:"26%" }}>{p.implica}
              {af.length > 0 && <div style={{ marginTop:6 }}>
                <button onClick={() => setAbierto(open ? null : p.id)} style={{ fontSize:12.5, fontWeight:700, color:"#b45309", background:"none", border:"none", padding:0, cursor:"pointer", fontFamily:DESIGN.font }}>
                  {open ? "▾" : "▸"} {af.length} pasos sin pantalla · {new Set(af.map(x => x.codigo)).size} procesos</button>
                {open && <ul style={{ margin:"4px 0 0", paddingLeft:16, display:"grid", gap:3 }}>{af.map(x => <li key={`${x.codigo}-${x.paso}`} style={{ fontSize:12.5 }}>
                  <button onClick={() => navigate({ tab:"olo-arch", codigo:x.codigo })} title={PROCESOS[x.codigo]?.nombre} style={{ fontSize:12.5, fontWeight:700, color:"#16a34a", background:"none", border:"none", padding:0, cursor:"pointer", fontFamily:DESIGN.font }}>{x.codigo} · paso {x.paso} ↗</button>
                  <span style={{ color:DESIGN.muted }}> {x.texto.length > 90 ? x.texto.slice(0, 88) + "…" : x.texto}</span></li>)}</ul>}
              </div>}
            </td>
            <td style={td}>{p.necesita}<div style={{ fontSize:12.5, color:DESIGN.muted, marginTop:3 }}>Quién: <b style={{ color:DESIGN.inkSoft }}>{p.quien}</b></div></td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  </div>;
}
