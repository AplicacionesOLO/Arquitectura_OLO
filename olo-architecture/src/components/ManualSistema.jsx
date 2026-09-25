// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE · Manual de un sistema (pantallas con captura) — lo usan Torre de
// Control (WMH) y el SORTER CLIRO (Mecalux). Tarjetas por módulo, panel lateral
// fijo con columnas/campos/acciones y los pasos de procesos que usan cada
// pantalla, y recorridos guiados (flujo del manual, módulo, procesos).
//
// cfg: { titulo, subtitulo, intro, accent, sistema (etiqueta de ruta), modulos,
//        pantallas, byId, imgUrl, flujo, flujoLabel, usos, idKey, aviso?, conceptos? }
// idKey: campo con que las diapositivas llevan el id de pantalla ("wmhId" | "sorterId" | "hhId")
// retrato: capturas verticales (handheld) · hallazgos: lista de puntos a validar
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { useNav } from "../lib/nav.js";
import { DESIGN, DESIGN_STATUS } from "../data/constants.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { Presentacion } from "./Presentacion.jsx";
import { slidesProceso } from "../lib/presentacion.js";
import { SelectorRecorrido } from "./SelectorRecorrido.jsx";

export function ManualSistema({ cfg, focusScreen }) {
  const { modulos, pantallas, byId, imgUrl, accent, usos, idKey, sistema } = cfg;
  const [modulo, setModulo] = useState(modulos[0].name);
  const [sel, setSel] = useState(null);
  const [show, setShow] = useState(null); // { slides, start }

  useEffect(() => {
    if (focusScreen && byId[focusScreen]) { setModulo(byId[focusScreen].modulo); setSel(focusScreen); }
  }, [focusScreen, byId]);

  const slide = (p, extra) => ({ img: imgUrl(p.img), donde: `${sistema} › ${p.modulo} › ${p.nombre}`, [idKey]: p.id, ...extra });
  const slidesFlujo = () => cfg.flujo.map((f, i) => slide(byId[f.pantalla], { titulo: `Paso ${i + 1} de ${cfg.flujo.length}`, texto: f.texto, sistema, contexto: cfg.flujoLabel }));
  const slidesLista = (lista) => lista.map(p => slide(p, { titulo: p.nombre, texto: p.descripcion, contexto: `${cfg.titulo} · ${p.figura}` }));
  const abrir = (id) => { setShow(null); setModulo(byId[id].modulo); setSel(id); };

  const mod = modulos.find(m => m.name === modulo);
  const lista = pantallas.filter(p => p.modulo === modulo);
  const actual = sel && byId[sel];
  const procesos = [...new Set(Object.values(usos).flat().map(u => u.codigo))];
  const btnPlay = { fontSize:13.5, fontWeight:700, color:"#fff", background:accent, border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontFamily:DESIGN.font };

  return <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ margin:"0 0 12px" }}>
        <h3 style={{ fontSize:17, fontWeight:700, color:DESIGN.ink, margin:0 }}>{cfg.titulo}</h3>
        <div style={{ fontSize:14, color:DESIGN.muted, marginTop:3 }}>{cfg.subtitulo}</div>
        <p style={{ fontSize:14, color:DESIGN.inkSoft, lineHeight:1.6, margin:"8px 0 0", maxWidth:860 }}>{cfg.intro}</p>
        {cfg.aviso && <div style={{ marginTop:8, maxWidth:860, fontSize:13.5, lineHeight:1.5, color:DESIGN_STATUS.warning.color, background:DESIGN_STATUS.warning.bg, border:`1px solid ${DESIGN_STATUS.warning.border}`, borderRadius:6, padding:"6px 10px" }}>{cfg.aviso}</div>}
        {cfg.hallazgos?.length > 0 && <details style={{ marginTop:8, maxWidth:860, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"6px 10px" }}>
          <summary style={{ fontSize:13.5, fontWeight:700, color:DESIGN.ink, cursor:"pointer" }}>Hallazgos del mapeo a validar · {cfg.hallazgos.length}</summary>
          <ul style={{ margin:"6px 0 2px", paddingLeft:18, display:"grid", gap:4 }}>{cfg.hallazgos.map((h, i) => <li key={i} style={{ fontSize:13.5, color:DESIGN.inkSoft, lineHeight:1.5 }}>{h}</li>)}</ul>
        </details>}
      </div>

      <SelectorRecorrido codigos={procesos} accent={accent} onPlay={(c) => setShow({ slides: slidesProceso(c), start: 0 })}
        extra={<button onClick={()=>setShow({ slides: slidesFlujo(), start: 0 })} style={btnPlay}>{cfg.flujoLabel} · {cfg.flujo.length} pasos</button>}/>

      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
        {modulos.map(m => {
          const isA = m.name === modulo;
          const n = pantallas.filter(p => p.modulo === m.name).length;
          return <button key={m.name} onClick={()=>{ setModulo(m.name); setSel(null); }} style={{ padding:"5px 12px", borderRadius:DESIGN.radiusPill, border:`1px solid ${isA?DESIGN.ink:DESIGN.border}`, background:isA?DESIGN.ink:"#fff", color:isA?"#fff":DESIGN.inkSoft, fontSize:14, cursor:"pointer", fontFamily:DESIGN.font }}>
            {m.name} <span style={{ opacity:0.7 }}>{n}</span>
          </button>;
        })}
        <button onClick={()=>setShow({ slides: slidesLista(lista), start: 0 })} style={{ ...btnPlay, marginLeft:"auto" }}>▶ Presentar módulo</button>
      </div>
      <p style={{ fontSize:14, color:DESIGN.muted, margin:"0 0 10px" }}>{mod.info}</p>

      <div style={{ display:"grid", gridTemplateColumns:`repeat(auto-fill,minmax(${cfg.retrato ? (actual?140:160) : (actual?190:220)}px,1fr))`, gap:10 }}>
        {lista.map(p => {
          const isA = p.id === sel;
          const u = usos[p.id] || [];
          return <button key={p.id} onClick={()=>setSel(isA ? null : p.id)} style={{ textAlign:"left", background:"#fff", border:`1px solid ${isA?DESIGN.ink:DESIGN.border}`, boxShadow:isA?`0 0 0 1px ${DESIGN.ink}`:"none", borderRadius:9, padding:0, cursor:"pointer", fontFamily:DESIGN.font, overflow:"hidden" }}>
            <img src={imgUrl(p.img)} alt="" loading="lazy" style={{ width:"100%", aspectRatio:cfg.retrato ? "3/4" : "16/9", objectFit:"cover", objectPosition:cfg.retrato ? "top center" : "top left", display:"block", borderBottom:`1px solid ${DESIGN.border}`, background:DESIGN.sunken }}/>
            <div style={{ padding:"8px 10px 10px" }}>
              <div style={{ fontSize:14, fontWeight:700, color:DESIGN.ink }}>{p.nombre}</div>
              <div style={{ fontSize:12.5, color:DESIGN.muted, fontFamily:"'Courier New', monospace" }}>{p.url}</div>
              {u.length > 0 && <div style={{ marginTop:5, fontSize:11.5, fontWeight:700, color:"#16a34a" }}>{u.map(x => x.codigo).join(" · ")}</div>}
            </div>
          </button>;
        })}
      </div>

      {cfg.conceptos?.length > 0 && <div style={{ marginTop:16, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, padding:"10px 14px" }}>
        <L>Conceptos clave</L>
        <div style={{ display:"grid", gap:5 }}>{cfg.conceptos.map(c => <div key={c.termino} style={{ fontSize:14, lineHeight:1.5 }}><b style={{ color:DESIGN.ink }}>{c.termino}:</b> <span style={{ color:DESIGN.inkSoft }}>{c.definicion}</span></div>)}</div>
      </div>}
    </div>

    {actual && <Panel p={actual} cfg={cfg} usos={usos[actual.id] || []} onClose={()=>setSel(null)}
      onZoom={()=>setShow({ slides: slidesLista(lista), start: lista.findIndex(x => x.id === actual.id) })}
      onPlayProceso={(codigo, desde) => setShow({ slides: slidesProceso(codigo), start: desde - 1 })}/>}
    {show && <Presentacion slides={show.slides} start={show.start} onClose={()=>setShow(null)}
      onOpenWmh={idKey === "wmhId" ? abrir : undefined} onOpenSorter={idKey === "sorterId" ? abrir : undefined} onOpenHh={idKey === "hhId" ? abrir : undefined}/>}
  </div>;
}

function Panel({ p, cfg, usos, onClose, onZoom, onPlayProceso }) {
  const { navigate } = useNav();
  const link = { background:"none", border:"none", padding:0, fontWeight:700, cursor:"pointer", fontFamily:DESIGN.font };
  return <aside style={{ width:"clamp(340px, 32vw, 500px)", flexShrink:0, position:"sticky", top:20, maxHeight:"calc(100vh - 40px)", overflowY:"auto", background:"#fff", border:`1px solid ${DESIGN.border}`, borderLeft:`4px solid ${cfg.accent}`, borderRadius:10, padding:"12px 16px 16px", boxSizing:"border-box" }}>
    <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12.5, color:DESIGN.muted }}>{cfg.sistema} › {p.modulo}</div>
        <div style={{ fontSize:16, fontWeight:700, color:DESIGN.ink }}>{p.nombre}</div>
        <div style={{ fontSize:12.5, color:DESIGN.mutedSoft, fontFamily:"'Courier New', monospace" }}>{p.url}</div>
      </div>
      <button onClick={onClose} title="Cerrar" style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:17 }}>✕</button>
    </div>
    <div style={{ position:"relative", marginTop:10, cursor:"zoom-in" }} onClick={onZoom} title="Ver en grande y recorrer el módulo">
      <img src={cfg.imgUrl(p.img)} alt={p.figura} style={cfg.retrato ? { maxWidth:"100%", maxHeight:"62vh", display:"block", margin:"0 auto", borderRadius:6, border:`1px solid ${DESIGN.border}` } : { width:"100%", display:"block", borderRadius:6, border:`1px solid ${DESIGN.border}` }}/>
      <span style={{ position:"absolute", right:8, bottom:8, fontSize:13, fontWeight:700, color:"#fff", background:"rgba(15,23,42,0.8)", borderRadius:6, padding:"3px 8px" }}>⤢ Ver en grande</span>
    </div>
    <div style={{ fontSize:12.5, color:DESIGN.muted, marginTop:4, fontStyle:"italic" }}>Figura — {p.figura}</div>
    <p style={{ fontSize:14, color:DESIGN.inkSoft, lineHeight:1.55, margin:"10px 0 0" }}>{p.descripcion}</p>

    <L n={usos.length}>Procesos que usan esta pantalla</L>
    {usos.length === 0 ? <p style={{ fontSize:14, color:DESIGN.muted, margin:0 }}>Ningún paso de proceso cita esta pantalla todavía.</p> : <div style={{ display:"grid", gap:6 }}>
      {usos.map(({ codigo, pasos }) => {
        const pr = PROCESOS[codigo];
        return <div key={codigo} style={{ border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"6px 8px" }}>
          <div style={{ display:"flex", gap:8, alignItems:"baseline" }}>
            <button onClick={()=>navigate({ tab:"olo-arch", codigo })} title="Abrir la ficha del proceso" style={{ ...link, fontSize:14, color:DESIGN.ink, flex:1, textAlign:"left" }}>{codigo} · {pr.nombre} ↗</button>
            <button onClick={()=>onPlayProceso(codigo, pasos[0])} title="Presentar el proceso desde este paso"
              style={{ fontSize:12.5, fontWeight:700, color:"#fff", background:cfg.accent, border:"none", borderRadius:5, padding:"2px 8px", cursor:"pointer", fontFamily:DESIGN.font, flexShrink:0 }}>▶ Desde paso {pasos[0]}</button>
          </div>
          <div style={{ fontSize:13, color:DESIGN.muted, marginTop:2 }}>{pasos.map(n => <div key={n}>Paso {n}: {pr.pasos[n-1].texto}</div>)}</div>
        </div>;
      })}
    </div>}

    {p.campos.length > 0 && <><L n={p.campos.length}>Campos / indicadores</L>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{p.campos.map(c => <Chip key={c}>{c}</Chip>)}</div></>}
    {p.columnas.length > 0 && <><L n={p.columnas.length}>Columnas</L>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{p.columnas.map(c => <Chip key={c}>{c}</Chip>)}</div></>}
    {p.acciones.length > 0 && <><L n={p.acciones.length}>Acciones</L>
      <div style={{ display:"grid", gap:5 }}>{p.acciones.map(([a, d]) => <div key={a} style={{ fontSize:14 }}><b style={{ color:DESIGN.ink }}>{a}</b> <span style={{ color:DESIGN.muted }}>— {d}</span></div>)}</div></>}
  </aside>;
}

function L({ children, n }) { return <div style={{ fontSize:12, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.07em", textTransform:"uppercase", margin:"14px 0 6px" }}>{children}{n != null && <span style={{ color:DESIGN.mutedSoft, fontWeight:400 }}> · {n}</span>}</div>; }
function Chip({ children }) { return <span style={{ fontSize:13, color:DESIGN.inkSoft, background:DESIGN.sunken2, border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"2px 7px" }}>{children}</span>; }
