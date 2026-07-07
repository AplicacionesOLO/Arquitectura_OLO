// ═══════════════════════════════════════════════════════════════════════════
// VISTA · PROCESOS OPERATIVOS — procesos (categorías) dinámicos, cada uno
// con un árbol Subproceso → Sub-subproceso → Detalle persistido en Supabase.
// Categorías, subprocesos y sub-subprocesos son colapsables; los nodos
// Detalle permiten adjuntar archivos al bucket "Detalles_Porcesos".
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { KPICard } from "../components/ui.jsx";
import { PROCESO_COLOR_PALETTE } from "../data/procesosOperativos.js";

const LEVEL_LABELS = ["Subproceso", "Sub-subproceso", "Detalle"];
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

function Chevron({ collapsed }) {
  return <span style={{ display:"inline-block", transform: collapsed?"rotate(0deg)":"rotate(90deg)", transition:"transform 0.15s" }}>›</span>;
}

export function ProcesosOperativosView() {
  const { role } = useAuth();
  const canEdit = role === "admin" || role === "editor";
  const [categorias, setCategorias] = useState(null);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [err, setErr] = useState(null);

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
  }, []);

  useEffect(() => { load(); }, [load]);

  const addProceso = async () => {
    const nextNum = (categorias?.length ? Math.max(...categorias.map(c => c.num)) : 0) + 1;
    const color = PROCESO_COLOR_PALETTE[(nextNum - 1) % PROCESO_COLOR_PALETTE.length];
    const { error } = await supabase.from("procesos_categorias").insert({ id: `proc-${Date.now()}`, num: nextNum, label: "", color });
    if (error) { setErr(error.message); return; }
    load();
  };

  if (err) return <div style={{ padding:"12px 16px", background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:8, color:"#b91c1c", fontSize:12 }}>{err}</div>;
  if (!categorias) return <div style={{ padding:24, textAlign:"center", color:"#888", fontSize:13 }}>Cargando…</div>;

  // Silo = proceso/categoría (Inbound, Outbound…) · Macroproceso = nivel Subproceso ·
  // Proceso = nivel Sub-subproceso · Subproceso = nivel Detalle. Conteos en vivo, no fijos.
  const silos = categorias.length;
  const macroprocesos = categorias.reduce((s, c) => s + countAtDepth(c.tree, 0), 0);
  const procesos = categorias.reduce((s, c) => s + countAtDepth(c.tree, 1), 0);
  const subprocesos = categorias.reduce((s, c) => s + countAtDepth(c.tree, 2), 0);

  return <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      <KPICard label="Silos" value={silos} color="#2980b9" sub="procesos de primer nivel"/>
      <KPICard label="Macroprocesos" value={macroprocesos} color="#27ae60" sub="nivel Subproceso"/>
      <KPICard label="Procesos" value={procesos} color="#8e44ad" sub="nivel Sub-subproceso"/>
      <KPICard label="Subprocesos" value={subprocesos} color="#d35400" sub="nivel Detalle"/>
    </div>

    {categorias.map(cat => (
      <CategoriaCard key={cat.id} cat={cat} canEdit={canEdit} collapsed={collapsed} onToggle={toggle} onReload={load} setErr={setErr}/>
    ))}
    {canEdit && <button onClick={addProceso} style={{ alignSelf:"flex-start", fontSize:12, fontWeight:600, color:"#00838f", background:"#fff", border:"1px solid #00838f55", borderRadius:6, padding:"6px 14px", cursor:"pointer", fontFamily:"inherit" }}>
      + Agregar proceso
    </button>}
  </div>;
}

function CategoriaCard({ cat, canEdit, collapsed, onToggle, onReload, setErr }) {
  const [label, setLabel] = useState(cat.label);
  useEffect(() => { setLabel(cat.label); }, [cat.label]);
  const isCollapsed = collapsed.has(cat.id);
  const total = countAll(cat.tree);

  const saveLabel = async () => {
    if (label === cat.label) return;
    const { error } = await supabase.from("procesos_categorias").update({ label }).eq("id", cat.id);
    if (error) setErr(error.message);
  };

  const removeCategoria = async () => {
    const { error } = await supabase.from("procesos_categorias").delete().eq("id", cat.id);
    if (error) { setErr(error.message); return; }
    onReload();
  };

  const addSubproceso = async () => {
    const { error } = await supabase.from("procesos_nodes").insert({
      categoria_id: cat.id, parent_id: null, level: 0, name: "", sort_order: cat.tree.length,
    });
    if (error) { setErr(error.message); return; }
    onReload();
  };

  return <div style={{ background:"#fff", border:"1px solid #e0e0e0", borderLeft:`4px solid ${cat.color}`, borderRadius:10, padding:"14px 18px" }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: isCollapsed?0:12 }}>
      <button onClick={()=>onToggle(cat.id)} title={isCollapsed?"Expandir":"Contraer"}
        style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:13, padding:0, flexShrink:0 }}>
        <Chevron collapsed={isCollapsed}/>
      </button>
      <span style={{ fontSize:11, fontWeight:700, color:"#fff", background:cat.color, borderRadius:12, padding:"2px 9px", flexShrink:0 }}>{cat.num}</span>
      <input value={label} disabled={!canEdit} onChange={e=>setLabel(e.target.value)} onBlur={saveLabel}
        placeholder="Nombre del proceso…"
        style={{ fontSize:14, fontWeight:700, color:"#1D1D1B", border:"none", borderBottom: canEdit?"1px solid #eee":"none", background:"transparent", outline:"none", fontFamily:"inherit", minWidth:100, flex:"0 1 260px" }}/>
      <span style={{ fontSize:11, color:"#999" }}>· {total} elemento{total!==1?"s":""}</span>
      {canEdit && <button onClick={removeCategoria} title="Eliminar proceso" style={{ marginLeft:"auto", background:"none", border:"none", color:"#c0392b", cursor:"pointer", fontSize:14, lineHeight:1, flexShrink:0 }}>×</button>}
    </div>

    {!isCollapsed && <>
      {cat.tree.length === 0
        ? <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:52, border:"1px dashed #e0e0e0", borderRadius:8, color:"#aaa", fontSize:12, marginBottom:10 }}>
            Sin subprocesos agregados todavía.
          </div>
        : <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
            {cat.tree.map(n => (
              <NodeRow key={n.id} node={n} depth={0} color={cat.color} canEdit={canEdit} collapsed={collapsed} onToggle={onToggle} onReload={onReload} setErr={setErr}/>
            ))}
          </div>}

      {canEdit && <button onClick={addSubproceso} style={{ fontSize:11, fontWeight:600, color:cat.color, background:"#fff", border:`1px solid ${cat.color}55`, borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>
        + Agregar subproceso
      </button>}
    </>}
  </div>;
}

function NodeRow({ node, depth, color, canEdit, collapsed, onToggle, onReload, setErr }) {
  const [name, setName] = useState(node.name);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);
  const label = LEVEL_LABELS[depth] ?? LEVEL_LABELS[LEVEL_LABELS.length - 1];
  const canHaveChildren = depth < LEVEL_LABELS.length - 1;
  const isDetalle = depth === LEVEL_LABELS.length - 1;
  const hasChildren = node.children?.length > 0;
  const isCollapsed = collapsed.has(node.id);

  useEffect(() => { setName(node.name); }, [node.name]);

  const saveName = async () => {
    if (name === node.name) return;
    const { error } = await supabase.from("procesos_nodes").update({ name }).eq("id", node.id);
    if (error) setErr(error.message);
  };

  const addChild = async () => {
    const { error } = await supabase.from("procesos_nodes").insert({
      categoria_id: node.categoria_id, parent_id: node.id, level: depth+1, name: "", sort_order: node.children.length,
    });
    if (error) { setErr(error.message); return; }
    onReload();
  };

  const removeNode = async () => {
    const { error } = await supabase.from("procesos_nodes").delete().eq("id", node.id);
    if (error) { setErr(error.message); return; }
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

  return <div style={{ marginLeft: depth*20 }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background: depth===0?"#fafafa":"transparent", border: depth===0?`1px solid ${color}33`:"none", borderRadius:6 }}>
      {hasChildren
        ? <button onClick={()=>onToggle(node.id)} title={isCollapsed?"Expandir":"Contraer"} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:12, padding:0, width:14, flexShrink:0 }}><Chevron collapsed={isCollapsed}/></button>
        : <span style={{ width:14, flexShrink:0 }}/>}
      <span style={{ fontSize:9, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.04em", minWidth:82, flexShrink:0 }}>{label}</span>
      <input value={name} disabled={!canEdit} onChange={e=>setName(e.target.value)} onBlur={saveName}
        placeholder={`Nombre del ${label.toLowerCase()}…`}
        style={{ flex:1, border:"none", borderBottom:"1px solid #eee", background:"transparent", fontSize:12, padding:"3px 4px", fontFamily:"inherit", color:"#1D1D1B", outline:"none" }}/>
      {canEdit && isDetalle && <>
        <input type="file" ref={fileInputRef} onChange={handleUpload} style={{ display:"none" }}/>
        <button onClick={()=>fileInputRef.current?.click()} disabled={busy} title="Adjuntar archivo"
          style={{ background:"none", border:"1px solid #ddd", borderRadius:4, color:"#00838f", cursor:"pointer", fontSize:10, fontWeight:600, padding:"3px 8px", flexShrink:0 }}>
          Adjuntar
        </button>
      </>}
      {canEdit && canHaveChildren && <button onClick={addChild} title={`Agregar ${LEVEL_LABELS[depth+1]}`} style={{ background:"none", border:"1px solid #ddd", borderRadius:4, color:"#00838f", cursor:"pointer", fontSize:12, width:20, height:20, lineHeight:1, flexShrink:0 }}>+</button>}
      {canEdit && <button onClick={removeNode} title="Eliminar" style={{ background:"none", border:"none", color:"#c0392b", cursor:"pointer", fontSize:14, lineHeight:1, flexShrink:0 }}>×</button>}
    </div>

    {isDetalle && node.files?.length > 0 && <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:4, marginLeft:106 }}>
      {node.files.map(f => (
        <span key={f.id} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:10, background:"#f0f9fa", border:"1px solid #b2ebf2", borderRadius:4, padding:"3px 6px" }}>
          <a href={fileUrl(f)} target="_blank" rel="noreferrer" style={{ color:"#00838f", textDecoration:"none", fontWeight:600 }}>{f.file_name}</a>
          <span style={{ color:"#999" }}>{formatSize(f.size_bytes)}</span>
          {canEdit && <button onClick={()=>removeFile(f)} title="Quitar archivo" style={{ background:"none", border:"none", color:"#c0392b", cursor:"pointer", fontSize:12, lineHeight:1, padding:0 }}>×</button>}
        </span>
      ))}
    </div>}

    {hasChildren && !isCollapsed && <div style={{ marginTop:4, display:"flex", flexDirection:"column", gap:4 }}>
      {node.children.map(child => (
        <NodeRow key={child.id} node={child} depth={depth+1} color={color} canEdit={canEdit} collapsed={collapsed} onToggle={onToggle} onReload={onReload} setErr={setErr}/>
      ))}
    </div>}
  </div>;
}
