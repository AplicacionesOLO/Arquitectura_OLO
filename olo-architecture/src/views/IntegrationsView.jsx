// ═══════════════════════════════════════════════════════════════════════════
// VISTA · INTEGRACIONES
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { INTEGRATIONS, CAT_META, rowCategory, getModules,
         EFWBEVAL_MOD, EFWFEBECA_MOD, EFWSILLACA_MOD, EFWWMH_MOD,
         WMH_CR_MOD, EINTEGRA_VE_MOD, SFLBEVAL_MOD, SFLFEBECA_MOD, SFLSILLACA_MOD, SFLTREXA_MOD, SFLPRISMA_MOD,
         EFWBEVAL_INTEGRATIONS, EFWFEBECA_INTEGRATIONS,
         EFWSILLACA_INTEGRATIONS, EFWWMH_INTEGRATIONS,
         WMH_CR_INTEGRATIONS, EINTEGRA_VE_INTEGRATIONS,
         SFLBEVAL_INTEGRATIONS, SFLFEBECA_INTEGRATIONS, SFLSILLACA_INTEGRATIONS, SFLTREXA_INTEGRATIONS, SFLPRISMA_INTEGRATIONS } from "../data/integrations.js";

// Mapa de MOD.size para contadores de schema (no están en INTEGRATIONS global)
const SCHEMA_TABLE_COUNTS = {
  efwbeval:    () => EFWBEVAL_MOD.size,
  efwfebeca:   () => EFWFEBECA_MOD.size,
  efwsillaca:  () => EFWSILLACA_MOD.size,
  efwwmh:      () => EFWWMH_MOD.size,
  wmh_cr:      () => WMH_CR_MOD.size,
  eintegra_ve: () => EINTEGRA_VE_MOD.size,
  softland_beval: () => SFLBEVAL_MOD.size,
  softland_febeca: () => SFLFEBECA_MOD.size,
  softland_sillaca: () => SFLSILLACA_MOD.size,
  softland_trexa: () => SFLTREXA_MOD.size,
  softland_prisma: () => SFLPRISMA_MOD.size,
};
// Mapa de arrays de integraciones por schema (no van al array global)
const SCHEMA_ROWS = {
  efwbeval:    EFWBEVAL_INTEGRATIONS,
  efwfebeca:   EFWFEBECA_INTEGRATIONS,
  efwsillaca:  EFWSILLACA_INTEGRATIONS,
  efwwmh:      EFWWMH_INTEGRATIONS,
  wmh_cr:      WMH_CR_INTEGRATIONS,
  eintegra_ve: EINTEGRA_VE_INTEGRATIONS,
  softland_beval: SFLBEVAL_INTEGRATIONS,
  softland_febeca: SFLFEBECA_INTEGRATIONS,
  softland_sillaca: SFLSILLACA_INTEGRATIONS,
  softland_trexa: SFLTREXA_INTEGRATIONS,
  softland_prisma: SFLPRISMA_INTEGRATIONS,
};
import { ModuleChip, StatusBadge } from "../components/ui.jsx";
import { ERDiagram } from "../schemas/ERDiagram.jsx";
import { ERSchemaView } from "../schemas/ERSchemaView.jsx";
import { CrossSchemaView } from "../schemas/CrossSchemaView.jsx";
import { VeGlobalSummary } from "../schemas/VeGlobalSummary.jsx";

function IntegTable({ rows }) {
  const thS={padding:"10px 14px",color:"#666",fontWeight:700,letterSpacing:"0.05em",fontSize:11,textTransform:"uppercase"};
  const tdS={padding:"10px 14px",verticalAlign:"top"};
  if (!rows.length) return <div style={{ padding:"24px", textAlign:"center", color:"#888", fontSize:13 }}>Sin resultados para los filtros seleccionados.</div>;
  return <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
    <thead><tr style={{ background:"#fafafa", textAlign:"left" }}>
      <th style={thS}>Origen</th><th style={thS}>Destino</th><th style={thS}>Qué fluye</th><th style={{...thS,textAlign:"right"}}>Estado</th>
    </tr></thead>
    <tbody>{rows.map((i,idx)=><tr key={idx} style={{ borderTop:"1px solid #f0f0f0" }}>
      <td style={tdS}><ModuleChip code={i.from}/></td>
      <td style={tdS}><ModuleChip code={i.to}/></td>
      <td style={{...tdS,color:"#444",lineHeight:1.5}}>{i.what}</td>
      <td style={{...tdS,textAlign:"right"}}><StatusBadge status={i.status}/></td>
    </tr>)}</tbody>
  </table>;
}

// Categorías que forman el grupo Venezuela, organizadas por capa:
// WMS Venezuela = todo eFlow (incluye WMH, torre de control) · ERP Venezuela =
// todo Softland · middleware (eIntegra) y relaciones semánticas (cross-schema)
// quedan sueltos directamente bajo Venezuela, no dentro de WMS ni ERP.
const WMS_VE_CATS = ["efwbeval","efwfebeca","efwsillaca","efwwmh"];
const ERP_VE_CATS = ["softland_beval","softland_febeca","softland_sillaca","softland_trexa","softland_prisma"];
const VE_DIRECT_CATS = ["eintegra_ve","ve_cross"];
const VE_CATS = ["ve_global", ...WMS_VE_CATS, ...ERP_VE_CATS, ...VE_DIRECT_CATS];
// Todo lo que no es Venezuela se agrupa bajo Costa Rica (mismo patrón de
// grupo colapsable), con su propio "Global · Todos" (el ya existente "global").
const CR_CATS = Object.keys(CAT_META).filter(k => !VE_CATS.includes(k));

export function IntegrationsView({ searchQuery="" }) {
  const [cat, setCat] = useState("global");
  const [fFrom, setFFrom] = useState("*");
  const [fTo, setFTo] = useState("*");
  const [fStatus, setFStatus] = useState("*");
  const [fWhat, setFWhat] = useState(searchQuery||"");
  const [viewMode, setViewMode] = useState("table");
  const [crExpanded, setCrExpanded] = useState(true);
  const [veExpanded, setVeExpanded] = useState(false);
  const [wmsVeExpanded, setWmsVeExpanded] = useState(false);
  const [erpVeExpanded, setErpVeExpanded] = useState(false);
  // Sync external search into filter
  useEffect(()=>{ if(searchQuery) setFWhat(searchQuery); }, [searchQuery]);

  const handleCat = c => { setCat(c); setFFrom("*"); setFTo("*"); setFStatus("*"); setFWhat(""); };

  const baseRows = cat==="global" ? INTEGRATIONS : INTEGRATIONS.filter(r=>rowCategory(r)===cat);
  const filtered = baseRows.filter(r=>{
    if (fFrom!=="*" && r.from!==fFrom) return false;
    if (fTo!=="*" && r.to!==fTo) return false;
    if (fStatus!=="*" && r.status!==fStatus) return false;
    if (fWhat && !r.what.toLowerCase().includes(fWhat.toLowerCase())) return false;
    return true;
  });

  const fromOpts = getModules(cat);
  const toOpts   = getModules(cat);

  const selStyle = { fontSize:11, border:"1px solid #ddd", borderRadius:6, padding:"5px 8px", background:"#fff", color:"#333", cursor:"pointer", fontFamily:"inherit" };
  const inputStyle = { fontSize:11, border:"1px solid #ddd", borderRadius:6, padding:"5px 8px", background:"#fff", color:"#333", fontFamily:"inherit", minWidth:160 };

  return <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
    {/* Submenú lateral de categorías */}
    <nav style={{ width:215, minWidth:215, background:"#fff", border:"1px solid #e0e0e0", borderRadius:10, overflow:"hidden", flexShrink:0, position:"sticky", top:20 }}>
      <div style={{ padding:"10px 14px", borderBottom:"1px solid #f0f0f0", background:"#fafafa", fontSize:10, fontWeight:700, color:"#888", letterSpacing:"0.08em", textTransform:"uppercase" }}>Categoría</div>
      {/* ── Grupo Costa Rica (colapsable) — todo lo que no es Venezuela ── */}
      <div key="cr_group">
        <button onClick={()=>{ setCrExpanded(e=>!e); if(!crExpanded) handleCat("global"); }}
          style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 14px", border:"none",
            borderLeft:CR_CATS.includes(cat)?"3px solid #1D1D1B":"3px solid transparent",
            borderBottom:"1px solid #f5f5f5",
            background:CR_CATS.includes(cat)?"rgba(29,29,27,0.04)":"rgba(0,0,0,0.015)",
            cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", textAlign:"left" }}>
          <span style={{ fontSize:13 }}>🇨🇷</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, fontWeight:CR_CATS.includes(cat)?700:500, color:CR_CATS.includes(cat)?"#1D1D1B":"#444", lineHeight:1.35 }}>Costa Rica</div>
            {!crExpanded && <div style={{ fontSize:9, color:"#aaa" }}>ERP · Operación · Satélite · Suite</div>}
          </div>
          <span style={{ fontSize:11, color:"#aaa", marginRight:2 }}>{crExpanded?"▼":"▶"}</span>
        </button>
        {crExpanded && CR_CATS.map(key => {
          const m = CAT_META[key];
          const isA = cat===key;
          const count = key==="global"
            ? INTEGRATIONS.length
            : SCHEMA_TABLE_COUNTS[key]
              ? SCHEMA_TABLE_COUNTS[key]()
              : INTEGRATIONS.filter(r=>rowCategory(r)===key).length;
          return <button key={key} onClick={()=>handleCat(key)} style={{ display:"flex", alignItems:"center", gap:7, width:"100%", padding:"8px 14px 8px 24px", border:"none", borderLeft:isA?`3px solid ${m.color}`:"3px solid transparent", borderBottom:"1px solid #f5f5f5", background:isA?m.bg:"transparent", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", textAlign:"left" }}>
            <span style={{ fontSize:12, lineHeight:1 }}>{m.icon}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:10.5, fontWeight:isA?700:500, color:isA?m.color:"#555", lineHeight:1.35 }}>{key==="global"?"Global · Todos":m.label.split("·")[0].trim()}</div>
              {isA && key!=="global" && <div style={{ fontSize:9, color:m.color+"99", marginTop:1, lineHeight:1.3 }}>{m.label.split("·").slice(1).join("·").trim()}</div>}
            </div>
            <span style={{ fontSize:9.5, fontWeight:700, color:isA?m.color:"#999", background:isA?m.color+"15":"#f0f0f0", padding:"1px 5px", borderRadius:8, flexShrink:0, minWidth:22, textAlign:"center" }}>{count}</span>
          </button>;
        })}
      </div>

      {/* ── Grupo Venezuela (colapsable) ── */}
      <div key="ve_group">
        {/* Header del grupo */}
        <button onClick={()=>{ setVeExpanded(e=>!e); if(!veExpanded) handleCat("ve_global"); }}
          style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 14px", border:"none",
            borderLeft:VE_CATS.includes(cat)?"3px solid #dc2626":"3px solid transparent",
            borderBottom:"1px solid #f5f5f5",
            background:VE_CATS.includes(cat)?"rgba(220,38,38,0.04)":"rgba(0,0,0,0.015)",
            cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", textAlign:"left" }}>
          <span style={{ fontSize:13 }}>🇻🇪</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, fontWeight:VE_CATS.includes(cat)?700:500, color:VE_CATS.includes(cat)?"#dc2626":"#444", lineHeight:1.35 }}>Venezuela</div>
            {!veExpanded && <div style={{ fontSize:9, color:"#aaa" }}>WMS · ERP · Middleware</div>}
          </div>
          <span style={{ fontSize:11, color:"#aaa", marginRight:2 }}>{veExpanded?"▼":"▶"}</span>
        </button>
        {/* Sub-items Venezuela: Global · Todos (resumen agregado) · WMS Venezuela
            (eFlow) · ERP Venezuela (Softland) · middleware y relaciones
            semánticas sueltos, sin agrupar */}
        {veExpanded && <>
          {(() => {
            const vm = CAT_META.ve_global;
            const isVA = cat==="ve_global";
            return <button onClick={()=>handleCat("ve_global")}
              style={{ display:"flex", alignItems:"center", gap:7, width:"100%", padding:"8px 14px 8px 24px",
                border:"none", borderLeft:isVA?`3px solid ${vm.color}`:"3px solid transparent",
                borderBottom:"1px solid #f5f5f5", background:isVA?vm.bg:"transparent",
                cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", textAlign:"left" }}>
              <span style={{ fontSize:13, lineHeight:1 }}>{vm.icon}</span>
              <span style={{ fontSize:10.5, fontWeight:isVA?700:600, color:isVA?vm.color:"#444", flex:1 }}>Global · Todos</span>
            </button>;
          })()}
          {[
                { id:"wms", label:"WMS Venezuela", icon:"◒", color:"#0891b2", cats:WMS_VE_CATS, expanded:wmsVeExpanded, toggle:setWmsVeExpanded },
                { id:"erp", label:"ERP Venezuela", icon:"⬡", color:"#b45309", cats:ERP_VE_CATS, expanded:erpVeExpanded, toggle:setErpVeExpanded },
              ].map(grp => {
                const groupActive = grp.cats.includes(cat);
                const groupCount = grp.cats.reduce((s,k)=>s+(SCHEMA_TABLE_COUNTS[k]?.()??0), 0);
                return <div key={grp.id}>
                  <button onClick={()=>{ grp.toggle(e=>!e); if(!grp.expanded) handleCat(grp.cats[0]); }}
                    style={{ display:"flex", alignItems:"center", gap:7, width:"100%", padding:"8px 14px 8px 24px",
                      border:"none", borderLeft:groupActive?`3px solid ${grp.color}`:"3px solid transparent",
                      borderBottom:"1px solid #f5f5f5", background:groupActive?grp.color+"0a":"transparent",
                      cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", textAlign:"left" }}>
                    <span style={{ fontSize:12, lineHeight:1, color:groupActive?grp.color:"#999" }}>{grp.icon}</span>
                    <span style={{ fontSize:10.5, fontWeight:groupActive?700:500, color:groupActive?grp.color:"#555", flex:1 }}>{grp.label}</span>
                    <span style={{ fontSize:9.5, fontWeight:700, color:groupActive?grp.color:"#bbb", background:groupActive?grp.color+"15":"#f5f5f5", padding:"1px 5px", borderRadius:8, flexShrink:0 }}>{groupCount}</span>
                    <span style={{ fontSize:10, color:"#bbb" }}>{grp.expanded?"▼":"▶"}</span>
                  </button>
                  {grp.expanded && grp.cats.map(vk => {
                    const vm = CAT_META[vk]; if(!vm) return null;
                    const isVA = cat===vk;
                    const vc = SCHEMA_TABLE_COUNTS[vk]?.() ?? 0;
                    return <button key={vk} onClick={()=>handleCat(vk)}
                      style={{ display:"flex", alignItems:"center", gap:7, width:"100%", padding:"7px 14px 7px 42px",
                        border:"none", borderLeft:isVA?`3px solid ${vm.color}`:"3px solid transparent",
                        borderBottom:"1px solid #f5f5f5", background:isVA?vm.bg:"transparent",
                        cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", textAlign:"left" }}>
                      <span style={{ fontSize:11, lineHeight:1 }}>{vm.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:10, fontWeight:isVA?700:400, color:isVA?vm.color:"#666", lineHeight:1.35 }}>
                          {vm.label.split("·")[1]?.trim() || vm.label.split("—")[1]?.trim() || vk}
                        </div>
                      </div>
                      <span style={{ fontSize:9, fontWeight:700, color:isVA?vm.color:"#bbb", background:isVA?vm.color+"15":"#f5f5f5", padding:"1px 5px", borderRadius:8, flexShrink:0 }}>{vc}</span>
                    </button>;
                  })}
                </div>;
              })}
              {/* Middleware y relaciones semánticas — sueltos bajo Venezuela */}
              {VE_DIRECT_CATS.map(vk => {
                const vm = CAT_META[vk]; if(!vm) return null;
                const isVA = cat===vk;
                const vc = vk==="ve_cross" ? 0 : (SCHEMA_TABLE_COUNTS[vk]?.() ?? 0);
                return <button key={vk} onClick={()=>handleCat(vk)}
                  style={{ display:"flex", alignItems:"center", gap:7, width:"100%", padding:"8px 14px 8px 24px",
                    border:"none", borderLeft:isVA?`3px solid ${vm.color}`:"3px solid transparent",
                    borderBottom:"1px solid #f5f5f5", background:isVA?vm.bg:"transparent",
                    cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", textAlign:"left" }}>
                  <span style={{ fontSize:12, lineHeight:1 }}>{vm.icon}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:10.5, fontWeight:isVA?700:400, color:isVA?vm.color:"#666", lineHeight:1.35 }}>
                      {vm.label.split("·")[1]?.trim() || vm.label.split("—")[1]?.trim() || vk}
                    </div>
                  </div>
                  <span style={{ fontSize:9.5, fontWeight:700, color:isVA?vm.color:"#bbb", background:isVA?vm.color+"15":"#f5f5f5", padding:"1px 5px", borderRadius:8, flexShrink:0 }}>
                    {vk==="ve_cross"?"🔀":vc}
                  </span>
                </button>;
              })}
            </>}
      </div>
    </nav>

    {/* Contenido principal */}
    <div style={{ flex:1, minWidth:0 }}>

    {/* Venezuela: resumen agregado / cross-schema */}
    {cat==="ve_global" ? <VeGlobalSummary onNavigate={handleCat}/> :
    cat==="ve_cross" ? <CrossSchemaView/> :

    /* Schema ER views (sro / sco / efw / wmh_cr / ve schemas) */
    (cat==="sro"||cat==="sco"||cat==="efw"||cat==="wmh_cr"||cat==="efwbeval"||cat==="efwfebeca"||cat==="efwsillaca"||cat==="efwwmh"||cat==="eintegra_ve"||cat==="softland_beval"||cat==="softland_febeca"||cat==="softland_sillaca"||cat==="softland_trexa"||cat==="softland_prisma")
      ? <ERSchemaView schema={cat} searchQuery={searchQuery} overrideRows={SCHEMA_ROWS[cat]||null}/> : <>

    {cat!=="global" && <div style={{ background:CAT_META[cat].bg, border:`1px solid ${CAT_META[cat].border}`, borderLeft:`3px solid ${CAT_META[cat].color}`, borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#555", lineHeight:1.5 }}>
      <b style={{ color:CAT_META[cat].color }}>{CAT_META[cat].icon} {CAT_META[cat].label}</b>
      {cat==="erp"   && " — integraciones intra-suite declaradas explícitamente en los manuales oficiales."}
      {cat==="ops"   && " — integraciones entre ERP Softland y la plataforma eflow Cloud Suite."}
      {cat==="sat"   && " — integraciones con sistemas externos inferidos por contexto."}
      {cat==="suite" && " — integraciones de los clusters del ecosistema OLO."}
    </div>}
    {cat==="global" && <div style={{ background:"rgba(41,128,185,0.06)", border:"1px solid rgba(41,128,185,0.22)", borderLeft:"3px solid #2980b9", borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#666", lineHeight:1.6 }}>
      Las integraciones intra-Softland están <b style={{ color:"#27ae60" }}>declaradas explícitamente</b> en la sección "Integración" de cada manual.
    </div>}

    <div style={{ display:"flex", gap:6, marginBottom:14, alignItems:"center" }}>
      <span style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:"0.06em", textTransform:"uppercase", marginRight:4 }}>Vista:</span>
      {[["table","📋 Tabla"],["relations","⬡ Diagrama ER"]].map(([mode,label])=>{
        const isA = viewMode===mode;
        return <button key={mode} onClick={()=>setViewMode(mode)} style={{ fontSize:11, fontWeight:isA?700:400, color:isA?"#00838f":"#666", background:isA?"#e0f7fa":"transparent", border:`1px solid ${isA?"#00838f55":"#ddd"}`, borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>{label}</button>;
      })}
    </div>

    <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center", padding:"10px 14px", background:"#fafafa", border:"1px solid #e8e8e8", borderRadius:8 }}>
      <span style={{ fontSize:11, color:"#888", fontWeight:600, marginRight:4 }}>Filtros:</span>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        <label style={{ fontSize:9, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Origen</label>
        <select value={fFrom} onChange={e=>setFFrom(e.target.value)} style={selStyle}>
          <option value="*">Todos</option>
          {fromOpts.filter(c=>c!=="*").map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        <label style={{ fontSize:9, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Destino</label>
        <select value={fTo} onChange={e=>setFTo(e.target.value)} style={selStyle}>
          <option value="*">Todos</option>
          {toOpts.filter(c=>c!=="*").map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        <label style={{ fontSize:9, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Estado</label>
        <select value={fStatus} onChange={e=>setFStatus(e.target.value)} style={selStyle}>
          <option value="*">Todos</option>
          <option value="confirmed">Confirmado</option>
          <option value="partial">Parcial</option>
          <option value="inferred">Inferido</option>
        </select>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        <label style={{ fontSize:9, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Qué fluye</label>
        <input value={fWhat} onChange={e=>setFWhat(e.target.value)} placeholder="buscar…" style={inputStyle}/>
      </div>
      <div style={{ marginLeft:"auto", display:"flex", alignItems:"flex-end", paddingBottom:1 }}>
        <span style={{ fontSize:11, color:"#888" }}><b style={{ color:"#444" }}>{filtered.length}</b> / {baseRows.length} registros</span>
      </div>
      {(fFrom!=="*"||fTo!=="*"||fStatus!=="*"||fWhat) && <button onClick={()=>{setFFrom("*");setFTo("*");setFStatus("*");setFWhat("");}} style={{ fontSize:10, color:"#c0392b", background:"none", border:"1px solid #ef9a9a", borderRadius:5, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit" }}>✕ Limpiar</button>}
    </div>

    {viewMode==="table"
      ? <div style={{ background:"#ffffff", border:"1px solid #e0e0e0", borderRadius:10, overflow:"hidden", overflowX:"auto" }}><IntegTable rows={filtered}/></div>
      : <ERDiagram rows={filtered}/>
    }
    </>}

    </div>
  </div>;
}
