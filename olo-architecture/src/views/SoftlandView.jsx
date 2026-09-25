// ═══════════════════════════════════════════════════════════════════════════
// VISTA · SOFTLAND — Módulos ERP
// Tarjetas de los módulos documentados (manuales) + el diccionario real de
// Softland Costa Rica (compañía COFER, esquema erpadmin): menú con pantallas y
// acciones, tablas de cada módulo y entidades de negocio (softland_dd.json,
// generado por softland_dd/extraer.js).
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { SOFTLAND_MODULES } from "../data/softland.js";
import { MODULE_COLORS, DESIGN } from "../data/constants.js";
import { StatusBadge, DetailPanel } from "../components/ui.jsx";
import DD from "../data/softland_dd.json";

const th = { textAlign:"left", fontSize:10.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.06em", textTransform:"uppercase", padding:"8px 10px", borderBottom:`1px solid ${DESIGN.border}`, background:DESIGN.sunken, position:"sticky", top:0 };
const td = { fontSize:12.5, color:DESIGN.ink, padding:"7px 10px", borderBottom:`1px solid ${DESIGN.border}`, verticalAlign:"top" };
const mono = { fontFamily:"'Courier New', monospace", fontSize:12 };
const TIPO_PANT = { pantalla:"Pantalla", consulta:"Consulta", reporte:"Reporte", proceso:"Proceso" };

export function SoftlandView({ selected, setSelected }) {
  const sel = SOFTLAND_MODULES.find(m => m.code === selected) || (DD.modulos[selected] && { code:selected, name:DD.modulos[selected].nombre, status:"confirmed", role:"Instalado en Cofersa según el diccionario de Softland" });
  const documentados = new Set(SOFTLAND_MODULES.map(m => m.code));
  const otros = Object.entries(DD.modulos).filter(([k, m]) => m.instaladoEnCofersa && !documentados.has(k));
  const tarjeta = (mod, dd) => {
    const c = MODULE_COLORS[mod.code] ?? "#64748b", isSel = selected === mod.code;
    return <div key={mod.code} onClick={() => setSelected(isSel ? null : mod.code)} style={{ background:isSel ? c + "10" : "#ffffff", borderTop:`1px solid ${isSel ? c + "88" : c + "33"}`, borderRight:`1px solid ${isSel ? c + "88" : c + "33"}`, borderBottom:`1px solid ${isSel ? c + "88" : c + "33"}`, borderLeft:`4px solid ${c}`, borderRadius:8, padding:"12px 14px", cursor:"pointer", transition:"all 0.15s", boxShadow:isSel ? `0 0 0 2px ${c}33` : "none" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
        <span style={{ fontSize:13, fontWeight:800, color:c, fontFamily:DESIGN.font, letterSpacing:"0.04em" }}>{mod.code}</span>
        {mod.status && <StatusBadge status={mod.status}/>}
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:"#1D1D1B", marginBottom:2 }}>{mod.name}</div>
      <div style={{ fontSize:11, color:"#888", fontStyle:"italic" }}>{mod.role}</div>
      {dd && <div style={{ fontSize:11, color: dd.instaladoEnCofersa ? "#15803d" : DESIGN.muted, marginTop:6, fontWeight:600 }}>
        {dd.instaladoEnCofersa ? "✓ En Cofersa" : "No instalado en Cofersa"} · {dd.pantallas.length} opciones de menú · {dd.tablas.length} tablas</div>}
    </div>;
  };
  return <div>
    <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderLeft:"3px solid #0284c7", borderRadius:8, padding:"9px 14px", marginBottom:14, fontSize:12.5, color:DESIGN.inkSoft, lineHeight:1.55 }}>
      <b style={{ color:"#0369a1" }}>Diccionario real:</b> además de los manuales, cada módulo trae su menú, sus tablas y entidades tal como están en {DD.fuente} (extraído el {DD.generado}). Ojo: es el Softland del <b>cliente Cofersa</b> en QA; el Softland propio de OLO no está disponible para lectura. Los manuales de los que sale el resumen de cada módulo no están cargados en el BPA.
    </div>
    {sel && <DetailPanel item={{ ...sel, color:MODULE_COLORS[sel.code] }} onClose={() => setSelected(null)}/>}
    {sel && DD.modulos[sel.code] && <Diccionario key={sel.code} codigo={sel.code} m={DD.modulos[sel.code]}/>}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
      {SOFTLAND_MODULES.map(mod => tarjeta(mod, DD.modulos[mod.code]))}
    </div>
    {otros.length > 0 && <>
      <div style={{ fontSize:14, fontWeight:700, color:DESIGN.ink, margin:"22px 0 4px" }}>Otros módulos instalados en Cofersa</div>
      <div style={{ fontSize:12.5, color:DESIGN.muted, marginBottom:10 }}>No están en los manuales del BPA, pero el diccionario de Softland los muestra instalados en la compañía.</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
        {otros.map(([k, m]) => tarjeta({ code:k, name:m.nombre, role:`Área ${m.area}` }, m))}
      </div>
    </>}
  </div>;
}

// Diccionario de un módulo: menú, tablas y entidades, en tablas
function Diccionario({ codigo, m }) {
  const [pest, setPest] = useState("menu");
  const [q, setQ] = useState("");
  const f = s => !q || String(s || "").toLowerCase().includes(q.toLowerCase());
  const pant = m.pantallas.filter(p => f(p.nombre) || f(p.descripcion) || f(p.tabla) || p.acciones.some(f));
  const tabs = m.tablas.filter(t => f(t.tabla) || f(t.nombre));
  const ents = m.entidades.filter(e => f(e.nombre) || f(e.descripcion));
  const tabla = { width:"100%", borderCollapse:"collapse" };
  return <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, marginBottom:22, overflow:"hidden" }}>
    <div style={{ display:"flex", gap:4, alignItems:"center", padding:"8px 12px", borderBottom:`1px solid ${DESIGN.border}`, background:DESIGN.sunken, flexWrap:"wrap" }}>
      <span style={{ fontSize:12, fontWeight:700, color:DESIGN.muted, marginRight:8 }}>DICCIONARIO {codigo} · COFERSA</span>
      {[["menu", `Menú y pantallas · ${m.pantallas.length}`], ["tablas", `Tablas · ${m.tablas.length}`], ["entidades", `Entidades · ${m.entidades.length}`]].map(([id, l]) =>
        <button key={id} onClick={() => setPest(id)} style={{ fontSize:12.5, fontWeight: pest === id ? 700 : 500, color: pest === id ? "#fff" : DESIGN.inkSoft, background: pest === id ? DESIGN.ink : "#fff", border:`1px solid ${pest === id ? DESIGN.ink : DESIGN.border}`, borderRadius:7, padding:"4px 10px", cursor:"pointer", fontFamily:DESIGN.font }}>{l}</button>)}
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filtrar…" style={{ marginLeft:"auto", fontSize:12.5, padding:"5px 9px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:7, fontFamily:DESIGN.font, width:200 }}/>
    </div>
    <div style={{ maxHeight:460, overflowY:"auto" }}>
      {pest === "menu" && <table style={tabla}>
        <colgroup><col style={{ width:40 }}/><col style={{ width:200 }}/><col style={{ width:90 }}/><col style={{ width:280 }}/><col style={{ width:190 }}/><col/></colgroup>
        <thead><tr>{["#", "Opción", "Tipo", "Descripción", "Tabla principal", "Acciones dentro"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{pant.map((p, i) => <tr key={p.id + i}>
          <td style={{ ...td, color:DESIGN.mutedSoft, width:34 }}>{i + 1}</td>
          <td style={{ ...td, fontWeight:600 }}>{p.nombre}</td>
          <td style={{ ...td, color:DESIGN.muted, whiteSpace:"nowrap" }}>{TIPO_PANT[p.tipo] || p.tipo}</td>
          <td style={td}>{p.descripcion !== p.nombre ? p.descripcion : ""}</td>
          <td style={{ ...td, ...mono }}>{p.tabla || ""}</td>
          <td style={{ ...td, color:DESIGN.inkSoft }}>{p.acciones.join(" · ")}</td>
        </tr>)}</tbody>
      </table>}
      {pest === "tablas" && <table style={tabla}>
        <thead><tr>{["Tabla", "Nombre en Softland", "Principal", "En Cofersa", "Columnas", "Con datos"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{tabs.map(t => <tr key={t.tabla}>
          <td style={{ ...td, ...mono }}>{t.tabla}</td><td style={td}>{t.nombre || "—"}</td>
          <td style={td}>{t.principal ? "Sí" : ""}</td>
          <td style={{ ...td, color: t.enCofersa ? "#15803d" : DESIGN.muted }}>{t.enCofersa ? "✓" : "no"}</td>
          <td style={td}>{t.columnas ?? "—"}</td>
          <td style={{ ...td, color: t.conDatos ? "#15803d" : DESIGN.muted }}>{t.enCofersa ? (t.conDatos ? "Sí" : "Vacía") : "—"}</td>
        </tr>)}</tbody>
      </table>}
      {pest === "entidades" && (ents.length ? <table style={tabla}>
        <thead><tr>{["Entidad", "Descripción", "Depende de"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{ents.map(e => <tr key={e.id}>
          <td style={{ ...td, fontWeight:600 }}>{e.nombre}</td><td style={td}>{e.descripcion}</td>
          <td style={{ ...td, color:DESIGN.muted }}>{m.entidades.find(x => x.id === e.padre)?.nombre || ""}</td>
        </tr>)}</tbody>
      </table> : <div style={{ padding:16, fontSize:12.5, color:DESIGN.muted }}>El diccionario no define entidades de negocio para este módulo.</div>)}
    </div>
  </div>;
}
