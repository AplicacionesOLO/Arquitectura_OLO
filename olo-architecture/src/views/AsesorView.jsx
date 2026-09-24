// ═══════════════════════════════════════════════════════════════════════════
// VISTA · Asesor de cambios (solo admin)
// Consultar: se describe un cambio o problema; el agente (Edge Function
// asesor-cambios) consulta la base de conocimiento del BPA y responde con
// veredicto, implicaciones, lo que afecta, precedentes y recomendación.
// Solicitudes de cambio: catálogo de lo pedido a ePRAC, con estado editable.
// Base de conocimiento: qué sabe el asesor y cómo alimentarlo.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, Fragment } from "react";
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
      {[["consultar", "Consultar"], ["solicitudes", "Solicitudes de cambio"], ["conocimiento", "Base de conocimiento"]].map(([id, l]) => <button key={id} onClick={() => setPest(id)}
        style={{ fontSize:14, fontWeight: pest === id ? 700 : 500, color: pest === id ? DESIGN.ink : DESIGN.muted, background:"none", border:"none", borderBottom:`2px solid ${pest === id ? DESIGN.ink : "transparent"}`, padding:"8px 14px", cursor:"pointer", fontFamily:DESIGN.font, marginBottom:-1 }}>{l}</button>)}
    </div>
    {pest === "consultar" && <Consultar onVerSolicitud={id => { setVerSol(id); setPest("solicitudes"); }}/>}
    {pest === "solicitudes" && <Solicitudes abrir={verSol}/>}
    {pest === "conocimiento" && <Conocimiento/>}
  </div>;
}

// ── Consultar ────────────────────────────────────────────────────────────────
function Consultar({ onVerSolicitud }) {
  const [pregunta, setPregunta] = useState("");
  const [cargando, setCargando] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);
  const [historial, setHistorial] = useState([]);
  const cargarHist = useCallback(async () => {
    const { data } = await supabase.from("asesor_consultas").select("id,pregunta,respuesta,modelo,tokens_entrada,tokens_salida,herramientas,duracion_ms,created_at").order("created_at", { ascending:false }).limit(25);
    setHistorial(data || []);
  }, []);
  useEffect(() => { const t = setTimeout(cargarHist, 0); return () => clearTimeout(t); }, [cargarHist]);
  const analizar = async () => {
    if (!pregunta.trim()) return;
    setCargando(true); setErr(null); setRes(null);
    const { data, error } = await supabase.functions.invoke("asesor-cambios", { body: { pregunta: pregunta.trim() } });
    setCargando(false);
    if (error || data?.error) { setErr(data?.error || error.message || "No se pudo consultar al asesor."); return; }
    setRes({ ...data, pregunta: pregunta.trim(), created_at: new Date().toISOString() }); cargarHist();
  };
  const EJEMPLOS = ["Quiero que las reglas USA_LECTOR_HH se puedan activar por zona de almacenaje: ¿ya se pidió?, ¿qué implica?",
    "¿Se puede permitir asignar una misma expedición a dos camiones en el carga camión?",
    "Queremos agregar la fecha prometida del pedido en la pantalla de Órdenes de Expedición: ¿es posible y qué afecta?"];
  return <div style={{ display:"grid", gridTemplateColumns:"minmax(0, 1fr) 300px", gap:16, alignItems:"start" }}>
    <div>
      <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:12, padding:"14px 16px" }}>
        <div style={{ fontSize:13, color:DESIGN.inkSoft, marginBottom:8, lineHeight:1.5 }}>Describe el cambio que quieres hacer en el WMS (o el problema que tienes). El asesor revisa las solicitudes de cambio a ePRAC, la estructura de las bases, los manuales de pantallas y los procesos antes de responder.</div>
        <textarea value={pregunta} onChange={e => setPregunta(e.target.value)} rows={4} placeholder="Ej.: quiero que al cerrar el carga camión se pueda dejar una expedición en dos unidades distintas…"
          style={{ width:"100%", boxSizing:"border-box", fontSize:14, fontFamily:DESIGN.font, padding:"10px 12px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:9, resize:"vertical" }}
          onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) analizar(); }}/>
        <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:8, flexWrap:"wrap" }}>
          <button onClick={analizar} disabled={cargando || !pregunta.trim()} style={{ ...btn, color:"#fff", background: cargando || !pregunta.trim() ? "#94a3b8" : "#7c3aed" }}>{cargando ? "Analizando…" : "Analizar cambio"}</button>
          <span style={{ fontSize:11.5, color:DESIGN.muted }}>Ctrl + Enter · tarda entre 20 y 90 segundos</span>
        </div>
        {!res && !cargando && <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
          {EJEMPLOS.map(x => <button key={x} onClick={() => setPregunta(x)} style={{ fontSize:12, color:"#6d28d9", background:"#faf5ff", border:"1px solid #ede9fe", borderRadius:999, padding:"4px 10px", cursor:"pointer", fontFamily:DESIGN.font, textAlign:"left" }}>{x}</button>)}
        </div>}
      </div>
      {cargando && <div style={{ marginTop:14, fontSize:13, color:DESIGN.muted, background:"#faf5ff", border:"1px solid #ede9fe", borderRadius:10, padding:"12px 14px" }}>El asesor está consultando las solicitudes de cambio, las tablas, las pantallas y los procesos…</div>}
      {err && <div style={{ marginTop:14, fontSize:13, color:"#991b1b", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px" }}>{err}</div>}
      {res && <Resultado r={res} onVerSolicitud={onVerSolicitud}/>}
    </div>
    <aside style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:12, padding:"12px 14px", position:"sticky", top:16, maxHeight:"calc(100vh - 32px)", overflowY:"auto" }}>
      <div style={{ fontSize:11, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", marginBottom:8 }}>CONSULTAS ANTERIORES</div>
      {!historial.length && <div style={{ fontSize:12.5, color:DESIGN.muted }}>Todavía no hay consultas.</div>}
      {historial.map(h => { const v = VEREDICTO[h.respuesta?.veredicto] || VEREDICTO.falta_informacion;
        return <button key={h.id} onClick={() => setRes({ ...h, respuesta:h.respuesta, tokens:{ entrada:h.tokens_entrada, salida:h.tokens_salida } })} style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:`1px solid ${DESIGN.border}`, padding:"8px 0", cursor:"pointer", fontFamily:DESIGN.font }}>
          <div style={{ fontSize:12.5, color:DESIGN.ink, lineHeight:1.35, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{h.pregunta}</div>
          <div style={{ fontSize:11, marginTop:3 }}><b style={{ color:v.color }}>{v.label}</b> <span style={{ color:DESIGN.muted }}>· {fecha(h.created_at)}</span></div>
        </button>; })}
    </aside>
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
  const vis = filas.filter(f => (!fEstado || f.estado === fEstado) && (!q || [f.titulo, f.modulo, f.descripcion, f.compania].some(x => n(x).includes(n(q)))));
  const cuenta = Object.fromEntries(Object.keys(ESTADOS).map(k => [k, filas.filter(f => f.estado === k).length]));
  return <div>
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:10 }}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar solicitud…" style={{ fontSize:13, padding:"7px 10px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:7, fontFamily:DESIGN.font, width:260 }}/>
      <select value={fEstado} onChange={e => setFEstado(e.target.value)} style={{ fontSize:13, padding:"6px 8px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:7, fontFamily:DESIGN.font }}>
        <option value="">Todos los estados ({filas.length})</option>{Object.entries(ESTADOS).map(([k, l]) => <option key={k} value={k}>{l} ({cuenta[k]})</option>)}
      </select>
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
              <td style={{ ...td, fontWeight:600, minWidth:220 }}>{open ? "▾" : "▸"} {f.titulo}{f.numero_eprac && <span style={{ fontSize:11, color:DESIGN.muted, fontWeight:400 }}> · ePRAC {f.numero_eprac}</span>}</td>
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

// ── Base de conocimiento ─────────────────────────────────────────────────────
const TIPOS = { solicitud:"Solicitudes de cambio a ePRAC", tabla:"Tablas (estructura real de las bases)", pantalla_wms:"Pantallas de eFlow WMS", pantalla_wmh:"Pantallas de Torre de Control", pantalla_sorter:"Pantallas del SORTER CLIRO",
  pantalla_softland:"Menús de Softland por módulo", proceso:"Procesos del BPA (con pasos)", regla:"Reglas operativas", contexto:"Contexto (aplicaciones, clientes, brechas)", estandar:"Estándares y plantillas de ePRAC" };
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
