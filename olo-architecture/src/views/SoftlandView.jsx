// ═══════════════════════════════════════════════════════════════════════════
// VISTA · SOFTLAND — Módulos ERP
// ═══════════════════════════════════════════════════════════════════════════
import { SOFTLAND_MODULES } from "../data/softland.js";
import { MODULE_COLORS } from "../data/constants.js";
import { StatusBadge, DetailPanel } from "../components/ui.jsx";

export function SoftlandView({ selected, setSelected }) {
  const sel = SOFTLAND_MODULES.find(m => m.code === selected);
  return <div>
    {sel && <DetailPanel item={{...sel, color:MODULE_COLORS[sel.code]}} onClose={()=>setSelected(null)}/>}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
      {SOFTLAND_MODULES.map(mod => {
        const c = MODULE_COLORS[mod.code] ?? "#888";
        const isSel = selected === mod.code;
        return <div key={mod.code} onClick={()=>setSelected(isSel?null:mod.code)} style={{ background:isSel?c+"10":"#ffffff", border:`1px solid ${isSel?c+"88":c+"33"}`, borderLeft:`4px solid ${c}`, borderRadius:8, padding:"12px 14px", cursor:"pointer", transition:"all 0.15s", boxShadow:isSel?`0 0 0 2px ${c}33`:"none" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
            <span style={{ fontSize:13, fontWeight:800, color:c, fontFamily:"'JetBrains Mono','Consolas',monospace", letterSpacing:"0.04em" }}>{mod.code}</span>
            <StatusBadge status={mod.status}/>
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:"#1D1D1B", marginBottom:2 }}>{mod.name}</div>
          <div style={{ fontSize:11, color:"#888", fontStyle:"italic" }}>{mod.role}</div>
        </div>;
      })}
    </div>
  </div>;
}
