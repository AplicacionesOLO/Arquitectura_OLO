// ═══════════════════════════════════════════════════════════════════════════
// VISTA · CONTEXTO — todo lo que se sabe de OLO fuera del árbol de procesos:
// estado del conocimiento, localizaciones, aplicaciones, clientes y sus reglas,
// bases de datos, fuentes, puntos de extensión, glosario y brechas.
// Los conteos se calculan de los datos vivos del BPA (no quedan fijos).
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { EXTENSION_POINTS, GAPS } from "../data/softland.js";
import { DESIGN, DESIGN_STATUS } from "../data/constants.js";
import { StatusBadge } from "../components/ui.jsx";
import { useNav } from "../lib/nav.js";
import { LOCALIZACIONES, APLICACIONES, CLIENTES, REGLAS_OPERATIVAS, REGLAS_WMH, EXTENSION_EFLOW, FUENTES } from "../data/contexto.js";
import { PROCESOS, SILO_LABELS } from "../data/procesos_fichas.js";
import { WMS_INDEX } from "../data/wms_links.js";
import { WMH_PANTALLAS } from "../data/wmh_manual.js";
import { SORTER_PANTALLAS, SORTER_CONCEPTOS } from "../data/sorter_manual.js";
import { COFERSA_PENDIENTES } from "../data/control_tower.js";
import { CUESTIONARIO, textoParaEnviar } from "../data/cuestionario.js";
import { CAT_META, INTEGRATIONS, SRO_MOD, SCO_MOD, EFW_MOD, WMH_CR_MOD, EFWBEVAL_MOD, EFWFEBECA_MOD, EFWSILLACA_MOD, EFWWMH_MOD,
         EINTEGRA_VE_MOD, SFLBEVAL_MOD, SFLFEBECA_MOD, SFLSILLACA_MOD, SFLTREXA_MOD, SFLPRISMA_MOD } from "../data/integrations.js";
import { EFW_CONFIG_MOD } from "../data/efw_config.js";
import { BACKBONE_SUMMARY, BACKBONE_SOURCES, BACKBONE_NO_ACCESS, BACKBONE_GENERATED_AT } from "../data/sql_backbone.js";

const ACCENT = "#7B1FA2";

// Esquemas de BD mapeados: categoría de Integraciones → tablas
const ESQUEMAS = [
  ["efw", EFW_MOD, "Costa Rica"], ["efw_config", EFW_CONFIG_MOD, "Costa Rica"], ["wmh_cr", WMH_CR_MOD, "Costa Rica"],
  ["sro", SRO_MOD, "Costa Rica"], ["sco", SCO_MOD, "Costa Rica"],
  ["efwbeval", EFWBEVAL_MOD, "Venezuela"], ["efwfebeca", EFWFEBECA_MOD, "Venezuela"], ["efwsillaca", EFWSILLACA_MOD, "Venezuela"], ["efwwmh", EFWWMH_MOD, "Venezuela"],
  ["eintegra_ve", EINTEGRA_VE_MOD, "Venezuela"], ["softland_beval", SFLBEVAL_MOD, "Venezuela"], ["softland_febeca", SFLFEBECA_MOD, "Venezuela"],
  ["softland_sillaca", SFLSILLACA_MOD, "Venezuela"], ["softland_trexa", SFLTREXA_MOD, "Venezuela"], ["softland_prisma", SFLPRISMA_MOD, "Venezuela"],
].map(([cat, mod, pais]) => ({ cat, pais, label: CAT_META[cat]?.label || cat, tablas: mod?.size || 0 }));

// Estado del conocimiento, calculado de los datos
const PROC = Object.values(PROCESOS);
const PASOS_POR_ORIGEN = PROC.reduce((o, p) => { p.pasos.forEach(s => { const k = s.origen || "procedimiento"; o[k] = (o[k] || 0) + 1; }); return o; }, {});
const GLOSARIO = (() => {
  const m = new Map();
  for (const p of PROC) for (const c of p.conceptos || []) if (!m.has(c.termino.toLowerCase())) m.set(c.termino.toLowerCase(), { ...c, codigo: p.codigo });
  for (const c of SORTER_CONCEPTOS) if (!m.has(c.termino.toLowerCase())) m.set(c.termino.toLowerCase(), { ...c, codigo: "XDK-01" });
  return [...m.values()].sort((a, b) => a.termino.localeCompare(b.termino, "es"));
})();
const ORIGEN_LABEL = { procedimiento: ["Procedimiento de OLO", "#0f766e"], eflow_wms: ["Pantalla de eflow WMS", "#0891b2"], mecalux_sorter: ["Manual del SORTER", "#ea580c"], control_tower: ["Levantamiento de Torre", "#16a34a"], inferido: ["Inferido", "#b45309"] };

const SECCIONES = [
  ["resumen", "Estado del conocimiento", "qué está mapeado"],
  ["localizaciones", "Localizaciones", "Costa Rica · Venezuela"],
  ["aplicaciones", "Aplicaciones y versiones", `${APLICACIONES.length} sistemas`],
  ["clientes", "Clientes y operación", "COFERSA · EPA"],
  ["reglas", "Reglas de negocio", `${REGLAS_OPERATIVAS.length} operativas · ${REGLAS_WMH.length} WMH`],
  ["datos", "Bases de datos", `${ESQUEMAS.length} esquemas · backbone SQL`],
  ["fuentes", "Fuentes del levantamiento", `${FUENTES.length} fuentes`],
  ["extension", "Puntos de extensión", `${EXTENSION_POINTS.length + EXTENSION_EFLOW.length} mecanismos`],
  ["glosario", "Glosario", `${GLOSARIO.length} términos`],
  ["brechas", "Brechas declaradas", `${GAPS.length + COFERSA_PENDIENTES.length} pendientes`],
  ["cuestionario", "Cuestionario", `${CUESTIONARIO.reduce((a, b) => a + b.preguntas.length, 0)} preguntas · ${CUESTIONARIO.length} destinatarios`],
];

export function ContextView() {
  const [sec, setSec] = useState("resumen");
  const { navigate } = useNav();
  const ir = (v) => v && navigate(v);

  return <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
    <nav style={{ width:230, minWidth:230, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, overflow:"hidden", flexShrink:0, position:"sticky", top:20 }}>
      <div style={{ padding:"10px 14px", borderBottom:`1px solid ${DESIGN.sunken2}`, background:DESIGN.sunken, fontSize:11, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", textTransform:"uppercase" }}>Contexto de OLO</div>
      {SECCIONES.map(([id, label, sub]) => {
        const isA = sec === id;
        return <button key={id} onClick={()=>setSec(id)} style={{ display:"block", width:"100%", padding:"10px 14px", border:"none", borderLeft:`3px solid ${isA?ACCENT:"transparent"}`, borderBottom:`1px solid ${DESIGN.sunken}`, background:isA?ACCENT+"10":"transparent", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
          <div style={{ fontSize:13, fontWeight:isA?700:500, color:isA?DESIGN.ink:DESIGN.inkSoft }}>{label}</div>
          <div style={{ fontSize:11, color:DESIGN.mutedSoft, marginTop:1 }}>{sub}</div>
        </button>;
      })}
    </nav>

    <div style={{ flex:1, minWidth:0 }}>
      {sec === "resumen" && <Resumen ir={ir} setSec={setSec}/>}
      {sec === "localizaciones" && <Localizaciones/>}
      {sec === "aplicaciones" && <Aplicaciones ir={ir}/>}
      {sec === "clientes" && <Clientes ir={ir}/>}
      {sec === "reglas" && <Reglas ir={ir}/>}
      {sec === "datos" && <Datos ir={ir}/>}
      {sec === "fuentes" && <Fuentes ir={ir}/>}
      {sec === "extension" && <Extension ir={ir}/>}
      {sec === "glosario" && <Glosario ir={ir}/>}
      {sec === "brechas" && <Brechas ir={ir}/>}
      {sec === "cuestionario" && <Cuestionario ir={ir}/>}
    </div>
  </div>;
}

// ── Piezas ─────────────────────────────────────────────────────────────────
function H({ children, sub }) {
  return <div style={{ margin:"0 0 14px" }}>
    <h3 style={{ fontSize:18, fontWeight:700, color:DESIGN.ink, margin:0 }}>{children}</h3>
    {sub && <p style={{ fontSize:13.5, color:DESIGN.muted, margin:"4px 0 0", lineHeight:1.55, maxWidth:900 }}>{sub}</p>}
  </div>;
}
function Card({ children, style }) { return <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, padding:"14px 16px", ...style }}>{children}</div>; }
function Ir({ onClick, children = "Ver" }) {
  return <button onClick={onClick} style={{ fontSize:12.5, fontWeight:700, color:ACCENT, background:ACCENT+"10", border:`1px solid ${ACCENT}40`, borderRadius:6, padding:"3px 9px", cursor:"pointer", fontFamily:DESIGN.font, whiteSpace:"nowrap" }}>{children} ↗</button>;
}
function Kpi({ n, label, sub, onClick }) {
  return <button onClick={onClick} disabled={!onClick} style={{ textAlign:"left", background:"#fff", border:`1px solid ${DESIGN.border}`, borderTop:`3px solid ${ACCENT}`, borderRadius:10, padding:"12px 14px", cursor:onClick?"pointer":"default", fontFamily:DESIGN.font }}>
    <div style={{ fontSize:26, fontWeight:700, color:DESIGN.ink }}>{n}</div>
    <div style={{ fontSize:13.5, fontWeight:600, color:DESIGN.inkSoft }}>{label}</div>
    {sub && <div style={{ fontSize:12, color:DESIGN.muted, marginTop:2 }}>{sub}</div>}
  </button>;
}
const th = { padding:"9px 12px", fontSize:11.5, fontWeight:700, color:DESIGN.muted, textTransform:"uppercase", letterSpacing:"0.04em", textAlign:"left", background:DESIGN.sunken, borderBottom:`1px solid ${DESIGN.border}` };
const td = { padding:"10px 12px", fontSize:13.5, color:DESIGN.inkSoft, verticalAlign:"top", borderTop:`1px solid ${DESIGN.sunken2}`, lineHeight:1.5 };

// ── Secciones ──────────────────────────────────────────────────────────────
function Resumen({ ir, setSec }) {
  const tablas = ESQUEMAS.reduce((n, e) => n + e.tablas, 0);
  const cedi = PROC.filter(p => !p.borrador && p.silo !== "cross_docking").length;
  const borr = PROC.filter(p => p.borrador).length;
  const xdk = PROC.filter(p => p.silo === "cross_docking").length;
  const totalPasos = Object.values(PASOS_POR_ORIGEN).reduce((a, b) => a + b, 0);
  return <>
    <H sub="Lo que el BPA ya tiene mapeado de OLO, calculado de los datos: cada tarjeta lleva a su vista.">Estado del conocimiento</H>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:12, marginBottom:18 }}>
      <Kpi n={PROC.length} label="Procesos con ficha" sub={`${cedi} CEDI · ${borr} borradores · ${xdk} sorter`} onClick={()=>ir({ tab:"olo-arch" })}/>
      <Kpi n={totalPasos} label="Pasos documentados" sub="con sistema, pantalla y origen" onClick={()=>ir({ tab:"olo-arch" })}/>
      <Kpi n={Object.keys(WMS_INDEX).length + WMH_PANTALLAS.length + SORTER_PANTALLAS.length} label="Pantallas con captura" sub={`${Object.keys(WMS_INDEX).length} eflow · ${WMH_PANTALLAS.length} Torre · ${SORTER_PANTALLAS.length} SORTER`} onClick={()=>ir({ tab:"ops", view:"wms" })}/>
      <Kpi n={tablas.toLocaleString("es")} label="Tablas de BD mapeadas" sub={`${ESQUEMAS.length} esquemas reales`} onClick={()=>setSec("datos")}/>
      <Kpi n={INTEGRATIONS.length} label="Integraciones inter-módulo" sub="qué fluye entre sistemas" onClick={()=>ir({ tab:"integrations" })}/>
      <Kpi n={APLICACIONES.length} label="Aplicaciones" sub="con versión y dónde se usan" onClick={()=>setSec("aplicaciones")}/>
      <Kpi n={GLOSARIO.length} label="Términos de glosario" sub="definidos en las fichas" onClick={()=>setSec("glosario")}/>
      <Kpi n={GAPS.length + COFERSA_PENDIENTES.length} label="Brechas abiertas" sub="candidatas a levantamiento" onClick={()=>setSec("brechas")}/>
    </div>
    <Card>
      <div style={{ fontSize:12, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:10 }}>De dónde sale cada paso de proceso</div>
      {Object.entries(PASOS_POR_ORIGEN).sort((a, b) => b[1] - a[1]).map(([k, n]) => {
        const [label, color] = ORIGEN_LABEL[k] || [k, DESIGN.muted];
        return <div key={k} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <span style={{ width:190, fontSize:13.5, color:DESIGN.inkSoft, flexShrink:0 }}>{label}</span>
          <div style={{ flex:1, height:12, background:DESIGN.sunken2, borderRadius:6, overflow:"hidden" }}>
            <div style={{ width:`${(n / totalPasos) * 100}%`, height:"100%", background:color }}/>
          </div>
          <span style={{ width:90, fontSize:13, color:DESIGN.ink, textAlign:"right", flexShrink:0 }}><b>{n}</b> · {Math.round((n / totalPasos) * 100)} %</span>
        </div>;
      })}
      <p style={{ fontSize:12.5, color:DESIGN.muted, margin:"8px 0 0" }}>Los pasos inferidos están en los borradores de los silos de referencia: son práctica 3PL sin documento de OLO y deben validarse.</p>
    </Card>
  </>;
}

function Localizaciones() {
  return <>
    <H sub="Dónde opera OLO y con qué sistemas en cada país.">Localizaciones</H>
    <div style={{ display:"grid", gap:12 }}>
      {LOCALIZACIONES.map(l => <Card key={l.pais} style={{ borderLeft:`4px solid ${l.estado === "confirmed" ? "#16a34a" : "#f59e0b"}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <span style={{ fontSize:18, fontWeight:700, color:DESIGN.ink }}>{l.pais}</span>
          <StatusBadge status={l.estado} size="lg"/>
          <span style={{ fontSize:13, color:DESIGN.muted }}>{l.etiqueta}</span>
        </div>
        <p style={{ fontSize:14, color:DESIGN.inkSoft, lineHeight:1.6, margin:"10px 0" }}>{l.detalle}</p>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{l.sistemas.map(s => <span key={s} style={{ fontSize:12.5, color:DESIGN.inkSoft, background:DESIGN.sunken2, border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"3px 9px" }}>{s}</span>)}</div>
      </Card>)}
    </div>
  </>;
}

function Aplicaciones({ ir }) {
  return <>
    <H sub="Cada sistema que interviene en la operación, su versión y de dónde sale lo que sabemos de él.">Aplicaciones y versiones</H>
    <Card style={{ padding:0, overflow:"hidden" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr><th style={th}>Sistema</th><th style={th}>Versión</th><th style={th}>Para qué se usa</th><th style={th}>Fuente</th><th style={th}></th></tr></thead>
        <tbody>{APLICACIONES.map(a => <tr key={a.nombre}>
          <td style={td}><b style={{ color:DESIGN.ink }}>{a.nombre}</b><div style={{ fontSize:12, color:DESIGN.muted }}>{a.tipo}</div></td>
          <td style={{ ...td, whiteSpace:"nowrap" }}>{a.version}</td>
          <td style={td}>{a.uso}</td>
          <td style={{ ...td, fontSize:12.5, color:DESIGN.muted }}>{a.fuente}</td>
          <td style={{ ...td, textAlign:"right" }}><Ir onClick={()=>ir(a.vista)}/></td>
        </tr>)}</tbody>
      </table>
    </Card>
  </>;
}

function Clientes({ ir }) {
  return <>
    <H sub="Cómo se opera cada cliente en el CEDI y qué procedimientos lo cubren.">Clientes y operación</H>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(360px,1fr))", gap:12 }}>
      {CLIENTES.map(c => <Card key={c.nombre} style={{ borderLeft:`4px solid ${c.color}` }}>
        <div style={{ fontSize:18, fontWeight:700, color:c.color }}>{c.nombre}</div>
        <div style={{ fontSize:12.5, color:DESIGN.muted }}>{c.codigo}</div>
        <p style={{ fontSize:14, color:DESIGN.inkSoft, lineHeight:1.6, margin:"10px 0 12px" }}>{c.operacion}</p>
        <div style={{ fontSize:12, fontWeight:700, color:DESIGN.muted, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Procedimientos · {c.procesos.length}</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {c.procesos.filter(k => PROCESOS[k]).map(k => <button key={k} onClick={()=>ir({ tab:"olo-arch", codigo:k })} title="Abrir la ficha"
            style={{ fontSize:12.5, color:DESIGN.inkSoft, background:"#fff", border:`1px solid ${c.color}55`, borderRadius:6, padding:"4px 9px", cursor:"pointer", fontFamily:DESIGN.font }}>
            <b style={{ color:c.color }}>{k}</b> {PROCESOS[k].nombre}
          </button>)}
        </div>
      </Card>)}
    </div>
  </>;
}

function Reglas({ ir }) {
  const [f, setF] = useState("todas");
  const lista = REGLAS_OPERATIVAS.filter(r => f === "todas" || r.cliente === f);
  return <>
    <H sub="Reglas que gobiernan la operación, tomadas de los procedimientos del CEDI, y las reglas FLOW que parametrizan la Torre de Control.">Reglas de negocio</H>
    <div style={{ display:"flex", gap:6, marginBottom:10 }}>
      {["todas", "COFERSA", "EPA"].map(k => <button key={k} onClick={()=>setF(k)} style={{ padding:"5px 12px", borderRadius:DESIGN.radiusPill, border:`1px solid ${f===k?DESIGN.ink:DESIGN.border}`, background:f===k?DESIGN.ink:"#fff", color:f===k?"#fff":DESIGN.inkSoft, fontSize:13, cursor:"pointer", fontFamily:DESIGN.font }}>{k === "todas" ? "Todas" : k}</button>)}
    </div>
    <Card style={{ padding:0, overflow:"hidden", marginBottom:18 }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr><th style={th}>Regla operativa</th><th style={th}>Cliente</th><th style={th}>Procedimiento</th></tr></thead>
        <tbody>{lista.map((r, i) => <tr key={i}>
          <td style={td}>{r.regla}</td>
          <td style={{ ...td, whiteSpace:"nowrap" }}>{r.cliente}</td>
          <td style={{ ...td, whiteSpace:"nowrap" }}><Ir onClick={()=>ir({ tab:"olo-arch", codigo:r.codigo })}>{r.codigo} · {PROCESOS[r.codigo]?.nombre}</Ir></td>
        </tr>)}</tbody>
      </table>
    </Card>
    <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink, marginBottom:8 }}>Reglas FLOW de la Torre de Control</div>
    <Card style={{ padding:0, overflow:"hidden" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr><th style={th}>Regla</th><th style={th}>Qué hace</th></tr></thead>
        <tbody>{REGLAS_WMH.map(([id, d]) => <tr key={id}><td style={{ ...td, fontFamily:"'Courier New', monospace", fontWeight:700, color:DESIGN.ink, whiteSpace:"nowrap" }}>{id}</td><td style={td}>{d}</td></tr>)}</tbody>
      </table>
    </Card>
  </>;
}

function Datos({ ir }) {
  return <>
    <H sub={`Esquemas reales extraídos de las bases de datos, con su cantidad de tablas, y el acceso a metadata SQL por instancia (backbone del ${BACKBONE_GENERATED_AT}).`}>Bases de datos</H>
    <Card style={{ padding:0, overflow:"hidden", marginBottom:18 }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr><th style={th}>Esquema</th><th style={th}>País</th><th style={{ ...th, textAlign:"right" }}>Tablas</th><th style={th}></th></tr></thead>
        <tbody>{ESQUEMAS.map(e => <tr key={e.cat}>
          <td style={td}>{e.label}</td>
          <td style={{ ...td, whiteSpace:"nowrap" }}>{e.pais}</td>
          <td style={{ ...td, textAlign:"right", fontWeight:700, color:DESIGN.ink }}>{e.tablas}</td>
          <td style={{ ...td, textAlign:"right" }}><Ir onClick={()=>ir({ tab:"integrations", cat:e.cat })}>Ver esquema</Ir></td>
        </tr>)}</tbody>
      </table>
    </Card>
    <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink, marginBottom:8 }}>Acceso a metadata SQL (backbone)</div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:10, marginBottom:12 }}>
      {BACKBONE_SOURCES.map(s => <Card key={s.id}>
        <div style={{ fontSize:14, fontWeight:700, color:DESIGN.ink }}>{s.label}</div>
        <div style={{ fontSize:12.5, color:DESIGN.muted, marginBottom:6 }}>{s.empresa} · con acceso</div>
        <div style={{ fontSize:13, color:DESIGN.inkSoft }}>{(s.procs || []).length} procedimientos · {(s.fns || []).length} funciones · {(s.triggersTotal || 0).toLocaleString("es")} triggers</div>
      </Card>)}
    </div>
    <Card style={{ background:DESIGN_STATUS.warning.bg, borderColor:DESIGN_STATUS.warning.border }}>
      <div style={{ fontSize:13, fontWeight:700, color:DESIGN_STATUS.warning.color, marginBottom:6 }}>Sin acceso a metadata · {BACKBONE_NO_ACCESS.length} instancias</div>
      {BACKBONE_NO_ACCESS.map((n, i) => <div key={i} style={{ fontSize:13, color:DESIGN_STATUS.warning.color, lineHeight:1.6 }}><b>{n.instancia}</b> — {n.db}: {n.motivo}</div>)}
      <div style={{ fontSize:12.5, color:DESIGN_STATUS.warning.color, marginTop:6 }}>Totales del backbone: {BACKBONE_SUMMARY.procs} procedimientos, {BACKBONE_SUMMARY.fns} funciones y {BACKBONE_SUMMARY.triggers.toLocaleString("es")} triggers en las instancias con acceso.</div>
    </Card>
  </>;
}

function Fuentes({ ir }) {
  return <>
    <H sub="Todo el material que alimenta el BPA, qué aporta cada uno y dónde se ve.">Fuentes del levantamiento</H>
    <Card style={{ padding:0, overflow:"hidden" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr><th style={th}>Fuente</th><th style={th}>Qué aporta</th><th style={th}></th></tr></thead>
        <tbody>{FUENTES.map(f => <tr key={f.fuente}>
          <td style={td}><b style={{ color:DESIGN.ink }}>{f.fuente}</b><div style={{ fontSize:12, color:DESIGN.muted }}>{f.origen}</div></td>
          <td style={td}>{f.aporta}</td>
          <td style={{ ...td, textAlign:"right" }}><Ir onClick={()=>ir(f.vista)}/></td>
        </tr>)}</tbody>
      </table>
    </Card>
  </>;
}

function Extension({ ir }) {
  const bloque = (titulo, color, items) => <>
    <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink, margin:"4px 0 8px" }}>{titulo}</div>
    <div style={{ display:"grid", gap:8, marginBottom:18 }}>
      {items.map((p, i) => <Card key={i} style={{ borderLeft:`3px solid ${color}`, padding:"10px 14px", display:"flex", gap:12, alignItems:"flex-start" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:700, color, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:4 }}>{p.type || p.tipo}</div>
          <p style={{ fontSize:13.5, color:DESIGN.inkSoft, lineHeight:1.55, margin:0 }}>{p.detail || p.detalle}</p>
        </div>
        {p.vista && <Ir onClick={()=>ir(p.vista)}/>}
      </Card>)}
    </div>
  </>;
  return <>
    <H sub="Mecanismos para conectar, parametrizar o integrar lógica externa, en el ERP y en la suite eflow.">Puntos de extensión</H>
    {bloque("eflow WMS y Torre de Control", "#0891b2", EXTENSION_EFLOW)}
    {bloque("Softland ERP", ACCENT, EXTENSION_POINTS)}
  </>;
}

function Glosario({ ir }) {
  const [q, setQ] = useState("");
  const n = q.trim().toLowerCase();
  const lista = GLOSARIO.filter(g => !n || `${g.termino} ${g.definicion}`.toLowerCase().includes(n));
  return <>
    <H sub="Términos de la operación y de los sistemas, reunidos de todas las fichas de proceso y del manual del SORTER.">Glosario</H>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar término o definición…"
      style={{ width:"100%", maxWidth:420, boxSizing:"border-box", fontSize:14, border:`1px solid ${DESIGN.borderStrong}`, borderRadius:8, padding:"8px 12px", fontFamily:DESIGN.font, marginBottom:12 }}/>
    <div style={{ fontSize:12.5, color:DESIGN.muted, marginBottom:8 }}>{lista.length} de {GLOSARIO.length} términos</div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:10 }}>
      {lista.map(g => <Card key={g.termino} style={{ padding:"10px 14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", gap:8, alignItems:"baseline" }}>
          <b style={{ fontSize:14, color:DESIGN.ink }}>{g.termino}</b>
          <button onClick={()=>ir({ tab:"olo-arch", codigo:g.codigo })} title={PROCESOS[g.codigo]?.nombre} style={{ fontSize:11.5, color:ACCENT, background:"none", border:"none", cursor:"pointer", fontFamily:DESIGN.font, padding:0, flexShrink:0 }}>{g.codigo} ↗</button>
        </div>
        <p style={{ fontSize:13, color:DESIGN.inkSoft, lineHeight:1.5, margin:"4px 0 0" }}>{g.definicion}</p>
      </Card>)}
    </div>
  </>;
}

function Brechas({ ir }) {
  const borradores = PROC.filter(p => p.borrador);
  const silos = [...new Set(borradores.map(p => p.silo))].map(s => SILO_LABELS[s] || s);
  return <>
    <H sub="Vacíos reconocidos: lo que falta documentar o confirmar. Son los candidatos al siguiente levantamiento.">Brechas declaradas</H>
    <div style={{ display:"grid", gap:8, marginBottom:18 }}>
      {GAPS.map((g, i) => <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", background:"#fbe9e7", border:"1px solid #ef9a9a", borderLeft:"3px solid #c0392b", borderRadius:8, padding:"10px 14px" }}>
        <span style={{ fontSize:11, fontWeight:700, color:"#c0392b", background:"#fff", padding:"2px 7px", borderRadius:4, whiteSpace:"nowrap", flexShrink:0 }}>GAP·{String(i + 1).padStart(2, "0")}</span>
        <span style={{ fontSize:13.5, color:"#555", lineHeight:1.55 }}>{g}</span>
      </div>)}
    </div>
    <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink, marginBottom:8 }}>Pendiente en el mapeo de Torre de Control (alistamiento COFERSA)</div>
    <Card style={{ marginBottom:18 }}>
      <ul style={{ margin:0, paddingLeft:18, display:"grid", gap:4 }}>{COFERSA_PENDIENTES.map((t, i) => <li key={i} style={{ fontSize:13.5, color:DESIGN.inkSoft, lineHeight:1.5 }}>{t}</li>)}</ul>
      <div style={{ marginTop:10 }}><Ir onClick={()=>ir({ tab:"ops", view:"wmh" })}>Ver el mapeo</Ir></div>
    </Card>
    <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink, marginBottom:8 }}>Procesos en borrador por validar</div>
    <Card>
      <p style={{ fontSize:13.5, color:DESIGN.inkSoft, lineHeight:1.55, margin:"0 0 8px" }}>
        {borradores.length} procesos de {silos.length} silos de referencia se armaron sobre pantallas reales de eflow, pero su secuencia, reglas y responsables son inferidos: {PASOS_POR_ORIGEN.inferido || 0} pasos sin documento de OLO. Necesitan un procedimiento aprobado.
      </p>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{silos.map(s => <span key={s} style={{ fontSize:12.5, color:"#b45309", background:"#fffbeb", border:"1px dashed #f59e0b", borderRadius:6, padding:"3px 9px" }}>{s}</span>)}</div>
    </Card>
  </>;
}

// Preguntas para cerrar las brechas, por destinatario, listas para enviar
function Cuestionario({ ir }) {
  const [copiado, setCopiado] = useState(null);
  const copiar = async b => {
    try { await navigator.clipboard.writeText(textoParaEnviar(b)); setCopiado(b.id); setTimeout(() => setCopiado(null), 2000); } catch { setCopiado("error"); }
  };
  return <>
    <H sub="Lo que hay que preguntar para cerrar las brechas, agrupado por quién puede responder. Cada pregunta indica qué brecha cierra y dónde se registra la respuesta en el BPA.">Cuestionario de levantamiento</H>
    <div style={{ display:"grid", gap:14 }}>
      {CUESTIONARIO.map(b => <Card key={b.id}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:10, flexWrap:"wrap", marginBottom:8 }}>
          <div style={{ flex:1, minWidth:240 }}>
            <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink }}>{b.destinatario}</div>
            {b.nota && <div style={{ fontSize:12.5, color:DESIGN.muted, marginTop:3, lineHeight:1.5 }}>{b.nota}</div>}
          </div>
          <button onClick={() => copiar(b)} style={{ fontSize:12.5, fontWeight:700, color: copiado === b.id ? "#15803d" : "#fff", background: copiado === b.id ? "#f0fdf4" : ACCENT, border: copiado === b.id ? "1px solid #86efac" : "none", borderRadius:7, padding:"7px 12px", cursor:"pointer", fontFamily:"inherit" }}>
            {copiado === b.id ? "✓ Copiado" : "Copiar para enviar"}</button>
          {b.id === "operaciones" && <button onClick={() => ir({ tab:"workflows" })} style={{ fontSize:12.5, fontWeight:700, color:DESIGN.ink, background:DESIGN.sunken2, border:"none", borderRadius:7, padding:"7px 12px", cursor:"pointer", fontFamily:"inherit" }}>Abrir Workflows ›</button>}
        </div>
        <ol style={{ margin:0, paddingLeft:20, display:"grid", gap:8 }}>
          {b.preguntas.map((q, i) => <li key={i} style={{ fontSize:13.5, color:DESIGN.ink, lineHeight:1.5 }}>
            {q.p}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:3 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#c0392b", background:"#fbe9e7", borderRadius:4, padding:"1px 6px" }}>{q.gap}</span>
              <span style={{ fontSize:11.5, color:DESIGN.muted }}>La respuesta va en: {q.va}</span>
            </div>
          </li>)}
        </ol>
      </Card>)}
      {copiado === "error" && <div style={{ fontSize:12.5, color:"#b91c1c" }}>El navegador no permitió copiar al portapapeles; selecciona el texto y cópialo a mano.</div>}
    </div>
  </>;
}
