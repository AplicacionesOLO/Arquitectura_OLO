import { useState, useEffect, useMemo } from "react";
import { TABS } from "./data/constants.js";
import { OLOArchView } from "./views/OLOArchView.jsx";
import { EcosystemView } from "./views/EcosystemView.jsx";
import { BPAView } from "./views/BPAView.jsx";
import { SoftlandView } from "./views/SoftlandView.jsx";
import { OpsView } from "./views/OpsView.jsx";
import { IntegrationsView } from "./views/IntegrationsView.jsx";
import { ContextView } from "./views/ContextView.jsx";
import { AdminView } from "./views/AdminView.jsx";
import { ProcesosOperativosView } from "./views/ProcesosOperativosView.jsx";
import { BpaBotWidget } from "./components/BpaBotWidget.jsx";
import { useAuth } from "./auth/AuthContext.jsx";
import { LoginScreen } from "./auth/LoginScreen.jsx";
import { PendingScreen } from "./auth/PendingScreen.jsx";
import oloLogo from "./assets/olo-logo.png";

const ADMIN_TAB = { id:"admin", label:"🛡 Administración", sub:"Usuarios · Roles · Permisos del sistema" };

const ROLE_BADGE = {
  admin:  { label:"Admin",  bg:"#fef3c7", color:"#92400e" },
  editor: { label:"Editor", bg:"#dbeafe", color:"#1e40af" },
  viewer: { label:"Viewer", bg:"#e0e7ff", color:"#3730a3" },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function SoftlandArchitectureMap() {
  const { loading, permsLoading, user, profile, profileLoaded, role, isActive, isAdmin, canSeeTab, signOut } = useAuth();
  const [tab, setTab] = useState("bpa");
  const [bpaSel, setBpaSel] = useState(null);
  const [slSel, setSlSel] = useState(null);
  const [opsSel, setOpsSel] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(()=>new Set(["ecosystem","bpa"]));

  const navTabs = useMemo(() => {
    const visible = TABS.filter(t => isAdmin || canSeeTab(t.id));
    return isAdmin ? [...visible, ADMIN_TAB] : visible;
  }, [isAdmin, canSeeTab]);

  // Agrupa navTabs en árbol de 1 nivel: los tabs con `parent` cuelgan del tab
  // con ese id (si sigue visible); si no, se muestran sueltos como fallback.
  const navTree = useMemo(() => {
    const ids = new Set(navTabs.map(t => t.id));
    const tops = navTabs.filter(t => !t.parent || !ids.has(t.parent));
    return tops.map(t => ({ ...t, children: navTabs.filter(c => c.parent === t.id) }));
  }, [navTabs]);

  const toggleGroup = (id) => setExpandedGroups(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Si el rol/permisos cambian y el tab actual deja de estar disponible, cae al primero visible.
  useEffect(() => {
    if (permsLoading || navTabs.length===0) return;
    if (!navTabs.some(t => t.id === tab)) setTab(navTabs[0].id);
  }, [permsLoading, navTabs, tab]);

  const handleTab = id => { setTab(id); setBpaSel(null); setSlSel(null); setOpsSel(null); };
  const activeTab = navTabs.find(t => t.id === tab);

  if (loading || (user && !profileLoaded)) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8f9fa", color:"#94a3b8", fontFamily:"'Segoe UI','Helvetica Neue',system-ui,sans-serif", fontSize:13 }}>Cargando…</div>;
  if (!user) return <LoginScreen/>;
  if (!isActive) return <PendingScreen/>;

  return <div style={{ fontFamily:"'Segoe UI','Helvetica Neue',system-ui,sans-serif", background:"#f8f9fa", color:"#1D1D1B", minHeight:"100vh", display:"flex" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap');body{margin:0;}::selection{background:#1D1D1B;color:#fff;}`}</style>

    {/* Sidebar */}
    <aside style={{ width:sidebarCollapsed?56:220, minWidth:sidebarCollapsed?56:220, background:"#ffffff", color:"#1D1D1B", display:"flex", flexDirection:"column", transition:"width 0.2s ease, min-width 0.2s ease", overflow:"hidden", position:"sticky", top:0, height:"100vh", borderRight:"1px solid #e0e6ed", boxShadow:"0 0 8px rgba(0,0,0,0.04)" }}>
      {/* Sidebar Header */}
      <div style={{ padding:sidebarCollapsed?"16px 10px":"16px 14px", borderBottom:"1px solid #e0e6ed", background:"#f8fafc", display:"flex", alignItems:"center", gap:8, minHeight:60, justifyContent:sidebarCollapsed?"center":"space-between" }}>
        {sidebarCollapsed
          ? <img src={oloLogo} alt="OLO" style={{ height:22 }}/>
          : <div style={{ flex:1, overflow:"hidden", display:"flex", alignItems:"center", gap:9 }}>
              <img src={oloLogo} alt="OLO" style={{ height:26, flexShrink:0 }}/>
              <div style={{ overflow:"hidden" }}>
                <div style={{ fontSize:9, color:"#94a3b8", letterSpacing:1.5, textTransform:"uppercase", marginBottom:2, fontWeight:600 }}>Arquitectura</div>
                <div style={{ fontSize:13, fontWeight:800, color:"#1D1D1B", lineHeight:1.2, whiteSpace:"nowrap" }}>BPA OLO</div>
                <div style={{ fontSize:10, color:"#64748b", fontFamily:"'JetBrains Mono','Consolas',monospace", marginTop:2 }}>v0.5 · CR · VE</div>
              </div>
            </div>}
        {!sidebarCollapsed && <button onClick={()=>setSidebarCollapsed(!sidebarCollapsed)} style={{ background:"#fff", border:"1px solid #e0e6ed", color:"#64748b", cursor:"pointer", fontSize:14, padding:"2px 8px", borderRadius:4, lineHeight:1.6, flexShrink:0 }} title="Contraer menú">‹</button>}
      </div>
      {sidebarCollapsed && <button onClick={()=>setSidebarCollapsed(!sidebarCollapsed)} style={{ background:"#fff", border:"1px solid #e0e6ed", borderTop:"none", color:"#64748b", cursor:"pointer", fontSize:14, padding:"2px 8px", width:"100%" }} title="Expandir menú">›</button>}

      {/* Nav Items */}
      <nav style={{ flex:1, padding:"8px 0", overflowY:"auto" }}>
        {navTree.map(t => {
          const isA = tab === t.id;
          const hasChildren = t.children.length > 0;
          const childActive = t.children.some(c => c.id === tab);
          const expanded = expandedGroups.has(t.id) || childActive;
          return <div key={t.id}>
            <div style={{ display:"flex", alignItems:"stretch", background:isA?"#e0f7fa":"transparent", borderLeft:isA?"3px solid #00838f":"3px solid transparent", transition:"background 0.15s" }}
              onMouseEnter={e=>{ if(!isA) e.currentTarget.style.background="#f1f5f9"; }}
              onMouseLeave={e=>{ if(!isA) e.currentTarget.style.background="transparent"; }}>
              <button onClick={()=>handleTab(t.id)} title={sidebarCollapsed?t.label:undefined} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", flex:1, background:"transparent", border:"none", color:isA?"#00838f":"#1D1D1B", padding:sidebarCollapsed?"12px 0":"11px 6px 11px 11px", cursor:"pointer", fontSize:13, fontWeight:isA?700:600, fontFamily:"inherit", textAlign:"left", justifyContent:sidebarCollapsed?"center":"flex-start" }}>
                <span style={{ fontSize:16, lineHeight:1, width:18, textAlign:"center", flexShrink:0, color:isA?"#00838f":"#64748b" }}>{t.label.split(" ")[0]}</span>
                {!sidebarCollapsed && <span style={{ flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.label.split(" ").slice(1).join(" ")}</span>}
              </button>
              {hasChildren && !sidebarCollapsed && <button onClick={()=>toggleGroup(t.id)} title={expanded?"Contraer":"Expandir"} style={{ background:"transparent", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:11, padding:"0 12px" }}>
                <span style={{ display:"inline-block", transform:expanded?"rotate(90deg)":"rotate(0deg)", transition:"transform 0.15s" }}>›</span>
              </button>}
            </div>
            {hasChildren && expanded && !sidebarCollapsed && t.children.map(c => { const isCA = tab === c.id; return (
              <button key={c.id} onClick={()=>handleTab(c.id)} style={{ display:"flex", alignItems:"center", gap:9, width:"100%", background:isCA?"#e0f7fa":"transparent", border:"none", borderLeft:isCA?"3px solid #00838f":"3px solid transparent", color:isCA?"#00838f":"#475569", padding:"8px 14px 8px 32px", cursor:"pointer", fontSize:12, fontWeight:isCA?700:500, fontFamily:"inherit", textAlign:"left", transition:"background 0.15s" }}
                onMouseEnter={e=>{ if(!isCA) e.currentTarget.style.background="#f1f5f9"; }}
                onMouseLeave={e=>{ if(!isCA) e.currentTarget.style.background="transparent"; }}>
                <span style={{ fontSize:13, width:16, textAlign:"center", flexShrink:0, color:isCA?"#00838f":"#94a3b8" }}>{c.label.split(" ")[0]}</span>
                <span style={{ flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.label.split(" ").slice(1).join(" ")}</span>
              </button>
            ); })}
          </div>;
        })}
      </nav>

      {/* Sidebar Footer */}
      {!sidebarCollapsed && <div style={{ borderTop:"1px solid #e0e6ed", background:"#f8fafc" }}>
        <div style={{ padding:"10px 14px 0", fontSize:10, color:"#64748b", lineHeight:1.5 }}>
          17 manuales · 7 guías eflow · 1 BPA
        </div>
        <div style={{ padding:"10px 14px 12px" }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"#0097A7", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, flexShrink:0 }}>
              {(profile?.email || user.email || "?").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, overflow:"hidden", minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#1D1D1B", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={profile?.email || user.email}>
                {profile?.nombre || profile?.email || user.email}
              </div>
              {role && ROLE_BADGE[role] && <span style={{ display:"inline-block", marginTop:2, fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:3, background:ROLE_BADGE[role].bg, color:ROLE_BADGE[role].color }}>{ROLE_BADGE[role].label}</span>}
            </div>
          </div>
          <button onClick={signOut} style={{ width:"100%", padding:"6px 8px", background:"#fff", border:"1px solid #e0e6ed", borderRadius:6, fontSize:10, fontWeight:600, color:"#475569", cursor:"pointer" }}>
            Cerrar sesión
          </button>
        </div>
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

        {/* Contenido — BPA · OLO (id "bpa") ahora muestra el modelo de procesos;
            Infraestructura (id "infra", nuevo submódulo de BPA) muestra el
            diagrama de arquitectura que antes vivía en BPA · OLO; Procesos
            (id "olo-arch") muestra los grids lineales por categoría operativa.
            Los ids existentes se dejan igual a propósito para no invalidar
            los permisos por rol ya configurados (keyed por id). */}
        {tab==="bpa"          && <BPAView selected={bpaSel} setSelected={setBpaSel}/>}
        {tab==="infra"        && <OLOArchView     searchQuery={globalSearch}/>}
        {tab==="olo-arch"     && <ProcesosOperativosView/>}
        {tab==="ecosystem"    && <EcosystemView   searchQuery={globalSearch}/>}
        {tab==="softland"     && <SoftlandView selected={slSel} setSelected={setSlSel}/>}
        {tab==="ops"          && <OpsView selected={opsSel} setSelected={setOpsSel}/>}
        {tab==="integrations" && <IntegrationsView searchQuery={globalSearch}/>}
        {tab==="context"      && <ContextView/>}
        {tab==="admin" && isAdmin && <AdminView/>}

        {/* Footer */}
        <footer style={{ marginTop:56, paddingTop:24, borderTop:"1px solid #e0e0e0", display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", gap:12, fontSize:11, color:"#888" }}>
          <span>17 manuales Softland · 7 guías eflow · 1 informe BPA · 0 acceso a esquema · 0 acceso a configuración real</span>
          <span style={{ fontFamily:"'JetBrains Mono','Consolas',monospace" }}>v0.5 · próxima iteración: AS · POS · FR · AC · Capital Humano</span>
        </footer>
      </div>
    </main>

    <BpaBotWidget/>
  </div>;
}
