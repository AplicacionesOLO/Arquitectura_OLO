// Contexto › Cambios en bases: lo que publica el job schema_watch (tabla
// bpa_schema_cambios). Muestra la última corrida (resumen, análisis de Claude,
// estado de cada esquema del BPA, bases sin mapear) y el historial.
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { DESIGN } from "../data/constants.js";

const fecha = f => f ? new Date(f).toLocaleString("es-CR", { dateStyle:"medium", timeStyle:"short" }) : "—";

// Markdown mínimo: títulos, viñetas, negritas y `código`
function inline(t) {
  return t.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((x, i) =>
    x.startsWith("**") ? <b key={i}>{inline(x.slice(2, -2))}</b>
    : x.startsWith("`") ? <code key={i} style={{ fontFamily:"'Courier New', monospace", fontSize:"0.92em", background:DESIGN.sunken2, borderRadius:3, padding:"0 4px" }}>{x.slice(1, -1)}</code>
    : x);
}
export function Markdown({ texto }) {
  const out = []; let lista = [];
  const cerrar = () => { if (lista.length) { out.push(<ul key={`ul${out.length}`} style={{ margin:"4px 0 10px", paddingLeft:20, display:"grid", gap:3 }}>{lista}</ul>); lista = []; } };
  (texto || "").split("\n").forEach((l, i) => {
    const m = l.match(/^(\s*)[-*]\s+(.*)$/), n = l.match(/^\s*\d+\.\s+(.*)$/), h = l.match(/^(#{1,4})\s+(.*)$/);
    if (m || n) { lista.push(<li key={i} style={{ fontSize:13, color:DESIGN.inkSoft, lineHeight:1.55, marginLeft: m && m[1].length ? 16 : 0 }}>{inline(m ? m[2] : n[1])}</li>); return; }
    cerrar();
    if (h) out.push(<div key={`h${i}`} style={{ fontSize: h[1].length <= 2 ? 15 : 13.5, fontWeight:700, color:DESIGN.ink, margin:"12px 0 4px" }}>{inline(h[2])}</div>);
    else if (l.trim()) out.push(<p key={`p${i}`} style={{ fontSize:13, color:DESIGN.inkSoft, lineHeight:1.6, margin:"4px 0" }}>{inline(l)}</p>);
  });
  cerrar();
  return <div>{out}</div>;
}

function Kpi({ n, label, color }) {
  return <div style={{ flex:"1 1 140px", background:"#fff", border:`1px solid ${DESIGN.border}`, borderTop:`3px solid ${color}`, borderRadius:9, padding:"10px 14px" }}>
    <div style={{ fontSize:22, fontWeight:700, color }}>{n}</div><div style={{ fontSize:12, color:DESIGN.inkSoft }}>{label}</div></div>;
}

export function MonitoreoBases() {
  const [filas, setFilas] = useState(null);
  const [sel, setSel] = useState(0);
  const [verInforme, setVerInforme] = useState(false);
  useEffect(() => {
    supabase.from("bpa_schema_cambios").select("*").order("generado", { ascending:false }).limit(20).then(({ data }) => setFilas(data || []));
  }, []);
  if (filas === null) return <div style={{ color:DESIGN.muted, fontSize:13 }}>Cargando…</div>;
  if (!filas.length) return <div style={{ fontSize:13.5, color:DESIGN.inkSoft }}>Todavía no hay corridas del monitoreo. Se generan con <code>node schema_watch/run.js</code> (ver schema_watch/LEEME.md).</div>;
  const f = filas[sel], r = f.resumen || {}, d = f.detalle || {};
  // si esta corrida no necesitó análisis (sin cambios), se muestra el último que hubo
  const conAnalisis = f.analisis_md ? f : filas.slice(sel).find(x => x.analisis_md);
  const sinAcceso = (d.bpa || []).filter(c => c.error);
  const ok = (d.bpa || []).filter(c => !c.error);
  const legibles = (d.sinMapear || []).filter(b => !b.error).sort((a, b) => b.tablas - a.tablas);
  const cerradas = (d.sinMapear || []).filter(b => b.error).length;
  return <div>
    <div style={{ fontSize:12.5, color:DESIGN.muted, marginBottom:10 }}>
      Corrida del {fecha(f.generado)}{f.anterior ? ` · comparada con la del ${fecha(f.anterior)}` : " · primera instantánea (línea base)"}
    </div>
    <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
      <Kpi n={`${ok.length}/${r.esquemasBPA ?? "—"}`} label="Esquemas del BPA verificados" color="#15803d"/>
      <Kpi n={(r.tablasFaltan ?? 0) + (r.columnasFaltan ?? 0)} label="Tablas o columnas del BPA que ya no existen" color={(r.tablasFaltan || r.columnasFaltan) ? "#b91c1c" : "#15803d"}/>
      <Kpi n={r.cambiosDesdeAnterior ?? 0} label="Bases con cambios desde la corrida anterior" color="#2563eb"/>
      <Kpi n={sinAcceso.length} label="Esquemas del BPA sin acceso para verificar" color={sinAcceso.length ? "#b45309" : "#15803d"}/>
    </div>

    {conAnalisis && <div style={{ background:"#faf5ff", border:"1px solid #e9d5ff", borderLeft:"3px solid #7c3aed", borderRadius:10, padding:"12px 16px", marginBottom:14 }}>
      <div style={{ fontSize:11, fontWeight:700, color:"#7c3aed", letterSpacing:"0.08em" }}>ANÁLISIS · CLAUDE{conAnalisis !== f ? ` · del ${fecha(conAnalisis.generado)} (desde entonces no hubo cambios)` : ""}</div>
      <Markdown texto={conAnalisis.analisis_md.replace(/^[^#\n]*\n+(?=##)/, "")}/>
    </div>}

    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(290px, 1fr))", gap:10, marginBottom:14 }}>
      {(d.bpa || []).map(c => { const alerta = c.error || c.faltan?.length || c.colsFaltan?.length;
        return <div key={c.cat} style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderLeft:`3px solid ${c.error ? "#b45309" : alerta ? "#b91c1c" : "#15803d"}`, borderRadius:8, padding:"9px 12px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:DESIGN.ink }}>{c.error ? "⚠" : alerta ? "✗" : "✓"} {c.label}</div>
          {c.error ? <div style={{ fontSize:12, color:"#92400e", marginTop:3, lineHeight:1.45 }}>{c.error.replace(/^No se pudo comparar — /, "Sin verificar: ")}</div>
            : <div style={{ fontSize:12, color:DESIGN.inkSoft, marginTop:3, lineHeight:1.45 }}>
                {c.presentes} de {c.tablasBPA} tablas del BPA presentes{c.colsFaltan?.length ? ` · ${c.colsFaltan.length} columnas faltan` : " · columnas OK"}
                {c.nuevasDesdeMapeo?.length ? <div>Nuevas: {c.nuevasDesdeMapeo.slice(0, 4).map(t => <code key={t} style={{ fontSize:11, marginRight:4 }}>{t.replace(/^dbo\./, "")}</code>)}</div> : null}
              </div>}
        </div>; })}
    </div>

    {legibles.length > 0 && <div style={{ fontSize:12.5, color:DESIGN.inkSoft, marginBottom:14, lineHeight:1.6 }}>
      <b>Bases legibles que el BPA no tiene mapeadas:</b> {legibles.map(b => `${b.base} (${b.tablas} tablas)`).join(" · ")}. {cerradas} bases más no dan acceso al usuario de integración o están fuera de línea.
    </div>}

    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:8 }}>
      <button onClick={() => setVerInforme(v => !v)} style={{ fontSize:12.5, fontWeight:700, color:DESIGN.ink, background:DESIGN.sunken2, border:"none", borderRadius:7, padding:"6px 12px", cursor:"pointer", fontFamily:"inherit" }}>{verInforme ? "Ocultar" : "Ver"} informe completo</button>
      {filas.length > 1 && <select value={sel} onChange={e => setSel(Number(e.target.value))} style={{ fontSize:12.5, padding:"5px 8px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:7, fontFamily:"inherit" }}>
        {filas.map((x, i) => <option key={x.id} value={i}>{fecha(x.generado)} · {x.resumen?.cambiosDesdeAnterior || 0} bases con cambios</option>)}
      </select>}
    </div>
    {verInforme && <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, padding:"12px 16px" }}><Markdown texto={f.informe_md}/></div>}
  </div>;
}
