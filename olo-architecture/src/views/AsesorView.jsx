// ═══════════════════════════════════════════════════════════════════════════
// VISTA · Asesor de cambios (solo admin)
// Consultar: se describe un cambio o problema; el agente (Edge Function
// asesor-cambios) consulta la base de conocimiento del BPA y responde con
// veredicto, implicaciones, lo que afecta, precedentes y recomendación.
// Solicitudes de cambio: catálogo de lo pedido a ePRAC, con estado editable.
// Base de conocimiento: qué sabe el asesor y cómo alimentarlo.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { DESIGN } from "../data/constants.js";
import { Markdown } from "../components/MonitoreoBases.jsx";

const VEREDICTO = {
  viable:             { label:"Viable",                color:"#15803d", bg:"#f0fdf4" },
  viable_con_riesgos: { label:"Viable, con riesgos",   color:"#b45309", bg:"#fffbeb" },
  no_recomendable:    { label:"No recomendable",       color:"#b91c1c", bg:"#fef2f2" },
  falta_informacion:  { label:"Falta información",     color:"#475569", bg:"#f1f5f9" },
};
const ESTADOS = { aplicada:"Aplicada", en_desarrollo:"En desarrollo", pendiente:"Pendiente", rechazada:"Rechazada", por_definir:"Por definir" };
const COLOR_ESTADO = { aplicada:"#15803d", en_desarrollo:"#2563eb", pendiente:"#b45309", rechazada:"#b91c1c", por_definir:"#64748b" };
const SEV = { alta:"#b91c1c", media:"#b45309", baja:"#15803d" };
const th = { textAlign:"left", fontSize:10.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.06em", textTransform:"uppercase", padding:"8px 10px", borderBottom:`1px solid ${DESIGN.border}`, background:DESIGN.sunken };
const td = { fontSize:12.5, color:DESIGN.ink, padding:"8px 10px", borderBottom:`1px solid ${DESIGN.border}`, verticalAlign:"top" };
const btn = { fontSize:12.5, fontWeight:700, border:"none", borderRadius:7, padding:"7px 13px", cursor:"pointer", fontFamily:DESIGN.font };
const fecha = f => f ? new Date(f).toLocaleString("es-CR", { dateStyle:"medium", timeStyle:"short" }) : "—";

export function AsesorView() {
  const [pest, setPest] = useState("consultar");
  const [verSol, setVerSol] = useState(null);
  return <div>
    <div style={{ display:"flex", gap:4, borderBottom:`1px solid ${DESIGN.border}`, marginBottom:16 }}>
      {[["consultar", "Consultar"], ["solicitudes", "Solicitudes de cambio"], ["conocimiento", "Base de conocimiento"], ["abstracto", "Conocimiento abstracto"]].map(([id, l]) => <button key={id} onClick={() => setPest(id)}
        style={{ fontSize:14, fontWeight: pest === id ? 700 : 500, color: pest === id ? DESIGN.ink : DESIGN.muted, background:"none", border:"none", borderBottom:`2px solid ${pest === id ? DESIGN.ink : "transparent"}`, padding:"8px 14px", cursor:"pointer", fontFamily:DESIGN.font, marginBottom:-1 }}>{l}</button>)}
    </div>
    {pest === "consultar" && <Consultar onVerSolicitud={id => { setVerSol(id); setPest("solicitudes"); }}/>}
    {pest === "solicitudes" && <Solicitudes abrir={verSol}/>}
    {pest === "conocimiento" && <Conocimiento/>}
    {pest === "abstracto" && <Abstracto/>}
  </div>;
}

// ── Consultar: conversación con el asesor ───────────────────────────────────
const nuevoId = () => (crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}-${Math.random().toString(36).slice(2)}`);
const EJEMPLOS = ["¿Ya se pidió a ePRAC que las reglas USA_LECTOR_HH se puedan activar por zona? ¿Qué implica?",
  "¿Se puede asignar una misma expedición a dos camiones en el carga camión?",
  "Queremos agregar la fecha prometida del pedido en Órdenes de Expedición: ¿es posible y qué afecta?"];

function Consultar({ onVerSolicitud }) {
  const [conv, setConv] = useState(nuevoId);
  const [turnos, setTurnos] = useState([]);          // { pregunta, respuesta, modelo, tokens, herramientas, duracion_ms, created_at, cargando, error }
  const [texto, setTexto] = useState("");
  const [modal, setModal] = useState(null);
  const [hilos, setHilos] = useState([]);
  const [seg, setSeg] = useState(0);
  const finRef = useRef(null);
  const cargando = turnos.some(t => t.cargando);

  const cargarHilos = useCallback(async () => {
    const { data } = await supabase.from("asesor_consultas").select("id,conversacion,pregunta,respuesta,modelo,tokens_entrada,tokens_salida,herramientas,duracion_ms,created_at").order("created_at", { ascending:false }).limit(300);
    const g = new Map();
    (data || []).forEach(r => { const k = r.conversacion || `c-${r.id}`; if (!g.has(k)) g.set(k, []); g.get(k).push(r); });
    setHilos([...g.entries()].map(([id, rows]) => ({ id, rows: rows.slice().reverse(), ultima: rows[0] })));
  }, []);
  useEffect(() => { const t = setTimeout(cargarHilos, 0); return () => clearTimeout(t); }, [cargarHilos]);
  useEffect(() => { finRef.current?.scrollIntoView({ behavior:"smooth", block:"end" }); }, [turnos]);
  useEffect(() => {                                   // segundos transcurridos mientras piensa
    if (!cargando) return;
    const t0 = Date.now(); const i = setInterval(() => setSeg(Math.round((Date.now() - t0) / 1000)), 1000);
    return () => { clearInterval(i); setSeg(0); };
  }, [cargando]);
  useEffect(() => {                                   // Esc cierra el modal
    if (!modal) return;
    const k = e => { if (e.key === "Escape") setModal(null); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [modal]);

  const enviar = async (q = texto) => {
    const pregunta = q.trim(); if (!pregunta || cargando) return;
    const historial = turnos.filter(t => t.respuesta && !t.error).map(t => ({ pregunta:t.pregunta, respuesta:t.respuesta }));
    setTexto("");
    setTurnos(ts => [...ts, { pregunta, cargando:true, created_at:new Date().toISOString() }]);
    const { data, error } = await supabase.functions.invoke("asesor-cambios", { body:{ pregunta, historial, conversacion:conv } });
    setTurnos(ts => ts.map((t, i) => i !== ts.length - 1 ? t : (error || data?.error)
      ? { ...t, cargando:false, error: data?.error || error?.message || "No se pudo consultar al asesor." }
      : { ...t, cargando:false, ...data }));
    cargarHilos();
  };
  const abrirHilo = h => { if (cargando) return; setConv(h.id); setModal(null);
    setTurnos(h.rows.map(r => ({ pregunta:r.pregunta, respuesta:r.respuesta, modelo:r.modelo, tokens:{ entrada:r.tokens_entrada, salida:r.tokens_salida }, herramientas:r.herramientas, duracion_ms:r.duracion_ms, created_at:r.created_at }))); };
  const nueva = () => { if (cargando) return; setConv(nuevoId()); setTurnos([]); setTexto(""); };

  return <div style={{ display:"grid", gridTemplateColumns:"minmax(0, 1fr) 290px", gap:16, alignItems:"start" }}>
    <style>{`@keyframes asesorPunto { 0%,80%,100% { opacity:.25 } 40% { opacity:1 } }`}</style>
    <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:12, display:"flex", flexDirection:"column", height:"calc(100vh - 230px)", minHeight:460 }}>
      <div style={{ flex:1, overflowY:"auto", padding:"18px 18px 8px", display:"flex", flexDirection:"column", gap:14 }}>
        {!turnos.length && <div style={{ margin:"auto 0", textAlign:"center", color:DESIGN.muted }}>
          <div style={{ fontSize:28, color:"#7c3aed" }}>✦</div>
          <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink, marginTop:4 }}>¿Qué cambio quieres hacer en el WMS?</div>
          <div style={{ fontSize:12.5, marginTop:4, lineHeight:1.5, maxWidth:560, marginInline:"auto" }}>El asesor revisa las solicitudes de cambio a ePRAC, la estructura de las bases, las pantallas y los procesos, y te dice si es viable, qué implica y qué recomienda. Puedes repreguntar sobre la misma idea.</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"center", marginTop:14 }}>
            {EJEMPLOS.map(x => <button key={x} onClick={() => enviar(x)} style={{ fontSize:12.5, color:"#6d28d9", background:"#faf5ff", border:"1px solid #ede9fe", borderRadius:999, padding:"6px 14px", cursor:"pointer", fontFamily:DESIGN.font }}>{x}</button>)}
          </div>
        </div>}
        {turnos.map((t, i) => <Fragment key={i}>
          <div style={{ alignSelf:"flex-end", maxWidth:"75%", background:"#7c3aed", color:"#fff", borderRadius:"14px 14px 4px 14px", padding:"9px 13px", fontSize:13.5, lineHeight:1.5, whiteSpace:"pre-wrap" }}>{t.pregunta}</div>
          {t.cargando ? <div style={{ alignSelf:"flex-start", maxWidth:"80%", background:DESIGN.sunken, border:`1px solid ${DESIGN.border}`, borderRadius:"14px 14px 14px 4px", padding:"10px 14px", fontSize:13, color:DESIGN.inkSoft }}>
              <span style={{ fontWeight:700, color:"#7c3aed" }}>✦ Asesor</span> está revisando solicitudes, tablas, pantallas y procesos
              <span style={{ marginLeft:4 }}>{[0, 1, 2].map(k => <span key={k} style={{ animation:`asesorPunto 1.2s ${k * 0.2}s infinite` }}>•</span>)}</span>
              <span style={{ marginLeft:8, fontSize:11.5, color:DESIGN.muted }}>{seg} s</span>
            </div>
            : t.error ? <div style={{ alignSelf:"flex-start", maxWidth:"80%", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"14px 14px 14px 4px", padding:"10px 14px", fontSize:13, color:"#991b1b" }}>{t.error}</div>
            : <Burbuja t={t} onVer={() => setModal(t)}/>}
        </Fragment>)}
        <div ref={finRef}/>
      </div>
      <div style={{ borderTop:`1px solid ${DESIGN.border}`, padding:"10px 12px", display:"flex", gap:8, alignItems:"flex-end" }}>
        <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={Math.min(5, Math.max(1, texto.split("\n").length))}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
          placeholder={turnos.length ? "Repregunta o afina el cambio… (Enter para enviar, Shift+Enter para salto de línea)" : "Describe el cambio o el problema…"}
          style={{ flex:1, boxSizing:"border-box", fontSize:14, fontFamily:DESIGN.font, padding:"9px 12px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:10, resize:"none", lineHeight:1.45 }}/>
        <button onClick={() => enviar()} disabled={cargando || !texto.trim()} style={{ ...btn, color:"#fff", background: cargando || !texto.trim() ? "#c4b5fd" : "#7c3aed", padding:"10px 16px" }}>{cargando ? "…" : "Enviar"}</button>
      </div>
    </div>

    <aside style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:12, padding:"12px 14px", position:"sticky", top:16, maxHeight:"calc(100vh - 230px)", overflowY:"auto" }}>
      <button onClick={nueva} disabled={cargando} style={{ ...btn, width:"100%", color:"#7c3aed", background:"#faf5ff", border:"1px solid #ddd6fe", marginBottom:10 }}>＋ Nueva conversación</button>
      <div style={{ fontSize:11, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", marginBottom:6 }}>CONVERSACIONES</div>
      {!hilos.length && <div style={{ fontSize:12.5, color:DESIGN.muted }}>Todavía no hay conversaciones.</div>}
      {hilos.map(h => { const v = VEREDICTO[h.ultima.respuesta?.veredicto] || VEREDICTO.falta_informacion, activo = h.id === conv;
        return <button key={h.id} onClick={() => abrirHilo(h)} style={{ display:"block", width:"100%", textAlign:"left", background: activo ? "#faf5ff" : "none", border:"none", borderRadius:8, borderBottom:`1px solid ${DESIGN.border}`, padding:"8px 6px", cursor:"pointer", fontFamily:DESIGN.font }}>
          <div style={{ fontSize:12.5, color:DESIGN.ink, lineHeight:1.35, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", fontWeight: activo ? 700 : 400 }}>{h.rows[0].pregunta}</div>
          <div style={{ fontSize:11, marginTop:3 }}><b style={{ color:v.color }}>{v.label}</b> <span style={{ color:DESIGN.muted }}>· {h.rows.length > 1 ? `${h.rows.length} mensajes · ` : ""}{fecha(h.ultima.created_at)}</span></div>
        </button>; })}
    </aside>

    {modal && <div onClick={() => setModal(null)} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.45)", zIndex:900, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"4vh 16px", overflowY:"auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ width:"min(1000px, 100%)", background:"#fff", borderRadius:14, boxShadow:"0 24px 60px rgba(15,23,42,.3)", padding:"6px 8px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px 0" }}>
          <span style={{ fontSize:12, fontWeight:700, color:"#7c3aed", letterSpacing:"0.06em" }}>✦ ANÁLISIS COMPLETO</span>
          <button onClick={() => setModal(null)} title="Cerrar (Esc)" style={{ background:"none", border:"none", fontSize:18, color:DESIGN.muted, cursor:"pointer" }}>✕</button>
        </div>
        <Resultado r={modal} onVerSolicitud={id => { setModal(null); onVerSolicitud(id); }}/>
      </div>
    </div>}
  </div>;
}

// Respuesta del asesor como burbuja: veredicto, resumen y recomendación; el resto en el modal
function Burbuja({ t, onVer }) {
  const x = t.respuesta || {}, v = VEREDICTO[x.veredicto] || VEREDICTO.falta_informacion;
  return <div style={{ alignSelf:"flex-start", maxWidth:"82%", background:"#fff", border:`1px solid ${DESIGN.border}`, borderLeft:`4px solid ${v.color}`, borderRadius:"14px 14px 14px 4px", padding:"11px 14px", boxShadow:DESIGN.shadowCard }}>
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:6 }}>
      <span style={{ fontSize:12, fontWeight:700, color:"#7c3aed" }}>✦ Asesor</span>
      <span style={{ fontSize:12, fontWeight:800, color:v.color, background:v.bg, border:`1px solid ${v.color}55`, borderRadius:6, padding:"2px 9px" }}>{v.label}</span>
    </div>
    {x.resumen && <div style={{ fontSize:13.5, color:DESIGN.ink, lineHeight:1.55 }}>{x.resumen}</div>}
    {x.recomendacion && <div style={{ fontSize:12.5, color:DESIGN.inkSoft, lineHeight:1.5, marginTop:8, background:v.bg, borderRadius:8, padding:"7px 10px" }}><b style={{ color:v.color }}>Recomendación: </b>{x.recomendacion}</div>}
    <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap", marginTop:9 }}>
      <button onClick={onVer} style={{ ...btn, fontSize:12, color:"#fff", background:"#7c3aed", padding:"5px 12px" }}>Ver análisis completo</button>
      <span style={{ fontSize:11, color:DESIGN.muted }}>
        {[x.implicaciones?.length && `${x.implicaciones.length} implicaciones`, x.solicitudes_relacionadas?.length && `${x.solicitudes_relacionadas.length} precedentes`, x.fuentes?.length && `${x.fuentes.length} fuentes`, t.duracion_ms && `${Math.round(t.duracion_ms / 1000)} s`].filter(Boolean).join(" · ")}
      </span>
    </div>
  </div>;
}

function Caja({ titulo, children }) {
  return <div style={{ marginTop:14 }}><div style={{ fontSize:10.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>{titulo}</div>{children}</div>;
}

function Resultado({ r, onVerSolicitud }) {
  const x = r.respuesta || {}, v = VEREDICTO[x.veredicto] || VEREDICTO.falta_informacion, a = x.afecta || {};
  const [verHerr, setVerHerr] = useState(false);
  const chips = (xs, color) => <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{xs.map(t => <span key={t} style={{ fontSize:11.5, color, background:color + "12", border:`1px solid ${color}40`, borderRadius:5, padding:"2px 8px" }}>{t}</span>)}</div>;
  return <div style={{ marginTop:14, background:"#fff", border:`1px solid ${DESIGN.border}`, borderTop:`4px solid ${v.color}`, borderRadius:12, padding:"16px 18px" }}>
    {r.pregunta && <div style={{ fontSize:12, color:DESIGN.muted, marginBottom:8 }}>«{r.pregunta}»</div>}
    <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
      <span style={{ fontSize:14, fontWeight:800, color:v.color, background:v.bg, border:`1px solid ${v.color}55`, borderRadius:8, padding:"5px 12px" }}>{v.label}</span>
      {x.reformulacion && <span style={{ fontSize:13.5, color:DESIGN.inkSoft }}>{x.reformulacion}</span>}
    </div>
    {x.resumen && <p style={{ fontSize:14.5, color:DESIGN.ink, lineHeight:1.6, margin:"12px 0 0", fontWeight:500 }}>{x.resumen}</p>}
    {x.recomendacion && <div style={{ marginTop:12, background:v.bg, border:`1px solid ${v.color}33`, borderRadius:9, padding:"10px 14px", fontSize:13.5, color:DESIGN.ink, lineHeight:1.55 }}><b style={{ color:v.color }}>Recomendación: </b>{x.recomendacion}</div>}
    {x.implicaciones?.length > 0 && <Caja titulo="Implicaciones">
      <table style={{ width:"100%", borderCollapse:"collapse", border:`1px solid ${DESIGN.border}` }}>
        <thead><tr>{["Área", "Detalle", "Severidad"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{x.implicaciones.map((i, k) => <tr key={k}><td style={{ ...td, fontWeight:600, whiteSpace:"nowrap" }}>{i.area}</td><td style={td}>{i.detalle}</td>
          <td style={td}><span style={{ fontSize:11, fontWeight:700, color:SEV[i.severidad] || DESIGN.muted, textTransform:"uppercase" }}>{i.severidad}</span></td></tr>)}</tbody>
      </table></Caja>}
    {(a.tablas?.length || a.pantallas?.length || a.procesos?.length || a.clientes?.length) ? <Caja titulo="Qué afecta">
      <table style={{ width:"100%", borderCollapse:"collapse" }}><tbody>
        {[["Tablas", a.tablas, "#0e7490"], ["Pantallas", a.pantallas, "#2563eb"], ["Procesos", a.procesos, "#7c3aed"], ["Clientes / compañías", a.clientes, "#b45309"]].filter(([, xs]) => xs?.length).map(([k, xs, c]) =>
          <tr key={k}><td style={{ ...td, width:150, color:DESIGN.muted, fontWeight:600 }}>{k}</td><td style={td}>{chips(xs, c)}</td></tr>)}
      </tbody></table></Caja> : null}
    {x.solicitudes_relacionadas?.length > 0 && <Caja titulo="Solicitudes de cambio relacionadas (precedentes)">
      <table style={{ width:"100%", borderCollapse:"collapse", border:`1px solid ${DESIGN.border}` }}>
        <thead><tr>{["Solicitud", "Relación"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{x.solicitudes_relacionadas.map(s => <tr key={s.id}><td style={{ ...td, whiteSpace:"nowrap" }}><button onClick={() => onVerSolicitud(s.id)} style={{ background:"none", border:"none", padding:0, color:"#2563eb", fontWeight:700, cursor:"pointer", fontFamily:DESIGN.font, fontSize:12.5, textAlign:"left" }}>{s.titulo} ›</button></td><td style={td}>{s.relacion}</td></tr>)}</tbody>
      </table></Caja>}
    {x.analisis && <Caja titulo="Análisis"><div style={{ background:DESIGN.sunken, borderRadius:9, padding:"8px 14px" }}><Markdown texto={x.analisis}/></div></Caja>}
    {x.preguntas_abiertas?.length > 0 && <Caja titulo="Preguntas abiertas"><ul style={{ margin:0, paddingLeft:18, display:"grid", gap:3 }}>{x.preguntas_abiertas.map((p, k) => <li key={k} style={{ fontSize:13, color:DESIGN.inkSoft }}>{p}</li>)}</ul></Caja>}
    {x.fuentes?.length > 0 && <Caja titulo={`Fuentes · ${x.fuentes.length}`}>{chips(x.fuentes.map(f => f.titulo || f.id), "#475569")}</Caja>}
    <div style={{ marginTop:14, paddingTop:10, borderTop:`1px solid ${DESIGN.border}`, fontSize:11.5, color:DESIGN.muted, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
      <span>{r.modelo} · {r.tokens?.entrada ? `${Math.round(r.tokens.entrada / 1000)}k tokens de entrada, ${((r.tokens.salida || 0) / 1000).toFixed(1)}k de salida` : ""}{r.duracion_ms ? ` · ${Math.round(r.duracion_ms / 1000)} s` : ""}</span>
      {r.herramientas?.length > 0 && <button onClick={() => setVerHerr(v => !v)} style={{ background:"none", border:"none", padding:0, color:"#2563eb", cursor:"pointer", fontFamily:DESIGN.font, fontSize:11.5 }}>{verHerr ? "▾" : "▸"} {r.herramientas.length} consultas del agente</button>}
    </div>
    {verHerr && <ol style={{ margin:"6px 0 0", paddingLeft:20, fontSize:11.5, color:DESIGN.inkSoft }}>{r.herramientas.map((h, k) => <li key={k}><code>{h.herramienta}</code> {JSON.stringify(h.args)}</li>)}</ol>}
  </div>;
}

// ── Solicitudes de cambio ────────────────────────────────────────────────────
function Solicitudes({ abrir }) {
  const [filas, setFilas] = useState(null);
  const [abierta, setAbierta] = useState(abrir);
  const [q, setQ] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [soloVigentes, setSoloVigentes] = useState(true);   // oculta duplicados y versiones anteriores
  const cargar = useCallback(async () => {
    const { data } = await supabase.from("solicitudes_cambio").select("*").order("fecha", { ascending:false, nullsFirst:false });
    setFilas(data || []);
  }, []);
  useEffect(() => { const t = setTimeout(cargar, 0); return () => clearTimeout(t); }, [cargar]);
  const guardar = async (id, cambios) => {
    setFilas(fs => fs.map(f => f.id === id ? { ...f, ...cambios } : f));
    const { error } = await supabase.from("solicitudes_cambio").update(cambios).eq("id", id);
    if (error) { alert(`No se pudo guardar: ${error.message}`); cargar(); }
  };
  if (filas === null) return <div style={{ color:DESIGN.muted, fontSize:13 }}>Cargando…</div>;
  const n = s => String(s || "").toLowerCase();
  const superada = f => f.relacion && f.relacion.tipo !== "relacionada";
  const vis = filas.filter(f => (!soloVigentes || !superada(f)) && (!fEstado || f.estado === fEstado) && (!q || [f.titulo, f.modulo, f.descripcion, f.compania].some(x => n(x).includes(n(q)))));
  const cuenta = Object.fromEntries(Object.keys(ESTADOS).map(k => [k, filas.filter(f => f.estado === k).length]));
  return <div>
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:10 }}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar solicitud…" style={{ fontSize:13, padding:"7px 10px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:7, fontFamily:DESIGN.font, width:260 }}/>
      <select value={fEstado} onChange={e => setFEstado(e.target.value)} style={{ fontSize:13, padding:"6px 8px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:7, fontFamily:DESIGN.font }}>
        <option value="">Todos los estados ({filas.length})</option>{Object.entries(ESTADOS).map(([k, l]) => <option key={k} value={k}>{l} ({cuenta[k]})</option>)}
      </select>
      <label style={{ fontSize:12.5, color:DESIGN.inkSoft, display:"flex", gap:5, alignItems:"center" }}><input type="checkbox" checked={soloVigentes} onChange={e => setSoloVigentes(e.target.checked)}/>Solo vigentes ({filas.filter(f => !superada(f)).length} de {filas.length}: sin duplicados ni versiones anteriores)</label>
      <span style={{ marginLeft:"auto", fontSize:12, color:DESIGN.muted }}>Marca el estado real de cada una: el asesor lo toma en cuenta al responder.</span>
    </div>
    <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:980 }}>
        <thead><tr>{["Fecha", "Solicitud", "Módulo", "Compañía", "Solicitante", "Prior.", "Estado", "Menciona"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{vis.map(f => { const open = abierta === f.id, e = f.entidades || {};
          const menciona = [...(e.tablas || []), ...(e.reglas || [])];
          return <Fragment key={f.id}>
            <tr onClick={() => setAbierta(open ? null : f.id)} style={{ cursor:"pointer", background: open ? "#f8fafc" : "#fff" }}>
              <td style={{ ...td, whiteSpace:"nowrap" }}>{f.fecha ? new Date(f.fecha + "T12:00").toLocaleDateString("es-CR") : "—"}</td>
              <td style={{ ...td, fontWeight:600, minWidth:220 }}>{open ? "▾" : "▸"} {f.titulo}{f.numero_eprac && <span style={{ fontSize:11, color:DESIGN.muted, fontWeight:400 }}> · ePRAC {f.numero_eprac}</span>}
                {f.relacion && <div style={{ fontSize:11, fontWeight:500, color: f.relacion.tipo === "relacionada" ? DESIGN.muted : "#b45309", marginTop:2 }}>{{ duplicado:"Duplicado de", version_anterior:"Versión anterior de", relacionada:"Relacionada con" }[f.relacion.tipo]} «{f.relacion.titulo}»</div>}</td>
              <td style={td}>{f.modulo || "—"}</td><td style={{ ...td, fontSize:12 }}>{f.compania || "—"}</td><td style={{ ...td, fontSize:12 }}>{f.solicitante || "—"}</td>
              <td style={{ ...td, textAlign:"center" }}>{f.prioridad || "—"}</td>
              <td style={td} onClick={e => e.stopPropagation()}>
                <select value={f.estado} onChange={e => guardar(f.id, { estado:e.target.value })} style={{ fontSize:12, fontWeight:700, color:COLOR_ESTADO[f.estado], padding:"3px 6px", border:`1px solid ${COLOR_ESTADO[f.estado]}66`, borderRadius:6, background:"#fff", fontFamily:DESIGN.font }}>
                  {Object.entries(ESTADOS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
              </td>
              <td style={{ ...td, fontSize:11, color:DESIGN.inkSoft }}>{menciona.slice(0, 3).map(m => <code key={m} style={{ display:"inline-block", marginRight:4 }}>{m}</code>)}{menciona.length > 3 ? `+${menciona.length - 3}` : ""}</td>
            </tr>
            {open && <tr><td colSpan={8} style={{ padding:"4px 14px 16px", background:"#f8fafc", borderBottom:`1px solid ${DESIGN.border}` }}><DetalleSolicitud f={f} onGuardar={c => guardar(f.id, c)}/></td></tr>}
          </Fragment>; })}</tbody>
      </table>
    </div>
  </div>;
}

function DetalleSolicitud({ f, onGuardar }) {
  const [notas, setNotas] = useState(f.notas || "");
  const e = f.entidades || {}, at = f.atencion || {};
  const filas = [["Como", f.como], ["Necesito", f.necesito], ["Para", f.para], ["Cliente · almacén · compañía", [f.cliente, f.almacen, f.compania].filter(Boolean).join(" · ")],
    ["Atención de ePRAC", Object.keys(at).length ? [at.fecha && `Fecha ${at.fecha}`, at.atendidoPor && `Atendido por ${at.atendidoPor}`, at.proforma && `Proforma ${at.proforma}`, at.solicitud && `Solicitud ${at.solicitud}`, at.factura && `Factura ${at.factura}`].filter(Boolean).join(" · ") : "Sin datos de atención en el documento"],
    ["Tablas / reglas", [...(e.tablas || []), ...(e.reglas || [])].join(", ")], ["Pantallas", (e.pantallas || []).join(" · ")], ["Procesos del BPA", (e.procesos || []).join(" · ")], ["Archivo", f.archivo]].filter(([, v]) => v);
  const tabla = { width:"100%", borderCollapse:"collapse", background:"#fff", border:`1px solid ${DESIGN.border}` };
  return <div style={{ display:"grid", gridTemplateColumns:"minmax(360px, 1fr) minmax(360px, 1.2fr)", gap:14, marginTop:8 }}>
    <div>
      <table style={tabla}><tbody>{filas.map(([k, v]) => <tr key={k}><td style={{ ...td, width:170, color:DESIGN.muted, fontWeight:600, background:DESIGN.sunken }}>{k}</td><td style={{ ...td, lineHeight:1.5 }}>{v}</td></tr>)}</tbody></table>
      <div style={{ fontSize:10.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", margin:"12px 0 5px" }}>NOTAS (las lee el asesor)</div>
      <textarea value={notas} onChange={x => setNotas(x.target.value)} rows={3} placeholder="Qué se aplicó realmente, en qué versión, qué quedó pendiente…" style={{ width:"100%", boxSizing:"border-box", fontSize:12.5, fontFamily:DESIGN.font, padding:"7px 9px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:7 }}/>
      {notas !== (f.notas || "") && <button onClick={() => onGuardar({ notas })} style={{ ...btn, color:"#fff", background:"#15803d", marginTop:6 }}>Guardar notas</button>}
    </div>
    <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:8, padding:"10px 14px", maxHeight:460, overflowY:"auto" }}>
      {f.situacion_actual && <><div style={{ fontSize:10.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", marginBottom:4 }}>SITUACIÓN ACTUAL</div><div style={{ fontSize:12.5, color:DESIGN.ink, lineHeight:1.55, whiteSpace:"pre-wrap", marginBottom:12 }}>{f.situacion_actual}</div></>}
      <div style={{ fontSize:10.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", marginBottom:4 }}>CAMBIO SOLICITADO</div>
      <div style={{ fontSize:12.5, color:DESIGN.ink, lineHeight:1.55, whiteSpace:"pre-wrap" }}>{f.descripcion}</div>
    </div>
  </div>;
}

// ── Conocimiento abstracto: correos, chats, imágenes, PDFs y notas ─────────
const CATEGORIA = { incidencia:["Incidencia","#b91c1c"], decision:["Decisión","#7c3aed"], acuerdo:["Acuerdo","#0f766e"], requerimiento:["Requerimiento","#2563eb"],
  solicitud_de_cambio:["Solicitud de cambio","#c2410c"], evidencia:["Evidencia","#0891b2"], procedimiento:["Procedimiento","#15803d"], contexto:["Contexto","#475569"] };
const FUENTES = { nota:"Nota", correo:"Correo", chat:"Chat / mensajes", imagen:"Imagen / captura", documento:"Documento" };
const ESTADO_ABS = { pendiente:["Pendiente","#64748b"], procesando:["Procesando…","#2563eb"], listo:["Listo","#15803d"], error:["Error","#b91c1c"] };
const seguro = n => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]+/g, "_").slice(-80);

// Texto de un .docx en el navegador (el .docx es un zip; word/document.xml trae el texto)
async function textoDocx(file) {
  const buf = await file.arrayBuffer(), dv = new DataView(buf);
  let eocd = buf.byteLength - 22; while (eocd > 0 && dv.getUint32(eocd, true) !== 0x06054b50) eocd--;
  let off = dv.getUint32(eocd + 16, true); const n = dv.getUint16(eocd + 10, true);
  for (let i = 0; i < n; i++) {
    const metodo = dv.getUint16(off + 10, true), comp = dv.getUint32(off + 20, true), ln = dv.getUint16(off + 28, true), le = dv.getUint16(off + 30, true), lc = dv.getUint16(off + 32, true), loc = dv.getUint32(off + 42, true);
    const nombre = new TextDecoder().decode(new Uint8Array(buf, off + 46, ln));
    if (nombre === "word/document.xml") {
      const ini = loc + 30 + dv.getUint16(loc + 26, true) + dv.getUint16(loc + 28, true);
      let datos = new Uint8Array(buf, ini, comp);
      if (metodo === 8) datos = new Uint8Array(await new Response(new Blob([datos]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
      const xml = new TextDecoder().decode(datos);
      return xml.replace(/<\/w:p>/g, "\n").replace(/<w:tab\/>/g, "\t").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\n{3,}/g, "\n\n").trim();
    }
    off += 46 + ln + le + lc;
  }
  throw new Error("No se encontró el texto del documento Word");
}

function Abstracto() {
  const [filas, setFilas] = useState(null);
  const [texto, setTexto] = useState("");
  const [titulo, setTitulo] = useState("");
  const [fuente, setFuente] = useState("nota");
  const [archivos, setArchivos] = useState([]);       // File[]
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [abierta, setAbierta] = useState(null);
  const [arrastre, setArrastre] = useState(false);
  const cargar = useCallback(async () => {
    const { data } = await supabase.from("asesor_abstracto").select("*").order("created_at", { ascending:false }).limit(200);
    setFilas(data || []);
  }, []);
  useEffect(() => { const t = setTimeout(cargar, 0); return () => clearTimeout(t); }, [cargar]);
  const procesando = (filas || []).some(f => f.estado === "procesando" || f.estado === "pendiente");
  useEffect(() => { if (!procesando) return; const i = setInterval(cargar, 5000); return () => clearInterval(i); }, [procesando, cargar]);

  // se copia la lista ya: el selector de archivos se vacía justo después (y con él, su FileList)
  const agregar = list => { const nuevos = [...list].filter(f => f.size <= 15 * 1024 * 1024); setArchivos(a => [...a, ...nuevos]); };
  const onPaste = e => { const imgs = [...(e.clipboardData?.files || [])].filter(f => f.type.startsWith("image/")); if (imgs.length) { e.preventDefault(); agregar(imgs.map((f, i) => new File([f], `captura-${Date.now()}-${i}.png`, { type:f.type }))); } };

  const procesar = async () => {
    if (!texto.trim() && !archivos.length) return;
    setEnviando(true); setAviso(null);
    try {
      const piezas = [];
      if (texto.trim()) piezas.push({ titulo: titulo.trim() || null, fuente, contenido: texto.trim() });
      for (const f of archivos) {
        const ext = f.name.split(".").pop().toLowerCase();
        if (ext === "docx") piezas.push({ titulo: titulo.trim() || f.name, fuente:"documento", contenido: await textoDocx(f), archivo_nombre: f.name });
        else if (["txt", "eml", "md", "csv", "json", "log"].includes(ext) || f.type.startsWith("text/")) piezas.push({ titulo: titulo.trim() || f.name, fuente: ext === "eml" ? "correo" : "documento", contenido: (await f.text()).slice(0, 200000), archivo_nombre: f.name });
        else if (f.type.startsWith("image/") || f.type === "application/pdf") {
          const path = `${crypto.randomUUID ? crypto.randomUUID() : Date.now()}/${seguro(f.name)}`;
          const { error } = await supabase.storage.from("asesor-abstracto").upload(path, f, { contentType:f.type, upsert:false });
          if (error) throw new Error(`No se pudo subir ${f.name}: ${error.message}`);
          piezas.push({ titulo: titulo.trim() || f.name, fuente: f.type.startsWith("image/") ? "imagen" : "documento", archivo_path:path, archivo_nombre:f.name, mime:f.type });
        } else throw new Error(`Formato no soportado: ${f.name} (usa imagen, PDF, Word, .txt o .eml)`);
      }
      const { data, error } = await supabase.from("asesor_abstracto").insert(piezas).select("id");
      if (error) throw new Error(error.message);
      setTexto(""); setTitulo(""); setArchivos([]); cargar();
      setAviso(`${data.length} pieza${data.length > 1 ? "s" : ""} en proceso: el modelo las clasifica y las suma a la base de conocimiento (≈ 30–90 s cada una).`);
      for (const r of data) { await supabase.functions.invoke("asesor-abstracto", { body:{ id:r.id } }); cargar(); }
    } catch (e) { setAviso(`⚠ ${e.message}`); }
    setEnviando(false);
  };
  const reprocesar = async id => { await supabase.from("asesor_abstracto").update({ estado:"pendiente" }).eq("id", id); cargar(); await supabase.functions.invoke("asesor-abstracto", { body:{ id } }); cargar(); };
  const eliminar = async f => {
    if (!confirm(`¿Eliminar «${f.titulo || f.archivo_nombre || "esta pieza"}» y quitarla de la base de conocimiento del asesor?`)) return;
    if (f.archivo_path) await supabase.storage.from("asesor-abstracto").remove([f.archivo_path]);
    await supabase.from("asesor_docs").delete().eq("id", `abstracto:${f.id}`);
    await supabase.from("asesor_abstracto").delete().eq("id", f.id);
    setAbierta(null); cargar();
  };

  const campo = { fontSize:13, fontFamily:DESIGN.font, padding:"7px 10px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:8, boxSizing:"border-box" };
  return <div>
    <div onDragOver={e => { e.preventDefault(); setArrastre(true); }} onDragLeave={() => setArrastre(false)} onDrop={e => { e.preventDefault(); setArrastre(false); agregar(e.dataTransfer.files); }}
      style={{ background: arrastre ? "#faf5ff" : "#fff", border:`1.5px ${arrastre ? "dashed #7c3aed" : `solid ${DESIGN.border}`}`, borderRadius:12, padding:"14px 16px", marginBottom:14 }}>
      <div style={{ fontSize:13, color:DESIGN.inkSoft, marginBottom:8, lineHeight:1.5 }}>Pega aquí correos, conversaciones de WhatsApp, notas de reuniones o arrastra capturas, fotos, PDFs y documentos Word. El modelo los <b>clasifica</b>, los <b>resume</b> (hechos, decisiones, pendientes), los <b>interpreta</b> para el WMS y el BPA y los <b>enlaza</b> con tablas, pantallas, procesos y solicitudes reales; luego el asesor los usa como evidencia. Se ocultan correos y teléfonos.</div>
      <div style={{ display:"flex", gap:8, marginBottom:8, flexWrap:"wrap" }}>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título (opcional)" style={{ ...campo, flex:"1 1 260px" }}/>
        <select value={fuente} onChange={e => setFuente(e.target.value)} style={campo}>{Object.entries(FUENTES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      </div>
      <textarea value={texto} onChange={e => setTexto(e.target.value)} onPaste={onPaste} rows={6} placeholder="Pega el texto del correo o del chat… (también puedes pegar una captura con Ctrl+V)"
        style={{ ...campo, width:"100%", resize:"vertical", lineHeight:1.5 }}/>
      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginTop:8 }}>
        <label style={{ ...btn, color:DESIGN.ink, background:DESIGN.sunken2, display:"inline-block" }}>📎 Adjuntar archivos
          <input type="file" multiple accept="image/*,.pdf,.docx,.txt,.eml,.md,.csv" onChange={e => { agregar(e.target.files); e.target.value = ""; }} style={{ display:"none" }}/></label>
        {archivos.map((f, i) => <span key={i} style={{ fontSize:12, color:DESIGN.inkSoft, background:"#f1f5f9", border:`1px solid ${DESIGN.border}`, borderRadius:999, padding:"3px 10px" }}>
          {f.type.startsWith("image/") ? "🖼" : "📄"} {f.name} <button onClick={() => setArchivos(a => a.filter((_, k) => k !== i))} style={{ background:"none", border:"none", cursor:"pointer", color:DESIGN.muted }}>✕</button></span>)}
        <button onClick={procesar} disabled={enviando || (!texto.trim() && !archivos.length)} style={{ ...btn, marginLeft:"auto", color:"#fff", background: enviando || (!texto.trim() && !archivos.length) ? "#c4b5fd" : "#7c3aed" }}>{enviando ? "Procesando…" : "Cargar y procesar"}</button>
      </div>
      {aviso && <div style={{ fontSize:12.5, color: aviso.startsWith("⚠") ? "#991b1b" : "#1e40af", marginTop:8 }}>{aviso}</div>}
    </div>

    {filas === null ? <div style={{ color:DESIGN.muted, fontSize:13 }}>Cargando…</div> :
    <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
        <thead><tr>{["Cargado", "Título", "Fuente", "Categoría", "Estado", "Relacionado con"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>
          {!filas.length && <tr><td colSpan={6} style={{ ...td, color:DESIGN.muted, textAlign:"center", padding:20 }}>Todavía no hay conocimiento abstracto cargado.</td></tr>}
          {filas.map(f => { const r = f.resultado || {}, c = CATEGORIA[f.categoria], es = ESTADO_ABS[f.estado], open = abierta === f.id;
            const rel = r.entidades ? [...r.entidades.procesos, ...r.entidades.solicitudes, ...r.entidades.tablas, ...r.entidades.pantallas].slice(0, 4) : [];
            return <Fragment key={f.id}>
              <tr onClick={() => setAbierta(open ? null : f.id)} style={{ cursor:"pointer", background: open ? "#f8fafc" : "#fff" }}>
                <td style={{ ...td, whiteSpace:"nowrap" }}>{fecha(f.created_at)}</td>
                <td style={{ ...td, fontWeight:600, minWidth:220 }}>{open ? "▾" : "▸"} {f.titulo || r.titulo || f.archivo_nombre || "Sin título"}{f.titulo && r.titulo && r.titulo !== f.titulo && <div style={{ fontSize:11.5, fontWeight:400, color:DESIGN.muted }}>{r.titulo}</div>}</td>
                <td style={td}>{FUENTES[r.fuente || f.fuente]}</td>
                <td style={td}>{c ? <span style={{ fontSize:11.5, fontWeight:700, color:c[1], background:c[1] + "14", border:`1px solid ${c[1]}44`, borderRadius:5, padding:"1px 8px" }}>{c[0]}</span> : "—"}</td>
                <td style={td}><span style={{ fontSize:11.5, fontWeight:700, color:es[1] }}>{es[0]}</span>{f.estado === "error" && <div style={{ fontSize:11, color:"#991b1b" }}>{f.error?.slice(0, 80)}</div>}</td>
                <td style={{ ...td, fontSize:11.5, color:DESIGN.inkSoft }}>{rel.join(" · ")}</td>
              </tr>
              {open && <tr><td colSpan={6} style={{ padding:"4px 14px 16px", background:"#f8fafc", borderBottom:`1px solid ${DESIGN.border}` }}><DetalleAbstracto f={f} onReprocesar={() => reprocesar(f.id)} onEliminar={() => eliminar(f)}/></td></tr>}
            </Fragment>; })}
        </tbody>
      </table>
    </div>}
  </div>;
}

function DetalleAbstracto({ f, onReprocesar, onEliminar }) {
  const r = f.resultado || {}, e = r.entidades || {};
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!f.archivo_path) return;
    supabase.storage.from("asesor-abstracto").createSignedUrl(f.archivo_path, 600).then(({ data }) => setUrl(data?.signedUrl || null));
  }, [f.archivo_path]);
  const [verOriginal, setVerOriginal] = useState(false);
  const filas = [["Resumen", r.resumen], ["Interpretación para el WMS / BPA", r.interpretacion],
    ["Hechos", r.hechos?.length ? <ul style={{ margin:0, paddingLeft:18 }}>{r.hechos.map((h, i) => <li key={i}>{h}</li>)}</ul> : null],
    ["Decisiones", r.decisiones?.length ? <ul style={{ margin:0, paddingLeft:18 }}>{r.decisiones.map((h, i) => <li key={i}>{h}</li>)}</ul> : null],
    ["Pendientes", r.pendientes?.length ? <ul style={{ margin:0, paddingLeft:18 }}>{r.pendientes.map((p, i) => <li key={i}>{p.que}{p.responsable ? <b> · {p.responsable}</b> : null}</li>)}</ul> : null],
    ["Sistemas", e.sistemas?.join(", ")], ["Procesos", e.procesos?.join(" · ")], ["Solicitudes de cambio", e.solicitudes?.join(" · ")], ["Tablas", e.tablas?.join(", ")], ["Pantallas", e.pantallas?.join(" · ")], ["Clientes", e.clientes?.join(", ")],
    ["Mencionado pero no existe en el BPA", r.no_encontrado?.join(", ")], ["Fecha del hecho", r.fecha_evento], ["Confianza", r.confianza],
    ["Procesado", f.procesado_at ? `${fecha(f.procesado_at)} · ${f.modelo} · ${Math.round((f.tokens_entrada || 0) / 1000)}k tokens` : null]].filter(([, v]) => v);
  return <div style={{ display:"grid", gridTemplateColumns: url ? "minmax(380px, 1.3fr) minmax(280px, 1fr)" : "1fr", gap:14, marginTop:8 }}>
    <div>
      {f.estado !== "listo" ? <div style={{ fontSize:12.5, color:DESIGN.muted }}>{f.estado === "error" ? `Error: ${f.error}` : "Todavía en proceso…"}</div> :
      <table style={{ width:"100%", borderCollapse:"collapse", background:"#fff", border:`1px solid ${DESIGN.border}` }}><tbody>
        {filas.map(([k, v]) => <tr key={k}><td style={{ ...td, width:200, color:DESIGN.muted, fontWeight:600, background:DESIGN.sunken }}>{k}</td><td style={{ ...td, lineHeight:1.55 }}>{v}</td></tr>)}
      </tbody></table>}
      {(r.texto_extraido || f.contenido) && <button onClick={() => setVerOriginal(v => !v)} style={{ background:"none", border:"none", padding:0, marginTop:8, color:"#2563eb", cursor:"pointer", fontFamily:DESIGN.font, fontSize:12 }}>{verOriginal ? "▾" : "▸"} {r.texto_extraido ? "Texto extraído" : "Contenido original"}</button>}
      {verOriginal && <pre style={{ whiteSpace:"pre-wrap", fontSize:12, fontFamily:DESIGN.font, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:8, padding:"8px 12px", maxHeight:300, overflowY:"auto" }}>{r.texto_extraido || f.contenido}</pre>}
      <div style={{ display:"flex", gap:8, marginTop:10 }}>
        <button onClick={onReprocesar} style={{ ...btn, color:DESIGN.ink, background:DESIGN.sunken2 }}>↻ Reprocesar</button>
        <button onClick={onEliminar} style={{ ...btn, color:"#b91c1c", background:"#fff", border:"1px solid #fecaca" }}>Eliminar</button>
      </div>
    </div>
    {url && (f.mime?.startsWith("image/") ? <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={f.archivo_nombre} style={{ width:"100%", borderRadius:8, border:`1px solid ${DESIGN.border}` }}/></a>
      : <a href={url} target="_blank" rel="noreferrer" style={{ fontSize:13, color:"#2563eb" }}>📄 Abrir {f.archivo_nombre}</a>)}
  </div>;
}

// ── Base de conocimiento ─────────────────────────────────────────────────────
const TIPOS = { solicitud:"Solicitudes de cambio a ePRAC", tabla:"Tablas (estructura real de las bases)", pantalla_wms:"Pantallas de eFlow WMS", pantalla_wmh:"Pantallas de Torre de Control", pantalla_sorter:"Pantallas del SORTER CLIRO",
  pantalla_softland:"Menús de Softland por módulo", proceso:"Procesos del BPA (con pasos)", regla:"Reglas operativas", contexto:"Contexto (aplicaciones, clientes, brechas)", estandar:"Estándares y plantillas de ePRAC", abstracto:"Conocimiento abstracto (correos, chats, capturas, notas)" };
function Conocimiento() {
  const [cuenta, setCuenta] = useState(null);
  useEffect(() => {
    supabase.from("asesor_docs").select("tipo,updated_at").then(({ data }) => {
      const c = {}; let ult = null;
      (data || []).forEach(d => { c[d.tipo] = (c[d.tipo] || 0) + 1; if (!ult || d.updated_at > ult) ult = d.updated_at; });
      setCuenta({ c, ult, total:(data || []).length });
    });
  }, []);
  if (!cuenta) return <div style={{ color:DESIGN.muted, fontSize:13 }}>Cargando…</div>;
  return <div style={{ display:"grid", gridTemplateColumns:"minmax(360px, 1fr) minmax(320px, 1fr)", gap:16, alignItems:"start" }}>
    <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, overflow:"hidden" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr><th style={th}>Qué sabe el asesor</th><th style={{ ...th, textAlign:"right" }}>Documentos</th></tr></thead>
        <tbody>{Object.entries(TIPOS).map(([k, l]) => <tr key={k}><td style={td}>{l}</td><td style={{ ...td, textAlign:"right", fontWeight:700 }}>{cuenta.c[k] || 0}</td></tr>)}
          <tr><td style={{ ...td, fontWeight:700 }}>Total</td><td style={{ ...td, textAlign:"right", fontWeight:800 }}>{cuenta.total}</td></tr></tbody>
      </table>
      <div style={{ fontSize:11.5, color:DESIGN.muted, padding:"8px 12px" }}>Última actualización: {fecha(cuenta.ult)}</div>
    </div>
    <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, padding:"14px 16px", fontSize:13, color:DESIGN.inkSoft, lineHeight:1.6 }}>
      <div style={{ fontSize:14, fontWeight:700, color:DESIGN.ink, marginBottom:6 }}>Cómo alimentarlo</div>
      <ol style={{ margin:0, paddingLeft:18, display:"grid", gap:6 }}>
        <li>Guarda las nuevas solicitudes de cambio (.docx o .pdf, con la plantilla de ePRAC) en la carpeta de solicitudes.</li>
        <li>Ejecuta <code>node asesor/ingestar.mjs</code> en el equipo del BPA: agrega las solicitudes nuevas y regenera todo lo demás (tablas, pantallas, procesos) con lo último del BPA. No pisa los estados ni las notas que marcaste aquí.</li>
        <li>Marca el estado real de cada solicitud en la pestaña «Solicitudes de cambio» y anota qué se aplicó: el asesor usa esa información.</li>
      </ol>
      <div style={{ marginTop:10, fontSize:12, color:DESIGN.muted }}>Las solicitudes, la base de conocimiento y las consultas son visibles solo para administradores.</div>
    </div>
  </div>;
}
