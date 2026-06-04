// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA · EREntityCard (previously SROEntityCard)
// ═══════════════════════════════════════════════════════════════════════════
import { RELATION_META } from "../data/sro.js";

export function EREntityCard({ table, def, color, fkIn, fkOut, relation, connRows, onClick }) {
  const fkCols   = (def?.cols || []).filter(c => c.includes('→'));
  const dataCols = (def?.cols || []).filter(c => !c.includes('→'));
  const rm = relation ? (RELATION_META[relation] || RELATION_META.none) : { border:color+"55", bg:"#fff", badge:null, dim:false };
  const borderColor = rm.border || color+"55";
  const topColor    = relation==="selected" ? color : rm.border || color;
  return (
    <div onClick={onClick} style={{ background:rm.bg, border:`1.5px solid ${borderColor}`, borderTop:`3px solid ${topColor}`, borderRadius:8, minWidth:200, maxWidth:260, cursor:"pointer", opacity:rm.dim?0.22:1, transition:"all 0.15s", fontSize:11, position:"relative" }}>
      {rm.badge && (
        <div style={{ position:"absolute", top:-10, right:8, background:rm.badgeBg, border:`1px solid ${borderColor}`, color:borderColor, fontSize:9, fontWeight:700, padding:"1px 7px", borderRadius:10, letterSpacing:"0.04em" }}>
          {rm.badge}
        </div>
      )}
      <div style={{ background:relation==="selected"?color:rm.border?rm.border+"18":color+"18", padding:"5px 10px", borderRadius:"5px 5px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontWeight:700, color:relation==="selected"?"#fff":topColor, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.03em", fontSize:11 }}>{table}</span>
        <div style={{ display:"flex", gap:4 }}>
          {fkOut>0 && <span style={{ fontSize:9, background:"rgba(255,255,255,0.35)", color:relation==="selected"?"#fff":color, padding:"1px 5px", borderRadius:3, fontWeight:700 }}>→{fkOut}</span>}
          {fkIn>0  && <span style={{ fontSize:9, background:"rgba(100,100,100,0.12)", color:"#666", padding:"1px 5px", borderRadius:3, fontWeight:700 }}>←{fkIn}</span>}
        </div>
      </div>
      {connRows?.length > 0 && (
        <div style={{ padding:"3px 10px", background:rm.badgeBg||"#f8faff", borderBottom:"1px solid "+borderColor+"44" }}>
          {connRows.slice(0,2).map((r,i) => (
            <div key={i} style={{ fontSize:9, color:borderColor, fontFamily:"'JetBrains Mono',monospace", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {r.from===table?"→":"←"} {r.what?.split('→')[0]?.trim() || r.what}
            </div>
          ))}
          {connRows.length>2 && <div style={{ fontSize:9, color:"#aaa" }}>+{connRows.length-2} más</div>}
        </div>
      )}
      <div style={{ padding:"3px 10px 0", color:"#f59e0b", fontFamily:"'JetBrains Mono',monospace", fontSize:10, borderBottom:"1px solid #f5f5f5" }}>
        🔑 {def?.pk || "id"}
      </div>
      {fkCols.slice(0,5).map(c => {
        const [field, ref] = c.split('→');
        return <div key={c} style={{ padding:"1px 10px", fontFamily:"'JetBrains Mono',monospace", fontSize:10, display:"flex", gap:4 }}>
          <span style={{ color:"#aaa" }}>🔗</span>
          <span style={{ color:"#555", fontWeight:500 }}>{field}</span>
          <span style={{ color:color, opacity:0.7 }}>→{ref}</span>
        </div>;
      })}
      {fkCols.length>5 && <div style={{ padding:"1px 10px", color:"#bbb", fontSize:10 }}>  +{fkCols.length-5} FK más</div>}
      {dataCols.slice(0,3).map(c => (
        <div key={c} style={{ padding:"1px 10px", color:"#888", fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}>· {c}</div>
      ))}
      {dataCols.length>3 && <div style={{ padding:"1px 10px 4px", color:"#bbb", fontSize:10 }}>  +{dataCols.length-3} cols</div>}
      {dataCols.length<=3 && <div style={{ height:4 }}/>}
    </div>
  );
}
