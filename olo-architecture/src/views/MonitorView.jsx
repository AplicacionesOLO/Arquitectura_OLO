// ═══════════════════════════════════════════════════════════════════════════
// VISTA · Monitor — jobs automáticos del BPA y cambios en las bases de datos.
// Jobs: una tabla con cada job (tipo, dónde vive, frecuencia, modelo de IA,
// última corrida, tiempos, gasto, próxima corrida y limitaciones). Al abrir una
// fila se ve y edita su configuración (solo admin) y su historial. El despachador
// (jobs/despachador.js) lee esta configuración cada 15 minutos.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, Fragment } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { DESIGN } from "../data/constants.js";
import { describir, siguiente, DIAS } from "../lib/frecuencia.js";
import { MonitoreoBases } from "../components/MonitoreoBases.jsx";

const MODELOS = {
  "claude-opus-5-5":           "Claude Opus 5.5",
  "claude-sonnet-5":           "Claude Sonnet 5",
  "claude-haiku-4-5-20251001": "Claude Haiku 4.5",
};
const fecha = f => f ? new Date(f).toLocaleString("es-CR", { dateStyle:"short", timeStyle:"short" }) : "—";
// fecha corta para la tabla: 25/9 07:00
const corta = f => { if (!f) return "—"; const d = new Date(f); return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const hace = (f, ahora) => { if (!f) return "nunca"; const m = Math.round((ahora - new Date(f)) / 60000);
  return m < 1 ? "hace un momento" : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : `hace ${Math.round(m / 1440)} d`; };
const dur = ms => ms == null ? "—" : ms < 1000 ? `${ms} ms` : ms < 60000 ? `${(ms / 1000).toFixed(0)} s` : `${Math.floor(ms / 60000)} min ${Math.round(ms % 60000 / 1000)} s`;
const usd = n => `US$ ${Number(n || 0).toFixed(2)}`;

const th = { textAlign:"left", fontSize:10.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.06em", textTransform:"uppercase", padding:"9px 10px", borderBottom:`1px solid ${DESIGN.border}`, background:DESIGN.sunken, whiteSpace:"nowrap" };
const td = { fontSize:12.5, color:DESIGN.ink, padding:"10px", borderBottom:`1px solid ${DESIGN.border}`, verticalAlign:"top" };
const sub = { fontSize:11.5, color:DESIGN.muted, marginTop:2 };
const btn = { fontSize:12, fontWeight:700, border:"none", borderRadius:7, padding:"6px 11px", cursor:"pointer", fontFamily:DESIGN.font };

function Estado({ e }) {
  const c = { ok:"#15803d", error:"#b91c1c", omitido:"#64748b" }[e] || "#94a3b8";
  return <span style={{ fontSize:11, fontWeight:700, color:c, background:c + "15", border:`1px solid ${c}44`, borderRadius:4, padding:"0 6px" }}>{{ ok:"OK", error:"Error", omitido:"Omitido" }[e] || e}</span>;
}

export function MonitorView() {
  const [pest, setPest] = useState("jobs");
  return <div>
    <div style={{ display:"flex", gap:4, borderBottom:`1px solid ${DESIGN.border}`, marginBottom:16 }}>
      {[["jobs", "Jobs"], ["bases", "Cambios en bases"]].map(([id, l]) => <button key={id} onClick={() => setPest(id)}
        style={{ fontSize:14, fontWeight: pest === id ? 700 : 500, color: pest === id ? DESIGN.ink : DESIGN.muted, background:"none", border:"none", borderBottom:`2px solid ${pest === id ? DESIGN.ink : "transparent"}`, padding:"8px 14px", cursor:"pointer", fontFamily:DESIGN.font, marginBottom:-1 }}>{l}</button>)}
    </div>
    {pest === "jobs" ? <Jobs/> : <MonitoreoBases/>}
  </div>;
}

function Jobs() {
  const { role } = useAuth();
  const esAdmin = role === "admin";
  const [jobs, setJobs] = useState(null);
  const [runs, setRuns] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [ahora, setAhora] = useState(null);         // hora de la última carga (para "hace X min")
  const cargar = useCallback(async () => {
    const [{ data: j }, { data: r }] = await Promise.all([
      supabase.from("bpa_jobs").select("*").order("orden"),
      supabase.from("bpa_job_runs").select("*").order("inicio", { ascending:false }).limit(500),
    ]);
    setJobs(j || []); setRuns(r || []); setAhora(Date.now());
  }, []);
  useEffect(() => { const t = setTimeout(cargar, 0); const i = setInterval(cargar, 60000); return () => { clearTimeout(t); clearInterval(i); }; }, [cargar]);

  if (jobs === null || ahora === null) return <div style={{ color:DESIGN.muted, fontSize:13 }}>Cargando…</div>;
  const desp = jobs.find(j => j.id === "despachador");
  const vivo = desp?.ultima_revision && ahora - new Date(desp.ultima_revision) < 20 * 60000;
  const hoy = new Date(ahora), inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const stats = id => {
    const rs = runs.filter(r => r.job_id === id), ult = rs[0];
    const conDur = rs.filter(r => r.duracion_ms != null).slice(0, 20);
    return { ult, rs, prom: conDur.length ? Math.round(conDur.reduce((a, r) => a + r.duracion_ms, 0) / conDur.length) : null,
      mes: rs.filter(r => new Date(r.inicio) >= inicioMes).reduce((a, r) => a + Number(r.costo_usd || 0), 0) };
  };
  const ejecutar = async j => {
    const { error } = await supabase.from("bpa_jobs").update({ ejecutar_ahora:true }).eq("id", j.id);
    setAviso(error ? `No se pudo: ${error.message}` : `«${j.nombre}» se ejecutará en la próxima revisión del despachador (máximo 15 min).`);
    cargar();
  };

  return <div>
    <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap", marginBottom:12, fontSize:12.5, color:DESIGN.inkSoft }}>
      <span style={{ width:9, height:9, borderRadius:"50%", background: vivo ? "#16a34a" : "#dc2626", display:"inline-block" }}/>
      <span><b>Despachador {vivo ? "activo" : "sin señal"}</b> · última revisión {hace(desp?.ultima_revision, ahora)} en {desp?.ubicacion?.equipo || "—"}{!vivo && " — el equipo puede estar apagado, sin sesión o fuera de la red de OLO"}</span>
      <span style={{ marginLeft:"auto", color:DESIGN.muted }}>{esAdmin ? "Toca una fila para ver y editar su configuración." : "Toca una fila para ver el detalle (solo admin edita)."}</span>
    </div>
    {aviso && <div style={{ fontSize:12.5, color:"#1e40af", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:8, padding:"7px 12px", marginBottom:10 }}>{aviso}</div>}

    <div style={{ overflowX:"auto", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:1080 }}>
        <thead><tr>
          {["Job", "Tipo y dónde vive", "Frecuencia", "Modelo de IA", "Última ejecución", "Tiempo de ejecución", "Gasto (US$)", "Próxima", "Limitaciones", ""].map(h => <th key={h} style={th}>{h}</th>)}
        </tr></thead>
        <tbody>
          {jobs.map(j => { const s = stats(j.id), c = j.config || {}, open = abierto === j.id;
            const prox = c.activo ? siguiente(c.frecuencia, j.ultima_ejecucion ? new Date(j.ultima_ejecucion) : hoy) : null;
            return <Fragment key={j.id}>
              <tr onClick={() => setAbierto(open ? null : j.id)} style={{ cursor:"pointer", background: open ? "#f8fafc" : "#fff" }}>
                <td style={{ ...td, minWidth:170 }}><div style={{ fontWeight:700 }}>{open ? "▾" : "▸"} {j.nombre}</div><div style={sub}>{j.id}</div></td>
                <td style={{ ...td, maxWidth:230 }}><div>{j.tipo.replace(" · Programador de tareas", "")}</div><div style={sub}>{j.motor}</div><div style={sub}>Equipo {j.ubicacion?.equipo}</div><div style={sub}><code style={{ fontSize:11 }}>{j.ubicacion?.ruta}</code></div></td>
                <td style={td}><div>{describir(c.frecuencia)}</div><div style={{ ...sub, color: c.activo ? "#15803d" : "#b91c1c", fontWeight:700 }}>{c.activo ? "Activo" : "Pausado"}</div></td>
                <td style={td}>{c.modelo ? <><div>{MODELOS[c.modelo] || c.modelo}</div><div style={sub}>{c.solo_si_cambios === false ? "analiza siempre" : "solo si hay cambios"}</div></> : <div style={{ color:DESIGN.muted }}>Sin IA · nativo</div>}</td>
                <td style={{ ...td, whiteSpace:"nowrap" }}>{s.ult ? <><div>{corta(s.ult.inicio)}</div><div style={{ display:"flex", gap:5, alignItems:"center", marginTop:3 }}><Estado e={s.ult.estado}/><span style={sub}>{s.ult.disparo}</span></div></> : <span style={{ color:DESIGN.muted }}>Sin corridas</span>}</td>
                <td style={{ ...td, whiteSpace:"nowrap" }}><div>Última <b>{dur(s.ult?.duracion_ms)}</b></div><div style={sub}>Promedio {dur(s.prom)}</div></td>
                <td style={{ ...td, whiteSpace:"nowrap" }}>{c.modelo || s.mes ? <><div>Última <b>{usd(s.ult?.costo_usd)}</b></div><div style={sub}>Mes {usd(s.mes)}{c.limite_mensual_usd ? ` de ${c.limite_mensual_usd}` : ""}</div></> : <span style={{ color:DESIGN.muted }}>US$ 0<div style={sub}>sin IA</div></span>}</td>
                <td style={{ ...td, whiteSpace:"nowrap" }}>{j.ejecutar_ahora ? <b style={{ color:"#1e40af" }}>En cola</b> : prox ? corta(prox) : <span style={{ color:DESIGN.muted }}>—</span>}</td>
                <td style={td}><span style={{ fontSize:11.5, fontWeight:700, color:"#92400e", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:4, padding:"1px 7px" }}>{(j.limitaciones || []).length}</span></td>
                <td style={{ ...td, whiteSpace:"nowrap", paddingRight:14 }} onClick={e => e.stopPropagation()}>
                  {esAdmin && j.id !== "despachador" && <button onClick={() => ejecutar(j)} disabled={j.ejecutar_ahora} style={{ ...btn, color:"#fff", background: j.ejecutar_ahora ? "#93c5fd" : "#2563eb" }}title="Ejecutar en la próxima revisión del despachador">▶ Ejecutar</button>}
                </td>
              </tr>
              {open && <tr><td colSpan={10} style={{ padding:"4px 14px 16px", background:"#f8fafc", borderBottom:`1px solid ${DESIGN.border}` }}>
                <Detalle j={j} runs={s.rs} esAdmin={esAdmin} onGuardado={cargar}/>
              </td></tr>}
            </Fragment>; })}
        </tbody>
      </table>
    </div>
    <div style={{ fontSize:11.5, color:DESIGN.muted, marginTop:8, lineHeight:1.5 }}>
      El gasto es el que informa Claude Code en cada corrida (con plan de suscripción es el equivalente de la API). Los tiempos se miden desde que el despachador lanza el job hasta que termina.
    </div>
  </div>;
}

// Detalle de un job: configuración (editable por admin), dónde vive, limitaciones e historial
function Detalle({ j, runs, esAdmin, onGuardado }) {
  const [c, setC] = useState(() => structuredClone(j.config || {}));
  const [estado, setEstado] = useState(null);
  const cambio = JSON.stringify(c) !== JSON.stringify(j.config || {});
  const f = c.frecuencia || {};
  const setF = x => setC(v => ({ ...v, frecuencia: { ...x } }));
  const fijo = j.id === "despachador";   // su frecuencia la fija la tarea de Windows
  const guardar = async () => {
    setEstado("guardando");
    const { error } = await supabase.from("bpa_jobs").update({ config:c }).eq("id", j.id);
    setEstado(error ? `error: ${error.message}` : "guardado");
    if (!error) onGuardado();
  };
  const campo = { fontSize:12.5, padding:"5px 8px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:6, fontFamily:DESIGN.font, background:"#fff" };
  const puede = esAdmin && !fijo;
  const filas = [
    ["Estado", puede ? <label style={{ display:"flex", gap:6, alignItems:"center" }}><input type="checkbox" checked={!!c.activo} onChange={e => setC(v => ({ ...v, activo:e.target.checked }))}/>{c.activo ? "Activo" : "Pausado"}</label> : (c.activo ? "Activo" : "Pausado")],
    ["Frecuencia", !puede ? describir(f) : <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
      <select value={f.tipo} onChange={e => { const t = e.target.value;
        setF(t === "semanal" ? { tipo:t, dias:f.dias || [1, 2, 3, 4, 5], hora:f.hora || "07:00" } : t === "diaria" ? { tipo:t, hora:f.hora || "07:00" } : t === "cada_horas" ? { tipo:t, horas:f.horas || 6 } : { tipo:t, minutos:f.minutos || 60 }); }} style={campo}>
        <option value="semanal">Días de la semana</option><option value="diaria">Todos los días</option><option value="cada_horas">Cada N horas</option><option value="cada_minutos">Cada N minutos</option>
      </select>
      {f.tipo === "semanal" && [1, 2, 3, 4, 5, 6, 7].map(d => <label key={d} style={{ fontSize:12, display:"flex", gap:3, alignItems:"center" }}>
        <input type="checkbox" checked={(f.dias || []).includes(d)} onChange={e => setF({ ...f, dias: e.target.checked ? [...(f.dias || []), d].sort() : (f.dias || []).filter(x => x !== d) })}/>{DIAS[d]}</label>)}
      {(f.tipo === "semanal" || f.tipo === "diaria") && <input type="time" value={f.hora || "07:00"} onChange={e => setF({ ...f, hora:e.target.value })} style={campo}/>}
      {f.tipo === "cada_horas" && <><input type="number" min={1} max={168} value={f.horas} onChange={e => setF({ ...f, horas:Math.max(1, Number(e.target.value)) })} style={{ ...campo, width:70 }}/> horas</>}
      {f.tipo === "cada_minutos" && <><input type="number" min={15} step={15} value={f.minutos} onChange={e => setF({ ...f, minutos:Math.max(15, Number(e.target.value)) })} style={{ ...campo, width:70 }}/> min (mínimo 15)</>}
    </div>],
    ["Modelo de IA", !puede ? (c.modelo ? MODELOS[c.modelo] || c.modelo : "Sin IA · nativo") : <select value={c.modelo || ""} onChange={e => setC(v => ({ ...v, modelo:e.target.value || null }))} style={campo}>
      {Object.entries(MODELOS).map(([id, l]) => <option key={id} value={id}>{l}</option>)}<option value="">Sin IA (solo el script nativo)</option></select>],
    ...(c.modelo || !fijo ? [["Análisis con IA", !puede ? (c.solo_si_cambios === false ? "En cada corrida" : "Solo si hay cambios") : <select value={c.solo_si_cambios === false ? "siempre" : "cambios"} onChange={e => setC(v => ({ ...v, solo_si_cambios:e.target.value !== "siempre" }))} style={campo} disabled={!c.modelo}>
      <option value="cambios">Solo si hay cambios (recomendado)</option><option value="siempre">En cada corrida</option></select>]] : []),
    ["Tope de gasto mensual", !puede ? (c.limite_mensual_usd ? usd(c.limite_mensual_usd) : "—") : <><input type="number" min={0} step={1} value={c.limite_mensual_usd ?? 0} onChange={e => setC(v => ({ ...v, limite_mensual_usd:Math.max(0, Number(e.target.value)) }))} style={{ ...campo, width:90 }}/> US$ · al alcanzarlo, el job sigue corriendo sin IA</>],
    ["Tiempo máximo", !puede ? `${c.timeout_min || 30} min` : <><input type="number" min={1} max={120} value={c.timeout_min ?? 30} onChange={e => setC(v => ({ ...v, timeout_min:Math.max(1, Number(e.target.value)) }))} style={{ ...campo, width:70 }}/> min · si se pasa, se corta y queda como error</>],
    ["Equipo", j.ubicacion?.equipo],
    ["Carpeta", <code key="r" style={{ fontSize:12 }}>{j.ubicacion?.ruta}</code>],
    ["Comando", <code key="c" style={{ fontSize:12 }}>{j.ubicacion?.comando}</code>],
    ["Tarea de Windows", j.ubicacion?.tarea_windows || "—"],
    ["Última edición", j.updated_at ? fecha(j.updated_at) : "—"],
  ];
  const tabla = { width:"100%", borderCollapse:"collapse", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:8, overflow:"hidden" };
  return <div style={{ display:"grid", gridTemplateColumns:"minmax(420px, 1.1fr) minmax(360px, 1fr)", gap:14, marginTop:8 }}>
    <div>
      <div style={{ fontSize:11, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", margin:"6px 0" }}>CONFIGURACIÓN Y UBICACIÓN</div>
      <table style={tabla}><tbody>{filas.map(([k, v]) => <tr key={k}>
        <td style={{ ...td, width:170, color:DESIGN.muted, fontWeight:600, background:DESIGN.sunken }}>{k}</td><td style={td}>{v}</td></tr>)}</tbody></table>
      {puede && <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:8 }}>
        <button onClick={guardar} disabled={!cambio || estado === "guardando"} style={{ ...btn, color:"#fff", background: cambio ? "#15803d" : "#86b39a" }}>Guardar configuración</button>
        {cambio && <button onClick={() => setC(structuredClone(j.config || {}))} style={{ ...btn, color:DESIGN.inkSoft, background:"#fff", border:`1px solid ${DESIGN.border}` }}>Descartar</button>}
        {estado && <span style={{ fontSize:12, color: estado.startsWith("error") ? "#b91c1c" : DESIGN.muted }}>{estado === "guardado" ? "Guardado ✓ — el despachador lo aplica en su próxima revisión" : estado === "guardando" ? "Guardando…" : estado}</span>}
      </div>}
      {fijo && esAdmin && <div style={{ fontSize:11.5, color:DESIGN.muted, marginTop:6 }}>La frecuencia del despachador la fija la tarea de Windows; se cambia en el equipo con <code>jobs/instalar_tarea.cmd</code>.</div>}
    </div>
    <div>
      <div style={{ fontSize:11, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", margin:"6px 0" }}>LIMITACIONES PARA QUE FUNCIONE</div>
      <table style={tabla}><tbody>{(j.limitaciones || []).map((l, i) => <tr key={i}>
        <td style={{ ...td, width:28, color:"#92400e", fontWeight:700, background:"#fffbeb", textAlign:"center" }}>{i + 1}</td><td style={{ ...td, lineHeight:1.5 }}>{l}</td></tr>)}</tbody></table>
      <div style={{ fontSize:11, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", margin:"14px 0 6px" }}>ÚLTIMAS CORRIDAS</div>
      <table style={tabla}>
        <thead><tr>{["Inicio", "Disparo", "Estado", "Duración", "Modelo", "Costo", "Detalle"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{runs.slice(0, 10).map(r => <tr key={r.id}>
          <td style={{ ...td, whiteSpace:"nowrap" }}>{fecha(r.inicio)}</td><td style={td}>{r.disparo}</td><td style={td}><Estado e={r.estado}/></td>
          <td style={{ ...td, whiteSpace:"nowrap" }}>{dur(r.duracion_ms)}</td><td style={td}>{r.modelo ? (MODELOS[r.modelo] || r.modelo).replace("Claude ", "") : "—"}</td>
          <td style={{ ...td, whiteSpace:"nowrap" }}>{usd(r.costo_usd)}</td><td style={{ ...td, fontSize:11.5, color:DESIGN.inkSoft }}>{r.mensaje}{r.tokens_entrada ? ` · ${Math.round(r.tokens_entrada / 1000)}k tokens de entrada, ${(r.tokens_salida / 1000).toFixed(1)}k de salida` : ""}</td>
        </tr>)}
        {!runs.length && <tr><td colSpan={7} style={{ ...td, color:DESIGN.muted }}>Sin corridas todavía.</td></tr>}</tbody>
      </table>
    </div>
  </div>;
}
