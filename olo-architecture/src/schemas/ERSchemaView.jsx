// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA · ERSchemaView — Orquestador de schema ER (sro / sco / efw)
// (previously SROERView)
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { SRO_GROUPS, SRO_TABLE_DEFS, SRO_COLORS, SRO_MOD, RELATION_META } from "../data/sro.js";
import { SCO_GROUPS, SCO_TABLE_DEFS, SCO_COLORS, SCO_MOD } from "../data/sco.js";
import { EFW_GROUPS, EFW_TABLE_DEFS, EFW_COLORS, EFW_MOD } from "../data/efw.js";
import { EFWBEVAL_GROUPS,   EFWBEVAL_TABLE_DEFS,   EFWBEVAL_COLORS,   EFWBEVAL_MOD   } from "../data/beval_ve.js";
import { EFWFEBECA_GROUPS,  EFWFEBECA_TABLE_DEFS,  EFWFEBECA_COLORS,  EFWFEBECA_MOD  } from "../data/febeca_ve.js";
import { EFWSILLACA_GROUPS, EFWSILLACA_TABLE_DEFS, EFWSILLACA_COLORS, EFWSILLACA_MOD } from "../data/sillaca_ve.js";
import { EFWWMH_GROUPS,    EFWWMH_TABLE_DEFS,    EFWWMH_COLORS,    EFWWMH_MOD    } from "../data/wmh_ve.js";
import { SFLBEVAL_GROUPS, SFLBEVAL_TABLE_DEFS, SFLBEVAL_COLORS, SFLBEVAL_MOD } from "../data/softland_beval_ve.js";
import { WMH_CR_GROUPS, WMH_CR_TABLE_DEFS, WMH_CR_COLORS, WMH_CR_MOD } from "../data/wmh_cr.js";
import { EINTEGRA_VE_GROUPS, EINTEGRA_VE_TABLE_DEFS, EINTEGRA_VE_COLORS, EINTEGRA_VE_MOD } from "../data/eintegra_ve.js";
import { INTEGRATIONS } from "../data/integrations.js";
import { EREntityCard } from "./EREntityCard.jsx";
import { ERDiagramRelational } from "./ERDiagramRelational.jsx";
import { ERDiagram } from "./ERDiagram.jsx";

export function ERSchemaView({ schema="sro", searchQuery="", overrideRows=null }) {
  const GR  = schema==="sco"       ? SCO_GROUPS
            : schema==="efw"       ? EFW_GROUPS
            : schema==="efwbeval"  ? EFWBEVAL_GROUPS
            : schema==="efwfebeca" ? EFWFEBECA_GROUPS
            : schema==="efwsillaca"? EFWSILLACA_GROUPS
            : schema==="efwwmh"    ? EFWWMH_GROUPS
            : schema==="softland_beval" ? SFLBEVAL_GROUPS
            : schema==="wmh_cr"    ? WMH_CR_GROUPS
            : schema==="eintegra_ve" ? EINTEGRA_VE_GROUPS
            : SRO_GROUPS;
  const TD  = schema==="sco"       ? SCO_TABLE_DEFS
            : schema==="efw"       ? EFW_TABLE_DEFS
            : schema==="efwbeval"  ? EFWBEVAL_TABLE_DEFS
            : schema==="efwfebeca" ? EFWFEBECA_TABLE_DEFS
            : schema==="efwsillaca"? EFWSILLACA_TABLE_DEFS
            : schema==="efwwmh"    ? EFWWMH_TABLE_DEFS
            : schema==="softland_beval" ? SFLBEVAL_TABLE_DEFS
            : schema==="wmh_cr"    ? WMH_CR_TABLE_DEFS
            : schema==="eintegra_ve" ? EINTEGRA_VE_TABLE_DEFS
            : SRO_TABLE_DEFS;
  const COL = schema==="sco"       ? SCO_COLORS
            : schema==="efw"       ? EFW_COLORS
            : schema==="efwbeval"  ? EFWBEVAL_COLORS
            : schema==="efwfebeca" ? EFWFEBECA_COLORS
            : schema==="efwsillaca"? EFWSILLACA_COLORS
            : schema==="efwwmh"    ? EFWWMH_COLORS
            : schema==="softland_beval" ? SFLBEVAL_COLORS
            : schema==="wmh_cr"    ? WMH_CR_COLORS
            : schema==="eintegra_ve" ? EINTEGRA_VE_COLORS
            : SRO_COLORS;
  const MOD = schema==="sco"       ? SCO_MOD
            : schema==="efw"       ? EFW_MOD
            : schema==="efwbeval"  ? EFWBEVAL_MOD
            : schema==="efwfebeca" ? EFWFEBECA_MOD
            : schema==="efwsillaca"? EFWSILLACA_MOD
            : schema==="efwwmh"    ? EFWWMH_MOD
            : schema==="softland_beval" ? SFLBEVAL_MOD
            : schema==="wmh_cr"    ? WMH_CR_MOD
            : schema==="eintegra_ve" ? EINTEGRA_VE_MOD
            : SRO_MOD;
  const [activeGroups, setActiveGroups] = useState(()=>new Set(Object.keys(GR)));
  const [selectedTable, setSelectedTable] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "diagram" | "radial"

  // Al cambiar de schema, los keys de GR cambian — resetear selección para no heredar un Set vacío/obsoleto
  useEffect(() => {
    setActiveGroups(new Set(Object.keys(GR)));
    setSelectedTable(null);
  }, [schema]);

  const toggleGroup = (key) => setActiveGroups(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  // overrideRows: para schemas VE que tienen los mismos nombres de tabla que EFW CR
  const sroRows = overrideRows ? overrideRows.filter(r => MOD.has(r.from) || MOD.has(r.to))
                               : INTEGRATIONS.filter(r => MOD.has(r.from) || MOD.has(r.to));
  const fkOutMap = {}, fkInMap = {};
  sroRows.forEach(r => {
    fkOutMap[r.from] = (fkOutMap[r.from]||0)+1;
    fkInMap[r.to]    = (fkInMap[r.to]||0)+1;
  });

  const depSet     = new Set();
  const impactSet  = new Set();
  const impact2Set = new Set();

  if (selectedTable) {
    sroRows.forEach(r => {
      if (r.from===selectedTable && r.to!==selectedTable) depSet.add(r.to);
      if (r.to===selectedTable   && r.from!==selectedTable) impactSet.add(r.from);
    });
    sroRows.forEach(r => {
      if (impactSet.has(r.to) && r.from!==selectedTable && !impactSet.has(r.from) && !depSet.has(r.from))
        impact2Set.add(r.from);
    });
  }

  const getRelation = (table) => {
    if (!selectedTable) return null;
    if (table===selectedTable) return "selected";
    if (depSet.has(table))     return "dep";
    if (impactSet.has(table))  return "impact";
    if (impact2Set.has(table)) return "impact2";
    return "none";
  };

  const getConnRows = (table) => {
    if (!selectedTable || table===selectedTable) return [];
    return sroRows.filter(r =>
      (r.from===table && r.to===selectedTable) ||
      (r.to===table   && r.from===selectedTable)
    );
  };

  const selRelated = selectedTable
    ? sroRows.filter(r => r.from===selectedTable || r.to===selectedTable)
    : [];

  const visibleTables = new Set(
    Object.entries(GR)
      .filter(([k]) => activeGroups.has(k))
      .flatMap(([,g]) => g.tables)
  );
  const diagRows = sroRows.filter(r => visibleTables.has(r.from) && visibleTables.has(r.to));

  const btnStyle = (active) => ({
    fontSize:11, fontWeight:active?700:400, padding:"5px 12px", borderRadius:6, border:`1px solid ${active?"#00838f":"#ddd"}`,
    background:active?"#e0f7fa":"#fff", color:active?"#00838f":"#666", cursor:"pointer", fontFamily:"inherit",
  });

  return (
    <div style={{ display:"flex", gap:0, alignItems:"flex-start" }}>
      {/* Sidebar de grupos */}
      <div style={{ width:200, minWidth:200, background:"#fff", border:"1px solid #e0e0e0", borderRadius:10, overflow:"hidden", flexShrink:0, position:"sticky", top:20, marginRight:16 }}>
        <div style={{ padding:"10px 14px", borderBottom:"1px solid #f0f0f0", background:"#fafafa", fontSize:10, fontWeight:700, color:"#888", letterSpacing:"0.08em", textTransform:"uppercase", display:"flex", justifyContent:"space-between" }}>
          <span>Módulos</span>
          <span style={{ cursor:"pointer", color:"#00838f" }} onClick={()=>setActiveGroups(prev=>prev.size===Object.keys(GR).length?new Set():new Set(Object.keys(GR)))}>
            {activeGroups.size===Object.keys(GR).length?"Ocultar todos":"Mostrar todos"}
          </span>
        </div>
        {Object.entries(GR).map(([key,g])=>{
          const on = activeGroups.has(key);
          return <button key={key} onClick={()=>toggleGroup(key)} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 14px", border:"none", borderLeft:`3px solid ${on?g.color:"transparent"}`, background:on?g.color+"0a":"transparent", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", textAlign:"left", borderBottom:"1px solid #f5f5f5" }}>
            <span style={{ width:10, height:10, borderRadius:"50%", background:on?g.color:"#ddd", flexShrink:0 }}/>
            <span style={{ fontSize:11, fontWeight:on?700:400, color:on?g.color:"#888", flex:1 }}>{g.label}</span>
            <span style={{ fontSize:10, color:on?g.color:"#bbb", background:on?g.color+"15":"#f0f0f0", padding:"1px 6px", borderRadius:8 }}>{g.tables.length}</span>
          </button>;
        })}
        <div style={{ padding:"10px 14px", borderTop:"1px solid #f0f0f0", fontSize:10, color:"#aaa" }}>
          {[...activeGroups].reduce((s,k)=>s+(GR[k]?.tables.length||0),0)} tablas visibles
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ flex:1, minWidth:0 }}>
        {selectedTable && (
          <div style={{ background:"#fff", border:`1px solid ${COL[selectedTable]}44`, borderLeft:`4px solid ${COL[selectedTable]}`, borderRadius:10, padding:"14px 18px", marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:15, color:COL[selectedTable] }}>{selectedTable}</span>
                <span style={{ fontSize:11, color:"#888", marginLeft:10 }}>{(TD[selectedTable]?.cols||[]).length} columnas · {fkOutMap[selectedTable]||0} FK out · {fkInMap[selectedTable]||0} FK in</span>
              </div>
              <button onClick={()=>setSelectedTable(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:16 }}>✕</button>
            </div>
            <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:6 }}>
              <span style={{ fontSize:10, background:"#fff8dc", border:"1px solid #fcd34d", color:"#92400e", padding:"2px 8px", borderRadius:4, fontFamily:"'JetBrains Mono',monospace" }}>🔑 {TD[selectedTable]?.pk||"id"}</span>
              {(TD[selectedTable]?.cols||[]).map(c=>{
                const isFK=c.includes('→');
                const color=COL[selectedTable];
                return <span key={c} style={{ fontSize:10, background:isFK?color+"10":"#f5f5f5", border:`1px solid ${isFK?color+"44":"#e0e0e0"}`, color:isFK?color:"#555", padding:"2px 8px", borderRadius:4, fontFamily:"'JetBrains Mono',monospace" }}>{isFK?"🔗 ":""}{c}</span>;
              })}
            </div>
            {selRelated.length > 0 && (
              <div style={{ marginTop:12, borderTop:"1px solid #f0f0f0", paddingTop:10 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#888", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6 }}>Relaciones FK</div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {selRelated.map((r,i)=>(
                    <div key={i} style={{ fontSize:11, display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", color:COL[r.from]||"#888", fontWeight:600 }}>{r.from}</span>
                      <span style={{ color:"#bbb" }}>→</span>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", color:COL[r.to]||"#888", fontWeight:600 }}>{r.to}</span>
                      <span style={{ color:"#999", fontSize:10, flex:1 }}>{r.what}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTable && (
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:12, padding:"8px 14px", background:"#f8faff", border:"1px solid #dbeafe", borderRadius:8, alignItems:"center" }}>
            <span style={{ fontSize:11, fontWeight:700, color:COL[selectedTable]||"#555", fontFamily:"'JetBrains Mono',monospace" }}>{selectedTable}</span>
            <span style={{ fontSize:10, color:"#888" }}>análisis de impacto:</span>
            {depSet.size>0    && <span style={{ fontSize:11, background:"#fffbeb", border:"1px solid #f59e0b", color:"#b45309", padding:"2px 10px", borderRadius:12, fontWeight:600 }}>⬆ {depSet.size} dependencia{depSet.size!==1?"s":""}</span>}
            {impactSet.size>0 && <span style={{ fontSize:11, background:"#fef2f2", border:"1px solid #ef4444", color:"#b91c1c", padding:"2px 10px", borderRadius:12, fontWeight:600 }}>⬇ {impactSet.size} tabla{impactSet.size!==1?"s":""} afectada{impactSet.size!==1?"s":""}</span>}
            {impact2Set.size>0 && <span style={{ fontSize:11, background:"#fff5f5", border:"1px solid #fca5a5", color:"#dc2626", padding:"2px 10px", borderRadius:12, fontWeight:600 }}>~ {impact2Set.size} impacto{impact2Set.size!==1?"s":""} indirecto{impact2Set.size!==1?"s":""}</span>}
            <span style={{ fontSize:10, color:"#aaa", marginLeft:"auto" }}>Leyenda: <b style={{color:"#f59e0b"}}>⬆ dep</b> · <b style={{color:"#ef4444"}}>⬇ impacto</b> · <b style={{color:"#fca5a5"}}>~ 2do nivel</b></span>
          </div>
        )}

        <div style={{ display:"flex", gap:6, marginBottom:14, alignItems:"center" }}>
          <button style={btnStyle(viewMode==="cards")}    onClick={()=>setViewMode("cards")}>⊞ Tarjetas por módulo</button>
          <button style={btnStyle(viewMode==="diagram")}  onClick={()=>setViewMode("diagram")}>⬡ Diagrama Relacional FK</button>
          <button style={btnStyle(viewMode==="radial")}   onClick={()=>setViewMode("radial")}>◎ Diagrama ER Radial</button>
          <span style={{ fontSize:11, color:"#aaa", marginLeft:8 }}>{sroRows.filter(r=>visibleTables.has(r.from)&&visibleTables.has(r.to)).length} relaciones FK visibles</span>
        </div>

        {viewMode==="cards" && Object.entries(GR)
          .filter(([k])=>activeGroups.has(k))
          .map(([key,group])=>(
            <div key={key} style={{ marginBottom:22 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ width:12, height:12, borderRadius:"50%", background:group.color }}/>
                <span style={{ fontSize:13, fontWeight:700, color:group.color }}>{group.label}</span>
                <span style={{ fontSize:11, color:"#aaa" }}>· {group.tables.length} tablas</span>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {group.tables.map(table=>(
                  <EREntityCard key={table}
                    table={table}
                    def={TD[table]}
                    color={group.color}
                    fkOut={fkOutMap[table]||0}
                    fkIn={fkInMap[table]||0}
                    relation={searchQuery&&!table.toLowerCase().includes(searchQuery.toLowerCase())&&!(TD[table]?.cols||[]).some(c=>c.toLowerCase().includes(searchQuery.toLowerCase()))?"none":getRelation(table)}
                    connRows={getConnRows(table)}
                    onClick={()=>setSelectedTable(prev=>prev===table?null:table)}
                  />
                ))}
              </div>
            </div>
          ))
        }

        {viewMode==="diagram" && (
          <ERDiagramRelational
            activeGroups={activeGroups}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            getRelation={getRelation}
            sroRows={sroRows}
            GR={GR}
            TD={TD}
            storageKey={`olo-er-${schema}`}
          />
        )}
        {viewMode==="radial" && <ERDiagram rows={diagRows}/>}
      </div>
    </div>
  );
}
