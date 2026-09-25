// ═══════════════════════════════════════════════════════════════════════════
// VISTA · Manual Softland ERP de OLO (compañía OVERSEAS) — dentro de Módulos ERP.
// Levantamiento del 25/09/2026 en modo consulta: generalidades + 14 módulos
// (CI, CO, FA, CC, CP y DE con pantallas; CG, CB, AF, CR, CH, RP, GN y MF a
// nivel de menú). El detalle (softland_manual.json) se carga bajo demanda.
// Las capturas muestran DATOS REALES: viven en el bucket privado softland-manual
// y se piden con URL firmada (lib/imgPrivada.js); nunca van al bucket público.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo, useRef } from "react";
import { useNav } from "../lib/nav.js";
import { DESIGN, DESIGN_STATUS } from "../data/constants.js";
import { SFL_MANUAL_META, SFL_MANUAL_INDEX, SFL_PASO_PANTALLA } from "../data/softland_manual_links.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { Presentacion } from "../components/Presentacion.jsx";
import { sflImg } from "../lib/presentacion.js";
import { firmar } from "../lib/imgPrivada.js";
import { supabase } from "../lib/supabaseClient.js";
import { SearchIcon } from "../components/icons.jsx";

const ACCENT = "#c0392b";
const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// **negrita** y *cursiva* del levantamiento
function Rico({ children }) {
  return String(children || "").split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).filter(Boolean).map((s, i) =>
    s.startsWith("**") ? <b key={i} style={{ color:DESIGN.ink }}>{s.slice(2, -2)}</b>
      : s.startsWith("*") && s.endsWith("*") && s.length > 2 ? <i key={i}>{s.slice(1, -1)}</i> : <span key={i}>{s}</span>);
}

// Pasos de procesos que citan cada pantalla del manual
const USOS = (() => {
  const out = {};
  for (const [codigo, pasos] of Object.entries(SFL_PASO_PANTALLA)) for (const [i, id] of Object.entries(pasos)) {
    const arr = (out[id] ||= []); let e = arr.find(x => x.codigo === codigo);
    if (!e) arr.push(e = { codigo, pasos: [] });
    e.pasos.push(Number(i) + 1);
  }
  return out;
})();

export function SoftlandManualView({ focus }) {
  const [data, setData] = useState(null);
  const [cap, setCap] = useState("00");
  const [q, setQ] = useState("");
  const [urls, setUrls] = useState({});
  const [show, setShow] = useState(null);
  const [marcado, setMarcado] = useState(null);
  const { navigate } = useNav();
  const cont = useRef(null);

  useEffect(() => { import("../data/softland_manual.json").then(m => setData(m.default)); }, []);

  // Foco desde un paso de proceso: abre el capítulo y la pantalla
  const focoId = focus?.sflScreen;
  const [focoVisto, setFocoVisto] = useState(null);
  if (focoId && focoId !== focoVisto && SFL_MANUAL_INDEX[focoId]) { setFocoVisto(focoId); setCap(SFL_MANUAL_INDEX[focoId].cap); setQ(""); setMarcado(focoId); }
  useEffect(() => {
    if (!data || !marcado) return;
    const t = setTimeout(() => document.getElementById(`sfl-${marcado}`)?.scrollIntoView({ behavior:"smooth", block:"start" }), 150);
    return () => clearTimeout(t);
  }, [data, marcado, cap]);

  const capitulo = data?.capitulos.find(c => c.codigo === cap);
  const nq = norm(q.trim());
  const resultados = useMemo(() => !data || !nq ? null : data.capitulos.flatMap(c => c.secciones.flatMap(s => s.items
    .filter(it => norm(`${c.nombre} ${s.titulo} ${it.titulo} ${it.desc} ${(it.puntos || []).join(" ")} ${(it.campos || []).flat().join(" ")}`).includes(nq))
    .map(it => ({ ...it, cap: c.codigo, capNombre: c.nombre, seccion: s.titulo })))), [data, nq]);

  // Firma en lote las capturas visibles (capítulo o resultados)
  const visibles = useMemo(() => {
    if (!data) return [];
    const items = resultados || capitulo?.secciones.flatMap(s => s.items) || [];
    return [...(resultados ? [] : [capitulo?.arbol]), ...items.flatMap(it => it.imgs)].filter(Boolean).map(sflImg);
  }, [data, capitulo, resultados]);
  useEffect(() => {
    if (!visibles.length) return;
    let vivo = true;
    firmar(visibles).then(m => { if (vivo) setUrls(u => ({ ...u, ...m })); });
    return () => { vivo = false; };
  }, [visibles]);

  if (!data) return <div style={{ padding:24, textAlign:"center", color:DESIGN.muted, fontSize:14.5 }}>Cargando manual…</div>;

  const itemsCap = capitulo.secciones.flatMap(s => s.items.map(it => ({ ...it, seccion: s.titulo })));
  const slidesDe = (lista) => lista.flatMap(it => it.imgs.map((im, k) => ({ img: sflImg(im), titulo: it.titulo + (it.imgs.length > 1 ? ` (${k + 1}/${it.imgs.length})` : ""),
    texto: (it.desc || it.titulo).replace(/\*\*?/g, ""), donde: `Softland (OVERSEAS) › ${it.ruta || `${it.cap || cap} › ${it.seccion} › ${it.titulo}`}`, sistema: "Softland ERP", contexto: `Manual Softland ERP · ${capitulo.nombre}` })));
  const presentar = (lista, it, k = 0) => { const sl = slidesDe(lista); const start = sl.findIndex(x => x.img === sflImg(it.imgs[k])); setShow({ slides: sl, start: Math.max(0, start) }); };
  const descargarPdf = async () => {
    const { data: d } = await supabase.storage.from("softland-manual").createSignedUrl(SFL_MANUAL_META.pdf, 600, { download: true });
    if (d?.signedUrl) window.open(d.signedUrl, "_blank", "noopener");
  };

  return <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
    <nav style={{ width:220, minWidth:220, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, overflow:"hidden", flexShrink:0, position:"sticky", top:20, maxHeight:"calc(100vh - 40px)", overflowY:"auto" }}>
      <div style={{ padding:"10px 14px", borderBottom:`1px solid ${DESIGN.sunken2}`, background:DESIGN.sunken, fontSize:12, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", textTransform:"uppercase" }}>Softland OLO · capítulos</div>
      {data.capitulos.map(c => {
        const isA = !resultados && c.codigo === cap;
        const n = c.secciones.reduce((a, s) => a + s.items.filter(it => it.imgs.length).length, 0);
        return <button key={c.codigo} onClick={() => { setCap(c.codigo); setQ(""); setMarcado(null); cont.current?.scrollIntoView({ block:"start" }); }} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 14px", border:"none", borderLeft:`3px solid ${isA ? ACCENT : "transparent"}`, borderBottom:`1px solid ${DESIGN.sunken}`, background:isA ? ACCENT + "12" : "transparent", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
          <span style={{ fontSize:12, fontWeight:800, color:ACCENT, width:24 }}>{c.codigo === "00" ? "·" : c.codigo}</span>
          <span style={{ flex:1, fontSize:13.5, fontWeight:isA ? 700 : 500, color:isA ? DESIGN.ink : DESIGN.inkSoft }}>{c.nombre}</span>
          {n > 0 && <span style={{ fontSize:12, color:DESIGN.mutedSoft }}>{n}</span>}
        </button>;
      })}
      <div style={{ padding:"10px 14px" }}>
        <button onClick={descargarPdf} style={{ width:"100%", fontSize:13, fontWeight:700, color:"#fff", background:ACCENT, border:"none", borderRadius:7, padding:"7px 10px", cursor:"pointer", fontFamily:DESIGN.font }}>⬇ Manual completo (PDF)</button>
        <div style={{ fontSize:11.5, color:DESIGN.mutedSoft, marginTop:6, lineHeight:1.45 }}>El número es la cantidad de pantallas con captura.</div>
      </div>
    </nav>

    <div ref={cont} style={{ flex:1, minWidth:0 }}>
      <h3 style={{ fontSize:17, fontWeight:700, color:DESIGN.ink, margin:0 }}>Manual · {SFL_MANUAL_META.producto} de OLO (compañía {SFL_MANUAL_META.compania})</h3>
      <div style={{ fontSize:13.5, color:DESIGN.muted, marginTop:3 }}>{SFL_MANUAL_META.razonSocial} · {SFL_MANUAL_META.pais} · servidor {SFL_MANUAL_META.servidor} · base {SFL_MANUAL_META.base} · usuario {SFL_MANUAL_META.usuario} · levantado el {SFL_MANUAL_META.fecha}</div>
      <div style={{ marginTop:8, maxWidth:900, fontSize:13.5, lineHeight:1.5, color:DESIGN_STATUS.warning.color, background:DESIGN_STATUS.warning.bg, border:`1px solid ${DESIGN_STATUS.warning.border}`, borderRadius:6, padding:"6px 10px" }}>
        Es el Softland <b>propio de OLO</b>, no el de un cliente. {SFL_MANUAL_META.nota} Por eso las capturas están en un almacenamiento privado: solo se ven con sesión y acceso a Módulos ERP, y no se comparten fuera del BPA.
      </div>

      <div style={{ position:"relative", maxWidth:420, margin:"12px 0" }}>
        <SearchIcon style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14.5, color:DESIGN.mutedSoft }}/>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar pantalla, campo o reporte en todo Softland…"
          style={{ width:"100%", boxSizing:"border-box", padding:"8px 10px 8px 32px", fontSize:14, border:`1px solid ${DESIGN.borderStrong}`, borderRadius:8, fontFamily:DESIGN.font }}/>
      </div>

      {resultados ? <>
        <div style={{ fontSize:13.5, color:DESIGN.muted, marginBottom:8 }}>{resultados.length} resultados para «{q}»</div>
        <div style={{ display:"grid", gap:10 }}>{resultados.map(it => <Item key={it.id} it={it} urls={urls} usos={USOS[it.id]} navigate={navigate} etiqueta={`${it.cap} · ${it.capNombre} › ${it.seccion}`}
          onPlay={(k) => presentar(resultados, it, k)}/>)}</div>
      </> : <>
        <h4 style={{ fontSize:16, fontWeight:700, color:DESIGN.ink, margin:"4px 0 6px" }}>{capitulo.codigo !== "00" && <span style={{ color:ACCENT }}>{capitulo.codigo} · </span>}{capitulo.nombre}</h4>
        {capitulo.intro && <p style={{ fontSize:14, color:DESIGN.inkSoft, lineHeight:1.6, margin:"0 0 10px", maxWidth:900 }}><Rico>{capitulo.intro}</Rico></p>}
        {itemsCap.some(it => it.imgs.length) && <button onClick={() => presentar(itemsCap.filter(it => it.imgs.length), itemsCap.find(it => it.imgs.length))}
          style={{ fontSize:13.5, fontWeight:700, color:"#fff", background:ACCENT, border:"none", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:DESIGN.font, marginBottom:12 }}>▶ Presentar el módulo</button>}
        {capitulo.arbol && <div style={{ marginBottom:14 }}><L>Árbol de menús</L><Miniatura src={urls[sflImg(capitulo.arbol)]} alto={220}/></div>}
        {capitulo.secciones.map((s, k) => <section key={k} style={{ marginBottom:18 }}>
          <div style={{ fontSize:14.5, fontWeight:700, color:DESIGN.ink, borderBottom:`1px solid ${DESIGN.border}`, paddingBottom:4, marginBottom:8 }}>{s.titulo}</div>
          {s.desc && <p style={{ fontSize:14, color:DESIGN.inkSoft, lineHeight:1.55, margin:"0 0 8px" }}><Rico>{s.desc}</Rico></p>}
          {s.tabla && <Tabla t={s.tabla}/>}
          <div style={{ display:"grid", gap:10 }}>{s.items.map(it => <Item key={it.id} it={{ ...it, seccion: s.titulo }} urls={urls} usos={USOS[it.id]} navigate={navigate} marcado={marcado === it.id}
            onPlay={(k2) => presentar(itemsCap.filter(x => x.imgs.length), it, k2)}/>)}</div>
        </section>)}
      </>}
    </div>
    {show && <Presentacion slides={show.slides} start={show.start} onClose={() => setShow(null)}/>}
  </div>;
}

function Item({ it, urls, usos, navigate, onPlay, marcado, etiqueta }) {
  const link = { background:"none", border:"none", padding:0, fontWeight:700, cursor:"pointer", fontFamily:DESIGN.font };
  return <div id={`sfl-${it.id}`} style={{ background:"#fff", border:`1px solid ${marcado ? ACCENT : DESIGN.border}`, boxShadow:marcado ? `0 0 0 2px ${ACCENT}33` : "none", borderRadius:9, padding:"10px 12px", scrollMarginTop:16 }}>
    <div style={{ display:"flex", gap:14, alignItems:"flex-start", flexWrap:"wrap" }}>
      <div style={{ flex:"1 1 340px", minWidth:0 }}>
        {etiqueta && <div style={{ fontSize:12, color:DESIGN.muted }}>{etiqueta}</div>}
        <div style={{ fontSize:14.5, fontWeight:700, color:DESIGN.ink }}>{it.titulo}</div>
        {it.ruta && <div style={{ fontSize:12.5, color:DESIGN.mutedSoft, fontFamily:"'Courier New', monospace" }}>{it.ruta}</div>}
        {it.desc && <p style={{ fontSize:14, color:DESIGN.inkSoft, lineHeight:1.55, margin:"6px 0 0" }}><Rico>{it.desc}</Rico></p>}
        {it.puntos && <ul style={{ margin:"6px 0 0", paddingLeft:18, display:"grid", gap:3 }}>{it.puntos.map((p, i) => <li key={i} style={{ fontSize:13.5, color:DESIGN.inkSoft, lineHeight:1.5 }}><Rico>{p}</Rico></li>)}</ul>}
        {it.campos && <table style={{ width:"100%", borderCollapse:"collapse", marginTop:8 }}><tbody>{it.campos.map(([c, d], i) => <tr key={i}>
          <td style={{ fontSize:13, fontWeight:700, color:DESIGN.ink, padding:"4px 8px 4px 0", borderBottom:`1px solid ${DESIGN.sunken2}`, verticalAlign:"top", width:"32%" }}><Rico>{c}</Rico></td>
          <td style={{ fontSize:13, color:DESIGN.inkSoft, padding:"4px 0", borderBottom:`1px solid ${DESIGN.sunken2}`, lineHeight:1.45 }}><Rico>{d}</Rico></td></tr>)}</tbody></table>}
        {it.tabla && <Tabla t={it.tabla}/>}
        {it.aviso && <div style={{ marginTop:8, fontSize:13, lineHeight:1.5, color:DESIGN_STATUS.warning.color, background:DESIGN_STATUS.warning.bg, border:`1px solid ${DESIGN_STATUS.warning.border}`, borderRadius:6, padding:"5px 9px" }}>⚠ <Rico>{it.aviso}</Rico></div>}
        {usos?.length > 0 && <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap", alignItems:"baseline" }}>
          <span style={{ fontSize:12, fontWeight:700, color:DESIGN.muted, textTransform:"uppercase", letterSpacing:"0.05em" }}>Usada en</span>
          {usos.map(u => <button key={u.codigo} onClick={() => navigate({ tab:"olo-arch", codigo:u.codigo })} title={PROCESOS[u.codigo]?.nombre}
            style={{ ...link, fontSize:12.5, color:"#16a34a" }}>{u.codigo} · paso {u.pasos.join(", ")} ↗</button>)}
        </div>}
      </div>
      {it.imgs.length > 0 && <div style={{ display:"flex", gap:8, flexWrap:"wrap", flex:"0 1 auto" }}>
        {it.imgs.map((im, k) => <Miniatura key={im} src={urls[sflImg(im)]} onClick={() => onPlay(k)}/>)}
      </div>}
    </div>
  </div>;
}

function Miniatura({ src, onClick, alto = 150 }) {
  return <button onClick={onClick} disabled={!onClick} title={onClick ? "Ver en grande" : undefined} style={{ padding:0, border:`1px solid ${DESIGN.border}`, borderRadius:6, background:DESIGN.sunken, cursor:onClick ? "zoom-in" : "default", overflow:"hidden", height:alto, minWidth:alto * 1.3, display:"flex", alignItems:"center", justifyContent:"center" }}>
    {src ? <img src={src} alt="" loading="lazy" style={{ height:alto, width:"auto", maxWidth:420, objectFit:"contain", display:"block" }}/> : <span style={{ fontSize:12, color:DESIGN.mutedSoft }}>Cargando…</span>}
  </button>;
}

function Tabla({ t }) {
  return <div style={{ overflowX:"auto", margin:"6px 0 10px" }}><table style={{ width:"100%", borderCollapse:"collapse", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:6 }}>
    <thead><tr>{t.encabezados.map(h => <th key={h} style={{ textAlign:"left", fontSize:12, fontWeight:700, color:DESIGN.muted, textTransform:"uppercase", letterSpacing:"0.05em", padding:"6px 10px", background:DESIGN.sunken, borderBottom:`1px solid ${DESIGN.border}` }}>{h}</th>)}</tr></thead>
    <tbody>{t.filas.map((f, i) => <tr key={i}>{f.map((c, j) => <td key={j} style={{ fontSize:13.5, color:j ? DESIGN.inkSoft : DESIGN.ink, fontWeight:j ? 400 : 600, padding:"6px 10px", borderBottom:`1px solid ${DESIGN.sunken2}`, verticalAlign:"top", lineHeight:1.45 }}><Rico>{c}</Rico></td>)}</tr>)}</tbody>
  </table></div>;
}

function L({ children }) { return <div style={{ fontSize:12, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.07em", textTransform:"uppercase", margin:"0 0 6px" }}>{children}</div>; }
