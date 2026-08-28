// ═══════════════════════════════════════════════════════════════════════════
// VISTA · PROCESOS OPERATIVOS — Silos (categorías) dinámicos, cada uno con
// un árbol Macroproceso → Proceso → Subproceso persistido en Supabase.
// Todos los niveles son colapsables; los Subprocesos (nivel más profundo)
// permiten adjuntar archivos de Detalle al bucket "Detalles_Porcesos".
// Layout homologado con el estándar del Grupo (Procesos de BPA Mayoreo):
// buscador, expandir/colapsar todo, línea de conteos, filas Silo/Macroproceso
// con etiqueta + insignias de conteo a la derecha, Proceso en fila con borde,
// Subprocesos como lista plana con ícono de ojo cuando hay documento.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { PROCESO_COLOR_PALETTE } from "../data/procesosOperativos.js";
import { DrawioFlowchart } from "../schemas/DrawioFlowchart.jsx";
import { PdfViewer } from "../components/PdfViewer.jsx";
import { DESIGN } from "../data/constants.js";
import { SearchIcon, EyeIcon } from "../components/icons.jsx";

const BUCKET = "Detalles_Porcesos";

function buildTree(nodes, filesByNode, parentId) {
  return nodes
    .filter(n => n.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(n => ({ ...n, files: filesByNode[n.id] || [], children: buildTree(nodes, filesByNode, n.id) }));
}
function countAll(nodes) {
  return nodes.reduce((s, n) => s + 1 + countAll(n.children || []), 0);
}
function countFiles(nodes) {
  return nodes.reduce((s, n) => s + (n.files?.length || 0) + countFiles(n.children || []), 0);
}
// Cuenta nodos en un nivel exacto del árbol (0 = raíz del array recibido).
function countAtDepth(nodes, target) {
  if (target === 0) return nodes.length;
  return nodes.reduce((s, n) => s + countAtDepth(n.children || [], target - 1), 0);
}
function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
}
// Todos los ids del árbol (para Expandir/Colapsar todo).
function allIds(nodes, acc = []) {
  nodes.forEach(n => { acc.push(n.id); allIds(n.children || [], acc); });
  return acc;
}
// Filtra el árbol por texto: conserva un nodo si su nombre matchea o si algún
// descendiente matchea. `matched` marca si ESTE nodo particular matchea
// (para resaltarlo), independiente de por qué se conservó la rama.
function filterTree(nodes, q) {
  if (!q) return nodes;
  const out = [];
  nodes.forEach(n => {
    const kids = filterTree(n.children || [], q);
    const self = (n.name || "").toLowerCase().includes(q);
    if (self || kids.length) out.push({ ...n, children: kids, matched: self });
  });
  return out;
}

// Auditoría de completitud del árbol: nombres vacíos, niveles sin hijos, y
// subprocesos (hoja) sin ningún documento de Detalle adjunto.
function auditTree(categorias) {
  const nombresVacios = [], silosVacios = [], macrosVacios = [], procesosVacios = [], subsSinDocumento = [];
  let totalSubs = 0, subsConDocumento = 0;

  categorias.forEach(cat => {
    const p0 = cat.label?.trim() || "(silo sin nombre)";
    if (!cat.label?.trim()) nombresVacios.push({ path: "Silo", detail: `#${cat.num}` });
    if (cat.tree.length === 0) silosVacios.push({ path: p0 });
    cat.tree.forEach(macro => {
      const p1 = `${p0} › ${macro.name?.trim() || "(sin nombre)"}`;
      if (!macro.name?.trim()) nombresVacios.push({ path: p0, detail: "Macroproceso" });
      if (macro.children.length === 0) macrosVacios.push({ path: p1 });
      macro.children.forEach(proc => {
        const p2 = `${p1} › ${proc.name?.trim() || "(sin nombre)"}`;
        if (!proc.name?.trim()) nombresVacios.push({ path: p1, detail: "Proceso" });
        if (proc.children.length === 0) procesosVacios.push({ path: p2 });
        proc.children.forEach(sub => {
          const p3 = `${p2} › ${sub.name?.trim() || "(sin nombre)"}`;
          if (!sub.name?.trim()) nombresVacios.push({ path: p2, detail: "Subproceso" });
          totalSubs++;
          if (sub.files?.length > 0) subsConDocumento++;
          else subsSinDocumento.push({ path: p3 });
        });
      });
    });
  });

  const pct = totalSubs > 0 ? Math.round((subsConDocumento / totalSubs) * 100) : 100;
  return { nombresVacios, silosVacios, macrosVacios, procesosVacios, subsSinDocumento, totalSubs, subsConDocumento, pct };
}

function AuditSection({ title, items, render }) {
  if (items.length === 0) return <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0", borderBottom:`1px solid ${DESIGN.sunken2}` }}>
    <span style={{ color:"#16a34a", fontSize:14 }}>✓</span>
    <span style={{ fontSize:12.5, color:DESIGN.inkSoft }}>{title} — sin hallazgos</span>
  </div>;
  return <div style={{ padding:"10px 0", borderBottom:`1px solid ${DESIGN.sunken2}` }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
      <span style={{ color:"#b45309", fontSize:13 }}>▲</span>
      <span style={{ fontSize:12.5, fontWeight:700, color:DESIGN.ink }}>{title}</span>
      <span style={{ fontSize:11, fontWeight:700, color:"#b45309", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:"0 7px" }}>{items.length}</span>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:3, paddingLeft:22 }}>
      {items.slice(0, 30).map((it, i) => <div key={i} style={{ fontSize:11.5, color:DESIGN.inkSoft }}>{render ? render(it) : it.path}</div>)}
      {items.length > 30 && <div style={{ fontSize:11, color:DESIGN.mutedSoft }}>+ {items.length - 30} más…</div>}
    </div>
  </div>;
}

function AuditModal({ categorias, onClose }) {
  const a = useMemo(() => auditTree(categorias), [categorias]);
  const totalFindings = a.nombresVacios.length + a.silosVacios.length + a.macrosVacios.length + a.procesosVacios.length + a.subsSinDocumento.length;
  return <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
    <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:12, width:"min(680px,100%)", maxHeight:"85vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.35)" }}>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${DESIGN.border}`, display:"flex", alignItems:"center", gap:12, background:DESIGN.sunken }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:DESIGN.ink }}>Auditoría de Procesos</div>
          <div style={{ fontSize:11.5, color:DESIGN.muted, marginTop:2 }}>Completitud del árbol Silo → Macroproceso → Proceso → Subproceso</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:22, fontWeight:700, color: a.pct>=80?"#16a34a":a.pct>=50?"#b45309":"#b91c1c" }}>{a.pct}%</div>
          <div style={{ fontSize:10, color:DESIGN.muted }}>subprocesos con documento</div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", fontSize:18, cursor:"pointer", lineHeight:1, padding:0 }}>✕</button>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:"6px 20px 16px" }}>
        {totalFindings === 0
          ? <div style={{ padding:"28px 0", textAlign:"center", color:"#16a34a", fontSize:13 }}>✓ Sin hallazgos — el árbol de Procesos está completo.</div>
          : <>
              <AuditSection title="Nombres vacíos" items={a.nombresVacios} render={it => <>{it.path} <span style={{ color:DESIGN.mutedSoft }}>· {it.detail} sin nombre</span></>}/>
              <AuditSection title="Silos sin macroprocesos" items={a.silosVacios}/>
              <AuditSection title="Macroprocesos sin procesos" items={a.macrosVacios}/>
              <AuditSection title="Procesos sin subprocesos" items={a.procesosVacios}/>
              <AuditSection title="Subprocesos sin documento adjunto" items={a.subsSinDocumento}/>
            </>}
      </div>
    </div>
  </div>;
}

function Chevron({ collapsed }) {
  return <span style={{ display:"inline-block", fontSize:"0.75em", transform: collapsed?"rotate(0deg)":"rotate(90deg)", transition:"transform 0.15s" }}>▶</span>;
}

function CountBadge({ n, label }) {
  return <div style={{ textAlign:"right", flexShrink:0 }}>
    <div style={{ fontWeight:700, fontSize:15, color:DESIGN.ink, lineHeight:1.2 }}>{n}</div>
    <div style={{ fontSize:10, color:DESIGN.muted }}>{label}</div>
  </div>;
}
function CountPill({ n }) {
  return <span style={{ fontSize:12, fontWeight:600, color:DESIGN.inkSoft, border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"2px 10px", minWidth:26, textAlign:"center", flexShrink:0 }}>{n}</span>;
}

// Determina cómo previsualizar un archivo sin salir de la app.
function viewerKind(file) {
  const mime = file.mime_type || "";
  const ext = (file.file_name || "").split(".").pop()?.toLowerCase() || "";
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (mime.startsWith("text/") || ["txt","md","csv","log","json"].includes(ext)) return "text";
  if (["doc","docx","xls","xlsx","ppt","pptx"].includes(ext)) return "office";
  if (ext === "drawio") return "drawio";
  return "unsupported";
}

// Diagrama de flujo draw.io: se descarga como texto (es XML) y se renderiza
// con el motor propio DrawioFlowchart — no hay iframe posible para este tipo.
function DrawioViewer({ url, title }) {
  const [xml, setXml] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetch(url).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(t => { if (!cancelled) setXml(t); })
      .catch(e => { if (!cancelled) setErr(e.message); });
    return () => { cancelled = true; };
  }, [url]);
  if (err) return <div style={{ color:"#b91c1c", fontSize:12, padding:20 }}>No se pudo cargar el diagrama: {err}</div>;
  if (!xml) return <div style={{ color:"#888", fontSize:12, padding:20 }}>Cargando diagrama…</div>;
  return <div style={{ width:"100%", height:"100%", overflow:"auto" }}><DrawioFlowchart xml={xml} title={title}/></div>;
}

export function FileViewerModal({ file, url, onClose }) {
  const kind = viewerKind(file);
  const [full, setFull] = useState(false);
  return <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding: full?0:24 }}>
    <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius: full?0:12, width: full?"100vw":"min(1000px,100%)", height: full?"100vh":"min(85vh,900px)", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.35)", transition:"width 0.15s, height 0.15s, border-radius 0.15s" }}>
      <div style={{ padding:"10px 16px", borderBottom:"1px solid #eee", display:"flex", alignItems:"center", gap:10, background:"#fafafa" }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#1D1D1B", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.file_name}</span>
        <button onClick={()=>setFull(f=>!f)} title={full?"Restaurar tamaño":"Pantalla completa"} style={{ background:"none", border:"1px solid #ddd", borderRadius:6, color:"#666", cursor:"pointer", fontSize:13, lineHeight:1, padding:"4px 9px", flexShrink:0 }}>{full?"⤡":"⤢"}</button>
        <a href={url} target="_blank" rel="noreferrer" style={{ fontSize:11, fontWeight:600, color:"#0f172a", textDecoration:"none", border:"1px solid #0f172a55", borderRadius:6, padding:"4px 10px", flexShrink:0 }}>↗ Abrir en pestaña</a>
        <a href={url} download={file.file_name} style={{ fontSize:11, fontWeight:600, color:"#0f172a", textDecoration:"none", border:"1px solid #0f172a55", borderRadius:6, padding:"4px 10px", flexShrink:0 }}>⇩ Descargar</a>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", fontSize:18, cursor:"pointer", lineHeight:1, padding:0, flexShrink:0 }}>✕</button>
      </div>
      <div style={{ flex:1, overflow:"auto", background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {kind==="image" && <img src={url} alt={file.file_name} style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }}/>}
        {kind==="pdf"   && <PdfViewer url={url}/>}
        {kind==="text"  && <iframe src={url} title={file.file_name} style={{ width:"100%", height:"100%", border:"none", background:"#fff" }}/>}
        {kind==="office"&& <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`} title={file.file_name} style={{ width:"100%", height:"100%", border:"none" }}/>}
        {kind==="drawio"&& <DrawioViewer url={url} title={file.file_name}/>}
        {kind==="unsupported" && <div style={{ textAlign:"center", color:"#888", fontSize:13, padding:24, lineHeight:1.8 }}>
          Vista previa no disponible para este tipo de archivo.<br/>
          <a href={url} download={file.file_name} style={{ color:"#0f172a", fontWeight:600 }}>⇩ Descargar {file.file_name}</a>
        </div>}
      </div>
    </div>
  </div>;
}

export function ProcesosOperativosView() {
  const { role } = useAuth();
  const canEdit = role === "admin" || role === "editor";
  const [categorias, setCategorias] = useState(null);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [search, setSearch] = useState("");
  const [showAudit, setShowAudit] = useState(false);
  const [err, setErr] = useState(null);
  const initedCollapse = useRef(false);

  const toggle = (id) => setCollapsed(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const load = useCallback(async () => {
    const [{ data: cats, error: e0 }, { data: nodes, error: e1 }, { data: archivos, error: e2 }] = await Promise.all([
      supabase.from("procesos_categorias").select("*").order("num"),
      supabase.from("procesos_nodes").select("*"),
      supabase.from("procesos_archivos").select("*").order("created_at"),
    ]);
    if (e0 || e1 || e2) { setErr((e0||e1||e2).message); return; }
    const filesByNode = {};
    (archivos || []).forEach(f => { (filesByNode[f.node_id] ||= []).push(f); });
    const withTree = (cats || []).map(cat => ({
      ...cat,
      tree: buildTree((nodes || []).filter(n => n.categoria_id === cat.id), filesByNode, null),
    }));
    setCategorias(withTree);
    // Primera carga: todos los procesos inician colapsados. Recargas
    // posteriores (agregar/editar) no deben reabrir lo que el usuario cerró.
    if (!initedCollapse.current) {
      initedCollapse.current = true;
      setCollapsed(new Set(withTree.map(c => c.id)));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addProceso = async () => {
    const nextNum = (categorias?.length ? Math.max(...categorias.map(c => c.num)) : 0) + 1;
    const color = PROCESO_COLOR_PALETTE[(nextNum - 1) % PROCESO_COLOR_PALETTE.length];
    const { error } = await supabase.from("procesos_categorias").insert({ id: `proc-${Date.now()}`, num: nextNum, label: "", color });
    if (error) { setErr(error.message); return; }
    load();
  };

  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () => {
    if (!categorias) return;
    const ids = categorias.flatMap(c => [c.id, ...allIds(c.tree)]);
    setCollapsed(new Set(ids));
  };

  const q = search.trim().toLowerCase();
  const filteredCategorias = useMemo(() => {
    if (!categorias) return null;
    if (!q) return categorias;
    return categorias
      .map(cat => ({ ...cat, tree: filterTree(cat.tree, q), matched: (cat.label || "").toLowerCase().includes(q) }))
      .filter(cat => cat.matched || cat.tree.length > 0);
  }, [categorias, q]);

  if (err) return <div style={{ padding:"12px 16px", background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:8, color:"#b91c1c", fontSize:12 }}>{err}</div>;
  if (!categorias) return <div style={{ padding:24, textAlign:"center", color:"#888", fontSize:13 }}>Cargando…</div>;

  // Silo = proceso/categoría (Inbound, Outbound…) · Macroproceso = nivel 0 ·
  // Proceso = nivel 1 · Subproceso = nivel 2 (nivel más profundo, admite archivos
  // de Detalle). Conteos en vivo, no fijos — siempre sobre el total real, no
  // sobre lo filtrado por búsqueda.
  const silos = categorias.length;
  const macroprocesos = categorias.reduce((s, c) => s + countAtDepth(c.tree, 0), 0);
  const procesos = categorias.reduce((s, c) => s + countAtDepth(c.tree, 1), 0);
  const subprocesos = categorias.reduce((s, c) => s + countAtDepth(c.tree, 2), 0);
  const detalles = categorias.reduce((s, c) => s + countFiles(c.tree), 0);

  return <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
    <div style={{ display:"flex", gap:10, alignItems:"center", justifyContent:"space-between", flexWrap:"wrap" }}>
      <div style={{ position:"relative", width:360, maxWidth:"100%", flexShrink:0 }}>
        <SearchIcon style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:13, color:DESIGN.mutedSoft, pointerEvents:"none" }}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar silo, macroproceso, proceso o subproceso…"
          style={{ width:"100%", boxSizing:"border-box", fontSize:13, border:`1px solid ${DESIGN.borderStrong}`, borderRadius:8, padding:"8px 12px 8px 32px", fontFamily:DESIGN.font, outline:"none", color:DESIGN.ink }}/>
        {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:DESIGN.mutedSoft, fontSize:13 }}>✕</button>}
      </div>
      <div style={{ display:"flex", gap:10, flexShrink:0 }}>
        <button onClick={expandAll} style={{ fontSize:12, fontWeight:600, color:DESIGN.inkSoft, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:8, padding:"7px 14px", cursor:"pointer", fontFamily:DESIGN.font }}>Expandir todo</button>
        <button onClick={collapseAll} style={{ fontSize:12, fontWeight:600, color:DESIGN.inkSoft, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:8, padding:"7px 14px", cursor:"pointer", fontFamily:DESIGN.font }}>Colapsar todo</button>
        <button onClick={()=>setShowAudit(true)} style={{ fontSize:12, fontWeight:700, color:"#fff", background:DESIGN.ink, border:"none", borderRadius:8, padding:"7px 16px", cursor:"pointer", fontFamily:DESIGN.font }}>Auditar Procesos ↗</button>
      </div>
    </div>
    {showAudit && <AuditModal categorias={categorias} onClose={()=>setShowAudit(false)}/>}

    <div style={{ display:"flex", alignItems:"baseline", gap:6, fontSize:13, color:DESIGN.muted, flexWrap:"wrap" }}>
      <span><b style={{ color:DESIGN.ink }}>{silos}</b> silos</span>·
      <span><b style={{ color:DESIGN.ink }}>{macroprocesos}</b> macroprocesos</span>·
      <span><b style={{ color:DESIGN.ink }}>{procesos}</b> procesos</span>·
      <span><b style={{ color:DESIGN.ink }}>{subprocesos}</b> subprocesos</span>·
      <span><b style={{ color:DESIGN.ink }}>{detalles}</b> documentos adjuntos</span>
    </div>

    {filteredCategorias.length === 0
      ? <div style={{ padding:"24px 16px", textAlign:"center", color:DESIGN.muted, fontSize:13, border:`1px dashed ${DESIGN.border}`, borderRadius:10 }}>Sin resultados para "{search}".</div>
      : filteredCategorias.map((cat, idx) => (
          <SiloSection key={cat.id} cat={cat} displayNum={idx + 1} canEdit={canEdit} collapsed={collapsed} onToggle={toggle} onReload={load} setErr={setErr} forceOpen={!!q}/>
        ))}
    {canEdit && <button onClick={addProceso} style={{ alignSelf:"flex-start", fontSize:12, fontWeight:600, color:DESIGN.ink, background:"#fff", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:6, padding:"6px 14px", cursor:"pointer", fontFamily:"inherit" }}>
      + Agregar silo
    </button>}
  </div>;
}

function SiloSection({ cat, canEdit, collapsed, onToggle, onReload, setErr, forceOpen }) {
  const [label, setLabel] = useState(cat.label);
  useEffect(() => { setLabel(cat.label); }, [cat.label]);
  const isCollapsed = !forceOpen && collapsed.has(cat.id);
  const macros = countAtDepth(cat.tree, 0), procesos = countAtDepth(cat.tree, 1), subs = countAtDepth(cat.tree, 2);

  const saveLabel = async () => {
    if (label === cat.label) return;
    const { error } = await supabase.from("procesos_categorias").update({ label }).eq("id", cat.id);
    if (error) setErr(error.message);
  };

  const removeCategoria = async () => {
    const { error } = await supabase.from("procesos_categorias").delete().eq("id", cat.id);
    if (error) { setErr(error.message); setConfirmDelete(false); return; }
    onReload();
  };

  const addMacroproceso = async () => {
    const { error } = await supabase.from("procesos_nodes").insert({
      categoria_id: cat.id, parent_id: null, level: 0, name: "", sort_order: cat.tree.length,
    });
    if (error) { setErr(error.message); return; }
    onReload();
  };

  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const labelInputRef = useRef(null);
  useEffect(() => { if (editing) labelInputRef.current?.focus(); }, [editing]);

  return <div style={{ background:DESIGN.surface, border:`1px solid ${DESIGN.border}`, borderRadius:10, overflow:"hidden" }}>
    <div onClick={()=>onToggle(cat.id)} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} title={isCollapsed?"Expandir":"Contraer"}
      style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer", padding:"14px 18px", background: hover?DESIGN.sunken:"transparent", transition:"background 0.15s" }}>
      <span style={{ color:DESIGN.mutedSoft, fontSize:14, flexShrink:0 }}><Chevron collapsed={isCollapsed}/></span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, fontWeight:600, color:DESIGN.muted }}>Silo</div>
        {editing
          ? <input ref={labelInputRef} value={label} onChange={e=>setLabel(e.target.value)} onClick={e=>e.stopPropagation()}
              onBlur={()=>{ saveLabel(); setEditing(false); }} onKeyDown={e=>{ if(e.key==="Enter") e.currentTarget.blur(); }}
              placeholder="Nombre del silo…"
              style={{ fontSize:17, fontWeight:700, color:DESIGN.ink, border:"none", borderBottom:`1px solid ${DESIGN.border}`, background:"transparent", outline:"none", fontFamily:"inherit", minWidth:100 }}/>
          : <div style={{ fontSize:17, fontWeight:700, color: label?DESIGN.ink:DESIGN.mutedSoft }}>{label || "Nombre del silo…"}</div>}
      </div>
      <div style={{ display:"flex", gap:22, flexShrink:0 }}>
        <CountBadge n={macros} label="macros"/>
        <CountBadge n={procesos} label="procesos"/>
        <CountBadge n={subs} label="subs"/>
      </div>
      {canEdit && <span style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }} onClick={e=>e.stopPropagation()}>
        {confirmDelete ? <>
          <span style={{ fontSize:11, color:"#b91c1c" }}>¿Eliminar "{label || "este silo"}"?</span>
          <button onClick={removeCategoria} style={{ fontSize:11, fontWeight:700, color:"#b91c1c", background:"none", border:"none", cursor:"pointer", padding:0 }}>Sí</button>
          <button onClick={()=>setConfirmDelete(false)} style={{ fontSize:11, color:"#888", background:"none", border:"none", cursor:"pointer", padding:0 }}>No</button>
        </> : <>
          <button onClick={()=>setEditing(true)} title="Editar nombre" style={{ background:"none", border:"none", color:DESIGN.mutedSoft, cursor:"pointer", fontSize:13, lineHeight:1 }}>✎</button>
          <button onClick={()=>setConfirmDelete(true)} title="Eliminar silo" style={{ background:"none", border:"none", color:"#b91c1c", cursor:"pointer", fontSize:15, lineHeight:1 }}>×</button>
        </>}
      </span>}
    </div>

    <div style={{ maxHeight: isCollapsed?0:8000, opacity: isCollapsed?0:1, overflow:"hidden", transition:"max-height 0.28s ease, opacity 0.22s ease" }}>
      <div style={{ borderTop:`1px solid ${DESIGN.border}`, padding:"6px 18px 16px" }}>
        {cat.tree.length === 0
          ? <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:52, border:`1px dashed ${DESIGN.border}`, borderRadius:8, color:DESIGN.mutedSoft, fontSize:12, margin:"10px 0" }}>
              Sin macroprocesos agregados todavía.
            </div>
          : cat.tree.map(m => <MacroprocesoRow key={m.id} node={m} canEdit={canEdit} collapsed={collapsed} onToggle={onToggle} onReload={onReload} setErr={setErr} forceOpen={forceOpen}/>)}
        {canEdit && <button onClick={addMacroproceso} style={{ marginTop:8, fontSize:11, fontWeight:600, color:DESIGN.inkSoft, background:"#fff", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>
          + Agregar macroproceso
        </button>}
      </div>
    </div>
  </div>;
}

// Macroproceso (nivel 0) — encabezado plano con insignias de conteo,
// separado del anterior por un borde superior; sin caja propia.
function MacroprocesoRow({ node, canEdit, collapsed, onToggle, onReload, setErr, forceOpen }) {
  const [name, setName] = useState(node.name);
  const [editing, setEditing] = useState(false);
  const nameInputRef = useRef(null);
  const isCollapsed = !forceOpen && collapsed.has(node.id);
  const procesos = countAtDepth(node.children, 0), subs = countAtDepth(node.children, 1);

  useEffect(() => { setName(node.name); }, [node.name]);
  useEffect(() => { if (editing) nameInputRef.current?.focus(); }, [editing]);

  const saveName = async () => {
    if (name === node.name) return;
    const { error } = await supabase.from("procesos_nodes").update({ name }).eq("id", node.id);
    if (error) setErr(error.message);
  };
  const addProceso = async () => {
    const { error } = await supabase.from("procesos_nodes").insert({
      categoria_id: node.categoria_id, parent_id: node.id, level: 1, name: "", sort_order: node.children.length,
    });
    if (error) { setErr(error.message); return; }
    onReload();
  };
  const [confirmDelete, setConfirmDelete] = useState(false);
  const removeNode = async () => {
    const { error } = await supabase.from("procesos_nodes").delete().eq("id", node.id);
    if (error) { setErr(error.message); setConfirmDelete(false); return; }
    onReload();
  };

  return <div style={{ borderTop:`1px solid ${DESIGN.border}`, paddingTop:12, marginTop:12 }}>
    <div onClick={()=>onToggle(node.id)} title={isCollapsed?"Expandir":"Contraer"} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:10 }}>
      <span style={{ color:DESIGN.mutedSoft, fontSize:12, flexShrink:0 }}><Chevron collapsed={isCollapsed}/></span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:10.5, fontWeight:600, color:DESIGN.muted }}>Macroproceso</div>
        {editing
          ? <input ref={nameInputRef} value={name} onChange={e=>setName(e.target.value)} onClick={e=>e.stopPropagation()}
              onBlur={()=>{ saveName(); setEditing(false); }} onKeyDown={e=>{ if(e.key==="Enter") e.currentTarget.blur(); }}
              placeholder="Nombre del macroproceso…"
              style={{ fontSize:15, fontWeight:700, color:DESIGN.ink, border:"none", borderBottom:`1px solid ${DESIGN.border}`, background:"transparent", outline:"none", fontFamily:"inherit", minWidth:100 }}/>
          : <div style={{ fontSize:15, fontWeight:700, color: name?DESIGN.ink:DESIGN.mutedSoft }}>{name || "Nombre del macroproceso…"}</div>}
      </div>
      <div style={{ display:"flex", gap:18, flexShrink:0 }}>
        <CountBadge n={procesos} label="procesos"/>
        <CountBadge n={subs} label="subs"/>
      </div>
      {canEdit && <span style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }} onClick={e=>e.stopPropagation()}>
        {confirmDelete ? <>
          <span style={{ fontSize:10, color:"#b91c1c" }}>¿Eliminar?</span>
          <button onClick={removeNode} style={{ fontSize:10, fontWeight:700, color:"#b91c1c", background:"none", border:"none", cursor:"pointer", padding:0 }}>Sí</button>
          <button onClick={()=>setConfirmDelete(false)} style={{ fontSize:10, color:"#888", background:"none", border:"none", cursor:"pointer", padding:0 }}>No</button>
        </> : <>
          <button onClick={()=>setEditing(true)} title="Editar nombre" style={{ background:"none", border:"none", color:DESIGN.mutedSoft, cursor:"pointer", fontSize:12, lineHeight:1 }}>✎</button>
          <button onClick={()=>setConfirmDelete(true)} title="Eliminar" style={{ background:"none", border:"none", color:"#b91c1c", cursor:"pointer", fontSize:13, lineHeight:1 }}>×</button>
        </>}
      </span>}
    </div>

    <div style={{ maxHeight: isCollapsed?0:6000, opacity: isCollapsed?0:1, overflow:"hidden", transition:"max-height 0.25s ease, opacity 0.2s ease", display:"flex", flexDirection:"column", gap:8 }}>
      {node.children.length === 0
        ? <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:40, border:`1px dashed ${DESIGN.border}`, borderRadius:8, color:DESIGN.mutedSoft, fontSize:11, marginBottom:6 }}>
            Sin procesos agregados todavía.
          </div>
        : node.children.map(p => <ProcesoRow key={p.id} node={p} canEdit={canEdit} collapsed={collapsed} onToggle={onToggle} onReload={onReload} setErr={setErr} forceOpen={forceOpen}/>)}
      {canEdit && <button onClick={addProceso} style={{ alignSelf:"flex-start", fontSize:11, fontWeight:600, color:DESIGN.inkSoft, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit", marginBottom:6 }}>
        + Agregar proceso
      </button>}
    </div>
  </div>;
}

// Proceso (nivel 1) — fila con borde propio ("pill"), insignia de conteo de
// subprocesos a la derecha. Al expandir, muestra el encabezado "Subprocesos N"
// y la lista plana de subprocesos.
function ProcesoRow({ node, canEdit, collapsed, onToggle, onReload, setErr, forceOpen }) {
  const [name, setName] = useState(node.name);
  const [editing, setEditing] = useState(false);
  const nameInputRef = useRef(null);
  const isCollapsed = !forceOpen && collapsed.has(node.id);
  const subCount = node.children.length;

  useEffect(() => { setName(node.name); }, [node.name]);
  useEffect(() => { if (editing) nameInputRef.current?.focus(); }, [editing]);

  const saveName = async () => {
    if (name === node.name) return;
    const { error } = await supabase.from("procesos_nodes").update({ name }).eq("id", node.id);
    if (error) setErr(error.message);
  };
  const addSubproceso = async () => {
    const { error } = await supabase.from("procesos_nodes").insert({
      categoria_id: node.categoria_id, parent_id: node.id, level: 2, name: "", sort_order: node.children.length,
    });
    if (error) { setErr(error.message); return; }
    onReload();
  };
  const [confirmDelete, setConfirmDelete] = useState(false);
  const removeNode = async () => {
    const { error } = await supabase.from("procesos_nodes").delete().eq("id", node.id);
    if (error) { setErr(error.message); setConfirmDelete(false); return; }
    onReload();
  };

  // La caja con borde envuelve SOLO el encabezado del Proceso (una "píldora"
  // angosta); los Subprocesos, al expandir, flotan debajo sin caja ni fondo
  // propio — igual que el estándar del Grupo.
  return <div>
    <div style={{ border:`1px solid ${DESIGN.border}`, borderRadius:8, background:"#fff" }}>
      <div onClick={()=>onToggle(node.id)} title={isCollapsed?"Expandir":"Contraer"}
        style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"8px 12px" }}>
        <span style={{ color:DESIGN.mutedSoft, fontSize:11, flexShrink:0 }}><Chevron collapsed={isCollapsed}/></span>
        <span style={{ fontSize:11, fontWeight:600, color:DESIGN.muted, flexShrink:0 }}>Proceso</span>
        {editing
          ? <input ref={nameInputRef} value={name} onChange={e=>setName(e.target.value)} onClick={e=>e.stopPropagation()}
              onBlur={()=>{ saveName(); setEditing(false); }} onKeyDown={e=>{ if(e.key==="Enter") e.currentTarget.blur(); }}
              placeholder="Nombre del proceso…"
              style={{ flex:1, fontSize:13, fontWeight:700, color:DESIGN.ink, border:"none", borderBottom:`1px solid ${DESIGN.border}`, background:"transparent", outline:"none", fontFamily:"inherit", minWidth:80 }}/>
          : <span style={{ flex:1, fontSize:13, fontWeight:700, color: name?DESIGN.ink:DESIGN.mutedSoft, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name || "Nombre del proceso…"}</span>}
        <CountPill n={subCount}/>
        {canEdit && <span style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }} onClick={e=>e.stopPropagation()}>
          {confirmDelete ? <>
            <span style={{ fontSize:10, color:"#b91c1c", whiteSpace:"nowrap" }}>¿Eliminar?</span>
            <button onClick={removeNode} style={{ fontSize:10, fontWeight:700, color:"#b91c1c", background:"none", border:"none", cursor:"pointer", padding:0 }}>Sí</button>
            <button onClick={()=>setConfirmDelete(false)} style={{ fontSize:10, color:"#888", background:"none", border:"none", cursor:"pointer", padding:0 }}>No</button>
          </> : <>
            <button onClick={()=>setEditing(true)} title="Editar nombre" style={{ background:"none", border:"none", color:DESIGN.mutedSoft, cursor:"pointer", fontSize:12, lineHeight:1 }}>✎</button>
            <button onClick={()=>setConfirmDelete(true)} title="Eliminar" style={{ background:"none", border:"none", color:"#b91c1c", cursor:"pointer", fontSize:13, lineHeight:1 }}>×</button>
          </>}
        </span>}
      </div>
    </div>

    <div style={{ maxHeight: isCollapsed?0:4000, opacity: isCollapsed?0:1, overflow:"hidden", transition:"max-height 0.22s ease, opacity 0.18s ease" }}>
      <div style={{ padding:"8px 4px 4px 30px" }}>
        <div style={{ fontSize:11, fontWeight:600, color:DESIGN.muted, marginBottom:4 }}>Subprocesos {subCount>0 && <span style={{ color:DESIGN.mutedSoft, fontWeight:400 }}>{subCount}</span>}</div>
        {node.children.length === 0
          ? <div style={{ fontSize:11, color:DESIGN.mutedSoft, padding:"6px 0" }}>Sin subprocesos agregados todavía.</div>
          : <div style={{ display:"flex", flexDirection:"column" }}>
              {node.children.map(s => <SubprocesoItem key={s.id} node={s} canEdit={canEdit} onReload={onReload} setErr={setErr}/>)}
            </div>}
        {canEdit && <button onClick={addSubproceso} style={{ marginTop:6, fontSize:10.5, fontWeight:600, color:DESIGN.inkSoft, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"3px 9px", cursor:"pointer", fontFamily:"inherit" }}>
          + Agregar subproceso
        </button>}
      </div>
    </div>
  </div>;
}

// Subproceso (nivel 2, hoja) — fila plana de texto con viñeta "›"; si tiene
// documento(s) adjuntos, un ícono de ojo abre el visor sin salir de la app.
function SubprocesoItem({ node, canEdit, onReload, setErr }) {
  const [name, setName] = useState(node.name);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hover, setHover] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => { setName(node.name); }, [node.name]);
  useEffect(() => { if (editing) nameInputRef.current?.focus(); }, [editing]);

  const saveName = async () => {
    if (name === node.name) return;
    const { error } = await supabase.from("procesos_nodes").update({ name }).eq("id", node.id);
    if (error) setErr(error.message);
  };
  const removeNode = async () => {
    const { error } = await supabase.from("procesos_nodes").delete().eq("id", node.id);
    if (error) { setErr(error.message); setConfirmDelete(false); return; }
    onReload();
  };
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true); setErr(null);
    const path = `${node.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
    if (upErr) { setBusy(false); setErr(upErr.message); return; }
    const { error: dbErr } = await supabase.from("procesos_archivos").insert({
      node_id: node.id, bucket: BUCKET, path, file_name: file.name, mime_type: file.type, size_bytes: file.size,
    });
    setBusy(false);
    if (dbErr) { setErr(dbErr.message); return; }
    onReload();
  };
  const removeFile = async (file) => {
    setBusy(true); setErr(null);
    await supabase.storage.from(BUCKET).remove([file.path]);
    const { error } = await supabase.from("procesos_archivos").delete().eq("id", file.id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onReload();
  };
  const fileUrl = (file) => supabase.storage.from(BUCKET).getPublicUrl(file.path).data.publicUrl;
  const firstFile = node.files?.[0];

  return <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 0" }}>
    <span style={{ color:DESIGN.mutedSoft, fontSize:12, flexShrink:0 }}>›</span>
    {editing
      ? <input ref={nameInputRef} value={name} onChange={e=>setName(e.target.value)}
          onBlur={()=>{ saveName(); setEditing(false); }} onKeyDown={e=>{ if(e.key==="Enter") e.currentTarget.blur(); }}
          placeholder="Nombre del subproceso…"
          style={{ flex:"0 1 360px", minWidth:80, border:"none", borderBottom:`1px solid ${DESIGN.border}`, background:"transparent", fontSize:12.5, padding:"2px 0", fontFamily:"inherit", color:DESIGN.ink, outline:"none" }}/>
      : <span style={{ fontSize:12.5, color: name?DESIGN.inkSoft:DESIGN.mutedSoft }}>{name || "Nombre del subproceso…"}</span>}

    {node.files?.length > 0 && (
      node.files.length === 1
        ? <button onClick={()=>setViewingFile(firstFile)} title={`Ver ${firstFile.file_name}`} style={{ background:"none", border:"none", color:DESIGN.inkSoft, cursor:"pointer", padding:0, display:"flex", alignItems:"center" }}><EyeIcon style={{ fontSize:13 }}/></button>
        : <span style={{ display:"flex", alignItems:"center", gap:4 }}>
            {node.files.map(f => <button key={f.id} onClick={()=>setViewingFile(f)} title={`Ver ${f.file_name}`} style={{ background:"none", border:"none", color:DESIGN.inkSoft, cursor:"pointer", padding:0, display:"flex", alignItems:"center" }}><EyeIcon style={{ fontSize:13 }}/></button>)}
            <span style={{ fontSize:10, color:DESIGN.mutedSoft }}>{node.files.length}</span>
          </span>
    )}
    {viewingFile && <FileViewerModal file={viewingFile} url={fileUrl(viewingFile)} onClose={()=>setViewingFile(null)}/>}

    {canEdit && (hover || editing || confirmDelete) && <span style={{ display:"flex", alignItems:"center", gap:6, marginLeft:"auto" }}>
      {node.files?.length > 0 && canEdit && node.files.map(f => (
        <span key={f.id} style={{ fontSize:9.5, color:DESIGN.mutedSoft }}>
          {formatSize(f.size_bytes)}
          <button onClick={()=>removeFile(f)} title="Quitar archivo" style={{ background:"none", border:"none", color:"#b91c1c", cursor:"pointer", fontSize:12, lineHeight:1, padding:"0 0 0 3px" }}>×</button>
        </span>
      ))}
      <input type="file" ref={fileInputRef} onChange={handleUpload} style={{ display:"none" }}/>
      <button onClick={()=>fileInputRef.current?.click()} disabled={busy} title="Adjuntar archivo"
        style={{ background:"none", border:`1px solid ${DESIGN.border}`, borderRadius:4, color:DESIGN.inkSoft, cursor:"pointer", fontSize:9.5, fontWeight:600, padding:"2px 7px", flexShrink:0 }}>
        Adjuntar
      </button>
      <button onClick={()=>setEditing(true)} title="Editar nombre" style={{ background:"none", border:"none", color:DESIGN.mutedSoft, cursor:"pointer", fontSize:11, lineHeight:1 }}>✎</button>
      {confirmDelete ? <>
        <span style={{ fontSize:10, color:"#b91c1c", whiteSpace:"nowrap" }}>¿Eliminar?</span>
        <button onClick={removeNode} style={{ fontSize:10, fontWeight:700, color:"#b91c1c", background:"none", border:"none", cursor:"pointer", padding:0 }}>Sí</button>
        <button onClick={()=>setConfirmDelete(false)} style={{ fontSize:10, color:"#888", background:"none", border:"none", cursor:"pointer", padding:0 }}>No</button>
      </> : <button onClick={()=>setConfirmDelete(true)} title="Eliminar" style={{ background:"none", border:"none", color:"#b91c1c", cursor:"pointer", fontSize:13, lineHeight:1 }}>×</button>}
    </span>}
  </div>;
}
