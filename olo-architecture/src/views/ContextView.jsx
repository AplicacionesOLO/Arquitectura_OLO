// ═══════════════════════════════════════════════════════════════════════════
// VISTA · CONTEXTO
// ═══════════════════════════════════════════════════════════════════════════
import { LOCALIZATIONS, EXTENSION_POINTS, GAPS } from "../data/softland.js";
import { STATUS_VIS } from "../data/constants.js";
import { SectionTitle, StatusBadge } from "../components/ui.jsx";

export function ContextView() {
  return <div>
    <SectionTitle>Localizaciones</SectionTitle>
    <p style={{ fontSize:12, color:"#777", margin:"0 0 14px 0", lineHeight:1.55 }}>Costa Rica es la operación activa con todo el stack calibrado. Venezuela es la próxima expansión y aún tiene gaps de configuración fiscal por resolver — pendiente identificar SENIAT, tarifas de IVA venezolanas y formato de libros fiscales locales.</p>
    <div style={{ display:"grid", gap:10, marginBottom:28 }}>
      {LOCALIZATIONS.map((l,i) => {
        const t = STATUS_VIS[l.status];
        return <div key={i} style={{ display:"flex", alignItems:"baseline", gap:16, background:"#ffffff", border:`1px solid ${t.border}`, borderLeft:`4px solid ${t.color}`, padding:"12px 16px", borderRadius:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:16, fontWeight:700, color:"#1D1D1B", minWidth:130 }}>{l.country}</span>
          <StatusBadge status={l.status} size="lg"/>
          <span style={{ fontSize:12, color:"#666", flex:1, lineHeight:1.5 }}>{l.detail}</span>
        </div>;
      })}
    </div>
    <SectionTitle>Puntos de extensión</SectionTitle>
    <p style={{ fontSize:12, color:"#777", margin:"0 0 14px 0" }}>Mecanismos documentados en los manuales para integrar lógica externa al ERP.</p>
    <div style={{ display:"grid", gap:8, marginBottom:28 }}>
      {EXTENSION_POINTS.map((p,i) => (
        <div key={i} style={{ background:"#ffffff", border:"1px solid #e0e0e0", borderLeft:"3px solid #7B1FA2", borderRadius:8, padding:"10px 14px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#7B1FA2", letterSpacing:"0.05em", marginBottom:4, textTransform:"uppercase" }}>{p.type}</div>
          <p style={{ fontSize:12, color:"#555", lineHeight:1.55, margin:0 }}>{p.detail}</p>
        </div>
      ))}
    </div>
    <SectionTitle>Brechas declaradas</SectionTitle>
    <p style={{ fontSize:12, color:"#777", margin:"0 0 14px 0" }}>Vacíos reconocidos en la documentación accesible — candidatos a levantamiento.</p>
    <div style={{ display:"grid", gap:8 }}>
      {GAPS.map((g,i) => (
        <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", background:"#fbe9e7", border:"1px solid #ef9a9a", borderLeft:"3px solid #c0392b", borderRadius:8, padding:"10px 14px" }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#c0392b", fontFamily:"'JetBrains Mono','Consolas',monospace", background:"#ffffff", padding:"2px 7px", borderRadius:4, whiteSpace:"nowrap", flexShrink:0 }}>GAP·{(i+1).toString().padStart(2,"0")}</span>
          <span style={{ fontSize:12, color:"#555", lineHeight:1.55 }}>{g}</span>
        </div>
      ))}
    </div>
  </div>;
}
