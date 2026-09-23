// ═══════════════════════════════════════════════════════════════════════════
// VISTA · TORRE DE CONTROL (WMH) — dentro de Operación
// Contenido de los documentos de levantamiento de Control Tower y del mapeo
// del proceso de Alistamiento COFERSA (ver src/data/control_tower.js).
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { WmhManualSection } from "./WmhManualSection.jsx";
import { DESIGN, DESIGN_STATUS } from "../data/constants.js";
import { KPICard } from "../components/ui.jsx";
import flujoPng from "../assets/control-tower-flujo.png";
import {
  CT_META, CT_RESUMEN, CT_FLUJO, CT_KPIS, CT_NAV, CT_UI_GLOBAL, CT_DASHBOARD_ACCIONES,
  CT_NUEVO_VIAJE_INDICADORES, CT_DATOS, CT_MODELO, CT_FORMATO, CT_RECOMENDACIONES,
  COFERSA_META, COFERSA_RESUMEN, COFERSA_PASOS, COFERSA_VIAJE_NOMBRES, COFERSA_INTEGRACION,
  COFERSA_REGLAS, COFERSA_RIESGOS, COFERSA_PENDIENTES, CT_DOCUMENTOS,
} from "../data/control_tower.js";

const ACCENT = "#1abc9c";
const SYS = {
  eflow: { label: "eFlow WMS",        color: "#0891b2" },
  ct:    { label: "Torre de Control", color: "#16a34a" },
  ambos: { label: "eFlow + Torre",    color: "#7c3aed" },
  fuera: { label: "Fuera de sistema", color: "#64748b" },
};

const SECTIONS = [
  { id: "resumen",   label: "Resumen",                 sub: "Qué es · flujo · KPIs" },
  { id: "manual",    label: "Manual · pantallas",      sub: "17 capturas · recorridos guiados" },
  { id: "diagrama",  label: "Diagrama de flujo",       sub: "Flujo operativo TMS" },
  { id: "pantallas", label: "Pantallas y navegación",  sub: `${CT_NAV.length} módulos · URLs` },
  { id: "datos",     label: "Datos reales por columna", sub: `${CT_DATOS.length} módulos con muestra` },
  { id: "modelo",    label: "Modelo de datos",         sub: "Entidades · formatos" },
  { id: "cofersa",   label: "Proceso COFERSA",         sub: "Alistamiento · 23 pasos" },
  { id: "oms",       label: "Recomendaciones OMS/TMS", sub: `${CT_RECOMENDACIONES.length} recomendaciones` },
  { id: "docs",      label: "Documentos",              sub: "Descargas" },
];

export function ControlTowerView({ focus }) {
  const [section, setSection] = useState(focus?.wmhScreen ? "manual" : "resumen");
  // Foco desde otro módulo (paso de proceso en Torre de Control): abre la pantalla del manual
  useEffect(() => { if (focus?.wmhScreen) setSection("manual"); }, [focus]);

  return <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
    <nav style={{ width:215, minWidth:215, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, overflow:"hidden", flexShrink:0, position:"sticky", top:20 }}>
      <div style={{ padding:"10px 14px", borderBottom:`1px solid ${DESIGN.sunken2}`, background:DESIGN.sunken, fontSize:10, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", textTransform:"uppercase" }}>Torre de Control · WMH</div>
      {SECTIONS.map(s => {
        const isA = section === s.id;
        return <button key={s.id} onClick={()=>setSection(s.id)} style={{ display:"block", width:"100%", padding:"9px 14px", border:"none", borderLeft:`3px solid ${isA?ACCENT:"transparent"}`, borderBottom:`1px solid ${DESIGN.sunken}`, background:isA?ACCENT+"12":"transparent", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
          <div style={{ fontSize:11.5, fontWeight:isA?700:500, color:isA?DESIGN.ink:DESIGN.inkSoft }}>{s.label}</div>
          <div style={{ fontSize:9.5, color:DESIGN.mutedSoft, marginTop:1 }}>{s.sub}</div>
        </button>;
      })}
    </nav>

    <div style={{ flex:1, minWidth:0 }}>
      {section==="resumen"   && <Resumen/>}
      {section==="manual"    && <WmhManualSection focusScreen={focus?.wmhScreen}/>}
      {section==="diagrama"  && <Diagrama/>}
      {section==="pantallas" && <Pantallas/>}
      {section==="datos"     && <Datos/>}
      {section==="modelo"    && <Modelo/>}
      {section==="cofersa"   && <Cofersa/>}
      {section==="oms"       && <Recomendaciones/>}
      {section==="docs"      && <Documentos/>}
    </div>
  </div>;
}

// ── Piezas comunes ─────────────────────────────────────────────────────────
function H({ children, sub }) {
  return <div style={{ margin:"0 0 12px" }}>
    <h3 style={{ fontSize:16, fontWeight:700, color:DESIGN.ink, margin:0 }}>{children}</h3>
    {sub && <div style={{ fontSize:12, color:DESIGN.muted, marginTop:3 }}>{sub}</div>}
  </div>;
}
function Card({ children, style }) {
  return <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, padding:"14px 16px", marginBottom:16, ...style }}>{children}</div>;
}
function Label({ children }) {
  return <div style={{ fontSize:10.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>{children}</div>;
}
function Note({ children, critical }) {
  const st = critical ? DESIGN_STATUS.critical : DESIGN_STATUS.warning;
  return <div style={{ background:st.bg, border:`1px solid ${st.border}`, color:st.color, borderRadius:8, padding:"8px 12px", fontSize:12, lineHeight:1.55, marginTop:10 }}>► {children}</div>;
}
function Table({ cols, rows, mono }) {
  const th = { padding:"8px 12px", color:DESIGN.muted, fontWeight:700, fontSize:10.5, textTransform:"uppercase", letterSpacing:"0.04em", textAlign:"left", whiteSpace:"nowrap", background:DESIGN.sunken, borderBottom:`1px solid ${DESIGN.border}` };
  const td = { padding:"8px 12px", verticalAlign:"top", borderTop:`1px solid ${DESIGN.sunken2}`, color:DESIGN.ink };
  return <div style={{ overflowX:"auto", border:`1px solid ${DESIGN.border}`, borderRadius:8 }}>
    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
      <thead><tr>{cols.map(c => <th key={c} style={th}>{c}</th>)}</tr></thead>
      <tbody>{rows.map((r,i) => <tr key={i}>{r.map((v,j) =>
        <td key={j} style={{ ...td, fontFamily:mono?"'Courier New', monospace":undefined, whiteSpace:mono?"nowrap":undefined }}>
          {v === "" ? <span style={{ color:DESIGN.mutedSoft, fontStyle:"italic" }}>(vacío)</span> : v}
        </td>)}</tr>)}</tbody>
    </table>
  </div>;
}
function SysChip({ sys }) {
  const s = SYS[sys];
  return <span style={{ fontSize:10, fontWeight:700, color:s.color, background:s.color+"14", border:`1px solid ${s.color}40`, padding:"2px 8px", borderRadius:DESIGN.radiusPill, whiteSpace:"nowrap" }}>{s.label}</span>;
}

// ── Secciones ──────────────────────────────────────────────────────────────
function Resumen() {
  const meta = [["Tipo", CT_META.tipo], ["Versión", CT_META.version], ["Marca", CT_META.marca], ["Proveedor", CT_META.proveedor], ["URL", CT_META.url], ["Stack", CT_META.stack], ["Base de datos", CT_META.bd], ["Levantamiento", CT_META.levantamiento]];
  return <>
    <H sub="Mapeo funcional + datos reales extraídos en vivo de la aplicación">{CT_META.nombre}</H>
    <Card>
      <p style={{ fontSize:13, color:DESIGN.inkSoft, lineHeight:1.65, margin:"0 0 14px" }}>{CT_RESUMEN}</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"8px 16px" }}>
        {meta.map(([k,v]) => <div key={k} style={{ fontSize:12 }}>
          <div style={{ color:DESIGN.muted, fontSize:10.5 }}>{k}</div>
          <div style={{ color:DESIGN.ink, fontWeight:600, wordBreak:"break-word" }}>{v}</div>
        </div>)}
      </div>
    </Card>
    <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:16 }}>
      {CT_KPIS.map(k => <KPICard key={k.label} label={k.label} value={k.value} color={ACCENT} sub="dashboard 22/09/2026"/>)}
    </div>
    <Card>
      <Label>Flujo operativo principal (lo que el OMS debe automatizar)</Label>
      <ol style={{ margin:0, paddingLeft:0, listStyle:"none", display:"grid", gap:8 }}>
        {CT_FLUJO.map((f,i) => <li key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:12.5, color:DESIGN.ink, lineHeight:1.5 }}>
          <span style={{ width:22, height:22, borderRadius:"50%", background:ACCENT, color:"#fff", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
          <span>{f}</span>
        </li>)}
      </ol>
    </Card>
  </>;
}

function Diagrama() {
  return <>
    <H sub="Planificación de viajes de distribución · datos reales EFLOW_OLO (22/09/2026)">Diagrama de flujo — Control Tower</H>
    <Card style={{ padding:12, textAlign:"center" }}>
      <a href={flujoPng} target="_blank" rel="noreferrer" title="Abrir en tamaño completo">
        <img src={flujoPng} alt="Flujo operativo de Control Tower: datos maestros, ingreso de órdenes, motor de planificación, validación de capacidad, viaje activo y cierre" style={{ maxWidth:"100%", maxHeight:"none", width:760, borderRadius:6 }}/>
      </a>
      <div style={{ fontSize:11, color:DESIGN.muted, marginTop:6 }}>Clic en la imagen para verla en tamaño completo.</div>
    </Card>
  </>;
}

function Pantallas() {
  return <>
    <H sub="Rutas URL de la aplicación web y función de cada módulo">Pantallas y navegación</H>
    <Card style={{ padding:0, overflow:"hidden" }}>
      <Table cols={["Sección","Módulo","URL","Qué hace"]} rows={CT_NAV.map(n => [
        n.seccion,
        <b key="m" style={{ color:n.key?"#16a34a":DESIGN.ink }}>{n.modulo}</b>,
        <code key="u" style={{ fontSize:11, color:DESIGN.inkSoft }}>{n.url}</code>,
        n.desc,
      ])}/>
    </Card>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:16 }}>
      <Card style={{ marginBottom:0 }}>
        <Label>Dashboard — acciones sobre viajes</Label>
        <Table cols={["Botón","Función","Estado"]} rows={CT_DASHBOARD_ACCIONES.map(a => [a.boton, a.func, a.estado])}/>
      </Card>
      <Card style={{ marginBottom:0 }}>
        <Label>Nuevo Viaje — indicadores en vivo</Label>
        <Table cols={["Indicador","Qué mide"]} rows={CT_NUEVO_VIAJE_INDICADORES}/>
        <Note>Botones Añadir (recalcula KPIs), Crear (confirma) y Cancelar. Es la pantalla núcleo a automatizar.</Note>
      </Card>
    </div>
    <Card style={{ marginTop:16 }}>
      <Label>Componentes globales de la interfaz</Label>
      <ul style={{ margin:0, paddingLeft:18, fontSize:12.5, color:DESIGN.inkSoft, lineHeight:1.7 }}>
        {CT_UI_GLOBAL.map((t,i) => <li key={i}>{t}</li>)}
      </ul>
    </Card>
  </>;
}

function Datos() {
  const [mod, setMod] = useState(CT_DATOS[0].id);
  const d = CT_DATOS.find(x => x.id === mod);
  return <>
    <H sub="Ejemplos reales extraídos el 22/09/2026 — qué dato y formato va en cada columna">Datos reales por columna</H>
    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
      {CT_DATOS.map(x => {
        const isA = x.id === mod;
        return <button key={x.id} onClick={()=>setMod(x.id)} style={{ padding:"5px 12px", borderRadius:DESIGN.radiusPill, border:`1px solid ${isA?DESIGN.ink:DESIGN.border}`, background:isA?DESIGN.ink:"#fff", color:isA?"#fff":DESIGN.inkSoft, fontSize:12, cursor:"pointer", fontFamily:DESIGN.font, whiteSpace:"nowrap" }}>
          {x.critico && "⚠ "}{x.label}
        </button>;
      })}
    </div>
    <Card>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:10, flexWrap:"wrap", marginBottom:10 }}>
        <span style={{ fontSize:14, fontWeight:700, color:DESIGN.ink }}>{d.label}</span>
        <span style={{ fontSize:11.5, color:DESIGN.muted }}><code>{d.url}</code> · Total en la app: <b style={{ color:DESIGN.ink }}>{d.total}</b> · muestra: {d.rows.length}</span>
      </div>
      <Table cols={d.cols} rows={d.rows} mono/>
      {d.nota && <Note critical={d.critico}>{d.nota}</Note>}
    </Card>
  </>;
}

function Modelo() {
  return <>
    <H sub="Relaciones deducidas de las columnas visibles — no es el modelo físico de la BD">Modelo de datos inferido</H>
    <Card>
      <pre style={{ margin:0, fontSize:12, lineHeight:1.8, fontFamily:"'Courier New', monospace", color:DESIGN.ink, whiteSpace:"pre-wrap" }}>{CT_MODELO.join("\n")}</pre>
    </Card>
    <Card style={{ padding:0, overflow:"hidden" }}>
      <div style={{ padding:"12px 16px 0" }}><Label>Observaciones de formato (para el diseño de datos)</Label></div>
      <Table cols={["Observación","Ejemplo real","Tipo recomendado"]} rows={CT_FORMATO}/>
    </Card>
  </>;
}

function Cofersa() {
  const [sysF, setSysF] = useState("*");
  const pasos = sysF === "*" ? COFERSA_PASOS : COFERSA_PASOS.filter(p => p.sys === sysF);
  return <>
    <H sub={`eFlow WMS + Torre de Control · ${COFERSA_META.procedimiento} · preparado por ${COFERSA_META.autora}, ${COFERSA_META.fecha}`}>{COFERSA_META.titulo}</H>
    <Card>
      <p style={{ fontSize:13, color:DESIGN.inkSoft, lineHeight:1.65, margin:"0 0 10px" }}>{COFERSA_RESUMEN}</p>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {COFERSA_META.apps.map(a => <span key={a} style={{ fontSize:11, color:DESIGN.inkSoft, background:DESIGN.sunken2, padding:"3px 10px", borderRadius:6 }}>{a}</span>)}
      </div>
      <Note>{COFERSA_META.alcance}</Note>
    </Card>

    <Card>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:10 }}>
        <Label>Flujo integrado: procedimiento vs. sistema</Label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[["*","Todos"], ...Object.entries(SYS).map(([k,v]) => [k, v.label])].map(([k,l]) => {
            const isA = sysF === k;
            return <button key={k} onClick={()=>setSysF(k)} style={{ padding:"3px 10px", borderRadius:DESIGN.radiusPill, border:`1px solid ${isA?DESIGN.ink:DESIGN.border}`, background:isA?DESIGN.ink:"#fff", color:isA?"#fff":DESIGN.inkSoft, fontSize:11, cursor:"pointer", fontFamily:DESIGN.font }}>{l}</button>;
          })}
        </div>
      </div>
      <Table cols={["Paso","Sistema","Pantalla / ruta","Acción en el sistema","Resultado esperado"]}
        rows={pasos.map(p => [<b key="p">{p.paso}</b>, <SysChip key="s" sys={p.sys}/>, p.pantalla || "—", p.accion, p.resultado])}/>
    </Card>

    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:16, marginBottom:16 }}>
      <Card style={{ marginBottom:0 }}>
        <Label>Integración eFlow WMS ↔ Torre de Control</Label>
        <Table cols={["Dato","Origen","Destino","Momento"]} rows={COFERSA_INTEGRACION.map(i => [i.dato, i.from, i.to, i.momento])}/>
      </Card>
      <Card style={{ marginBottom:0 }}>
        <Label>El número de viaje une ambos sistemas</Label>
        <Table cols={["Sistema / pantalla","Nombre del campo"]} rows={COFERSA_VIAJE_NOMBRES}/>
      </Card>
    </div>

    <Card style={{ padding:0, overflow:"hidden" }}>
      <div style={{ padding:"12px 16px 0" }}><Label>Reglas de negocio del proceso</Label></div>
      <Table cols={["Regla","Dónde se aplica"]} rows={COFERSA_REGLAS}/>
    </Card>
    <Card style={{ padding:0, overflow:"hidden" }}>
      <div style={{ padding:"12px 16px 0" }}><Label>Riesgos y puntos de control en el sistema</Label></div>
      <Table cols={["Riesgo / no conformidad","Punto de control","Paso"]} rows={COFERSA_RIESGOS}/>
    </Card>
    <Card style={{ background:DESIGN_STATUS.warning.bg, borderColor:DESIGN_STATUS.warning.border }}>
      <Label>Pendiente por identificar en el mapeo</Label>
      <ul style={{ margin:0, paddingLeft:18, fontSize:12.5, color:DESIGN_STATUS.warning.color, lineHeight:1.7 }}>
        {COFERSA_PENDIENTES.map((t,i) => <li key={i}>{t}</li>)}
      </ul>
    </Card>
  </>;
}

function Recomendaciones() {
  return <>
    <H sub="Especificación para construir el OMS/TMS de reemplazo">Recomendaciones para el OMS/TMS</H>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
      {CT_RECOMENDACIONES.map(([t,d],i) => <div key={i} style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderLeft:`3px solid ${ACCENT}`, borderRadius:8, padding:"12px 14px" }}>
        <div style={{ fontSize:13, fontWeight:700, color:DESIGN.ink, marginBottom:4 }}>{i+1}. {t}</div>
        <div style={{ fontSize:12, color:DESIGN.inkSoft, lineHeight:1.55 }}>{d}</div>
      </div>)}
    </div>
  </>;
}

function Documentos() {
  return <>
    <H sub="Documentos originales del levantamiento">Documentos</H>
    <div style={{ display:"grid", gap:10 }}>
      {CT_DOCUMENTOS.map(d => <a key={d.file} href={`${import.meta.env.BASE_URL}${d.file}`} download style={{ display:"flex", alignItems:"center", gap:14, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:8, padding:"12px 16px", textDecoration:"none" }}>
        <span style={{ fontSize:10, fontWeight:700, color:"#fff", background:"#2b579a", borderRadius:4, padding:"4px 7px" }}>{d.tipo}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:DESIGN.ink }}>{d.titulo}</div>
          <div style={{ fontSize:12, color:DESIGN.muted }}>{d.desc}</div>
        </div>
        <span style={{ fontSize:12, color:DESIGN.inkSoft, fontWeight:600 }}>Descargar ↓</span>
      </a>)}
      <a href={flujoPng} download="Diagrama de Flujo — Control Tower.png" style={{ display:"flex", alignItems:"center", gap:14, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:8, padding:"12px 16px", textDecoration:"none" }}>
        <span style={{ fontSize:10, fontWeight:700, color:"#fff", background:"#64748b", borderRadius:4, padding:"4px 7px" }}>PNG</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:DESIGN.ink }}>Diagrama de Flujo — Control Tower</div>
          <div style={{ fontSize:12, color:DESIGN.muted }}>Flujo operativo del TMS con datos reales.</div>
        </div>
        <span style={{ fontSize:12, color:DESIGN.inkSoft, fontWeight:600 }}>Descargar ↓</span>
      </a>
    </div>
    <Note>El Documento Maestro y el de Datos Reales por Columna no se publican para descarga porque incluyen el valor de la regla ADMPASS (una contraseña). Su contenido está integrado en estas pantallas, sin ese valor.</Note>
  </>;
}
