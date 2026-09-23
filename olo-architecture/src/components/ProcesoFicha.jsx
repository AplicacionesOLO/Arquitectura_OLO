// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE · Ficha de proceso CEDI (P1–P14) — panel lateral fijo del módulo
// Procesos. Conecta el procedimiento con: sistemas y pantallas, tablas reales
// de BD (eFlow / Torre de Control), procesos anteriores/siguientes del flujo,
// silos de referencia P1.x, diagrama de flujo y documentos fuente.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { DESIGN, DESIGN_STATUS } from "../data/constants.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { DrawioFlowchart } from "../schemas/DrawioFlowchart.jsx";
import { WMS_INDEX, PASO_PANTALLA, PANTALLA_PROCESOS } from "../data/wms_links.js";
import { Presentacion } from "./Presentacion.jsx";
import { slidesProceso } from "../lib/presentacion.js";
import { WMH_BY_ID, pantallaWmhDePaso } from "../data/wmh_manual.js";
import { SORTER_BY_ID } from "../data/sorter_manual.js";

const BUCKET = "Detalles_Porcesos";
const DRAWIO = import.meta.glob("../assets/procesos_cedi/*.drawio", { query: "?raw", import: "default" });

const SISTEMAS = {
  eflow:       { label: "eFlow WMS",        color: "#0891b2" },
  handheld:    { label: "Handheld RF",      color: "#0d9488" },
  torre:       { label: "Torre de Control", color: "#16a34a" },
  softland:    { label: "Softland ERP",     color: "#c0392b" },
  apolo:       { label: "Apolo",            color: "#7c3aed" },
  sorter:      { label: "SORTER CLIRO",     color: "#ea580c" },
  correo:      { label: "Correo",           color: "#b45309" },
  excel_drive: { label: "Excel / Drive",    color: "#2563eb" },
  fisico:      { label: "Físico",           color: "#64748b" },
};
const SCHEMA_META = {
  efw:      { label: "eFlow WMS · EFLOW_OLO", cat: "efw" },
  wmh_cr:   { label: "Torre de Control · WMH", cat: "wmh_cr" },
  softland: { label: "Softland ERP", cat: null },
};
const CIA_COLOR = { COFERSA: "#1d4ed8", EPA: "#b45309", CEDI: "#475569", Borrador: "#b45309" };
// Origen de cada paso de un borrador: hecho verificable en el WMS vs. supuesto a revisar
const ORIGEN = { eflow_wms: { label: "eFlow WMS", color: "#0891b2", title: "La pantalla, campo o botón citado existe en eFlow WMS" },
  mecalux_sorter: { label: "SORTER Mecalux", color: "#ea580c", title: "Del manual del SORTER CLIRO (Mecalux): mapeo funcional real" },
  control_tower: { label: "Torre de Control", color: "#16a34a", title: "Documentado en el levantamiento de Torre de Control (Operación › Torre de Control · WMH)" },
  inferido: { label: "Inferido", color: "#b45309", title: "Paso o regla sin documento de OLO: revisar y validar" } };

export function SistemaChip({ sys }) {
  const s = SISTEMAS[sys];
  if (!s) return null;
  return <span style={{ fontSize:10, fontWeight:700, color:s.color, background:s.color+"14", border:`1px solid ${s.color}40`, padding:"1px 7px", borderRadius:DESIGN.radiusPill, whiteSpace:"nowrap" }}>{s.label}</span>;
}

function sistemasDe(p) {
  const set = new Set(p.pasos.map(s => s.sistema).filter(Boolean));
  return Object.keys(SISTEMAS).filter(k => set.has(k));
}

const TABS = [["resumen","Resumen"],["pasos","Pasos"],["datos","Datos y BD"],["flujo","Diagrama"],["docs","Documentos"]];

export function ProcesoFicha({ codigo, onClose, onOpen, onSearch, onNavigate, onViewFile }) {
  const p = PROCESOS[codigo];
  const [tab, setTab] = useState("resumen");
  if (!p) return null;
  const color = CIA_COLOR[p.compania] || DESIGN.ink;

  return <aside style={{ width:440, flexShrink:0, position:"sticky", top:20, maxHeight:"calc(100vh - 40px)", display:"flex", flexDirection:"column", background:"#fff", border:`1px solid ${DESIGN.border}`, borderLeft:`4px solid ${color}`, borderRadius:10, overflow:"hidden", boxSizing:"border-box" }}>
    <div style={{ padding:"12px 16px 0", flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", marginBottom:3 }}>
            <span style={{ fontSize:10.5, fontWeight:800, color:"#fff", background:color, borderRadius:4, padding:"1px 6px" }}>{p.codigo}</span>
            <span style={{ fontSize:10.5, fontWeight:700, color }}>{p.compania}</span>
            <span style={{ fontSize:10.5, color:DESIGN.muted }}>· {p.siloLabel} › {p.macro}</span>
          </div>
          <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink }}>{p.nombre}</div>
        </div>
        <button onClick={onClose} title="Cerrar" style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:16, flexShrink:0 }}>✕</button>
      </div>
      {p.borrador && <div style={{ marginTop:8, fontSize:11, lineHeight:1.45, color:DESIGN_STATUS.warning.color, background:DESIGN_STATUS.warning.bg, border:`1px solid ${DESIGN_STATUS.warning.border}`, borderRadius:6, padding:"6px 9px" }}>
        <b>Borrador sin procedimiento de OLO.</b> {p.fuente}
        {" "}{(() => { const n = p.pasos.filter(s => s.origen === "inferido").length; return `${n} de ${p.pasos.length} pasos inferidos.`; })()}
      </div>}
      <div style={{ display:"flex", gap:2, marginTop:10, borderBottom:`1px solid ${DESIGN.border}` }}>
        {TABS.map(([id,label]) => {
          const isA = tab === id;
          return <button key={id} onClick={()=>setTab(id)} style={{ fontSize:11.5, fontWeight:isA?700:500, color:isA?DESIGN.ink:DESIGN.muted, background:"none", border:"none", borderBottom:`2px solid ${isA?color:"transparent"}`, padding:"6px 8px", cursor:"pointer", fontFamily:DESIGN.font, marginBottom:-1 }}>{label}</button>;
        })}
      </div>
    </div>
    <div style={{ padding:"12px 16px 16px", overflowY:"auto", flex:1 }}>
      {tab==="resumen" && <Resumen p={p} onOpen={onOpen} onSearch={onSearch} onNavigate={onNavigate}/>}
      {tab==="pasos"   && <Pasos p={p} onNavigate={onNavigate}/>}
      {tab==="datos"   && <Datos p={p} onNavigate={onNavigate}/>}
      {tab==="flujo"   && <Flujo p={p}/>}
      {tab==="docs"    && <Documentos p={p} onViewFile={onViewFile} onNavigate={onNavigate}/>}
    </div>
  </aside>;
}

// ── Piezas ─────────────────────────────────────────────────────────────────
function L({ children, n }) {
  return <div style={{ fontSize:10, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.07em", textTransform:"uppercase", margin:"14px 0 6px" }}>
    {children}{n != null && <span style={{ color:DESIGN.mutedSoft, fontWeight:400 }}> · {n}</span>}
  </div>;
}
function Txt({ children }) {
  return <p style={{ fontSize:12.5, color:DESIGN.inkSoft, lineHeight:1.6, margin:0 }}>{children}</p>;
}
function Chip({ children, onClick, title, color }) {
  const c = color || DESIGN.inkSoft;
  return <button onClick={onClick} disabled={!onClick} title={title} style={{ fontSize:11, color:c, background:onClick?"#fff":DESIGN.sunken2, border:`1px solid ${onClick?c+"55":DESIGN.border}`, borderRadius:6, padding:"3px 8px", cursor:onClick?"pointer":"default", fontFamily:DESIGN.font, textAlign:"left" }}>{children}</button>;
}
function Bullets({ items, color }) {
  return <ul style={{ margin:0, paddingLeft:16, display:"grid", gap:4 }}>
    {items.map((t,i) => <li key={i} style={{ fontSize:12, color:color||DESIGN.inkSoft, lineHeight:1.5 }}>{t}</li>)}
  </ul>;
}
function ProcChip({ code, onOpen }) {
  const q = PROCESOS[code];
  if (!q) return null;
  return <Chip onClick={()=>onOpen(code)} title="Abrir ficha" color={CIA_COLOR[q.compania]}><b>{code}</b> {q.nombre}</Chip>;
}

// ── Pestañas ───────────────────────────────────────────────────────────────
function Resumen({ p, onOpen, onSearch, onNavigate }) {
  return <>
    <L>Objetivo</L><Txt>{p.objetivo}</Txt>
    <L>Alcance</L><Txt>{p.alcance}</Txt>
    <L>Responsables</L>
    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{p.responsables.map(r => <Chip key={r}>{r}</Chip>)}</div>
    <L>Sistemas que intervienen</L>
    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{sistemasDe(p).map(s => <SistemaChip key={s} sys={s}/>)}</div>

    {(p.entradaDe.length > 0 || p.salidaA.length > 0) && <>
      <L>Flujo de valor</L>
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:8, alignItems:"start" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <span style={{ fontSize:10, color:DESIGN.mutedSoft }}>Recibe de</span>
          {p.entradaDe.length ? p.entradaDe.map(c => <ProcChip key={c} code={c} onOpen={onOpen}/>) : <span style={{ fontSize:11, color:DESIGN.mutedSoft }}>— inicio</span>}
        </div>
        <span style={{ color:DESIGN.mutedSoft, paddingTop:16 }}>→</span>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <span style={{ fontSize:10, color:DESIGN.mutedSoft }}>Entrega a</span>
          {p.salidaA.length ? p.salidaA.map(c => <ProcChip key={c} code={c} onOpen={onOpen}/>) : <span style={{ fontSize:11, color:DESIGN.mutedSoft }}>— fin</span>}
        </div>
      </div>
    </>}

    {p.relacionados.length > 0 && <>
      <L>Relacionado en el modelo de referencia</L>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {p.relacionados.map(r => <Chip key={r.nombre} onClick={()=>onSearch(r.nombre)} title="Buscar en el árbol de Procesos">{r.nombre} ↗</Chip>)}
      </div>
    </>}

    {p.codigo === "P1" && <>
      <L>Aplicación</L>
      <Chip onClick={()=>onNavigate({ tab:"ops", view:"wmh" })}>Operación › Torre de Control · WMH ↗</Chip>
    </>}

    <L n={p.registros.length}>Registros generados</L><Bullets items={p.registros}/>
    <L n={p.noConformidades.length}>No conformidades / fallos</L>
    {p.noConformidades.length
      ? <Bullets items={p.noConformidades} color={DESIGN_STATUS.critical.color}/>
      : <Txt>No se reportan no conformidades específicas.</Txt>}
    {p.notas.length > 0 && <><L>Notas del manual y del diagrama</L><Bullets items={p.notas}/></>}
  </>;
}

// Pantalla del manual eFlow WMS ligada a un paso (hilo Paso → Pantalla)
function PantallaLink({ id, onNavigate }) {
  const w = WMS_INDEX[id];
  return <button onClick={()=>onNavigate({ tab:"ops", view:"wms", screen:id })} title="Ver la pantalla en el manual de eFlow WMS"
    style={{ fontSize:10.5, fontWeight:700, color:"#0891b2", background:"#0891b214", border:"1px solid #0891b240", borderRadius:5, padding:"1px 6px", cursor:"pointer", fontFamily:DESIGN.font }}>
    {w.module} › {w.option} ↗
  </button>;
}

// Pantalla del manual de Torre de Control ligada a un paso en "torre"
function WmhLink({ id, onNavigate }) {
  const w = WMH_BY_ID[id];
  return <button onClick={()=>onNavigate({ tab:"ops", view:"wmh", wmhScreen:id })} title="Ver la pantalla en el manual de Torre de Control"
    style={{ fontSize:10.5, fontWeight:700, color:"#16a34a", background:"#16a34a14", border:"1px solid #16a34a40", borderRadius:5, padding:"1px 6px", cursor:"pointer", fontFamily:DESIGN.font }}>
    Torre › {w.nombre} ↗
  </button>;
}

// Pantalla del manual del SORTER CLIRO ligada a un paso en "sorter"
function SorterLink({ id, onNavigate }) {
  const w = SORTER_BY_ID[id];
  return <button onClick={()=>onNavigate({ tab:"ops", view:"sorter", sorterScreen:id })} title="Ver la pantalla en el manual del SORTER CLIRO"
    style={{ fontSize:10.5, fontWeight:700, color:"#ea580c", background:"#ea580c14", border:"1px solid #ea580c40", borderRadius:5, padding:"1px 6px", cursor:"pointer", fontFamily:DESIGN.font }}>
    SORTER › {w.modulo} › {w.nombre} ↗
  </button>;
}

function Pasos({ p, onNavigate }) {
  const links = PASO_PANTALLA[p.codigo] || {};
  const [show, setShow] = useState(null);
  const wmhDe = (s) => s.sistema === "torre" ? pantallaWmhDePaso(s.texto) : null;
  const srtDe = (s) => s.sistema === "sorter" && SORTER_BY_ID[s.screen] ? s.screen : null;
  const conPantalla = p.pasos.filter((s, i) => links[i] || wmhDe(s) || srtDe(s)).length;
  return <>
  {conPantalla > 0 && <button onClick={()=>setShow(0)} title="Presentar el proceso pantalla por pantalla"
    style={{ width:"100%", marginBottom:12, fontSize:12, fontWeight:700, color:"#fff", background:"#0891b2", border:"none", borderRadius:7, padding:"8px 12px", cursor:"pointer", fontFamily:DESIGN.font }}>
    ▶ Recorrido en pantallas · {p.pasos.length} pasos, {conPantalla} con captura
  </button>}
  {show != null && <Presentacion slides={slidesProceso(p.codigo)} start={show} onClose={()=>setShow(null)}
    onOpenScreen={(id) => { setShow(null); onNavigate({ tab:"ops", view:"wms", screen:id }); }}
    onOpenWmh={(id) => { setShow(null); onNavigate({ tab:"ops", view:"wmh", wmhScreen:id }); }}
    onOpenSorter={(id) => { setShow(null); onNavigate({ tab:"ops", view:"sorter", sorterScreen:id }); }}/>}
  <ol style={{ margin:0, padding:0, listStyle:"none", display:"grid", gap:10 }}>
    {p.pasos.map((s,i) => <li key={i} style={{ display:"flex", gap:10 }}>
      <span style={{ width:20, height:20, borderRadius:"50%", background:DESIGN.sunken2, color:DESIGN.inkSoft, fontSize:10.5, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:12.5, color:DESIGN.ink, lineHeight:1.5 }}>{s.texto}</div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", marginTop:3 }}>
          {s.origen && <span title={ORIGEN[s.origen].title} style={{ fontSize:9.5, fontWeight:700, color:ORIGEN[s.origen].color, border:`1px ${s.origen==="inferido"?"dashed":"solid"} ${ORIGEN[s.origen].color}80`, borderRadius:4, padding:"0 5px" }}>{ORIGEN[s.origen].label}</span>}
          {s.sistema && <SistemaChip sys={s.sistema}/>}
          {links[i]
            ? links[i].map(id => <PantallaLink key={id} id={id} onNavigate={onNavigate}/>)
            : srtDe(s) ? <SorterLink id={srtDe(s)} onNavigate={onNavigate}/>
            : wmhDe(s) ? <WmhLink id={wmhDe(s)} onNavigate={onNavigate}/>
            : s.pantalla && <span style={{ fontSize:10.5, color:DESIGN.muted }}>{s.pantalla}</span>}
        </div>
      </div>
    </li>)}
    {p.decisiones.length > 0 && <li><L>Decisiones del diagrama</L><Bullets items={p.decisiones}/></li>}
  </ol>
  </>;
}

function Datos({ p, onNavigate }) {
  const bySchema = {};
  p.tablas.forEach(t => (bySchema[t.schema] ||= []).push(t));
  return <>
    {p.datosClave.length > 0 && <>
      <L n={p.datosClave.length}>Datos clave del proceso</L>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{p.datosClave.map(d => <Chip key={d}>{d}</Chip>)}</div>
    </>}
    {(() => {
      const ids = Object.keys(PANTALLA_PROCESOS).filter(id => PANTALLA_PROCESOS[id].some(x => x.codigo === p.codigo));
      return ids.length > 0 && <>
        <L n={ids.length}>Pantallas del manual eFlow WMS</L>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{ids.map(id => <PantallaLink key={id} id={id} onNavigate={onNavigate}/>)}</div>
      </>;
    })()}
    {p.pantallas.length > 0 && <>
      <L n={p.pantallas.length}>Pantallas</L>
      <div style={{ display:"grid", gap:6 }}>
        {p.pantallas.map((s,i) => <div key={i} style={{ fontSize:12, lineHeight:1.45 }}>
          <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}><SistemaChip sys={s.sistema}/><b style={{ color:DESIGN.ink }}>{s.ruta}</b></div>
          <div style={{ color:DESIGN.muted, marginTop:2 }}>{s.uso}</div>
        </div>)}
      </div>
    </>}
    {Object.entries(bySchema).map(([schema, rows]) => <div key={schema}>
      <L n={rows.length}>Tablas · {SCHEMA_META[schema]?.label || schema}</L>
      <div style={{ display:"grid", gap:5 }}>
        {rows.map(t => {
          const cat = SCHEMA_META[schema]?.cat;
          return <div key={t.tabla} style={{ display:"flex", gap:8, alignItems:"baseline" }}>
            {cat
              ? <button onClick={()=>onNavigate({ tab:"integrations", cat, table:t.tabla })} title="Ver la tabla en Integraciones" style={{ fontSize:11.5, fontWeight:700, color:"#0891b2", background:"none", border:"none", padding:0, cursor:"pointer", fontFamily:"'Courier New', monospace", flexShrink:0 }}>{t.tabla}</button>
              : <span style={{ fontSize:11.5, fontWeight:700, color:DESIGN.ink, fontFamily:"'Courier New', monospace", flexShrink:0 }}>{t.tabla}</span>}
            <span style={{ fontSize:11, color:DESIGN.muted, flex:1 }}>{t.motivo}</span>
            {t.confianza === "media" && <span title="Inferido por semántica, no por columna o pantalla" style={{ fontSize:9.5, color:DESIGN.mutedSoft, flexShrink:0 }}>inferida</span>}
          </div>;
        })}
      </div>
    </div>)}
    {p.tablas.length === 0 && <Txt>Sin tablas mapeadas todavía.</Txt>}
    {p.conceptos.length > 0 && <>
      <L n={p.conceptos.length}>Glosario</L>
      <div style={{ display:"grid", gap:5 }}>
        {p.conceptos.map(c => <div key={c.termino} style={{ fontSize:12, lineHeight:1.45 }}><b style={{ color:DESIGN.ink }}>{c.termino}:</b> <span style={{ color:DESIGN.inkSoft }}>{c.definicion}</span></div>)}
      </div>
    </>}
  </>;
}

function Flujo({ p }) {
  const [xml, setXml] = useState(null);
  useEffect(() => {
    let alive = true;
    const loader = DRAWIO[`../assets/procesos_cedi/${p.codigo}.drawio`];
    if (loader) loader().then(x => { if (alive) setXml(x); });
    return () => { alive = false; };
  }, [p.codigo]);
  if (!DRAWIO[`../assets/procesos_cedi/${p.codigo}.drawio`]) return <Txt>Este proceso todavía no tiene diagrama de flujo. {p.pasos.length > 0 && "Usa «▶ Recorrido en pantallas» en la pestaña Pasos para verlo paso a paso."}</Txt>;
  if (!xml) return <Txt>Cargando diagrama…</Txt>;
  return <div style={{ height:520, border:`1px solid ${DESIGN.border}`, borderRadius:8, overflow:"hidden" }}>
    <DrawioFlowchart key={p.codigo} xml={xml} title={`Diagrama de flujo — ${p.nombre}`}/>
  </div>;
}

function Documentos({ p, onViewFile, onNavigate }) {
  const [available, setAvailable] = useState(null);
  useEffect(() => {
    let alive = true;
    // Cada documento vive en su carpeta (procedimientos/, manuales/): se lista
    // cada una buscando el nombre exacto para saber si ya fue subido.
    Promise.all(p.documentos.map(d => {
      const i = d.path.lastIndexOf("/");
      return supabase.storage.from(BUCKET).list(d.path.slice(0, i), { search: d.path.slice(i + 1) })
        .then(({ data }) => (data || []).some(f => f.name === d.path.slice(i + 1)) ? d.path : null);
    })).then(paths => { if (alive) setAvailable(new Set(paths.filter(Boolean))); });
    return () => { alive = false; };
  }, [p]);
  const urlOf = (path) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  return <>
    <div style={{ display:"grid", gap:8 }}>
      {p.documentos.map(d => {
        const ok = available?.has(d.path);
        return <button key={d.path} disabled={!ok} onClick={()=>onViewFile({ file_name:d.archivo }, urlOf(d.path))}
          style={{ display:"flex", alignItems:"center", gap:10, textAlign:"left", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:8, padding:"10px 12px", cursor:ok?"pointer":"default", fontFamily:DESIGN.font, opacity:ok?1:0.6 }}>
          <span style={{ fontSize:9.5, fontWeight:700, color:"#fff", background:"#2b579a", borderRadius:4, padding:"3px 6px" }}>DOCX</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12.5, fontWeight:700, color:DESIGN.ink }}>{d.titulo}</div>
            <div style={{ fontSize:11, color:DESIGN.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.archivo}</div>
          </div>
          <span style={{ fontSize:11, color:ok?DESIGN.inkSoft:DESIGN.mutedSoft }}>{available==null ? "…" : ok ? "Ver ↗" : "pendiente de subir"}</span>
        </button>;
      })}
    </div>
    {p.codigo === "P1" && <>
      <L>Levantamiento de Torre de Control</L>
      <Chip onClick={()=>onNavigate({ tab:"ops", view:"wmh" })}>Mapeo funcional, datos reales y modelo de datos ↗</Chip>
    </>}
  </>;
}
