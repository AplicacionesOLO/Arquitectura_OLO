// ═══════════════════════════════════════════════════════════════════════════
// VISTA · ADMINISTRACIÓN — Aprobaciones · Usuarios · Roles · Permisos (Supabase)
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { TABS } from "../data/constants.js";

const SUBTABS = [
  { id:"aprobaciones",     label:"⏳ Aprobaciones",  desc:"Cuentas nuevas sin rol — asígnales uno para activarlas" },
  { id:"usuarios",         label:"👥 Usuarios",      desc:"Cuentas activas y deshabilitadas · buscar · reasignar rol" },
  { id:"roles",            label:"🔑 Roles",         desc:"Roles del sistema y roles personalizados" },
  { id:"permisos",         label:"🛡 Permisos",     desc:"Qué secciones puede ver cada rol" },
  { id:"chatbot",          label:"🤖 Chatbot",       desc:"Documentos y permisos del asistente BPA-BOT" },
  { id:"bpabot_manuales",  label:"📄 Manuales",      desc:"Documentos que alimentan al asistente BPA-BOT", parent:"chatbot" },
  { id:"bpabot_permisos",  label:"◎ Permisos",      desc:"Qué puede hacer cada rol dentro del asistente", parent:"chatbot" },
];

const card = { background:"#fff", border:"1px solid #e0e0e0", borderRadius:10 };
const th = { padding:"10px 14px", color:"#666", fontWeight:700, letterSpacing:"0.05em", fontSize:11, textTransform:"uppercase", textAlign:"left" };
const td = { padding:"10px 14px", verticalAlign:"middle" };
const PAGE_SIZE = 10;

export function AdminView() {
  const [sub, setSub] = useState("aprobaciones");
  const [pendingCount, setPendingCount] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());

  const refreshPendingCount = useCallback(async () => {
    const { count } = await supabase.from("profiles").select("id", { count:"exact", head:true }).eq("status", "pending");
    setPendingCount(count ?? 0);
  }, []);

  useEffect(() => { refreshPendingCount(); }, [refreshPendingCount]);

  const tops = SUBTABS.filter(s => !s.parent);
  const childrenOf = (id) => SUBTABS.filter(s => s.parent === id);
  const toggleExpand = (id) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
    <nav style={{ width:200, minWidth:200, ...card, overflow:"hidden", flexShrink:0, position:"sticky", top:20 }}>
      <div style={{ padding:"10px 14px", borderBottom:"1px solid #f0f0f0", background:"#fafafa", fontSize:10, fontWeight:700, color:"#888", letterSpacing:"0.08em", textTransform:"uppercase" }}>Administración</div>
      {tops.map(s => {
        const kids = childrenOf(s.id);
        const hasKids = kids.length > 0;
        const childActive = kids.some(k => k.id === sub);
        const isExpanded = expanded.has(s.id) || childActive;
        const isA = sub === s.id;
        const badge = s.id==="aprobaciones" ? pendingCount : null;
        return <div key={s.id}>
          <div style={{ display:"flex", alignItems:"stretch" }}>
            <button onClick={()=>hasKids ? toggleExpand(s.id) : setSub(s.id)} style={{ display:"flex", alignItems:"center", gap:8, flex:1, padding:"10px 14px", border:"none", borderLeft:isA?"3px solid #00838f":"3px solid transparent", borderBottom:"1px solid #f5f5f5", background:isA?"#e0f7fa":"transparent", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s" }}>
              <span style={{ fontSize:13 }}>{s.label.split(" ")[0]}</span>
              <span style={{ fontSize:12, fontWeight:isA?700:500, color:isA?"#00838f":"#444", flex:1 }}>{s.label.split(" ").slice(1).join(" ")}</span>
              {!!badge && <span style={{ fontSize:10, fontWeight:700, color:"#fff", background:"#f39c12", borderRadius:9, minWidth:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 5px" }}>{badge}</span>}
            </button>
            {hasKids && <button onClick={()=>toggleExpand(s.id)} title={isExpanded?"Contraer":"Expandir"} style={{ background:"transparent", border:"none", borderBottom:"1px solid #f5f5f5", color:"#94a3b8", cursor:"pointer", fontSize:11, padding:"0 12px" }}>
              <span style={{ display:"inline-block", transform:isExpanded?"rotate(90deg)":"rotate(0deg)", transition:"transform 0.15s" }}>›</span>
            </button>}
          </div>
          {hasKids && isExpanded && kids.map(k => {
            const isCA = sub === k.id;
            return <button key={k.id} onClick={()=>setSub(k.id)} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 14px 8px 30px", border:"none", borderLeft:isCA?"3px solid #00838f":"3px solid transparent", borderBottom:"1px solid #f5f5f5", background:isCA?"#e0f7fa":"transparent", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s" }}>
              <span style={{ fontSize:12 }}>{k.label.split(" ")[0]}</span>
              <span style={{ fontSize:11.5, fontWeight:isCA?700:500, color:isCA?"#00838f":"#666", flex:1 }}>{k.label.split(" ").slice(1).join(" ")}</span>
            </button>;
          })}
        </div>;
      })}
    </nav>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ fontSize:12, color:"#777", margin:"0 0 16px 0" }}>{SUBTABS.find(s=>s.id===sub)?.desc}</p>
      {sub==="aprobaciones" && <AprobacionesPanel onChanged={refreshPendingCount}/>}
      {sub==="usuarios"     && <UsuariosPanel/>}
      {sub==="roles"        && <RolesPanel/>}
      {sub==="permisos"     && <PermisosPanel/>}
      {sub==="bpabot_manuales" && <BpaBotManualesPanel/>}
      {sub==="bpabot_permisos" && <BpaBotPermisosPanel/>}
    </div>
  </div>;
}

// ─────────────────────────────────────────────────────────────────────────
// Aprobaciones — solo cuentas con status='pending' (registradas, sin rol)
// ─────────────────────────────────────────────────────────────────────────
function AprobacionesPanel({ onChanged }) {
  const [rows, setRows] = useState(null);
  const [roles, setRoles] = useState([]);
  const [picked, setPicked] = useState({}); // { [id]: roleKey } — selección local antes de confirmar
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    const [{ data: profiles, error: e1 }, { data: rls, error: e2 }] = await Promise.all([
      supabase.from("profiles").select("*").eq("status", "pending").order("created_at", { ascending:false }),
      supabase.from("roles").select("key,label").order("key"),
    ]);
    if (e1 || e2) { setErr((e1||e2).message); return; }
    setRows(profiles); setRoles(rls);
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    const role = picked[id];
    if (!role) return;
    setBusyId(id); setErr(null);
    const { error } = await supabase.from("profiles").update({ role, status:"active" }).eq("id", id);
    setBusyId(null);
    if (error) { setErr(error.message); return; }
    setRows(prev => prev.filter(r => r.id !== id));
    onChanged?.();
  };

  const reject = async (id) => {
    setBusyId(id); setErr(null);
    const { error } = await supabase.from("profiles").update({ status:"disabled" }).eq("id", id);
    setBusyId(null);
    if (error) { setErr(error.message); return; }
    setRows(prev => prev.filter(r => r.id !== id));
    onChanged?.();
  };

  if (err) return <ErrorBox msg={err}/>;
  if (!rows) return <LoadingBox/>;

  if (rows.length === 0) return <div style={{ ...card, padding:"32px 16px", textAlign:"center", color:"#888", fontSize:13 }}>
    ✅ No hay cuentas pendientes de aprobación.
  </div>;

  return <div style={{ display:"grid", gap:10 }}>
    {rows.map(r => (
      <div key={r.id} style={{ ...card, padding:"14px 16px", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap", borderLeft:"3px solid #f39c12" }}>
        <div style={{ width:34, height:34, borderRadius:"50%", background:"#f39c12", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, flexShrink:0 }}>
          {(r.nombre||r.email||"?").charAt(0).toUpperCase()}
        </div>
        <div style={{ flex:"1 1 200px", minWidth:0 }}>
          <div style={{ fontWeight:700, color:"#1D1D1B", fontSize:13 }}>{r.nombre || "—"}</div>
          <div style={{ fontSize:11, color:"#888" }}>{r.email} · registrado el {new Date(r.created_at).toLocaleDateString("es-CR")}</div>
        </div>
        <select value={picked[r.id] ?? ""} disabled={busyId===r.id} onChange={e=>setPicked(p=>({ ...p, [r.id]:e.target.value }))}
          style={{ fontSize:11, border:"1px solid #ddd", borderRadius:6, padding:"6px 10px", background:"#fff", color:"#333", fontFamily:"inherit", cursor:"pointer" }}>
          <option value="" disabled>Elegir rol…</option>
          {roles.map(rl => <option key={rl.key} value={rl.key}>{rl.label}</option>)}
        </select>
        <button disabled={busyId===r.id || !picked[r.id]} onClick={()=>approve(r.id)}
          style={{ padding:"7px 14px", background: picked[r.id]?"#27ae60":"#e0e0e0", color:"#fff", border:"none", borderRadius:6, fontSize:11, fontWeight:700, cursor: picked[r.id]?"pointer":"default" }}>
          ✓ Aprobar
        </button>
        <button disabled={busyId===r.id} onClick={()=>reject(r.id)}
          style={{ padding:"7px 14px", background:"none", color:"#c0392b", border:"1px solid #ef9a9a", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer" }}>
          Rechazar
        </button>
      </div>
    ))}
  </div>;
}

// ─────────────────────────────────────────────────────────────────────────
// Usuarios — cuentas ya activas/deshabilitadas (las pendientes viven en
// Aprobaciones). Buscador tipo glass/blur + paginación.
// ─────────────────────────────────────────────────────────────────────────
function UsuariosPanel() {
  const [rows, setRows] = useState(null);
  const [roles, setRoles] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const [{ data: profiles, error: e1 }, { data: rls, error: e2 }] = await Promise.all([
      supabase.from("profiles").select("*").neq("status", "pending").order("created_at", { ascending:false }),
      supabase.from("roles").select("key,label").order("key"),
    ]);
    if (e1 || e2) { setErr((e1||e2).message); return; }
    setRows(profiles); setRoles(rls);
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeRole = async (id, role) => {
    setBusyId(id); setErr(null);
    const { error } = await supabase.from("profiles").update({ role, status:"active" }).eq("id", id);
    setBusyId(null);
    if (error) { setErr(error.message); return; }
    setRows(prev => prev.map(r => r.id===id ? { ...r, role, status:"active" } : r));
  };

  const setStatus = async (id, status) => {
    setBusyId(id); setErr(null);
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    setBusyId(null);
    if (error) { setErr(error.message); return; }
    setRows(prev => prev.map(r => r.id===id ? { ...r, status } : r));
  };

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => (r.nombre||"").toLowerCase().includes(q) || (r.email||"").toLowerCase().includes(q));
  }, [rows, search]);

  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  if (err) return <ErrorBox msg={err}/>;
  if (!rows) return <LoadingBox/>;

  return <div>
    {/* Buscador — panel glass/blur */}
    <div style={{
      position:"sticky", top:0, zIndex:5, marginBottom:14, padding:"10px 14px", borderRadius:12,
      background:"rgba(255,255,255,0.55)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)",
      border:"1px solid rgba(255,255,255,0.7)", boxShadow:"0 4px 20px rgba(15,23,42,0.08)",
      display:"flex", alignItems:"center", gap:10,
    }}>
      <span style={{ fontSize:14, color:"#94a3b8" }}>🔍</span>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre o correo…"
        style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:13, fontFamily:"inherit", color:"#1D1D1B" }}/>
      {search && <button onClick={()=>setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:13 }}>✕</button>}
      <span style={{ fontSize:11, color:"#888", whiteSpace:"nowrap" }}>{filtered.length} resultado{filtered.length!==1?"s":""}</span>
    </div>

    <div style={{ ...card, overflow:"hidden", overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead><tr style={{ background:"#fafafa" }}>
          <th style={th}>Usuario</th><th style={th}>Correo</th><th style={th}>Estado</th><th style={th}>Rol</th><th style={th}>Registrado</th><th style={th}></th>
        </tr></thead>
        <tbody>
          {pageRows.map(r => (
            <tr key={r.id} style={{ borderTop:"1px solid #f0f0f0" }}>
              <td style={td}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:"#0097A7", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:11, flexShrink:0 }}>{(r.nombre||r.email||"?").charAt(0).toUpperCase()}</div>
                  <span style={{ fontWeight:600, color:"#1D1D1B" }}>{r.nombre || "—"}</span>
                </div>
              </td>
              <td style={{ ...td, color:"#555" }}>{r.email}</td>
              <td style={td}><StatusBadge status={r.status}/></td>
              <td style={td}>
                <select value={r.role ?? ""} disabled={busyId===r.id} onChange={e=>changeRole(r.id, e.target.value)}
                  style={{ fontSize:11, border:"1px solid #ddd", borderRadius:6, padding:"4px 8px", background:"#fff", color:"#333", fontFamily:"inherit", cursor:"pointer" }}>
                  {!r.role && <option value="" disabled>— Sin asignar —</option>}
                  {roles.map(rl => <option key={rl.key} value={rl.key}>{rl.label}</option>)}
                </select>
              </td>
              <td style={{ ...td, color:"#888" }}>{new Date(r.created_at).toLocaleDateString("es-CR")}</td>
              <td style={{ ...td, textAlign:"right" }}>
                {r.status==="active" && <button disabled={busyId===r.id} onClick={()=>setStatus(r.id,"disabled")} style={{ background:"none", border:"none", color:"#c0392b", cursor:"pointer", fontSize:11 }}>Deshabilitar</button>}
                {r.status==="disabled" && <button disabled={busyId===r.id || !r.role} title={!r.role?"Asigna un rol primero":undefined} onClick={()=>setStatus(r.id,"active")} style={{ background:"none", border:"none", color:"#27ae60", cursor:"pointer", fontSize:11, opacity:!r.role?0.5:1 }}>Reactivar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length===0 && <div style={{ padding:24, textAlign:"center", color:"#888", fontSize:13 }}>{search?"Sin resultados para la búsqueda.":"Sin usuarios registrados."}</div>}
    </div>

    {filtered.length > 0 && <Pagination page={page} totalPages={totalPages} onChange={setPage}/>}
  </div>;
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:14 }}>
    <button disabled={page===1} onClick={()=>onChange(page-1)} style={{ padding:"5px 10px", border:"1px solid #ddd", borderRadius:6, background:"#fff", color: page===1?"#ccc":"#444", cursor: page===1?"default":"pointer", fontSize:11 }}>‹ Anterior</button>
    <span style={{ fontSize:11, color:"#888", margin:"0 8px" }}>Página {page} de {totalPages}</span>
    <button disabled={page===totalPages} onClick={()=>onChange(page+1)} style={{ padding:"5px 10px", border:"1px solid #ddd", borderRadius:6, background:"#fff", color: page===totalPages?"#ccc":"#444", cursor: page===totalPages?"default":"pointer", fontSize:11 }}>Siguiente ›</button>
  </div>;
}

const STATUS_META = {
  active:   { label:"Activo",       bg:"#e8f5e9", color:"#1e8449" },
  pending:  { label:"Pendiente",    bg:"#fff8e1", color:"#8a6d00" },
  disabled: { label:"Deshabilitado", bg:"#fbe9e7", color:"#c0392b" },
};
function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:8, background:m.bg, color:m.color }}>{m.label}</span>;
}

// ─────────────────────────────────────────────────────────────────────────
function RolesPanel() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState(null);
  const [label, setLabel] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("roles").select("*").order("is_system", { ascending:false }).order("key");
    if (error) { setErr(error.message); return; }
    setRows(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

  const handleCreate = async (e) => {
    e.preventDefault();
    const key = slugify(label);
    if (!key) return;
    setBusy(true); setErr(null);
    const { error } = await supabase.from("roles").insert({ key, label: label.trim(), description: desc.trim() || null });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setLabel(""); setDesc(""); load();
  };

  const handleDelete = async (key) => {
    setErr(null);
    const { error } = await supabase.from("roles").delete().eq("key", key);
    if (error) { setErr(error.message); return; }
    load();
  };

  if (err) return <ErrorBox msg={err}/>;
  if (!rows) return <LoadingBox/>;

  return <div>
    <div style={{ ...card, overflow:"hidden", marginBottom:16 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead><tr style={{ background:"#fafafa" }}>
          <th style={th}>Rol</th><th style={th}>Clave</th><th style={th}>Descripción</th><th style={{...th,textAlign:"right"}}>Sistema</th><th style={th}></th>
        </tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.key} style={{ borderTop:"1px solid #f0f0f0" }}>
              <td style={{ ...td, fontWeight:700, color:"#1D1D1B" }}>{r.label}</td>
              <td style={{ ...td, fontFamily:"'JetBrains Mono','Consolas',monospace", color:"#888" }}>{r.key}</td>
              <td style={{ ...td, color:"#555" }}>{r.description || "—"}</td>
              <td style={{ ...td, textAlign:"right" }}>{r.is_system && <span style={{ fontSize:9, fontWeight:700, color:"#92400e", background:"#fef3c7", padding:"2px 8px", borderRadius:8 }}>SISTEMA</span>}</td>
              <td style={{ ...td, textAlign:"right" }}>{!r.is_system && <button onClick={()=>handleDelete(r.key)} style={{ background:"none", border:"none", color:"#c0392b", cursor:"pointer", fontSize:11 }}>Eliminar</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <form onSubmit={handleCreate} style={{ ...card, padding:"14px 16px", display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
      <div style={{ display:"flex", flexDirection:"column", gap:4, flex:"1 1 160px" }}>
        <label style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase" }}>Nombre del rol</label>
        <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="ej. Auditor" required
          style={{ fontSize:12, border:"1px solid #ddd", borderRadius:6, padding:"7px 10px", fontFamily:"inherit" }}/>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4, flex:"2 1 220px" }}>
        <label style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase" }}>Descripción (opcional)</label>
        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Qué puede hacer este rol"
          style={{ fontSize:12, border:"1px solid #ddd", borderRadius:6, padding:"7px 10px", fontFamily:"inherit" }}/>
      </div>
      <button type="submit" disabled={busy || !label.trim()}
        style={{ padding:"7px 16px", background:"#00838f", color:"#fff", border:"none", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer" }}>
        + Crear rol
      </button>
    </form>
  </div>;
}

// ─────────────────────────────────────────────────────────────────────────
function PermisosPanel() {
  const [roles, setRoles] = useState(null);
  const [perms, setPerms] = useState({}); // { [roleKey]: Set(tab_id) }
  const [err, setErr] = useState(null);
  const gridTabs = TABS; // las 7 secciones principales — Administración se gestiona aparte (solo admin)

  const load = useCallback(async () => {
    const [{ data: rls, error: e1 }, { data: rp, error: e2 }] = await Promise.all([
      supabase.from("roles").select("*").order("is_system", { ascending:false }).order("key"),
      supabase.from("role_permissions").select("role_key,tab_id,access"),
    ]);
    if (e1 || e2) { setErr((e1||e2).message); return; }
    const map = {};
    (rp||[]).forEach(p => { if (p.access==="view") { (map[p.role_key] ||= new Set()).add(p.tab_id); } });
    setRoles(rls); setPerms(map);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (roleKey, tabId, current) => {
    const next = current ? "none" : "view";
    setPerms(prev => {
      const copy = { ...prev, [roleKey]: new Set(prev[roleKey] || []) };
      current ? copy[roleKey].delete(tabId) : copy[roleKey].add(tabId);
      return copy;
    });
    const { error } = await supabase.from("role_permissions").upsert({ role_key: roleKey, tab_id: tabId, access: next });
    if (error) setErr(error.message);
  };

  if (err) return <ErrorBox msg={err}/>;
  if (!roles) return <LoadingBox/>;

  return <div>
    <div style={{ ...card, overflow:"hidden", overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead><tr style={{ background:"#fafafa" }}>
          <th style={th}>Rol</th>
          {gridTabs.map(t => <th key={t.id} style={{ ...th, textAlign:"center" }}>{t.label.split(" ").slice(1).join(" ")}</th>)}
        </tr></thead>
        <tbody>
          {roles.filter(r=>r.key!=="admin").map(r => (
            <tr key={r.key} style={{ borderTop:"1px solid #f0f0f0" }}>
              <td style={{ ...td, fontWeight:700, color:"#1D1D1B", whiteSpace:"nowrap" }}>{r.label}</td>
              {gridTabs.map(t => {
                const on = perms[r.key]?.has(t.id) ?? false;
                return <td key={t.id} style={{ ...td, textAlign:"center" }}>
                  <button onClick={()=>toggle(r.key, t.id, on)}
                    title={on?"Visible — clic para ocultar":"Oculto — clic para mostrar"}
                    style={{ width:22, height:22, borderRadius:6, border:`1px solid ${on?"#00838f":"#ddd"}`, background:on?"#00838f":"#fff", color:on?"#fff":"#ccc", cursor:"pointer", fontSize:12, lineHeight:1 }}>
                    {on?"✓":"—"}
                  </button>
                </td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p style={{ fontSize:11, color:"#999", marginTop:10 }}>El rol <b>Admin</b> siempre ve todas las secciones, incluida Administración — no se gestiona aquí para evitar bloqueos accidentales.</p>
  </div>;
}

// ─────────────────────────────────────────────────────────────────────────
// Manuales BPA-BOT — sube documentos al bucket privado BPA_BOT_Manuales y
// los indexa en el Vector Store de OpenAI vía la Edge Function bpabot-ingest.
// ─────────────────────────────────────────────────────────────────────────
const BPABOT_BUCKET = "BPA_BOT_Manuales";
const STATUS_META_BOT = {
  pendiente: { label:"Procesando…", bg:"#fff8e1", color:"#8a6d00" },
  listo:     { label:"Listo",       bg:"#e8f5e9", color:"#1e8449" },
  error:     { label:"Error",       bg:"#fbe9e7", color:"#c0392b" },
};

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
}

function BpaBotManualesPanel() {
  const [rows, setRows] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("bpabot_manuales").select("*").order("created_at", { ascending:false });
    if (error) { setErr(error.message); return; }
    setRows(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true); setErr(null);
    const { data: userData } = await supabase.auth.getUser();
    const path = `${Date.now()}_${file.name}`;

    const { error: upErr } = await supabase.storage.from(BPABOT_BUCKET).upload(path, file);
    if (upErr) { setBusy(false); setErr(upErr.message); return; }

    const { data: inserted, error: insErr } = await supabase.from("bpabot_manuales").insert({
      titulo: titulo.trim() || file.name,
      file_name: file.name,
      bucket: BPABOT_BUCKET,
      path,
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by: userData?.user?.id,
    }).select().single();
    if (insErr) { setBusy(false); setErr(insErr.message); return; }

    setTitulo(""); setFile(null);
    load();

    const { error: fnErr } = await supabase.functions.invoke("bpabot-ingest", { body: { action:"ingest", manualId: inserted.id } });
    setBusy(false);
    if (fnErr) setErr("El archivo se subió, pero la indexación falló: " + fnErr.message);
    load();
  };

  const handleDelete = async (id) => {
    setErr(null);
    const { error } = await supabase.functions.invoke("bpabot-ingest", { body: { action:"delete", manualId: id } });
    if (error) { setErr(error.message); return; }
    load();
  };

  if (err && !rows) return <ErrorBox msg={err}/>;
  if (!rows) return <LoadingBox/>;

  return <div>
    <form onSubmit={handleUpload} style={{ ...card, padding:"14px 16px", display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end", marginBottom:16 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:4, flex:"1 1 220px" }}>
        <label style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase" }}>Título (opcional)</label>
        <input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="ej. Manual de Recepción eFlow"
          style={{ fontSize:12, border:"1px solid #ddd", borderRadius:6, padding:"7px 10px", fontFamily:"inherit" }}/>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4, flex:"1 1 220px" }}>
        <label style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase" }}>Archivo (PDF, DOCX, TXT…)</label>
        <input type="file" onChange={e=>setFile(e.target.files?.[0] ?? null)}
          style={{ fontSize:12, fontFamily:"inherit" }}/>
      </div>
      <button type="submit" disabled={busy || !file}
        style={{ padding:"7px 16px", background: busy||!file ? "#e0e0e0" : "#00838f", color:"#fff", border:"none", borderRadius:6, fontSize:12, fontWeight:700, cursor: busy||!file ? "default" : "pointer" }}>
        {busy ? "Subiendo…" : "+ Cargar manual"}
      </button>
    </form>

    {err && <div style={{ marginBottom:12 }}><ErrorBox msg={err}/></div>}

    <div style={{ ...card, overflow:"hidden", overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead><tr style={{ background:"#fafafa" }}>
          <th style={th}>Título</th><th style={th}>Archivo</th><th style={th}>Tamaño</th><th style={th}>Estado</th><th style={th}>Cargado</th><th style={th}></th>
        </tr></thead>
        <tbody>
          {rows.map(r => {
            const meta = STATUS_META_BOT[r.status] || STATUS_META_BOT.pendiente;
            return <tr key={r.id} style={{ borderTop:"1px solid #f0f0f0" }}>
              <td style={{ ...td, fontWeight:700, color:"#1D1D1B" }}>{r.titulo || "—"}</td>
              <td style={{ ...td, color:"#555" }}>{r.file_name}</td>
              <td style={{ ...td, color:"#888" }}>{formatSize(r.size_bytes)}</td>
              <td style={td}><span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:8, background:meta.bg, color:meta.color }}>{meta.label}</span></td>
              <td style={{ ...td, color:"#888" }}>{new Date(r.created_at).toLocaleDateString("es-CR")}</td>
              <td style={{ ...td, textAlign:"right" }}>
                <button onClick={()=>handleDelete(r.id)} style={{ background:"none", border:"none", color:"#c0392b", cursor:"pointer", fontSize:11 }}>Eliminar</button>
              </td>
            </tr>;
          })}
        </tbody>
      </table>
      {rows.length===0 && <div style={{ padding:24, textAlign:"center", color:"#888", fontSize:13 }}>Sin manuales cargados todavía.</div>}
    </div>
  </div>;
}

// ─────────────────────────────────────────────────────────────────────────
// Permisos BPA-BOT — matriz de capacidades por rol (independiente de la
// visibilidad del tab, que se gestiona en Permisos). El admin siempre tiene
// las 3 capacidades (forzado en bpabot_has_capability), por eso no se lista.
// ─────────────────────────────────────────────────────────────────────────
const BPABOT_CAPS = [
  { key:"gestionar_documentos", label:"Gestionar documentos", desc:"Subir / eliminar manuales" },
  { key:"chat_semantico",       label:"Chat semántico",       desc:"Respuestas con síntesis e interpretación de varios manuales" },
  { key:"consulta_documental",  label:"Consulta documental",  desc:"Respuestas con citas literales de los manuales" },
];

function BpaBotPermisosPanel() {
  const [roles, setRoles] = useState(null);
  const [caps, setCaps] = useState({}); // { [roleKey]: Set(capability) }
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    const [{ data: rls, error: e1 }, { data: rc, error: e2 }] = await Promise.all([
      supabase.from("roles").select("*").eq("is_system", true).order("key"),
      supabase.from("bpabot_role_capabilities").select("role_key,capability,enabled"),
    ]);
    if (e1 || e2) { setErr((e1||e2).message); return; }
    const map = {};
    (rc||[]).forEach(c => { if (c.enabled) (map[c.role_key] ||= new Set()).add(c.capability); });
    setRoles(rls); setCaps(map);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (roleKey, cap, current) => {
    setCaps(prev => {
      const copy = { ...prev, [roleKey]: new Set(prev[roleKey] || []) };
      current ? copy[roleKey].delete(cap) : copy[roleKey].add(cap);
      return copy;
    });
    const { error } = await supabase.from("bpabot_role_capabilities").upsert({ role_key: roleKey, capability: cap, enabled: !current });
    if (error) setErr(error.message);
  };

  if (err) return <ErrorBox msg={err}/>;
  if (!roles) return <LoadingBox/>;

  return <div>
    <div style={{ ...card, overflow:"hidden", overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead><tr style={{ background:"#fafafa" }}>
          <th style={th}>Rol</th>
          {BPABOT_CAPS.map(c => <th key={c.key} style={{ ...th, textAlign:"center" }} title={c.desc}>{c.label}</th>)}
        </tr></thead>
        <tbody>
          {roles.filter(r=>r.key!=="admin").map(r => (
            <tr key={r.key} style={{ borderTop:"1px solid #f0f0f0" }}>
              <td style={{ ...td, fontWeight:700, color:"#1D1D1B", whiteSpace:"nowrap" }}>{r.label}</td>
              {BPABOT_CAPS.map(c => {
                const on = caps[r.key]?.has(c.key) ?? false;
                return <td key={c.key} style={{ ...td, textAlign:"center" }}>
                  <button onClick={()=>toggle(r.key, c.key, on)}
                    title={on?"Habilitado — clic para deshabilitar":"Deshabilitado — clic para habilitar"}
                    style={{ width:22, height:22, borderRadius:6, border:`1px solid ${on?"#00838f":"#ddd"}`, background:on?"#00838f":"#fff", color:on?"#fff":"#ccc", cursor:"pointer", fontSize:12, lineHeight:1 }}>
                    {on?"✓":"—"}
                  </button>
                </td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p style={{ fontSize:11, color:"#999", marginTop:10 }}>El rol <b>Admin</b> siempre tiene las 3 capacidades — no se gestiona aquí para evitar bloqueos accidentales.</p>
  </div>;
}

function LoadingBox() { return <div style={{ padding:24, textAlign:"center", color:"#888", fontSize:13 }}>Cargando…</div>; }
function ErrorBox({ msg }) { return <div style={{ padding:"12px 16px", background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:8, color:"#b91c1c", fontSize:12 }}>{msg}</div>; }
