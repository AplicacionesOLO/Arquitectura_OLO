// ═══════════════════════════════════════════════════════════════════════════
// VISTA · BACKBONE SQL — homólogo de "Ecosistema › Integraciones" de BPA
// Mayoreo, con datos propios de OLO: catálogo real de triggers, stored
// procedures y funciones extraído en vivo de las instancias EPRAC/eflow y
// Softland conectadas (ver src/data/sql_backbone.js). No incluye SQL Server
// Agent (msdb) — sin permisos de lectura en ninguna de las 6 instancias; se
// marca explícitamente en vez de omitirse en silencio.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useMemo } from "react";
import { DESIGN, DESIGN_STATUS } from "../data/constants.js";
import { KPICard, CloseButton } from "../components/ui.jsx";
import { SearchIcon } from "../components/icons.jsx";
import {
  BACKBONE_SUMMARY, BACKBONE_CATEGORIES, BACKBONE_SOURCES,
  BACKBONE_NO_ACCESS, BACKBONE_JOBS_NOTE, BACKBONE_GENERATED_AT,
} from "../data/sql_backbone.js";

const TYPE_LABEL = { proc: "Stored procedure", fn: "Función" };

function buildRows() {
  const rows = [];
  BACKBONE_SOURCES.forEach(src => {
    (src.procs || []).forEach(o => rows.push({ ...o, type: "proc", sourceId: src.id, sourceLabel: src.label, empresa: src.empresa }));
    (src.fns || []).forEach(o => rows.push({ ...o, typeCode: o.type, type: "fn", sourceId: src.id, sourceLabel: src.label, empresa: src.empresa }));
  });
  return rows;
}
const ALL_ROWS = buildRows();
const SOURCES_WITH_DATA = BACKBONE_SOURCES.filter(s => (s.procs?.length || 0) + (s.fns?.length || 0) + (s.triggersTotal || 0) > 0);

export function SqlBackboneView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todas");
  const [instance, setInstance] = useState("todas");
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_ROWS.filter(r =>
      (category === "todas" || r.category === category) &&
      (instance === "todas" || r.sourceId === instance) &&
      (!q || r.name.toLowerCase().includes(q))
    );
  }, [query, category, instance]);

  return <div>
    <div style={{ fontSize:12, color:DESIGN.muted, marginBottom:14 }}>
      Instantánea real de metadata SQL Server · generada {BACKBONE_GENERATED_AT}
    </div>

    {/* Aviso de alcance — honesto sobre lo que falta, no lo oculta */}
    <div style={{ display:"flex", gap:10, alignItems:"flex-start", background:DESIGN_STATUS.warning.bg, border:`1px solid ${DESIGN_STATUS.warning.border}`, borderRadius:DESIGN.radius, padding:"11px 14px", marginBottom:16, fontSize:12.5, color:DESIGN_STATUS.warning.color, lineHeight:1.6 }}>
      <span style={{ fontWeight:700, flexShrink:0 }}>Jobs SQL: no disponible</span>
      <span>{BACKBONE_JOBS_NOTE}</span>
    </div>

    {/* KPIs */}
    <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20 }}>
      <KPICard label="Stored procedures reales" value={BACKBONE_SUMMARY.procs} color="#0d9488"/>
      <KPICard label="Funciones reales" value={BACKBONE_SUMMARY.fns} color="#7c3aed"/>
      <KPICard label="Triggers de negocio" value={BACKBONE_SUMMARY.triggers.toLocaleString("es")} color="#dc2626" sub="suma agregada, no listado individual"/>
      <KPICard label="Instancias con acceso" value={`${BACKBONE_SUMMARY.instancesWithAccess} / ${BACKBONE_SUMMARY.instancesWithAccess + BACKBONE_SUMMARY.instancesNoAccess}`} color="#2563eb"/>
    </div>

    <p style={{ fontSize:12.5, color:DESIGN.inkSoft, lineHeight:1.6, marginBottom:16, maxWidth:820 }}>
      Backbone SQL de OLO: procedimientos, funciones y triggers reales que orquestan
      automatizaciones de negocio en las bases a las que el usuario de integración tiene
      permisos de lectura de metadata. Filtrado por categoría, instancia o nombre.
    </p>

    {/* Filtros */}
    <div style={{ position:"relative", maxWidth:360, marginBottom:12 }}>
      <SearchIcon style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:DESIGN.mutedSoft }}/>
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nombre…"
        style={{ width:"100%", boxSizing:"border-box", fontSize:13, border:`1px solid ${DESIGN.borderStrong}`, borderRadius:8, padding:"8px 12px 8px 34px", fontFamily:DESIGN.font, outline:"none" }}/>
    </div>

    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
      <FilterPill active={instance==="todas"} onClick={()=>setInstance("todas")} label="Todas las instancias"/>
      {SOURCES_WITH_DATA.map(s => <FilterPill key={s.id} active={instance===s.id} onClick={()=>setInstance(s.id)} label={s.label}/>)}
    </div>

    {/* Categorías */}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:8, marginBottom:18 }}>
      <CategoryCard active={category==="todas"} label="Todas" count={ALL_ROWS.length} onClick={()=>setCategory("todas")}/>
      {BACKBONE_CATEGORIES.filter(c => c.count > 0).map(c =>
        <CategoryCard key={c.id} active={category===c.id} label={c.label} count={c.count} onClick={()=>setCategory(c.id)}/>
      )}
    </div>

    {/* Resultado: procs + funciones */}
    <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, overflow:"hidden", marginBottom:24 }}>
      <div style={{ padding:"9px 14px", borderBottom:`1px solid ${DESIGN.border}`, fontSize:12, color:DESIGN.muted, background:DESIGN.sunken }}>
        {rows.length} objeto{rows.length===1?"":"s"} encontrado{rows.length===1?"":"s"}
      </div>
      {rows.length === 0
        ? <div style={{ padding:24, textAlign:"center", color:DESIGN.muted, fontSize:13 }}>Sin resultados para los filtros seleccionados.</div>
        : rows.map((r,i) => {
            const cat = BACKBONE_CATEGORIES.find(c => c.id === r.category);
            return <button key={`${r.sourceId}-${r.type}-${r.name}-${i}`} onClick={()=>setSelected(r)} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 14px", width:"100%", border:"none", borderTop: i>0?`1px solid ${DESIGN.sunken}`:"none", background:"transparent", cursor:"pointer", fontFamily:DESIGN.font, textAlign:"left" }}
              onMouseEnter={e=>e.currentTarget.style.background=DESIGN.sunken}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{ fontSize:9.5, fontWeight:700, color:DESIGN.muted, background:DESIGN.sunken2, padding:"2px 7px", borderRadius:4, flexShrink:0, width:100, textAlign:"center" }}>{TYPE_LABEL[r.type]}</span>
              <span style={{ fontSize:13, color:DESIGN.ink, fontFamily:"'Courier New', monospace", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</span>
              <span style={{ fontSize:11, color:DESIGN.muted, flexShrink:0 }}>{r.sourceLabel}</span>
              {cat && <span style={{ fontSize:10.5, color:DESIGN.inkSoft, background:DESIGN.sunken2, padding:"2px 8px", borderRadius:6, flexShrink:0 }}>{cat.label}</span>}
            </button>;
          })}
    </div>

    {/* Triggers por tabla — agregado, no listado individual (miles de filas) */}
    <div style={{ fontSize:14, fontWeight:700, color:DESIGN.ink, marginBottom:10 }}>Triggers por tabla</div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:14, marginBottom:24 }}>
      {SOURCES_WITH_DATA.filter(s => s.triggersTablesCount > 0).map(s => {
        const maxN = s.triggersTop[0]?.n || 1;
        return <div key={s.id} style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, padding:"12px 14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, fontWeight:700, color:DESIGN.ink, marginBottom:2 }}>
            <span>{s.label}</span>
            <span style={{ color:DESIGN.muted, fontWeight:400 }}>{s.triggersTotal.toLocaleString("es")} triggers · {s.triggersTablesCount} tablas</span>
          </div>
          <div style={{ fontSize:10.5, color:DESIGN.muted, marginBottom:8 }}>Top 10 tablas con más triggers</div>
          {s.triggersTop.slice(0,10).map(t => <div key={t.table} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
            <span style={{ fontSize:11, color:DESIGN.inkSoft, width:150, flexShrink:0, fontFamily:"'Courier New', monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.table}</span>
            <div style={{ flex:1, background:DESIGN.sunken2, borderRadius:4, height:7, overflow:"hidden" }}>
              <div style={{ width:`${(t.n/maxN)*100}%`, height:"100%", background:"#546E7A" }}/>
            </div>
            <span style={{ fontSize:10.5, color:DESIGN.muted, width:26, textAlign:"right", flexShrink:0 }}>{t.n}</span>
          </div>)}
        </div>;
      })}
    </div>

    {/* Bases sin acceso — transparencia del gap de permisos */}
    <details style={{ fontSize:12.5, color:DESIGN.muted }}>
      <summary style={{ cursor:"pointer", fontWeight:700, color:DESIGN.inkSoft, marginBottom:8 }}>
        Bases conectadas sin permisos de metadata ({BACKBONE_NO_ACCESS.length})
      </summary>
      <div style={{ display:"grid", gap:6, marginTop:8 }}>
        {BACKBONE_NO_ACCESS.map((n,i) => <div key={i} style={{ display:"flex", gap:10, padding:"7px 12px", background:DESIGN.sunken, borderRadius:6, flexWrap:"wrap" }}>
          <span style={{ fontWeight:700, color:DESIGN.inkSoft, minWidth:150 }}>{n.instancia}</span>
          <span style={{ fontFamily:"'Courier New', monospace" }}>{n.db}</span>
          <span style={{ marginLeft:"auto", fontStyle:"italic" }}>{n.motivo}</span>
        </div>)}
      </div>
    </details>

    {selected && <ObjectDetailModal row={selected} onClose={()=>setSelected(null)}/>}
  </div>;
}

function ObjectDetailModal({ row, onClose }) {
  const cat = BACKBONE_CATEGORIES.find(c => c.id === row.category);
  return <div onClick={onClose} style={{ position:"fixed", inset:0, background:DESIGN.overlay, zIndex:200, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"60px 20px", overflowY:"auto" }}>
    <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:12, boxShadow:DESIGN.shadowDialog, maxWidth:640, width:"100%", padding:"18px 22px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:4 }}>
        <div>
          {cat && <div style={{ fontSize:11, fontWeight:700, color:DESIGN.muted, marginBottom:4 }}>{cat.label}</div>}
          <div style={{ fontSize:16, fontWeight:700, color:DESIGN.ink, fontFamily:"'Courier New', monospace" }}>{row.name}</div>
        </div>
        <CloseButton onClick={onClose}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"120px 1fr", rowGap:7, columnGap:10, fontSize:12.5, margin:"14px 0" }}>
        <span style={{ color:DESIGN.muted }}>Tipo:</span>
        <span style={{ color:DESIGN.ink, fontWeight:700 }}>{TYPE_LABEL[row.type]}{row.type==="fn" && row.typeCode ? ` (${row.typeCode})` : ""}</span>
        <span style={{ color:DESIGN.muted }}>Instancia:</span>
        <span style={{ color:DESIGN.ink, fontWeight:700 }}>{row.sourceLabel}</span>
        <span style={{ color:DESIGN.muted }}>Empresa:</span>
        <span style={{ color:DESIGN.ink }}>{row.empresa}</span>
        <span style={{ color:DESIGN.muted }}>Última modificación:</span>
        <span style={{ color:DESIGN.ink }}>{row.modified || "—"}</span>
        <span style={{ color:DESIGN.muted }}>Estado:</span>
        <span style={{ color: row.encrypted ? "#b45309" : "#16a34a", fontWeight:700 }}>
          {row.encrypted ? "○ Cifrado por el proveedor" : "● Definición disponible"}
        </span>
      </div>

      <div style={{ fontSize:11, fontWeight:700, color:DESIGN.muted, textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:6 }}>Definición SQL</div>
      {row.encrypted
        ? <div style={{ fontSize:12.5, color:DESIGN.inkSoft, background:DESIGN.sunken, borderRadius:8, padding:"12px 14px", fontStyle:"italic" }}>
            Este objeto está cifrado por el proveedor (<code>WITH ENCRYPTION</code>) — SQL Server no expone el cuerpo real ni al propio motor. No es un permiso pendiente: no hay definición que leer.
          </div>
        : <pre style={{ background:"#0f172a", color:"#e2e8f0", borderRadius:8, padding:"14px 16px", fontSize:11.5, lineHeight:1.6, overflow:"auto", maxHeight:340, fontFamily:"'Courier New', monospace", margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{row.definition}</pre>}
    </div>
  </div>;
}

function FilterPill({ active, onClick, label }) {
  return <button onClick={onClick} style={{ padding:"5px 12px", borderRadius:DESIGN.radiusPill, border:`1px solid ${active?DESIGN.ink:DESIGN.border}`, background:active?DESIGN.ink:"#fff", color:active?"#fff":DESIGN.inkSoft, fontSize:12, cursor:"pointer", fontFamily:DESIGN.font, whiteSpace:"nowrap" }}>
    {label}
  </button>;
}

function CategoryCard({ active, onClick, label, count }) {
  return <button onClick={onClick} style={{ textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, padding:"11px 14px", borderRadius:9, border:`1px solid ${active?DESIGN.ink:DESIGN.border}`, background:active?DESIGN.ink:"#fff", cursor:"pointer", fontFamily:DESIGN.font }}>
    <span style={{ fontSize:13, fontWeight:600, color:active?"#fff":DESIGN.ink }}>{label}</span>
    <span style={{ fontSize:14, fontWeight:700, color:active?"#fff":DESIGN.inkSoft }}>{count}</span>
  </button>;
}
