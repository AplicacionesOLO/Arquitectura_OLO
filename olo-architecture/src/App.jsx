import { useState, useEffect, useMemo, useRef } from "react";
import { TABS, DESIGN, NAV_LAYERS } from "./data/constants.js";
import { SearchIcon, ShieldIcon } from "./components/icons.jsx";
import { OLOArchView } from "./views/OLOArchView.jsx";
import { EcosystemView } from "./views/EcosystemView.jsx";
import { BPAView } from "./views/BPAView.jsx";
import { WorkflowsView } from "./views/WorkflowsView.jsx";
import { SoftlandView } from "./views/SoftlandView.jsx";
import { OpsView } from "./views/OpsView.jsx";
import { IntegrationsView } from "./views/IntegrationsView.jsx";
import { ContextView } from "./views/ContextView.jsx";
import { AdminView } from "./views/AdminView.jsx";
import { ProcesosOperativosView } from "./views/ProcesosOperativosView.jsx";
import { RelacionesSistemasView } from "./views/RelacionesSistemasView.jsx";
import { BpaBotWidget } from "./components/BpaBotWidget.jsx";
import { NovedadesModal, useNovedades } from "./components/NovedadesModal.jsx";
import { useAuth } from "./auth/AuthContext.jsx";
import { NavContext } from "./lib/nav.js";
import { LoginScreen } from "./auth/LoginScreen.jsx";
import { PendingScreen } from "./auth/PendingScreen.jsx";
import oloLogo from "./assets/olo-logo.png";

const ADMIN_TAB = { id:"admin", label:"◆ Administración", sub:"Usuarios · Roles · Permisos del sistema" };

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
  const [expandedGroups, setExpandedGroups] = useState(()=>new Set());
  const novedades = useNovedades({ isAdmin, canSeeTab });

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

  const handleTab = id => { setTab(id); setBpaSel(null); setSlSel(null); setOpsSel(null); setNavFocus(null); };
  // Navegación cruzada entre módulos: { tab, ...foco }; `n` fuerza re-aplicar
  // el mismo foco dos veces seguidas.
  const [navFocus, setNavFocus] = useState(null);
  const navSeq = useRef(0);
  const navigate = (target) => {
    setTab(target.tab); setBpaSel(null); setSlSel(null); setOpsSel(null);
    setNavFocus({ ...target, n: ++navSeq.current });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const focusFor = (id) => navFocus?.tab === id ? navFocus : null;
  const activeTab = navTabs.find(t => t.id === tab);

  if (loading || (user && !profileLoaded)) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8f9fa", color:"#94a3b8", fontFamily:"'Segoe UI','Helvetica Neue',system-ui,sans-serif", fontSize:13 }}>Cargando…</div>;
  if (!user) return <LoginScreen/>;
  if (!isActive) return <PendingScreen/>;

  return <NavContext.Provider value={{ navigate }}>
  <div style={{ fontFamily:DESIGN.font, background:"#f8f9fa", color:DESIGN.ink, minHeight:"100vh", display:"flex" }}>
    <style>{`body{margin:0;}::selection{background:${DESIGN.ink};color:#fff;}`}</style>

    {/* Sidebar */}
    <aside style={{ width:sidebarCollapsed?64:220, minWidth:sidebarCollapsed?64:220, background:"#ffffff", color:DESIGN.ink, display:"flex", flexDirection:"column", transition:"width 0.2s ease, min-width 0.2s ease", overflow:"visible", position:"sticky", top:0, height:"100vh", borderRight:`1px solid ${DESIGN.border}` }}>
      {/* Sidebar Header — solo el isotipo, centrado (igual que Mayoreo: sin título ni versión al lado) */}
      <div style={{ padding:"18px 14px", borderBottom:`1px solid ${DESIGN.border}`, background:DESIGN.sunken, display:"flex", alignItems:"center", justifyContent:"center", minHeight:60, flexShrink:0 }}>
        <img src={oloLogo} alt="OLO" style={{ height:32, flexShrink:0 }}/>
      </div>

      {/* Toggle único, flotando sobre el borde derecho del sidebar — mismo botón en ambos estados, solo cambia de dirección. */}
      <button onClick={()=>setSidebarCollapsed(c=>!c)} title={sidebarCollapsed?"Expandir menú":"Contraer menú"}
        style={{ position:"absolute", top:22, left:sidebarCollapsed?52:208, width:24, height:24, borderRadius:"50%", background:"#fff", border:`1px solid ${DESIGN.border}`, color:DESIGN.inkSoft, cursor:"pointer", fontSize:13, lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 4px rgba(0,0,0,.12)", transition:"left 0.2s ease", zIndex:1 }}>
        {sidebarCollapsed ? "›" : "‹"}
      </button>

      {/* Nav Items */}
      <nav style={{ flex:1, padding:"8px 0", overflowY:"auto" }}>
        {navTree.map((t, idx) => {
          const isA = tab === t.id;
          // Encabezado de capa (Procesos → Operación → Sistemas → Datos) al cambiar de capa
          const layer = NAV_LAYERS.find(l => l.id === t.layer);
          const newLayer = t.layer !== navTree[idx - 1]?.layer;
          const layerHeader = newLayer && (sidebarCollapsed
            ? idx > 0 && <div style={{ height:1, background:DESIGN.border, margin:"6px 12px" }}/>
            : <div style={{ display:"flex", alignItems:"baseline", gap:6, padding:"12px 14px 4px", borderTop: idx > 0 ? `1px solid ${DESIGN.sunken2}` : "none", marginTop: idx > 0 ? 4 : 0 }}>
                {layer
                  ? <><span style={{ fontSize:10.5, fontWeight:700, color:DESIGN.ink, letterSpacing:"0.04em", textTransform:"uppercase" }}>{layer.label}</span>
                      <span style={{ fontSize:10, color:DESIGN.mutedSoft }}>{layer.sub}</span></>
                  : <span style={{ fontSize:10.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.04em", textTransform:"uppercase" }}>Administración</span>}
              </div>);
          const hasChildren = t.children.length > 0;
          const childActive = t.children.some(c => c.id === tab);
          const expanded = expandedGroups.has(t.id) || childActive;
          return <div key={t.id}>
            {layerHeader}
            <div style={{ display:"flex", alignItems:"stretch", background:isA?DESIGN.sunken2:"transparent", borderLeft:isA?`3px solid ${DESIGN.ink}`:"3px solid transparent", transition:"background 0.15s" }}
              onMouseEnter={e=>{ if(!isA) e.currentTarget.style.background=DESIGN.sunken; }}
              onMouseLeave={e=>{ if(!isA) e.currentTarget.style.background="transparent"; }}>
              <button onClick={()=>{ handleTab(t.id); if(hasChildren) toggleGroup(t.id); }}
                title={sidebarCollapsed?t.label:(hasChildren?(expanded?"Contraer":"Expandir"):undefined)}
                style={{ display:"flex", alignItems:"center", gap:10, width:"100%", flex:1, background:"transparent", border:"none", color:isA?DESIGN.ink:"#1D1D1B", padding:sidebarCollapsed?"12px 0":"11px 11px", cursor:"pointer", fontSize:13, fontWeight:isA?700:400, fontFamily:"inherit", textAlign:"left", justifyContent:sidebarCollapsed?"center":"flex-start" }}>
                {t.id==="admin"
                  ? <ShieldIcon style={{ fontSize:15, width:18, textAlign:"center", flexShrink:0, color:isA?DESIGN.ink:DESIGN.muted }}/>
                  : <span style={{ fontSize:16, lineHeight:1, width:18, textAlign:"center", flexShrink:0, color:isA?DESIGN.ink:DESIGN.muted }}>{t.label.split(" ")[0]}</span>}
                {!sidebarCollapsed && <span style={{ flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.label.split(" ").slice(1).join(" ")}</span>}
                {hasChildren && !sidebarCollapsed && <span style={{ color:DESIGN.mutedSoft, fontSize:11, flexShrink:0 }}>
                  <span style={{ display:"inline-block", transform:expanded?"rotate(90deg)":"rotate(0deg)", transition:"transform 0.15s" }}>›</span>
                </span>}
              </button>
            </div>
            {hasChildren && expanded && !sidebarCollapsed && t.children.map(c => { const isCA = tab === c.id; return (
              <button key={c.id} onClick={()=>handleTab(c.id)} style={{ display:"flex", alignItems:"center", width:"100%", background:isCA?DESIGN.sunken2:"transparent", border:"none", borderLeft:isCA?`3px solid ${DESIGN.ink}`:"3px solid transparent", color:isCA?DESIGN.ink:DESIGN.inkSoft, padding:"8px 14px 8px 32px", cursor:"pointer", fontSize:12, fontWeight:isCA?700:400, fontFamily:"inherit", textAlign:"left", transition:"background 0.15s" }}
                onMouseEnter={e=>{ if(!isCA) e.currentTarget.style.background=DESIGN.sunken; }}
                onMouseLeave={e=>{ if(!isCA) e.currentTarget.style.background="transparent"; }}>
                <span style={{ flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.label.split(" ").slice(1).join(" ")}</span>
              </button>
            ); })}
          </div>;
        })}
      </nav>

      {/* Sidebar Footer */}
      {!sidebarCollapsed && <div style={{ borderTop:`1px solid ${DESIGN.border}`, background:DESIGN.sunken }}>
        <div style={{ padding:"10px 14px 0", fontSize:10, color:DESIGN.muted, lineHeight:1.5 }}>
          Softland · eflow · Torre · SORTER
        </div>
        <div style={{ padding:"10px 14px 12px" }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:DESIGN.ink, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, flexShrink:0 }}>
              {(profile?.email || user.email || "?").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, overflow:"hidden", minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:DESIGN.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={profile?.email || user.email}>
                {profile?.nombre || profile?.email || user.email}
              </div>
              {role && ROLE_BADGE[role] && <span style={{ display:"inline-block", marginTop:2, fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:3, background:ROLE_BADGE[role].bg, color:ROLE_BADGE[role].color }}>{ROLE_BADGE[role].label}</span>}
            </div>
          </div>
          <button onClick={signOut} style={{ width:"100%", padding:"6px 8px", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:6, fontSize:10, fontWeight:400, color:DESIGN.inkSoft, cursor:"pointer" }}>
            Cerrar sesión
          </button>
        </div>
      </div>}
    </aside>

    {/* Main Content */}
    <main style={{ flex:1, padding:"20px 40px 64px 40px", overflowX:"clip", minWidth:0 }}>
      <div>

        {/* Header */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", gap:12, marginBottom:4 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:DESIGN.ink, margin:0 }}>{activeTab?.label.split(" ").slice(1).join(" ") || "Inicio"}</h1>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
              <div style={{ position:"relative" }}>
                <SearchIcon style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", fontSize:13, color:DESIGN.mutedSoft, pointerEvents:"none" }}/>
                <input
                  value={globalSearch}
                  onChange={e=>setGlobalSearch(e.target.value)}
                  placeholder="Buscar nodo, tabla, conexión…"
                  style={{ fontSize:13, border:`1px solid ${DESIGN.borderStrong}`, borderRadius:8, padding:"6px 10px 6px 30px", width:240, fontFamily:"inherit", outline:"none", background: DESIGN.surface, color:DESIGN.ink }}
                />
                {globalSearch && <button onClick={()=>setGlobalSearch("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:DESIGN.mutedSoft, fontSize:14, lineHeight:1 }}>✕</button>}
              </div>
              <span style={{ fontSize:12, color:DESIGN.muted }}>Softland v7.00 · eflow Cloud Suite</span>
            </div>
          </div>
          <p style={{ fontSize:13, color:DESIGN.inkSoft, margin:0, lineHeight:1.5 }}>{activeTab?.sub}</p>
        </div>

        {/* Contenido — BPA · OLO (id "bpa") ahora muestra el modelo de procesos;
            Infraestructura (id "infra", nuevo submódulo de BPA) muestra el
            diagrama de arquitectura que antes vivía en BPA · OLO; Procesos
            (id "olo-arch") muestra los grids lineales por categoría operativa.
            Los ids existentes se dejan igual a propósito para no invalidar
            los permisos por rol ya configurados (keyed por id). */}
        {tab==="bpa"          && <BPAView selected={bpaSel} setSelected={setBpaSel} onNavigate={navigate}/>}
        {tab==="infra"        && <OLOArchView     searchQuery={globalSearch}/>}
        {tab==="olo-arch"     && <ProcesosOperativosView onNavigate={navigate} focusCodigo={focusFor("olo-arch")?.codigo} focusSilo={focusFor("olo-arch")?.silo} focusSeq={focusFor("olo-arch")?.n}/>}
        {tab==="workflows"    && <WorkflowsView focus={focusFor("workflows")}/>}
        {tab==="relaciones"   && <RelacionesSistemasView/>}
        {tab==="ecosystem"    && <EcosystemView   searchQuery={globalSearch}/>}
        {tab==="softland"     && <SoftlandView selected={slSel} setSelected={setSlSel}/>}
        {tab==="ops"          && <OpsView selected={opsSel} setSelected={setOpsSel} focus={focusFor("ops")}/>}
        {tab==="integrations" && <IntegrationsView searchQuery={globalSearch} focus={focusFor("integrations")}/>}
        {tab==="context"      && <ContextView/>}
        {tab==="admin" && isAdmin && <AdminView/>}

        {/* Footer */}
        <footer style={{ marginTop:56, paddingTop:24, borderTop:`1px solid ${DESIGN.border}`, display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", gap:12, fontSize:12, color:DESIGN.muted }}>
          <span>Fuentes: 17 manuales Softland · manuales de eflow WMS, Torre de Control y SORTER CLIRO · 14 procedimientos CEDI · esquemas reales de EFLOW_OLO y WMH</span>
          <span>v0.6 · pendiente: AS · POS · FR · AC · Capital Humano · handheld RF</span>
        </footer>
      </div>
    </main>

    <BpaBotWidget/>
    {novedades.open && <NovedadesModal titulo={novedades.doc?.titulo} fecha={novedades.doc?.fecha} items={novedades.items} onClose={novedades.close}/>}
  </div>
  </NavContext.Provider>;
}
