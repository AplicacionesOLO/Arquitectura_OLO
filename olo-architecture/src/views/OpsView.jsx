// ═══════════════════════════════════════════════════════════════════════════
// VISTA · OPERACIÓN — eflow Cloud Suite
// ═══════════════════════════════════════════════════════════════════════════
import { OPS_MODULES, SATELLITE_MODULES } from "../data/softland.js";
import { OPS_COLORS } from "../data/constants.js";
import { StatusBadge, DetailPanel } from "../components/ui.jsx";

export function OpsView({ selected, setSelected }) {
  const sel = OPS_MODULES.find(m => m.code === selected);
  return <div>
    {sel && <DetailPanel item={{...sel, color:OPS_COLORS[sel.code]??"#1abc9c"}} onClose={()=>setSelected(null)}/>}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10, marginBottom:24 }}>
      {OPS_MODULES.map(mod => {
        const c = OPS_COLORS[mod.code] ?? "#1abc9c";
        const isSel = selected === mod.code;
        return <div key={mod.code} onClick={()=>setSelected(isSel?null:mod.code)} style={{ background:isSel?c+"10":"#ffffff", border:`1px solid ${isSel?c+"88":c+"33"}`, borderLeft:`4px solid ${c}`, borderRadius:8, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s", boxShadow:isSel?`0 0 0 2px ${c}33`:"none" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
            <span style={{ fontSize:12, fontWeight:800, color:c, fontFamily:"'JetBrains Mono','Consolas',monospace", letterSpacing:"0.04em" }}>{mod.code}</span>
            {mod.status && <StatusBadge status={mod.status}/>}
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:"#1D1D1B", marginBottom:2 }}>{mod.name}</div>
          {mod.role && <div style={{ fontSize:11, color:"#888", fontStyle:"italic", marginBottom:6 }}>{mod.role}</div>}
          {mod.vendor && <div style={{ fontSize:10, color:"#999" }}>Vendor: <b style={{ color:"#777" }}>{mod.vendor}</b></div>}
        </div>;
      })}
    </div>
    <h3 style={{ fontSize:14, fontWeight:700, color:"#1D1D1B", margin:"0 0 4px 0" }}>Sistemas satélite · inferidos</h3>
    <p style={{ fontSize:12, color:"#777", margin:"0 0 14px 0" }}>Mencionados parcialmente en manuales pero sin documentación dedicada en el corpus accesible.</p>
    <div style={{ display:"grid", gap:8 }}>
      {SATELLITE_MODULES.map((s,i) => (
        <div key={i} style={{ background:"#ffffff", border:"1px dashed #b0bec5", borderLeft:"3px solid #7f8c8d", borderRadius:8, padding:"10px 14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8, marginBottom:4, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#1D1D1B" }}>{s.name}</span>
            <StatusBadge status={s.status}/>
          </div>
          <p style={{ fontSize:12, color:"#666", lineHeight:1.55, margin:0 }}>{s.purpose}</p>
        </div>
      ))}
    </div>
  </div>;
}
