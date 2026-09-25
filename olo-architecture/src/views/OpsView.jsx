// ═══════════════════════════════════════════════════════════════════════════
// VISTA · OPERACIÓN — eflow Cloud Suite
// ═══════════════════════════════════════════════════════════════════════════
import { OPS_MODULES, SATELLITE_MODULES } from "../data/softland.js";
import { OPS_COLORS, DESIGN } from "../data/constants.js";
import { StatusBadge, DetailPanel } from "../components/ui.jsx";
import { useState, useEffect } from "react";
import { ControlTowerView } from "./ControlTowerView.jsx";
import { WmsManualView } from "./WmsManualView.jsx";
import { SorterManualView } from "./SorterManualView.jsx";
import { HhManualView } from "./HhManualView.jsx";
import { OPS_RELACIONES } from "../data/ops_relaciones.js";

export function OpsView({ selected, setSelected, focus }) {
  const [mainView, setMainView] = useState(focus?.view || "modulos"); // "modulos" | "wms" | "hh" | "wmh" | "sorter"
  useEffect(() => { if (focus?.view) setMainView(focus.view); }, [focus]);
  return <div>
    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
      {[["modulos","Módulos de operación"],["wms","eFlow WMS · Manual"],["hh","eFlow WMS · Handheld"],["wmh","Torre de Control · WMH"],["sorter","SORTER CLIRO · Manual"]].map(([id,label]) => {
        const active = mainView===id;
        return <button key={id} onClick={()=>setMainView(id)} style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${active?DESIGN.ink:DESIGN.border}`, background:active?DESIGN.ink:"#fff", color:active?"#fff":DESIGN.inkSoft, fontWeight:active?700:400, fontSize:14.5, cursor:"pointer", fontFamily:DESIGN.font }}>{label}</button>;
      })}
    </div>
    {mainView==="wmh" ? <ControlTowerView focus={focus}/> : mainView==="sorter" ? <SorterManualView focus={focus}/> : mainView==="hh" ? <HhManualView focus={focus}/> : mainView==="wms" ? <WmsManualView focus={focus}/> : <OpsModules selected={selected} setSelected={setSelected} abrirVista={setMainView}/>}
  </div>;
}

// Cada módulo abre su manual / detalle dentro de Operación
const VISTA_DE = { "WMS-D": ["wms", "Abrir el manual de eFlow WMS"], "WMS-RF": ["hh", "Abrir el manual del handheld"], "WMH": ["wmh", "Abrir Torre de Control · WMH"], "SORTER": ["sorter", "Abrir el manual del SORTER CLIRO"] };

function OpsModules({ selected, setSelected, abrirVista }) {
  const sel = OPS_MODULES.find(m => m.code === selected);
  return <div>
    {sel && <DetailPanel item={{...sel, color:OPS_COLORS[sel.code]??"#1abc9c", accion: VISTA_DE[sel.code] && { label: VISTA_DE[sel.code][1], onClick: () => abrirVista(VISTA_DE[sel.code][0]) }}} onClose={()=>setSelected(null)}/>}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10, marginBottom:24 }}>
      {OPS_MODULES.map(mod => {
        const c = OPS_COLORS[mod.code] ?? "#1abc9c";
        const isSel = selected === mod.code;
        return <div key={mod.code} onClick={()=>setSelected(isSel?null:mod.code)} style={{ background:isSel?c+"10":"#ffffff", borderTop:`1px solid ${isSel?c+"88":c+"33"}`, borderRight:`1px solid ${isSel?c+"88":c+"33"}`, borderBottom:`1px solid ${isSel?c+"88":c+"33"}`, borderLeft:`4px solid ${c}`, borderRadius:8, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s", boxShadow:isSel?`0 0 0 2px ${c}33`:"none" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
            <span style={{ fontSize:14, fontWeight:800, color:c, fontFamily:DESIGN.font, letterSpacing:"0.04em" }}>{mod.code}</span>
            {mod.status && <StatusBadge status={mod.status}/>}
          </div>
          <div style={{ fontSize:15.5, fontWeight:700, color:"#1D1D1B", marginBottom:2 }}>{mod.name}</div>
          {mod.role && <div style={{ fontSize:13, color:"#888", fontStyle:"italic", marginBottom:6 }}>{mod.role}</div>}
          {mod.vendor && <div style={{ fontSize:12, color:"#999" }}>Vendor: <b style={{ color:"#777" }}>{mod.vendor}</b></div>}
        </div>;
      })}
    </div>
    <h3 style={{ fontSize:15.5, fontWeight:700, color:"#1D1D1B", margin:"0 0 4px 0" }}>Cómo se relacionan</h3>
    <p style={{ fontSize:14, color:"#777", margin:"0 0 10px 0" }}>Qué dato pasa entre los sistemas de operación y qué tan documentado está.</p>
    <div style={{ display:"grid", gap:6, marginBottom:24 }}>
      {OPS_RELACIONES.map((r,i) => (
        <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", background:"#fff", border:`1px ${r.status==="inferred"?"dashed":"solid"} ${DESIGN.border}`, borderRadius:8, padding:"8px 12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0, width:170 }}>
            <span style={{ fontSize:13, fontWeight:800, color:OPS_COLORS[r.a], fontFamily:DESIGN.font }}>{r.a}</span>
            <span style={{ color:DESIGN.mutedSoft, fontSize:13 }}>⇄</span>
            <span style={{ fontSize:13, fontWeight:800, color:OPS_COLORS[r.b], fontFamily:DESIGN.font }}>{r.b}</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, color:"#444", lineHeight:1.5 }}>{r.que}</div>
            <div style={{ fontSize:12.5, color:DESIGN.mutedSoft, marginTop:2 }}>Fuente: {r.fuente}</div>
          </div>
          <StatusBadge status={r.status}/>
        </div>
      ))}
    </div>
    <h3 style={{ fontSize:15.5, fontWeight:700, color:"#1D1D1B", margin:"0 0 4px 0" }}>Sistemas satélite · inferidos</h3>
    <p style={{ fontSize:14, color:"#777", margin:"0 0 14px 0" }}>Mencionados parcialmente en manuales pero sin documentación dedicada en el corpus accesible.</p>
    <div style={{ display:"grid", gap:8 }}>
      {SATELLITE_MODULES.map((s,i) => (
        <div key={i} style={{ background:"#ffffff", border:"1px dashed #b0bec5", borderLeft:"3px solid #7f8c8d", borderRadius:8, padding:"10px 14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8, marginBottom:4, flexWrap:"wrap" }}>
            <span style={{ fontSize:14.5, fontWeight:700, color:"#1D1D1B" }}>{s.name}</span>
            <StatusBadge status={s.status}/>
          </div>
          <p style={{ fontSize:14, color:"#666", lineHeight:1.55, margin:0 }}>{s.purpose}</p>
        </div>
      ))}
    </div>
  </div>;
}
