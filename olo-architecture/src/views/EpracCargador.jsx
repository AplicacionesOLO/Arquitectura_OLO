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

const MAX_MB = 20;
const ESTADO = { pendiente:["Pendiente", "#b45309"], procesado:["Procesado", "#15803d"], duplicado:["Duplicado", "#64748b"], error:["Error", "#b91c1c"] };
const TIPO = { solicitud:"Solicitud de cambio", estandar:"Documento oficial", contexto:"Documento de contexto" };
const btn = { fontSize:12.5, fontWeight:700, border:"none", borderRadius:6, padding:"5px 10px", cursor:"pointer", fontFamily:DESIGN.font };
const seguro = (n) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_").slice(-120);
const fecha = f => f ? new Date(f).toLocaleString("es-CR", { dateStyle:"medium", timeStyle:"short" }) : "—";

export function EpracCargador({ onVerSolicitud }) {
  const { profile } = useAuth();
  const [cargas, setCargas] = useState(null);
  const [subiendo, setSubiendo] = useState([]);   // [{ nombre, estado, error }]
  const [arrastre, setArrastre] = useState(false);
  const input = useRef(null);

  const leer = useCallback(async () => {
    const { data } = await supabase.from("eprac_cargas").select("*").order("created_at", { ascending:false }).limit(200);
    setCargas(data || []);
  }, []);
  useEffect(() => { const t = setTimeout(leer, 0); return () => clearTimeout(t); }, [leer]);
  // mientras haya pendientes, se refresca solo
  const hayPendientes = cargas?.some(c => c.estado === "pendiente");
  useEffect(() => { if (!hayPendientes) return; const t = setInterval(leer, 30000); return () => clearInterval(t); }, [hayPendientes, leer]);

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
        <div style={{ fontSize:13, color:DESIGN.inkSoft, lineHeight:1.5, marginTop:2 }}>Arrastra aquí o haz clic para elegir solicitudes de cambio, manuales, formatos o actas de ePRAC (.docx o .pdf, hasta {MAX_MB} MB). Se guardan en un almacenamiento privado y se procesan en la siguiente revisión del despachador (máximo 15 minutos): las solicitudes aparecen en la tabla de abajo y todo pasa a la base de conocimiento del asesor.</div>
      </div>
      <input ref={input} type="file" multiple accept=".docx,.pdf" style={{ display:"none" }} onChange={e => { subir(e.target.files); e.target.value = ""; }}/>
    </div>

    {subiendo.length > 0 && <div style={{ display:"grid", gap:3, marginTop:8 }}>{subiendo.map(s => <div key={s.nombre} style={{ fontSize:12.5, color:s.estado === "error" ? "#b91c1c" : s.estado === "listo" ? "#15803d" : DESIGN.muted }}>
      {s.estado === "subiendo" ? "… subiendo" : s.estado === "listo" ? "✓ cargado" : "✗ no se cargó"} · {s.nombre}{s.error ? ` — ${s.error}` : ""}</div>)}</div>}

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
              {c.estado === "pendiente" ? "Se procesa en la siguiente revisión del despachador." : c.mensaje || "—"}
              {c.solicitud_id && <div><button onClick={() => onVerSolicitud(c.solicitud_id)} style={{ ...btn, padding:0, background:"none", color:"#2563eb" }}>Ver la solicitud ›</button></div>}
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
