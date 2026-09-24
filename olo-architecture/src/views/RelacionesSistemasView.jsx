// ═══════════════════════════════════════════════════════════════════════════
// VISTA · RELACIONES DE SISTEMAS — cómo se relacionan sistemas/tablas/campos
// por silo. Cuelga de la jerarquía Costa Rica / Venezuela · sistema. Dos modos
// equivalentes: Por proceso (navega por silo → sistema) y Buscar dato (busca
// un campo/tabla y salta directo a su ER). Panel lateral Directorio / Por
// proceso, colapsable. Layout homologado con el estándar del Grupo — el
// contenido (silos, sistemas, tablas) es propio de OLO.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useMemo, useRef } from "react";
import { CAT_META } from "../data/integrations.js";
import { ERSchemaView } from "../schemas/ERSchemaView.jsx";
import { CrossSchemaView } from "../schemas/CrossSchemaView.jsx";
import { VeGlobalSummary } from "../schemas/VeGlobalSummary.jsx";
import { ListIcon, SitemapIcon, ExpandIcon, ContractIcon, SearchIcon } from "../components/icons.jsx";
import { DESIGN } from "../data/constants.js";

import { SRO_TABLE_DEFS } from "../data/sro.js";
import { SCO_TABLE_DEFS } from "../data/sco.js";
import { EFW_TABLE_DEFS } from "../data/efw.js";
import { WMH_CR_TABLE_DEFS } from "../data/wmh_cr.js";
import { EFWBEVAL_TABLE_DEFS } from "../data/beval_ve.js";
import { EFWFEBECA_TABLE_DEFS } from "../data/febeca_ve.js";
import { EFWSILLACA_TABLE_DEFS } from "../data/sillaca_ve.js";
import { EFWWMH_TABLE_DEFS } from "../data/wmh_ve.js";
import { SFLBEVAL_TABLE_DEFS } from "../data/softland_beval_ve.js";
import { SFLFEBECA_TABLE_DEFS } from "../data/softland_febeca_ve.js";
import { SFLSILLACA_TABLE_DEFS } from "../data/softland_sillaca_ve.js";
import { SFLTREXA_TABLE_DEFS } from "../data/softland_trexa_ve.js";
import { SFLPRISMA_TABLE_DEFS } from "../data/softland_prisma_ve.js";
import { EINTEGRA_VE_TABLE_DEFS } from "../data/eintegra_ve.js";
import { EFW_CONFIG_TABLE_DEFS } from "../data/efw_config.js";

const CR_CATS = ["efw_config", "sro", "sco", "efw", "wmh_cr"];
const WMS_VE_CATS = ["efwbeval", "efwfebeca", "efwsillaca", "efwwmh"];
const ERP_VE_CATS = ["softland_beval", "softland_febeca", "softland_sillaca", "softland_trexa", "softland_prisma"];
const SCHEMA_ER_CATS = [...CR_CATS, ...WMS_VE_CATS, ...ERP_VE_CATS, "eintegra_ve"]; // ve_cross/ve_global no son TABLE_DEFS de un solo schema

const TD_BY_CAT = {
  efw_config: EFW_CONFIG_TABLE_DEFS,
  sro: SRO_TABLE_DEFS, sco: SCO_TABLE_DEFS, efw: EFW_TABLE_DEFS, wmh_cr: WMH_CR_TABLE_DEFS,
  efwbeval: EFWBEVAL_TABLE_DEFS, efwfebeca: EFWFEBECA_TABLE_DEFS, efwsillaca: EFWSILLACA_TABLE_DEFS, efwwmh: EFWWMH_TABLE_DEFS,
  softland_beval: SFLBEVAL_TABLE_DEFS, softland_febeca: SFLFEBECA_TABLE_DEFS, softland_sillaca: SFLSILLACA_TABLE_DEFS,
  softland_trexa: SFLTREXA_TABLE_DEFS, softland_prisma: SFLPRISMA_TABLE_DEFS, eintegra_ve: EINTEGRA_VE_TABLE_DEFS,
};

function tableCount(cat) { return Object.keys(TD_BY_CAT[cat] || {}).length; }
const TOTAL_TABLES = SCHEMA_ER_CATS.reduce((sum, c) => sum + tableCount(c), 0);

// Leyenda de tipo de sistema — agrupa los mismos silos que ya existen en el
// panel "Por proceso" (Costa Rica / Venezuela·WMS / Venezuela·ERP / Middleware),
// solo como resumen visual. No introduce ni reorganiza datos.
const SYSTEM_TYPE_LEGEND = [
  { label:"Costa Rica · Operación (WMS)", color:"#546E7A" },
  { label:"Venezuela · WMS", color:"#0891b2" },
  { label:"Venezuela · ERP (Softland)", color:"#b45309" },
  { label:"Middleware (eIntegra)", color:"#6366f1" },
];

function routeFor(cat) {
  if (CR_CATS.includes(cat)) return ["Costa Rica", CAT_META[cat]?.label.split("—")[0].trim() || cat];
  if (WMS_VE_CATS.includes(cat)) return ["Venezuela", "WMS", CAT_META[cat]?.label.split("—")[0].trim() || cat];
  if (ERP_VE_CATS.includes(cat)) return ["Venezuela", "ERP", CAT_META[cat]?.label.split("—")[0].trim() || cat];
  if (cat === "eintegra_ve") return ["Venezuela", "Middleware"];
  return [cat];
}

function buildSearchIndex() {
  const rows = [];
  SCHEMA_ER_CATS.forEach(cat => {
    const td = TD_BY_CAT[cat] || {};
    Object.entries(td).forEach(([table, def]) => {
      rows.push({ cat, table, field:null, isTable:true });
      (def.cols || []).forEach(c => {
        const field = c.split("→")[0];
        rows.push({ cat, table, field, isTable:false });
      });
    });
  });
  return rows;
}
const SEARCH_INDEX = buildSearchIndex();

const Breadcrumb = ({ parts }) => <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, color:DESIGN.muted, fontFamily:DESIGN.font, marginBottom:12, flexWrap:"wrap" }}>
  {parts.map((p, i) => <span key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
    {i>0 && <span style={{ color:DESIGN.mutedSoft }}>›</span>}
    <span>{p}</span>
  </span>)}
</div>;

export function RelacionesSistemasView() {
  const [modo, setModo] = useState("proceso"); // "proceso" | "buscar"
  const [panelView, setPanelView] = useState("proceso"); // "directorio" | "proceso"
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [cat, setCat] = useState("efw_config");
  const [crExpanded, setCrExpanded] = useState(true);
  const [veExpanded, setVeExpanded] = useState(false);
  const [wmsVeExpanded, setWmsVeExpanded] = useState(false);
  const [erpVeExpanded, setErpVeExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [focusTable, setFocusTable] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef(null);

  const toggleFullscreen = () => {
    if (!fullscreen) { containerRef.current?.requestFullscreen?.(); setFullscreen(true); }
    else { document.exitFullscreen?.(); setFullscreen(false); }
  };

  const openTable = (c, table) => { setCat(c); setFocusTable(table); setModo("proceso"); };

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches = SEARCH_INDEX.filter(r =>
      r.table.toLowerCase().includes(q) || (r.field && r.field.toLowerCase().includes(q))
    );
    const byTable = new Map();
    matches.forEach(m => {
      const key = `${m.cat}::${m.table}`;
      if (!byTable.has(key)) byTable.set(key, { cat:m.cat, table:m.table, fields:new Set() });
      if (m.field) byTable.get(key).fields.add(m.field);
    });
    return [...byTable.values()].sort((a,b) => a.table.localeCompare(b.table)).slice(0, 60);
  }, [query]);

  const catBreadcrumb = routeFor(cat);

  const navBtn = (active, color) => ({
    display:"flex", alignItems:"center", gap:7, width:"100%", padding:"8px 14px", border:"none",
    borderLeft:`3px solid ${active?color:"transparent"}`, borderBottom:`1px solid ${DESIGN.sunken}`,
    background:active?color+"0d":"transparent", cursor:"pointer", fontFamily:DESIGN.font, textAlign:"left", fontSize:12.5,
  });

  return <div ref={containerRef} style={{ background: fullscreen?DESIGN.surface:"transparent", padding: fullscreen?20:0, minHeight: fullscreen?"100vh":"auto" }}>
    {/* Modo */}
    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
      <span style={{ fontSize:13, fontWeight:700, color:DESIGN.mutedSoft, marginRight:2 }}>Modo</span>
      <div style={{ display:"flex", background:DESIGN.sunken2, borderRadius:8, padding:3, gap:2 }}>
        {[
          { id:"proceso", label:"Por proceso" },
          { id:"buscar",  label:"Buscar dato" },
        ].map(m => {
          const active = modo===m.id;
          return <button key={m.id} onClick={()=>setModo(m.id)} style={{ padding:"6px 14px", borderRadius:6, border:"none", background:active?"#fff":"transparent", color:active?DESIGN.ink:DESIGN.muted, fontWeight:active?700:400, fontSize:13, cursor:"pointer", fontFamily:DESIGN.font, boxShadow:active?"0 1px 2px rgba(0,0,0,.08)":"none" }}>
            {m.label}
          </button>;
        })}
      </div>
      <button onClick={toggleFullscreen} title={fullscreen?"Salir de pantalla completa":"Pantalla completa"} style={{ marginLeft:"auto", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:8, color:DESIGN.inkSoft, cursor:"pointer", padding:"7px 10px", fontSize:14, lineHeight:1 }}>
        {fullscreen ? <ContractIcon/> : <ExpandIcon/>}
      </button>
    </div>

    {/* Leyenda de tipo de sistema */}
    <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:14, flexWrap:"wrap", paddingBottom:12, borderBottom:`1px solid ${DESIGN.sunken}` }}>
      {SYSTEM_TYPE_LEGEND.map(l => (
        <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:7, height:7, borderRadius:2, background:l.color, flexShrink:0 }}/>
          <span style={{ fontSize:14, color:"#475569" }}>{l.label}</span>
        </div>
      ))}
      <span style={{ marginLeft:"auto", fontSize:12, color:DESIGN.muted }}>{SCHEMA_ER_CATS.length} sistemas · {TOTAL_TABLES} tablas mapeadas</span>
    </div>

    {modo === "buscar" ? (
      <div>
        <div style={{ position:"relative", maxWidth:420, marginBottom:16 }}>
          <SearchIcon style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:DESIGN.mutedSoft }}/>
          <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nombre de tabla o campo…"
            style={{ width:"100%", boxSizing:"border-box", fontSize:14, border:`1px solid ${DESIGN.borderStrong}`, borderRadius:8, padding:"9px 12px 9px 34px", fontFamily:DESIGN.font, outline:"none" }}/>
        </div>
        {!query.trim() && <div style={{ fontSize:13, color:DESIGN.muted }}>Escribe el nombre de una tabla o un campo para ver en qué sistemas aparece y saltar directo a su diagrama ER.</div>}
        {query.trim() && searchResults.length === 0 && <div style={{ fontSize:13, color:DESIGN.muted }}>Sin resultados para "{query}".</div>}
        <div style={{ display:"grid", gap:8 }}>
          {searchResults.map((r,i) => {
            const m = CAT_META[r.cat];
            return <button key={i} onClick={()=>openTable(r.cat, r.table)} style={{ textAlign:"left", display:"flex", alignItems:"center", gap:12, background:"#fff", border:`1px solid ${DESIGN.border}`, borderLeft:`3px solid ${m?.color||DESIGN.muted}`, borderRadius:8, padding:"10px 14px", cursor:"pointer", fontFamily:"inherit" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:DESIGN.ink }}>{r.table}</div>
                <div style={{ fontSize:11, color:DESIGN.muted, marginTop:2 }}>{routeFor(r.cat).join(" › ")}{r.fields.size>0 ? ` · campo: ${[...r.fields].slice(0,4).join(", ")}` : ""}</div>
              </div>
              <span style={{ fontSize:11, color:m?.color, background:(m?.color||"#888")+"15", padding:"2px 8px", borderRadius:6, flexShrink:0 }}>Abrir ER ›</span>
            </button>;
          })}
        </div>
      </div>
    ) : (
      <div style={{ display:"flex", gap:0, alignItems:"flex-start" }}>
        {/* Panel lateral: Directorio / Por proceso, colapsable */}
        <div style={{ width:panelCollapsed?26:270, minWidth:panelCollapsed?26:270, transition:"width 0.15s, min-width 0.15s", marginRight:16, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, overflow:"hidden", flexShrink:0, position:"sticky", top:20 }}>
          {panelCollapsed
            ? <button onClick={()=>setPanelCollapsed(false)} title="Expandir panel" style={{ width:"100%", height:120, background:"transparent", border:"none", color:DESIGN.mutedSoft, cursor:"pointer" }}>›</button>
            : <>
              <div style={{ display:"flex", borderBottom:`1px solid ${DESIGN.border}` }}>
                {[["proceso","Por proceso",SitemapIcon],["directorio","Directorio",ListIcon]].map(([id,label,Icon]) => {
                  const active = panelView===id;
                  return <button key={id} onClick={()=>setPanelView(id)} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 6px", border:"none", background:active?DESIGN.sunken2:"#fff", color:active?DESIGN.ink:DESIGN.muted, fontWeight:active?700:400, fontSize:11.5, cursor:"pointer", fontFamily:DESIGN.font }}>
                    <Icon style={{ fontSize:13 }}/>{label}
                  </button>;
                })}
                <button onClick={()=>setPanelCollapsed(true)} title="Colapsar panel" style={{ width:26, background:"#fff", border:"none", borderLeft:`1px solid ${DESIGN.border}`, color:DESIGN.mutedSoft, cursor:"pointer" }}>‹</button>
              </div>

              {panelView === "directorio"
                ? <div>
                    {[...CR_CATS, ...WMS_VE_CATS, ...ERP_VE_CATS, "eintegra_ve"].map(c => {
                      const m = CAT_META[c]; if (!m) return null;
                      const active = cat===c;
                      return <button key={c} onClick={()=>{ setCat(c); setFocusTable(null); }} style={navBtn(active, m.color)}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:m.color, flexShrink:0 }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:active?700:400, color:active?m.color:DESIGN.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.label.split("—")[0].trim()}</div>
                          <div style={{ fontSize:10, color:DESIGN.muted }}>{routeFor(c).join(" › ")}</div>
                        </div>
                        <span style={{ fontSize:9.5, fontWeight:700, color:active?m.color:DESIGN.muted, background:active?m.color+"15":DESIGN.sunken2, padding:"1px 6px", borderRadius:8, flexShrink:0 }}>{tableCount(c)}</span>
                      </button>;
                    })}
                  </div>
                : <div>
                    {/* Costa Rica */}
                    <button onClick={()=>{ setCrExpanded(e=>!e); if(!crExpanded){ setCat(CR_CATS[0]); } }} style={navBtn(CR_CATS.includes(cat), DESIGN.ink)}>
                      <span style={{ flex:1 }}>Costa Rica</span>
                      <span style={{ fontSize:11, color:DESIGN.mutedSoft }}>{crExpanded?"▼":"▶"}</span>
                    </button>
                    {crExpanded && CR_CATS.map(c => {
                      const m = CAT_META[c]; const active = cat===c;
                      return <button key={c} onClick={()=>{ setCat(c); setFocusTable(null); }} style={{ ...navBtn(active, m.color), paddingLeft:26 }}>
                        <span style={{ fontSize:12 }}>{m.icon}</span>
                        <span style={{ flex:1, color:active?m.color:DESIGN.inkSoft, fontWeight:active?700:400 }}>{m.label.split("—")[0].trim()}</span>
                      </button>;
                    })}
                    {/* Venezuela */}
                    <button onClick={()=>{ setVeExpanded(e=>!e); if(!veExpanded){ setCat("eintegra_ve"); } }} style={navBtn(veExpanded, "#dc2626")}>
                      <span style={{ flex:1 }}>Venezuela</span>
                      <span style={{ fontSize:11, color:DESIGN.mutedSoft }}>{veExpanded?"▼":"▶"}</span>
                    </button>
                    {veExpanded && <>
                      {[
                        { id:"wms", label:"WMS Venezuela", cats:WMS_VE_CATS, expanded:wmsVeExpanded, toggle:setWmsVeExpanded },
                        { id:"erp", label:"ERP Venezuela", cats:ERP_VE_CATS, expanded:erpVeExpanded, toggle:setErpVeExpanded },
                      ].map(grp => <div key={grp.id}>
                        <button onClick={()=>{ grp.toggle(e=>!e); if(!grp.expanded) setCat(grp.cats[0]); }} style={{ ...navBtn(grp.cats.includes(cat), "#dc2626"), paddingLeft:26 }}>
                          <span style={{ flex:1 }}>{grp.label}</span>
                          <span style={{ fontSize:10, color:DESIGN.mutedSoft }}>{grp.expanded?"▼":"▶"}</span>
                        </button>
                        {grp.expanded && grp.cats.map(c => {
                          const m = CAT_META[c]; if (!m) return null; const active = cat===c;
                          return <button key={c} onClick={()=>{ setCat(c); setFocusTable(null); }} style={{ ...navBtn(active, m.color), paddingLeft:42 }}>
                            <span style={{ flex:1, fontSize:11.5, color:active?m.color:DESIGN.inkSoft, fontWeight:active?700:400 }}>{m.label.split("—")[1]?.trim() || m.label}</span>
                          </button>;
                        })}
                      </div>)}
                      <button onClick={()=>{ setCat("eintegra_ve"); setFocusTable(null); }} style={{ ...navBtn(cat==="eintegra_ve", CAT_META.eintegra_ve.color), paddingLeft:26 }}>
                        <span style={{ flex:1, color:cat==="eintegra_ve"?CAT_META.eintegra_ve.color:DESIGN.inkSoft, fontWeight:cat==="eintegra_ve"?700:400 }}>Middleware (eIntegra)</span>
                      </button>
                      <button onClick={()=>{ setCat("ve_cross"); setFocusTable(null); }} style={{ ...navBtn(cat==="ve_cross", CAT_META.ve_cross.color), paddingLeft:26 }}>
                        <span style={{ flex:1, color:cat==="ve_cross"?CAT_META.ve_cross.color:DESIGN.inkSoft, fontWeight:cat==="ve_cross"?700:400 }}>Relaciones cross-schema</span>
                      </button>
                      <button onClick={()=>{ setCat("ve_global"); setFocusTable(null); }} style={{ ...navBtn(cat==="ve_global", CAT_META.ve_global.color), paddingLeft:26 }}>
                        <span style={{ flex:1, color:cat==="ve_global"?CAT_META.ve_global.color:DESIGN.inkSoft, fontWeight:cat==="ve_global"?700:400 }}>Global · Todos (VE)</span>
                      </button>
                    </>}
                  </div>}
            </>}
        </div>

        {/* Contenido */}
        <div style={{ flex:1, minWidth:0 }}>
          <Breadcrumb parts={cat==="ve_cross" ? ["Venezuela","Relaciones cross-schema"] : cat==="ve_global" ? ["Venezuela","Global · Todos"] : catBreadcrumb}/>
          {cat === "ve_global" ? <VeGlobalSummary onNavigate={setCat}/>
            : cat === "ve_cross" ? <CrossSchemaView/>
            : <>
                <div style={{ fontSize:12, color:DESIGN.muted, marginBottom:10 }}>Diagrama ER · {tableCount(cat)} tablas</div>
                <ERSchemaView schema={cat} focusTable={focusTable}/>
              </>}
        </div>
      </div>
    )}
  </div>;
}
