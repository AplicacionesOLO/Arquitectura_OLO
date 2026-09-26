// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE · «Qué hace» una opción de Softland. Muestra la descripción
// (inferida o validada por el admin) y, solo al admin y con editable, permite
// corregirla. Se usa en el manual Softland, la ficha de procesos y Workflows.
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { DESIGN } from "../data/constants.js";
import { useSflDescripciones, guardarDescripcion } from "../lib/useSflDescripciones.js";

export function SflQueHace({ id, editable = false, compacto = false }) {
  const desc = useSflDescripciones();
  const { isAdmin, profile } = useAuth();
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState(null); // null | "guardando" | mensaje de error
  if (!id) return null;
  const d = desc?.[id];
  if (!d && !(editable && isAdmin)) return desc ? null : <div style={{ fontSize:12, color:DESIGN.mutedSoft }}>…</div>;
  const validada = d?.origen === "editado";
  const etiqueta = <span title={validada ? `Corregida por ${d.editado_nombre || "el admin"}${d.updated_at ? " el " + new Date(d.updated_at).toLocaleDateString("es-CR") : ""}` : "Inferida a partir del manual, el mapeo funcional de Softland y cómo funciona un ERP. Puede tener errores."}
    style={{ fontSize:10.5, fontWeight:700, color:validada ? "#15803d" : "#b45309", background:validada ? "#15803d14" : "#b4530914", border:`1px solid ${validada ? "#15803d44" : "#b4530944"}`, borderRadius:4, padding:"0 5px", whiteSpace:"nowrap" }}>
    {validada ? "✓ Validada" : "Inferida"}</span>;
  const btn = { fontSize:12, fontWeight:700, border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontFamily:DESIGN.font };

  if (editando) return <div style={{ marginTop:compacto ? 4 : 6 }}>
    <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={3} autoFocus
      style={{ width:"100%", boxSizing:"border-box", fontSize:13.5, fontFamily:DESIGN.font, padding:"6px 8px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:6, lineHeight:1.5 }}/>
    <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:4 }}>
      <button disabled={estado === "guardando" || !texto.trim()} onClick={async () => {
        setEstado("guardando");
        try { await guardarDescripcion(id, texto, profile); setEditando(false); setEstado(null); } catch (e) { setEstado(e.message); }
      }} style={{ ...btn, color:"#fff", background:"#15803d", opacity:texto.trim() ? 1 : 0.5 }}>{estado === "guardando" ? "Guardando…" : "Guardar y validar"}</button>
      <button onClick={() => { setEditando(false); setEstado(null); }} style={{ ...btn, color:DESIGN.inkSoft, background:DESIGN.sunken2 }}>Cancelar</button>
      {estado && estado !== "guardando" && <span style={{ fontSize:12, color:"#b91c1c" }}>{estado}</span>}
    </div>
  </div>;

  return <div style={{ marginTop:compacto ? 3 : 6, display:"flex", gap:6, alignItems:"baseline", flexWrap:"wrap" }}>
    {!compacto && <span style={{ fontSize:11, fontWeight:700, color:DESIGN.muted, textTransform:"uppercase", letterSpacing:"0.05em" }}>Qué hace</span>}
    {d ? <>{etiqueta}<span style={{ fontSize:compacto ? 12.5 : 13.5, color:DESIGN.ink, lineHeight:1.5, flex:"1 1 260px" }}>{d.descripcion}</span></>
      : <span style={{ fontSize:13, color:DESIGN.muted }}>Sin descripción todavía.</span>}
    {editable && isAdmin && <button onClick={() => { setTexto(d?.descripcion || ""); setEditando(true); }} title="Solo el admin puede editar"
      style={{ ...btn, color:"#0369a1", background:"none", padding:0, fontSize:12 }}>✎ Editar</button>}
  </div>;
}
