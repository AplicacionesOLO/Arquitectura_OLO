// Bloques de validación para el panel de Workflows: un paso o un proceso
// completo. Solo admin/editor registran; todos ven el estado y el historial.
import { useState } from "react";
import { DESIGN } from "../data/constants.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { useValidaciones, registrarValidaciones, ESTADO_VAL } from "../lib/useValidaciones.js";

const fecha = f => f ? new Date(f).toLocaleString("es-CR", { dateStyle:"medium", timeStyle:"short" }) : "";
const btn = { fontSize:12.5, fontWeight:700, border:"none", borderRadius:7, padding:"7px 12px", cursor:"pointer", fontFamily:DESIGN.font };

export function BadgeVal({ estado, grande }) {
  const e = ESTADO_VAL[estado] || ESTADO_VAL.pendiente;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize: grande ? 12.5 : 11, fontWeight:700, color:e.color, background:e.color + "15", border:`1px solid ${e.color}55`, borderRadius:5, padding: grande ? "3px 9px" : "1px 7px", whiteSpace:"nowrap" }}>
    {e.icono && <span>{e.icono}</span>}{e.label}</span>;
}

function Caja({ children }) {
  return <div style={{ marginTop:14, background:DESIGN.sunken, border:`1px solid ${DESIGN.border}`, borderRadius:10, padding:"10px 12px" }}>{children}</div>;
}
function Encabezado({ children }) {
  return <div style={{ fontSize:10.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>{children}</div>;
}

// Formulario de corrección: qué está mal y (opcional) cómo debería decir
function FormCorreccion({ inicial, onEnviar, onCancelar, conTexto }) {
  const [comentario, setComentario] = useState("");
  const [correccion, setCorreccion] = useState(inicial || "");
  const campo = { width:"100%", boxSizing:"border-box", fontSize:12.5, fontFamily:DESIGN.font, padding:"7px 9px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:7, resize:"vertical" };
  return <div style={{ display:"grid", gap:6, marginTop:8 }}>
    <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={2} placeholder="¿Qué está mal o falta?" style={campo} autoFocus/>
    {conTexto && <>
      <div style={{ fontSize:11, color:DESIGN.muted }}>Cómo debería decir (opcional):</div>
      <textarea value={correccion} onChange={e => setCorreccion(e.target.value)} rows={3} style={campo}/>
    </>}
    <div style={{ display:"flex", gap:6 }}>
      <button disabled={!comentario.trim()} onClick={() => onEnviar(comentario.trim(), conTexto && correccion.trim() !== (inicial || "").trim() ? correccion.trim() : null)}
        style={{ ...btn, color:"#fff", background: comentario.trim() ? "#b45309" : "#d6c3a5", cursor: comentario.trim() ? "pointer" : "default" }}>Enviar corrección</button>
      <button onClick={onCancelar} style={{ ...btn, color:DESIGN.inkSoft, background:"#fff", border:`1px solid ${DESIGN.border}` }}>Cancelar</button>
    </div>
  </div>;
}

function Historial({ filas }) {
  const [abierto, setAbierto] = useState(false);
  if (filas.length < 2) return null;
  return <div style={{ marginTop:8 }}>
    <button onClick={() => setAbierto(a => !a)} style={{ fontSize:11.5, color:DESIGN.muted, background:"none", border:"none", padding:0, cursor:"pointer", fontFamily:DESIGN.font }}>{abierto ? "▾" : "▸"} Historial · {filas.length}</button>
    {abierto && filas.map(f => <div key={f.id} style={{ fontSize:11.5, color:DESIGN.inkSoft, borderLeft:`2px solid ${ESTADO_VAL[f.estado]?.color || DESIGN.border}`, padding:"2px 0 2px 8px", marginTop:5 }}>
      <b>{ESTADO_VAL[f.estado]?.label}</b> · {f.validado_nombre || "—"} · {fecha(f.created_at)}{f.comentario && <div>«{f.comentario}»</div>}
    </div>)}
  </div>;
}

function Vigente({ fila, estado }) {
  if (!fila) return <div style={{ fontSize:12, color:DESIGN.muted }}>Nadie lo ha revisado todavía.</div>;
  return <div style={{ fontSize:12, color:DESIGN.inkSoft, lineHeight:1.5 }}>
    {estado === "desactualizado" ? "Se validó, pero el texto del paso cambió después: revísalo de nuevo." : null}
    <div>{fila.estado === "validado" ? "Validado" : "Corrección pedida"} por <b>{fila.validado_nombre || "—"}</b> · {fecha(fila.created_at)}</div>
    {fila.comentario && <div style={{ marginTop:4, fontStyle:"italic" }}>«{fila.comentario}»</div>}
    {fila.correccion && <div style={{ marginTop:4, background:"#fff", border:`1px dashed ${DESIGN.borderStrong}`, borderRadius:6, padding:"5px 8px" }}><b style={{ fontStyle:"normal" }}>Propuesta:</b> {fila.correccion}</div>}
  </div>;
}

export function ValidacionPaso({ codigo, i, canEdit }) {
  const v = useValidaciones();
  const [form, setForm] = useState(false);
  const [err, setErr] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const estado = v.estadoPaso(codigo, i), fila = v.filaDe(codigo, i);
  const enviar = async (estadoNuevo, comentario, correccion) => {
    setEnviando(true); setErr(await registrarValidaciones([{ codigo, paso:i, estado:estadoNuevo, comentario, correccion }])); setEnviando(false); setForm(false);
  };
  return <Caja>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}><Encabezado>Validación del paso</Encabezado><BadgeVal estado={estado}/></div>
    <Vigente fila={fila} estado={estado}/>
    {canEdit && !form && <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
      <button disabled={enviando} onClick={() => enviar("validado")} style={{ ...btn, color:"#fff", background:"#15803d" }}>✓ {estado === "validado" ? "Validar de nuevo" : "Es correcto"}</button>
      <button disabled={enviando} onClick={() => setForm(true)} style={{ ...btn, color:"#b45309", background:"#fff", border:"1px solid #fcd34d" }}>✎ Pedir corrección</button>
    </div>}
    {form && <FormCorreccion conTexto inicial={PROCESOS[codigo].pasos[i].texto} onCancelar={() => setForm(false)} onEnviar={(c, t) => enviar("corregir", c, t)}/>}
    {!canEdit && <div style={{ fontSize:11, color:DESIGN.muted, marginTop:8 }}>Solo admin y editores pueden validar.</div>}
    {err && <div style={{ fontSize:11.5, color:"#b91c1c", marginTop:6 }}>No se pudo guardar: {err}</div>}
    <Historial filas={v.historialDe(codigo, i)}/>
  </Caja>;
}

export function ValidacionProceso({ codigo, canEdit }) {
  const v = useValidaciones();
  const [form, setForm] = useState(false);
  const [err, setErr] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const r = v.resumen(codigo); if (!r) return null;
  const pendientes = PROCESOS[codigo].pasos.map((_, i) => i).filter(i => v.estadoPaso(codigo, i) !== "validado" && v.estadoPaso(codigo, i) !== "corregir");
  const ejecutar = async lista => { setEnviando(true); setErr(await registrarValidaciones(lista)); setEnviando(false); setForm(false); };
  const pct = r.total ? Math.round(r.validados / r.total * 100) : 0;
  return <Caja>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}><Encabezado>Validación del proceso</Encabezado><BadgeVal estado={r.proceso}/></div>
    <div style={{ height:6, background:"#e2e8f0", borderRadius:3, overflow:"hidden", display:"flex" }}>
      <div style={{ width:`${pct}%`, background:"#15803d" }}/><div style={{ width:`${r.total ? r.corregir / r.total * 100 : 0}%`, background:"#f59e0b" }}/>
    </div>
    <div style={{ fontSize:12, color:DESIGN.inkSoft, margin:"6px 0 4px" }}>
      <b>{r.validados}</b> de {r.total} pasos validados{r.corregir ? <> · <b style={{ color:"#b45309" }}>{r.corregir}</b> con corrección</> : null}{r.desactualizados ? ` · ${r.desactualizados} cambiaron` : ""}
    </div>
    <Vigente fila={r.filaProceso} estado={r.proceso}/>
    {canEdit && !form && <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
      {pendientes.length > 0 && <button disabled={enviando} onClick={() => ejecutar(pendientes.map(i => ({ codigo, paso:i, estado:"validado" })))} style={{ ...btn, color:"#15803d", background:"#fff", border:"1px solid #86efac" }}>✓ Validar los {pendientes.length} pasos pendientes</button>}
      <button disabled={enviando || r.corregir > 0} title={r.corregir ? "Primero resuelve los pasos con corrección" : "El proceso completo es correcto"} onClick={() => ejecutar([{ codigo, paso:null, estado:"validado" }])}
        style={{ ...btn, color:"#fff", background: r.corregir ? "#86b39a" : "#15803d", cursor: r.corregir ? "default" : "pointer" }}>✓ Validar proceso</button>
      <button disabled={enviando} onClick={() => setForm(true)} style={{ ...btn, color:"#b45309", background:"#fff", border:"1px solid #fcd34d" }}>✎ Pedir corrección</button>
    </div>}
    {form && <FormCorreccion onCancelar={() => setForm(false)} onEnviar={c => ejecutar([{ codigo, paso:null, estado:"corregir", comentario:c }])}/>}
    {err && <div style={{ fontSize:11.5, color:"#b91c1c", marginTop:6 }}>No se pudo guardar: {err}</div>}
    <Historial filas={v.historialDe(codigo, null)}/>
  </Caja>;
}
