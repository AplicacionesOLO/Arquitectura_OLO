import { useState } from "react";
import { TABS } from "./data/constants.js";
import { SOFTLAND_MODULES, OPS_MODULES, LOCALIZATIONS, GAPS, BPA_PROCESSES } from "./data/softland.js";
import { INTEGRATIONS } from "./data/integrations.js";
import { KPICard } from "./components/ui.jsx";
import { OLOArchView } from "./views/OLOArchView.jsx";
import { EcosystemView } from "./views/EcosystemView.jsx";
import { BPAView } from "./views/BPAView.jsx";
import { SoftlandView } from "./views/SoftlandView.jsx";
import { OpsView } from "./views/OpsView.jsx";
import { IntegrationsView } from "./views/IntegrationsView.jsx";
import { ContextView } from "./views/ContextView.jsx";

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function SoftlandArchitectureMap() {
  const [tab, setTab] = useState("olo-arch");
  const [bpaSel, setBpaSel] = useState(null);
  const [slSel, setSlSel] = useState(null);
  const [opsSel, setOpsSel] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const handleTab = id => { setTab(id); setBpaSel(null); setSlSel(null); setOpsSel(null); };
  const activeTab = TABS.find(t => t.id === tab);
  const totalProcs = BPA_PROCESSES.estrategicos.length + BPA_PROCESSES.negocio.length + BPA_PROCESSES.apoyo.length + BPA_PROCESSES.control.length;

  return <div style={{ fontFamily:"'Segoe UI','Helvetica Neue',system-ui,sans-serif", background:"#f8f9fa", color:"#1D1D1B", minHeight:"100vh", display:"flex" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap');body{margin:0;}::selection{background:#1D1D1B;color:#fff;}`}</style>

    {/* Sidebar */}
    <aside style={{ width:sidebarCollapsed?60:240, minWidth:sidebarCollapsed?60:240, background:"#1D1D1B", color:"#ffffff", display:"flex", flexDirection:"column", transition:"width 0.2s ease, min-width 0.2s ease", overflow:"hidden", position:"sticky", top:0, height:"100vh" }}>
      {/* Sidebar Header */}
      <div style={{ padding:sidebarCollapsed?"16px 10px":"20px 18px", borderBottom:"1px solid #333", display:"flex", alignItems:"center", justifyContent:sidebarCollapsed?"center":"space-between" }}>
        {!sidebarCollapsed && <div>
          <div style={{ fontSize:14, fontWeight:700, letterSpacing:"-0.02em", whiteSpace:"nowrap" }}>OLO Architecture</div>
          <div style={{ fontSize:10, color:"#888", fontFamily:"'JetBrains Mono','Consolas',monospace", marginTop:2 }}>v0.5 · CR · VE</div>
        </div>}
        <button onClick={()=>setSidebarCollapsed(!sidebarCollapsed)} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:16, padding:4, lineHeight:1 }} title={sidebarCollapsed?"Expandir":"Colapsar"}>{sidebarCollapsed?"▶":"◀"}</button>
      </div>

      {/* Nav Items */}
      <nav style={{ flex:1, padding:"12px 0", overflowY:"auto" }}>
        {TABS.map(t => { const isA = tab === t.id; return <button key={t.id} onClick={()=>handleTab(t.id)} title={sidebarCollapsed?t.label:undefined} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", background:isA?"rgba(255,255,255,0.1)":"transparent", border:"none", borderLeft:isA?"3px solid #fff":"3px solid transparent", color:isA?"#ffffff":"#aaa", padding:sidebarCollapsed?"12px 0":"10px 18px", cursor:"pointer", fontSize:13, fontWeight:isA?700:400, fontFamily:"inherit", transition:"all 0.15s", textAlign:"left", justifyContent:sidebarCollapsed?"center":"flex-start" }}>
          <span style={{ fontSize:16, lineHeight:1, flexShrink:0 }}>{t.label.split(" ")[0]}</span>
          {!sidebarCollapsed && <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.label.split(" ").slice(1).join(" ")}</span>}
        </button>; })}
      </nav>

      {/* Sidebar Footer */}
      {!sidebarCollapsed && <div style={{ padding:"14px 18px", borderTop:"1px solid #333", fontSize:10, color:"#666", lineHeight:1.5 }}>
        17 manuales · 7 guías eflow · 1 BPA
      </div>}
    </aside>

    {/* Main Content */}
    <main style={{ flex:1, padding:"20px 40px 64px 40px", overflow:"auto", minWidth:0 }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", gap:12, marginBottom:4 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#1D1D1B", margin:0, letterSpacing:"-0.02em" }}>{activeTab?.label.split(" ").slice(1).join(" ") || "Inicio"}</h1>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"#bbb", pointerEvents:"none" }}>🔍</span>
                <input
                  value={globalSearch}
                  onChange={e=>setGlobalSearch(e.target.value)}
                  placeholder="Buscar nodo, tabla, conexión…"
                  style={{ fontSize:12, border:"1px solid #ddd", borderRadius:8, padding:"6px 10px 6px 30px", width:240, fontFamily:"inherit", outline:"none", background: globalSearch?"#fff8dc":"#fafafa", color:"#333" }}
                />
                {globalSearch && <button onClick={()=>setGlobalSearch("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#aaa", fontSize:14, lineHeight:1 }}>✕</button>}
              </div>
              <span style={{ fontSize:11, color:"#888", letterSpacing:"0.1em", fontFamily:"'JetBrains Mono','Consolas',monospace" }}>Softland v7.00 · eflow Cloud Suite</span>
            </div>
          </div>
          <p style={{ fontSize:13, color:"#666", margin:0, lineHeight:1.5 }}>{activeTab?.sub}</p>
        </div>

        {/* KPI Strip */}
        <div style={{ display:"flex", gap:8, marginBottom:22, flexWrap:"wrap" }}>
          <KPICard label="Módulos Softland" value={SOFTLAND_MODULES.length} color="#c0392b" sub="con manual oficial"/>
          <KPICard label="Procesos BPA" value={totalProcs} color="#f39c12" sub="4 áreas · CICR dic-2024"/>
          <KPICard label="Operación eflow" value={OPS_MODULES.length} color="#1abc9c" sub="WMS-D · RF · WMH"/>
          <KPICard label="Integraciones" value={INTEGRATIONS.length} color="#2980b9" sub="mapeadas explícitamente"/>
          <KPICard label="Localizaciones" value={LOCALIZATIONS.length} color="#27ae60" sub="CR · VE"/>
          <KPICard label="Brechas" value={GAPS.length} color="#7f8c8d" sub="vacíos reconocidos"/>
        </div>

        {/* Contenido */}
        {tab==="olo-arch"     && <OLOArchView     searchQuery={globalSearch}/>}
        {tab==="ecosystem"    && <EcosystemView   searchQuery={globalSearch}/>}
        {tab==="bpa"          && <BPAView selected={bpaSel} setSelected={setBpaSel}/>}
        {tab==="softland"     && <SoftlandView selected={slSel} setSelected={setSlSel}/>}
        {tab==="ops"          && <OpsView selected={opsSel} setSelected={setOpsSel}/>}
        {tab==="integrations" && <IntegrationsView searchQuery={globalSearch}/>}
        {tab==="context"      && <ContextView/>}

        {/* Footer */}
        <footer style={{ marginTop:56, paddingTop:24, borderTop:"1px solid #e0e0e0", display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", gap:12, fontSize:11, color:"#888" }}>
          <span>17 manuales Softland · 7 guías eflow · 1 informe BPA · 0 acceso a esquema · 0 acceso a configuración real</span>
          <span style={{ fontFamily:"'JetBrains Mono','Consolas',monospace" }}>v0.5 · próxima iteración: AS · POS · FR · AC · Capital Humano</span>
        </footer>
      </div>
    </main>
  </div>;
}
