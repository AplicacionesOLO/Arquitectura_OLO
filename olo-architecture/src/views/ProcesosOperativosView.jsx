// ═══════════════════════════════════════════════════════════════════════════
// VISTA · PROCESOS OPERATIVOS — 6 procesos fijos (grids lineales), cada uno
// con un árbol dinámico Subproceso → Sub-subproceso → Detalle. Se pueden
// agregar/quitar filas en cualquier nivel; los cambios viven en memoria del
// navegador durante la sesión (no persisten al recargar todavía).
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { PROCESOS_CATEGORIAS } from "../data/procesosOperativos.js";

const LEVEL_LABELS = ["Subproceso", "Sub-subproceso", "Detalle"];

function newId() { return `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

function cloneNodes(nodes) {
  return nodes.map(n => ({ ...n, children: cloneNodes(n.children || []) }));
}
function cloneCategorias() {
  return PROCESOS_CATEGORIAS.map(cat => ({ ...cat, subprocesos: cloneNodes(cat.subprocesos) }));
}
function countAll(nodes) {
  return nodes.reduce((s, n) => s + 1 + countAll(n.children || []), 0);
}

export function ProcesosOperativosView() {
  const [categorias, setCategorias] = useState(cloneCategorias);

  const setSubprocesos = (catId, next) =>
    setCategorias(prev => prev.map(c => c.id === catId ? { ...c, subprocesos: next } : c));

  return <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
    {categorias.map(cat => (
      <CategoriaCard key={cat.id} cat={cat} onChange={(next) => setSubprocesos(cat.id, next)}/>
    ))}
  </div>;
}

function CategoriaCard({ cat, onChange }) {
  const total = countAll(cat.subprocesos);
  const addSubproceso = () => onChange([...cat.subprocesos, { id:newId(), name:"", children:[] }]);

  return <div style={{ background:"#fff", border:"1px solid #e0e0e0", borderLeft:`4px solid ${cat.color}`, borderRadius:10, padding:"14px 18px" }}>
    <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:12 }}>
      <span style={{ fontSize:11, fontWeight:700, color:"#fff", background:cat.color, borderRadius:12, padding:"2px 9px", flexShrink:0 }}>{cat.num}</span>
      <span style={{ fontSize:14, fontWeight:700, color:"#1D1D1B" }}>{cat.label}</span>
      <span style={{ fontSize:11, color:"#999" }}>· {total} elemento{total!==1?"s":""}</span>
    </div>

    {cat.subprocesos.length === 0
      ? <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:52, border:"1px dashed #e0e0e0", borderRadius:8, color:"#aaa", fontSize:12, marginBottom:10 }}>
          Sin subprocesos agregados todavía.
        </div>
      : <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
          {cat.subprocesos.map((n, i) => (
            <NodeRow key={n.id} node={n} depth={0} color={cat.color}
              onChange={(next) => onChange(cat.subprocesos.map((x, j) => j===i ? next : x))}
              onRemove={() => onChange(cat.subprocesos.filter((_, j) => j!==i))}
            />
          ))}
        </div>}

    <button onClick={addSubproceso} style={{ fontSize:11, fontWeight:600, color:cat.color, background:"#fff", border:`1px solid ${cat.color}55`, borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>
      + Agregar subproceso
    </button>
  </div>;
}

function NodeRow({ node, depth, color, onChange, onRemove }) {
  const label = LEVEL_LABELS[depth] ?? LEVEL_LABELS[LEVEL_LABELS.length - 1];
  const canHaveChildren = depth < LEVEL_LABELS.length - 1;

  const setName = (name) => onChange({ ...node, name });
  const addChild = () => onChange({ ...node, children:[...(node.children||[]), { id:newId(), name:"", children:[] }] });
  const updateChild = (idx, next) => onChange({ ...node, children: node.children.map((c,i)=>i===idx?next:c) });
  const removeChild = (idx) => onChange({ ...node, children: node.children.filter((_,i)=>i!==idx) });

  return <div style={{ marginLeft: depth*20 }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background: depth===0?"#fafafa":"transparent", border: depth===0?`1px solid ${color}33`:"none", borderRadius:6 }}>
      <span style={{ fontSize:9, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.04em", minWidth:82, flexShrink:0 }}>{label}</span>
      <input value={node.name} onChange={e=>setName(e.target.value)} placeholder={`Nombre del ${label.toLowerCase()}…`}
        style={{ flex:1, border:"none", borderBottom:"1px solid #eee", background:"transparent", fontSize:12, padding:"3px 4px", fontFamily:"inherit", color:"#1D1D1B", outline:"none" }}/>
      {canHaveChildren && <button onClick={addChild} title={`Agregar ${LEVEL_LABELS[depth+1]}`} style={{ background:"none", border:"1px solid #ddd", borderRadius:4, color:"#00838f", cursor:"pointer", fontSize:12, width:20, height:20, lineHeight:1, flexShrink:0 }}>+</button>}
      <button onClick={onRemove} title="Eliminar" style={{ background:"none", border:"none", color:"#c0392b", cursor:"pointer", fontSize:14, lineHeight:1, flexShrink:0 }}>×</button>
    </div>
    {node.children?.length > 0 && <div style={{ marginTop:4, display:"flex", flexDirection:"column", gap:4 }}>
      {node.children.map((child, i) => (
        <NodeRow key={child.id} node={child} depth={depth+1} color={color}
          onChange={(next)=>updateChild(i,next)}
          onRemove={()=>removeChild(i)}
        />
      ))}
    </div>}
  </div>;
}
