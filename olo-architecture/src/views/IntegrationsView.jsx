// ═══════════════════════════════════════════════════════════════════════════
// VISTA · INTEGRACIONES
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { INTEGRATIONS, CAT_META, rowCategory, getModules } from "../data/integrations.js";
import { ModuleChip, StatusBadge } from "../components/ui.jsx";
import { ERDiagram } from "../schemas/ERDiagram.jsx";
import { ERSchemaView } from "../schemas/ERSchemaView.jsx";

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

export function IntegrationsView({ searchQuery="" }) {
  const [cat, setCat] = useState("global");
  const [fFrom, setFFrom] = useState("*");
  const [fTo, setFTo] = useState("*");
  const [fStatus, setFStatus] = useState("*");
  const [fWhat, setFWhat] = useState(searchQuery||"");
  const [viewMode, setViewMode] = useState("table");
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
      {Object.entries(CAT_META).map(([key,m])=>{
        const isA = cat===key;
        const count = key==="global" ? INTEGRATIONS.length : INTEGRATIONS.filter(r=>rowCategory(r)===key).length;
        return <button key={key} onClick={()=>handleCat(key)} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"10px 14px", border:"none", borderLeft:isA?`3px solid ${m.color}`:"3px solid transparent", borderBottom:"1px solid #f5f5f5", background:isA?m.bg:"transparent", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", textAlign:"left" }}>
          <span style={{ fontSize:14, lineHeight:1 }}>{m.icon}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, fontWeight:isA?700:500, color:isA?m.color:"#555", lineHeight:1.35 }}>{key==="global"?"Global · todos":m.label.split("·")[0].trim()}</div>
            {isA && key!=="global" && <div style={{ fontSize:9, color:m.color+"99", marginTop:1, lineHeight:1.3 }}>{m.label.split("·").slice(1).join("·").trim()}</div>}
          </div>
          <span style={{ fontSize:10, fontWeight:700, color:isA?m.color:"#999", background:isA?m.color+"15":"#f0f0f0", padding:"1px 6px", borderRadius:8, flexShrink:0, minWidth:24, textAlign:"center" }}>{count}</span>
        </button>;
      })}
    </nav>

    {/* Contenido principal */}
    <div style={{ flex:1, minWidth:0 }}>

    {/* SRO: vista dedicada */}
    {(cat==="sro"||cat==="sco"||cat==="efw") ? <ERSchemaView schema={cat} searchQuery={searchQuery}/> : <>

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
        return <button key={mode} onClick={()=>setViewMode(mode)} style={{ fontSize:11, fontWeight:isA?700:400, color:isA?"#1D4ED8":"#666", background:isA?"#EFF6FF":"transparent", border:`1px solid ${isA?"#BFDBFE":"#ddd"}`, borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>{label}</button>;
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
