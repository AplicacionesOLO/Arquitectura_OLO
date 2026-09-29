// ═══════════════════════════════════════════════════════════════════════════
// VISTA · Asesor › Documentación oficial ePRAC — cargador de documentos.
// El admin arrastra solicitudes de cambio, manuales, formatos o actas de ePRAC
// (.docx / .pdf); se guardan en el bucket PRIVADO eprac-docs y quedan en
// eprac_cargas como «pendiente». El job eprac_docs (despachador, cada 15 min)
// los procesa con la misma lógica que la carpeta local (asesor/ingestar.mjs):
// plantilla de ePRAC, tablas/pantallas/procesos que menciona y sin duplicar.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { DESIGN } from "../data/constants.js";
import { siguiente } from "../lib/frecuencia.js";

const MAX_MB = 20;
const ESTADO = { pendiente:["Pendiente", "#b45309"], procesando:["Procesando…", "#7c3aed"], procesado:["Procesado", "#15803d"], duplicado:["Duplicado", "#64748b"], error:["Error", "#b91c1c"] };
const TIPO = { solicitud:"Solicitud de cambio", desarrollo:"Documentación de desarrollo", plantilla:"Plantilla o estándar", estandar:"Plantilla o estándar", contexto:"Documentación de desarrollo" };
const btn = { fontSize:12.5, fontWeight:700, border:"none", borderRadius:6, padding:"5px 10px", cursor:"pointer", fontFamily:DESIGN.font };
const seguro = (n) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_").slice(-120);
const fecha = f => f ? new Date(f).toLocaleString("es-CR", { dateStyle:"medium", timeStyle:"short" }) : "—";
const hora = d => d.toLocaleTimeString("es-CR", { hour:"2-digit", minute:"2-digit" });
const faltan = ms => ms <= 60000 ? "en menos de un minuto" : `en ${Math.round(ms / 60000)} min`;

export function EpracCargador({ onVerSolicitud, onVerDesarrollos }) {
  const { profile } = useAuth();
  const [cargas, setCargas] = useState(null);
  const [desp, setDesp] = useState(null);        // fila del despachador en bpa_jobs
  const [ahora, setAhora] = useState(() => Date.now());
  const [subiendo, setSubiendo] = useState([]);   // [{ nombre, estado, error }]
  const [arrastre, setArrastre] = useState(false);
  const input = useRef(null);

  const leer = useCallback(async () => {
    const [{ data }, { data: d }] = await Promise.all([
      supabase.from("eprac_cargas").select("*").order("created_at", { ascending:false }).limit(200),
      supabase.from("bpa_jobs").select("ultima_ejecucion,ultima_revision,config,ubicacion").eq("id", "despachador").maybeSingle()]);
    setCargas(data || []); setDesp(d || null); setAhora(Date.now());
  }, []);
  useEffect(() => { const t = setTimeout(leer, 0); return () => clearTimeout(t); }, [leer]);
  // mientras haya pendientes, se refresca solo
  const hayPendientes = cargas?.some(c => c.estado === "pendiente" || c.estado === "procesando");
  useEffect(() => { if (!hayPendientes) return; const t = setInterval(leer, 20000); const r = setInterval(() => setAhora(Date.now()), 10000); return () => { clearInterval(t); clearInterval(r); }; }, [hayPendientes, leer]);
  // Próxima revisión del despachador: su última corrida + su frecuencia (tarea de Windows cada 15 min)
  const ultima = desp?.ultima_ejecucion ? new Date(desp.ultima_ejecucion) : null;
  const proxima = ultima ? siguiente(desp.config?.frecuencia || { tipo:"cada_minutos", minutos:15 }, ultima) : null;
  const atrasada = proxima && ahora > proxima.getTime() + 3 * 60000;   // pasó la hora y no revisó: equipo apagado o sin sesión
  const intervalo = proxima && ultima ? proxima - ultima : 15 * 60000;

  const subir = async (lista) => {
    const archivos = [...lista];                 // se copia antes de limpiar el input
    const validos = archivos.filter(f => /\.(docx|pdf)$/i.test(f.name) && f.size <= MAX_MB * 1048576);
    const rechazados = archivos.filter(f => !validos.includes(f)).map(f => ({ nombre:f.name, estado:"error", error: /\.(docx|pdf)$/i.test(f.name) ? `Pesa más de ${MAX_MB} MB` : "Solo se aceptan .docx y .pdf" }));
    setSubiendo([...rechazados, ...validos.map(f => ({ nombre:f.name, estado:"subiendo" }))]);
    for (const f of validos) {
      const path = `cargas/${Date.now()}_${seguro(f.name)}`;
      const marca = (estado, error) => setSubiendo(s => s.map(x => x.nombre === f.name ? { ...x, estado, error } : x));
      const up = await supabase.storage.from("eprac-docs").upload(path, f, { contentType: f.type || undefined, upsert:false });
      if (up.error) { marca("error", up.error.message); continue; }
      const { error } = await supabase.from("eprac_cargas").insert({ nombre:f.name, path, tamano:f.size, subido_nombre: profile?.nombre || profile?.email || null });
      if (error) { await supabase.storage.from("eprac-docs").remove([path]); marca("error", error.message); continue; }
      marca("listo");
    }
    leer();
  };

  const descargar = async (c) => {
    const { data } = await supabase.storage.from("eprac-docs").createSignedUrl(c.path, 300, { download: c.nombre });
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  };
  const reintentar = async (c) => { await supabase.from("eprac_cargas").update({ estado:"pendiente", mensaje:null }).eq("id", c.id); leer(); };
  const eliminar = async (c) => {
    if (!confirm(`¿Eliminar «${c.nombre}»?${c.estado === "procesado" ? "\n\nSe quitará de la base de conocimiento del asesor en la próxima actualización." : ""}`)) return;
    await supabase.storage.from("eprac-docs").remove([c.path]);
    await supabase.from("eprac_cargas").delete().eq("id", c.id);
    leer();
  };

  return <div style={{ marginBottom:18 }}>
    <div onDragOver={e => { e.preventDefault(); setArrastre(true); }} onDragLeave={() => setArrastre(false)}
      onDrop={e => { e.preventDefault(); setArrastre(false); subir(e.dataTransfer.files); }}
      onClick={() => input.current?.click()}
      style={{ border:`2px dashed ${arrastre ? "#7c3aed" : DESIGN.borderStrong}`, background:arrastre ? "#7c3aed0d" : "#fff", borderRadius:10, padding:"16px 18px", cursor:"pointer", display:"flex", gap:14, alignItems:"center" }}>
      <div style={{ fontSize:28, lineHeight:1 }}>⇪</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14.5, fontWeight:700, color:DESIGN.ink }}>Cargar documentación de ePRAC</div>
        <div style={{ fontSize:13, color:DESIGN.inkSoft, lineHeight:1.5, marginTop:2 }}>Arrastra aquí o haz clic para elegir solicitudes de cambio, manuales, formatos o actas de ePRAC (.docx o .pdf, hasta {MAX_MB} MB). Se guardan en un almacenamiento privado y se procesan en la siguiente revisión del despachador (máximo 15 minutos): las solicitudes de cambio van a su sección, las especificaciones y documentos de diseño a «Documentación de desarrollos», y todo pasa a la base de conocimiento del asesor.</div>
      </div>
      <input ref={input} type="file" multiple accept=".docx,.pdf" style={{ display:"none" }} onChange={e => { subir(e.target.files); e.target.value = ""; }}/>
    </div>

    {subiendo.length > 0 && <div style={{ display:"grid", gap:3, marginTop:8 }}>{subiendo.map(s => <div key={s.nombre} style={{ fontSize:12.5, color:s.estado === "error" ? "#b91c1c" : s.estado === "listo" ? "#15803d" : DESIGN.muted }}>
      {s.estado === "subiendo" ? "… subiendo" : s.estado === "listo" ? "✓ cargado" : "✗ no se cargó"} · {s.nombre}{s.error ? ` — ${s.error}` : ""}</div>)}</div>}

    {hayPendientes && proxima && <div style={{ marginTop:10, fontSize:13.5, lineHeight:1.5, borderRadius:8, padding:"8px 12px", 
      ...(atrasada ? { color:"#991b1b", background:"#fef2f2", border:"1px solid #fecaca" } : { color:"#5b21b6", background:"#f5f3ff", border:"1px solid #ddd6fe" }) }}>
      {cargas.some(c => c.estado === "procesando") ? <><b>Procesando ahora.</b> Tarda unos segundos; la lista se actualiza sola.</>
        : atrasada ? <><b>La revisión de las {hora(proxima)} no se hizo.</b> El despachador corre en el equipo {desp?.ubicacion?.equipo || "del BPA"} y parece apagado, sin sesión o sin red. Los archivos se procesan en cuanto vuelva a revisar (última revisión: {fecha(desp.ultima_revision || desp.ultima_ejecucion)}).</>
        : <><b>Próxima revisión: {hora(proxima)} ({faltan(proxima - ahora)}).</b> Ahí se procesan todos los pendientes; tarda unos segundos. La lista se actualiza sola.</>}
    </div>}

    {cargas?.length > 0 && <details open={hayPendientes} style={{ marginTop:10, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, padding:"8px 12px" }}>
      <summary style={{ fontSize:13.5, fontWeight:700, color:DESIGN.ink, cursor:"pointer" }}>Documentos cargados · {cargas.length}
        {hayPendientes && <span style={{ fontWeight:500, color:ESTADO.pendiente[1] }}> · {cargas.filter(c => c.estado === "pendiente").length} pendientes de procesar</span>}</summary>
      <table style={{ width:"100%", borderCollapse:"collapse", marginTop:8 }}>
        <thead><tr>{["Documento", "Cargado", "Estado", "Resultado", ""].map(h => <th key={h} style={{ textAlign:"left", fontSize:11, fontWeight:700, color:DESIGN.muted, textTransform:"uppercase", letterSpacing:"0.05em", padding:"6px 8px", borderBottom:`1px solid ${DESIGN.border}` }}>{h}</th>)}</tr></thead>
        <tbody>{cargas.map(c => { const [el, col] = ESTADO[c.estado] || [c.estado, DESIGN.muted];
          return <tr key={c.id}>
            <td style={{ fontSize:13, color:DESIGN.ink, fontWeight:600, padding:"6px 8px", borderBottom:`1px solid ${DESIGN.sunken2}` }}>{c.nombre}<div style={{ fontSize:11.5, color:DESIGN.mutedSoft, fontWeight:400 }}>{c.tamano ? `${(c.tamano / 1024).toFixed(0)} KB` : ""}{c.tipo ? ` · ${TIPO[c.tipo] || c.tipo}` : ""}</div></td>
            <td style={{ fontSize:12.5, color:DESIGN.inkSoft, padding:"6px 8px", borderBottom:`1px solid ${DESIGN.sunken2}`, whiteSpace:"nowrap" }}>{fecha(c.created_at)}<div style={{ fontSize:11.5, color:DESIGN.mutedSoft }}>{c.subido_nombre || ""}</div></td>
            <td style={{ padding:"6px 8px", borderBottom:`1px solid ${DESIGN.sunken2}` }}><span style={{ fontSize:12, fontWeight:700, color:col }}>● {el}</span></td>
            <td style={{ fontSize:12.5, color:DESIGN.inkSoft, padding:"6px 8px", borderBottom:`1px solid ${DESIGN.sunken2}`, lineHeight:1.45 }}>
              {c.estado === "pendiente" ? (proxima && !atrasada ? <div>
                  <div>Se procesa a las {hora(proxima)} ({faltan(proxima - ahora)}).</div>
                  <div style={{ height:5, background:DESIGN.sunken2, borderRadius:3, marginTop:4, overflow:"hidden", maxWidth:220 }}>
                    <div style={{ height:"100%", width:`${Math.min(100, Math.max(4, 100 - (proxima - ahora) / intervalo * 100))}%`, background:"#7c3aed" }}/></div>
                </div> : "Espera a que el despachador vuelva a revisar.")
                : c.estado === "procesando" ? "Procesando ahora: tarda unos segundos." : c.mensaje || "—"}
              {c.solicitud_id && <div><button onClick={() => onVerSolicitud(c.solicitud_id)} style={{ ...btn, padding:0, background:"none", color:"#2563eb" }}>Ver la solicitud ›</button></div>}
              {c.estado === "procesado" && ["desarrollo", "plantilla", "estandar", "contexto"].includes(c.tipo) && onVerDesarrollos && <div><button onClick={onVerDesarrollos} style={{ ...btn, padding:0, background:"none", color:"#2563eb" }}>Ver en Documentación de desarrollos ›</button></div>}
            </td>
            <td style={{ padding:"6px 8px", borderBottom:`1px solid ${DESIGN.sunken2}`, whiteSpace:"nowrap" }}>
              <button onClick={() => descargar(c)} style={{ ...btn, background:DESIGN.sunken2, color:DESIGN.inkSoft, marginRight:4 }}>Descargar</button>
              {c.estado === "error" && <button onClick={() => reintentar(c)} style={{ ...btn, background:"#fef3c7", color:"#92400e", marginRight:4 }}>Reintentar</button>}
              <button onClick={() => eliminar(c)} style={{ ...btn, background:"#fee2e2", color:"#b91c1c" }}>Eliminar</button>
            </td>
          </tr>; })}</tbody>
      </table>
    </details>}
  </div>;
}
