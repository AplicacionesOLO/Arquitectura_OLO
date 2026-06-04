// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTES UI · Primitivas compartidas
// ═══════════════════════════════════════════════════════════════════════════
import { MODULE_COLORS, OPS_COLORS, CLUSTER_COLORS, STATUS_VIS, MATURITY_TINTS, PRIORITY_LABEL } from "../data/constants.js";

export function StatusBadge({ status, size="sm" }) {
  const t = STATUS_VIS[status] ?? STATUS_VIS.inferred;
  return <span style={{ display:"inline-block", fontSize:size==="lg"?11:10, fontWeight:700, color:t.color, background:t.bg, border:`1px solid ${t.border}`, padding:size==="lg"?"4px 10px":"2px 8px", borderRadius:4, letterSpacing:"0.04em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{t.label}</span>;
}

export function ModuleChip({ code, color, size="sm" }) {
  const c = color ?? MODULE_COLORS[code] ?? OPS_COLORS[code] ?? CLUSTER_COLORS[code] ?? "#7f8c8d";
  return <span style={{ display:"inline-block", fontSize:size==="lg"?12:10, fontWeight:700, color:c, background:c+"18", border:`1px solid ${c}44`, padding:size==="lg"?"4px 10px":"2px 7px", borderRadius:4, letterSpacing:"0.05em", fontFamily:"'JetBrains Mono','Consolas',monospace" }}>{code}</span>;
}

export function KPICard({ label, value, color, sub }) {
  return <div style={{ background:"#ffffff", border:"1px solid #e0e0e0", borderRadius:10, padding:"12px 16px", flex:"1 1 130px", minWidth:120 }}>
    <div style={{ fontSize:26, fontWeight:800, color, lineHeight:1.1 }}>{value}</div>
    <div style={{ fontSize:11, color:"#666", marginTop:4, fontWeight:500 }}>{label}</div>
    {sub && <div style={{ fontSize:10, color:"#999", marginTop:2 }}>{sub}</div>}
  </div>;
}

export function CategoryHeader({ icon, label, count, sub, color }) {
  return <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
    <span style={{ fontSize:22, lineHeight:1 }}>{icon}</span>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:15, fontWeight:700, color }}>{label}{count!=null && <span style={{ fontSize:12, color:"#888", fontWeight:400, marginLeft:8 }}>· {count}</span>}</div>
      {sub && <div style={{ fontSize:11, color:"#777", marginTop:2, lineHeight:1.45 }}>{sub}</div>}
    </div>
  </div>;
}

export function CloseButton({ onClick }) {
  return <button onClick={onClick} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:18, lineHeight:1, padding:4 }}>✕</button>;
}

export function SectionTitle({ children }) {
  return <h3 style={{ fontSize:16, fontWeight:700, color:"#1D1D1B", margin:"0 0 4px 0", letterSpacing:"-0.01em" }}>{children}</h3>;
}

export function DetailPanel({ item, onClose }) {
  if (!item) return null;
  const color = item.color ?? "#888";
  return <div style={{ background:"#ffffff", border:`1px solid ${color}55`, borderLeft:`4px solid ${color}`, borderRadius:10, padding:"16px 20px", marginBottom:22 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          {item.code && <span style={{ fontSize:11, fontWeight:700, color, background:color+"18", border:`1px solid ${color}44`, padding:"3px 9px", borderRadius:4, letterSpacing:"0.08em", fontFamily:"'JetBrains Mono','Consolas',monospace" }}>{item.code}</span>}
          <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:"#1D1D1B" }}>{item.name}</h3>
          {item.status && <StatusBadge status={item.status} />}
        </div>
        {item.role && <div style={{ fontSize:12, color:"#777", marginTop:4, fontStyle:"italic" }}>{item.role}</div>}
      </div>
      <CloseButton onClick={onClose} />
    </div>
    {item.purpose && <p style={{ fontSize:13, color:"#444", lineHeight:1.65, margin:"12px 0 14px 0" }}>{item.purpose}</p>}
    {(item.owner || item.maturity!=null) && <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginBottom:14, fontSize:11, color:"#666" }}>
      {item.owner && <span><b style={{ color:"#888", fontWeight:500 }}>Owner:</b> {item.owner}</span>}
      {item.maturity!=null && <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><b style={{ color:"#888", fontWeight:500 }}>Madurez:</b><span style={{ background:MATURITY_TINTS[item.maturity]+"20", color:MATURITY_TINTS[item.maturity], padding:"1px 7px", borderRadius:4, fontWeight:700 }}>M{item.maturity}/5</span></span>}
      {item.priority!=null && <span><b style={{ color:"#888", fontWeight:500 }}>Prioridad:</b> {PRIORITY_LABEL[item.priority]}</span>}
      {item.vendor && <span><b style={{ color:"#888", fontWeight:500 }}>Vendor:</b> {item.vendor}</span>}
    </div>}
    {item.note && <div style={{ fontSize:12, color:"#666", lineHeight:1.6, padding:"10px 14px", background:"#fafafa", borderRadius:6, marginBottom:14, fontStyle:"italic" }}>{item.note}</div>}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10 }}>
      {item.coverage && item.coverage.length>0 && <DetailBox label="⬡ Módulos que lo soportan" accent="#f39c12"><div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>{item.coverage.map(c=><ModuleChip key={c} code={c} size="lg"/>)}</div></DetailBox>}
      {item.entities && item.entities.length>0 && <DetailBox label={`◫ Entidades inferidas · ${item.entities.length}`} accent="#7B1FA2"><div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{item.entities.map(e=><span key={e} style={{ fontSize:10, color:"#555", background:"#f5f5f5", border:"1px solid #e0e0e0", padding:"2px 7px", borderRadius:3, fontFamily:"'JetBrains Mono','Consolas',monospace" }}>{e}</span>)}</div></DetailBox>}
    </div>
  </div>;
}

export function DetailBox({ label, accent, children }) {
  return <div style={{ background:"#fafafa", borderRadius:8, padding:"10px 14px" }}>
    <div style={{ fontSize:10, fontWeight:700, color:accent, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</div>
    {children}
  </div>;
}

export function ClusterCard({ color, bg, title, desc, children }) {
  return <div style={{ background:bg, border:`1px solid ${color}44`, borderLeft:`3px solid ${color}`, borderRadius:10, padding:"12px 14px" }}>
    <div style={{ fontSize:12, fontWeight:700, color, marginBottom:4 }}>{title}</div>
    <div style={{ fontSize:11, color:"#555", lineHeight:1.55, marginBottom:10 }}>{desc}</div>
    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>{children}</div>
  </div>;
}

export function ClusterTag({ label, color, outline }) {
  return <span style={{ display:"inline-block", fontSize:10, fontWeight:600, color, background:outline?"transparent":color+"15", border:`1px solid ${outline?color+"55":color+"33"}`, padding:"2px 8px", borderRadius:4 }}>{label}</span>;
}

export function LayerBlock({ icon, label, color, bg, border, sub, children, radiusTop, radiusBottom }) {
  const radius = radiusTop&&radiusBottom?12:radiusTop?"12px 12px 0 0":radiusBottom?"0 0 12px 12px":0;
  return <div style={{ background:bg, border:`1px solid ${border}`, borderTop:radiusTop?`1px solid ${border}`:"none", borderRadius:radius, padding:"16px 18px" }}>
    <CategoryHeader icon={icon} label={label} color={color} sub={sub}/>
    {children}
  </div>;
}
