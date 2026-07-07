// ═══════════════════════════════════════════════════════════════════════════
// VISTA · PROCESOS OPERATIVOS — 6 procesos fijos (grids lineales), cada uno
// con un árbol Subproceso → Sub-subproceso → Detalle persistido en Supabase
// (procesos_nodes). Los nodos Detalle permiten adjuntar archivos al bucket
// de Storage "Detalles_Porcesos" (procesos_archivos).
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { PROCESOS_CATEGORIAS } from "../data/procesosOperativos.js";

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
function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
}

export function ProcesosOperativosView() {
  const { role } = useAuth();
  const canEdit = role === "admin" || role === "editor";
  const [nodesByCat, setNodesByCat] = useState(null);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    const [{ data: nodes, error: e1 }, { data: archivos, error: e2 }] = await Promise.all([
      supabase.from("procesos_nodes").select("*"),
      supabase.from("procesos_archivos").select("*").order("created_at"),
    ]);
    if (e1 || e2) { setErr((e1||e2).message); return; }
    const filesByNode = {};
    (archivos || []).forEach(f => { (filesByNode[f.node_id] ||= []).push(f); });
    const grouped = {};
    PROCESOS_CATEGORIAS.forEach(cat => {
      const catNodes = (nodes || []).filter(n => n.categoria_id === cat.id);
      grouped[cat.id] = buildTree(catNodes, filesByNode, null);
    });
    setNodesByCat(grouped);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (err) return <div style={{ padding:"12px 16px", background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:8, color:"#b91c1c", fontSize:12 }}>{err}</div>;
  if (!nodesByCat) return <div style={{ padding:24, textAlign:"center", color:"#888", fontSize:13 }}>Cargando…</div>;

  return <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
    {PROCESOS_CATEGORIAS.map(cat => (
      <CategoriaCard key={cat.id} cat={cat} tree={nodesByCat[cat.id]} canEdit={canEdit} onReload={load} setErr={setErr}/>
    ))}
  </div>;
}

function CategoriaCard({ cat, tree, canEdit, onReload, setErr }) {
  const total = countAll(tree);

  const addSubproceso = async () => {
    const { error } = await supabase.from("procesos_nodes").insert({
      categoria_id: cat.id, parent_id: null, level: 0, name: "", sort_order: tree.length,
    });
    if (error) { setErr(error.message); return; }
    onReload();
  };

  return <div style={{ background:"#fff", border:"1px solid #e0e0e0", borderLeft:`4px solid ${cat.color}`, borderRadius:10, padding:"14px 18px" }}>
    <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:12 }}>
      <span style={{ fontSize:11, fontWeight:700, color:"#fff", background:cat.color, borderRadius:12, padding:"2px 9px", flexShrink:0 }}>{cat.num}</span>
      <span style={{ fontSize:14, fontWeight:700, color:"#1D1D1B" }}>{cat.label}</span>
      <span style={{ fontSize:11, color:"#999" }}>· {total} elemento{total!==1?"s":""}</span>
    </div>

    {tree.length === 0
      ? <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:52, border:"1px dashed #e0e0e0", borderRadius:8, color:"#aaa", fontSize:12, marginBottom:10 }}>
          Sin subprocesos agregados todavía.
        </div>
      : <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
          {tree.map(n => (
            <NodeRow key={n.id} node={n} depth={0} color={cat.color} canEdit={canEdit} onReload={onReload} setErr={setErr}/>
          ))}
        </div>}

    {canEdit && <button onClick={addSubproceso} style={{ fontSize:11, fontWeight:600, color:cat.color, background:"#fff", border:`1px solid ${cat.color}55`, borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>
      + Agregar subproceso
    </button>}
  </div>;
}

function NodeRow({ node, depth, color, canEdit, onReload, setErr }) {
  const [name, setName] = useState(node.name);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);
  const label = LEVEL_LABELS[depth] ?? LEVEL_LABELS[LEVEL_LABELS.length - 1];
  const canHaveChildren = depth < LEVEL_LABELS.length - 1;
  const isDetalle = depth === LEVEL_LABELS.length - 1;

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

    {isDetalle && node.files?.length > 0 && <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:4, marginLeft:92 }}>
      {node.files.map(f => (
        <span key={f.id} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:10, background:"#f0f9fa", border:"1px solid #b2ebf2", borderRadius:4, padding:"3px 6px" }}>
          <a href={fileUrl(f)} target="_blank" rel="noreferrer" style={{ color:"#00838f", textDecoration:"none", fontWeight:600 }}>{f.file_name}</a>
          <span style={{ color:"#999" }}>{formatSize(f.size_bytes)}</span>
          {canEdit && <button onClick={()=>removeFile(f)} title="Quitar archivo" style={{ background:"none", border:"none", color:"#c0392b", cursor:"pointer", fontSize:12, lineHeight:1, padding:0 }}>×</button>}
        </span>
      ))}
    </div>}

    {node.children?.length > 0 && <div style={{ marginTop:4, display:"flex", flexDirection:"column", gap:4 }}>
      {node.children.map(child => (
        <NodeRow key={child.id} node={child} depth={depth+1} color={color} canEdit={canEdit} onReload={onReload} setErr={setErr}/>
      ))}
    </div>}
  </div>;
}
