// ═══════════════════════════════════════════════════════════════════════════
// VISTA · ADMINISTRACIÓN — Aprobaciones · Usuarios · Roles · Permisos (Supabase)
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { TABS } from "../data/constants.js";

const SUBTABS = [
  { id:"aprobaciones", label:"⏳ Aprobaciones", desc:"Cuentas nuevas sin rol — asígnales uno para activarlas" },
  { id:"usuarios",     label:"👥 Usuarios",     desc:"Cuentas activas y deshabilitadas · buscar · reasignar rol" },
  { id:"roles",        label:"🔑 Roles",        desc:"Roles del sistema y roles personalizados" },
  { id:"permisos",     label:"🛡 Permisos",    desc:"Qué secciones puede ver cada rol" },
];

const card = { background:"#fff", border:"1px solid #e0e0e0", borderRadius:10 };
const th = { padding:"10px 14px", color:"#666", fontWeight:700, letterSpacing:"0.05em", fontSize:11, textTransform:"uppercase", textAlign:"left" };
const td = { padding:"10px 14px", verticalAlign:"middle" };
const PAGE_SIZE = 10;

export function AdminView() {
  const [sub, setSub] = useState("aprobaciones");
  const [pendingCount, setPendingCount] = useState(null);

  const refreshPendingCount = useCallback(async () => {
    const { count } = await supabase.from("profiles").select("id", { count:"exact", head:true }).eq("status", "pending");
    setPendingCount(count ?? 0);
  }, []);

  useEffect(() => { refreshPendingCount(); }, [refreshPendingCount]);

  return <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
    <nav style={{ width:200, minWidth:200, ...card, overflow:"hidden", flexShrink:0, position:"sticky", top:20 }}>
      <div style={{ padding:"10px 14px", borderBottom:"1px solid #f0f0f0", background:"#fafafa", fontSize:10, fontWeight:700, color:"#888", letterSpacing:"0.08em", textTransform:"uppercase" }}>Administración</div>
      {SUBTABS.map(s => {
        const isA = sub === s.id;
        const badge = s.id==="aprobaciones" ? pendingCount : null;
        return <button key={s.id} onClick={()=>setSub(s.id)} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"10px 14px", border:"none", borderLeft:isA?"3px solid #00838f":"3px solid transparent", borderBottom:"1px solid #f5f5f5", background:isA?"#e0f7fa":"transparent", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s" }}>
          <span style={{ fontSize:13 }}>{s.label.split(" ")[0]}</span>
          <span style={{ fontSize:12, fontWeight:isA?700:500, color:isA?"#00838f":"#444", flex:1 }}>{s.label.split(" ").slice(1).join(" ")}</span>
          {!!badge && <span style={{ fontSize:10, fontWeight:700, color:"#fff", background:"#f39c12", borderRadius:9, minWidth:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 5px" }}>{badge}</span>}
        </button>;
      })}
    </nav>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ fontSize:12, color:"#777", margin:"0 0 16px 0" }}>{SUBTABS.find(s=>s.id===sub)?.desc}</p>
      {sub==="aprobaciones" && <AprobacionesPanel onChanged={refreshPendingCount}/>}
      {sub==="usuarios"     && <UsuariosPanel/>}
      {sub==="roles"        && <RolesPanel/>}
      {sub==="permisos"     && <PermisosPanel/>}
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

function LoadingBox() { return <div style={{ padding:24, textAlign:"center", color:"#888", fontSize:13 }}>Cargando…</div>; }
function ErrorBox({ msg }) { return <div style={{ padding:"12px 16px", background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:8, color:"#b91c1c", fontSize:12 }}>{msg}</div>; }
