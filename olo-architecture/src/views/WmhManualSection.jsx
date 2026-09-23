// ═══════════════════════════════════════════════════════════════════════════
// SECCIÓN · Manual Control Tower (WMH) — dentro de Operación › Torre de Control.
// 17 pantallas del manual con captura, columnas, campos y acciones; recorrido
// guiado del flujo operativo típico; y los pasos de procesos (CEDI y borradores)
// que ocurren en cada pantalla (hilo Proceso → Paso → Pantalla).
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { useNav } from "../lib/nav.js";
import { DESIGN } from "../data/constants.js";
import { WMH_INTRO, WMH_MODULOS, WMH_PANTALLAS, WMH_BY_ID, pantallaWmhDePaso } from "../data/wmh_manual.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { Presentacion } from "../components/Presentacion.jsx";
import { slidesProceso, slidesWmhFlujo, slidesWmhPantallas, wmhImgUrl } from "../lib/presentacion.js";

const ACCENT = "#1abc9c";

// Pasos de procesos que ocurren en cada pantalla de Torre de Control
function usosPorPantalla() {
  const out = {};
  for (const p of Object.values(PROCESOS)) {
    p.pasos.forEach((s, i) => {
      if (s.sistema !== "torre") return;
      const id = pantallaWmhDePaso(s.texto);
      if (!id) return;
      const arr = (out[id] ||= []);
      let e = arr.find(x => x.codigo === p.codigo);
      if (!e) arr.push(e = { codigo: p.codigo, pasos: [] });
      e.pasos.push(i + 1);
    });
  }
  return out;
}

const USOS = usosPorPantalla(); // datos estáticos: se calcula una vez

export function WmhManualSection({ focusScreen }) {
  const [modulo, setModulo] = useState("Dashboard");
  const [sel, setSel] = useState(null);
  const [show, setShow] = useState(null); // { slides, start }
  const usos = USOS;

  useEffect(() => {
    if (focusScreen && WMH_BY_ID[focusScreen]) { setModulo(WMH_BY_ID[focusScreen].modulo); setSel(focusScreen); }
  }, [focusScreen]);

  const mod = WMH_MODULOS.find(m => m.name === modulo);
  const lista = WMH_PANTALLAS.filter(p => p.modulo === modulo);
  const actual = sel && WMH_BY_ID[sel];

  return <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ margin:"0 0 12px" }}>
        <h3 style={{ fontSize:16, fontWeight:700, color:DESIGN.ink, margin:0 }}>Manual de Usuario · Control Tower (WMH)</h3>
        <div style={{ fontSize:12, color:DESIGN.muted, marginTop:3 }}>eflow Cloud Suite v4.18.4.4 · 17 pantallas · septiembre 2026</div>
        <p style={{ fontSize:12.5, color:DESIGN.inkSoft, lineHeight:1.6, margin:"8px 0 0", maxWidth:860 }}>{WMH_INTRO}</p>
      </div>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
        <span style={{ fontSize:11, fontWeight:700, color:DESIGN.muted }}>▶ Recorridos guiados</span>
        <button onClick={()=>setShow({ slides: slidesWmhFlujo(), start: 0 })} style={btnPlay}>Flujo operativo típico · 6 pasos</button>
        {Object.keys(usos).length > 0 && [...new Set(Object.values(usos).flat().map(u => u.codigo))].map(c =>
          <button key={c} onClick={()=>setShow({ slides: slidesProceso(c), start: 0 })} title={`Presentar ${PROCESOS[c].nombre} (incluye sus pasos en Torre de Control)`} style={btnProc}>
            <b>{c}</b> {PROCESOS[c].nombre}
          </button>)}
      </div>

      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
        {WMH_MODULOS.map(m => {
          const isA = m.name === modulo;
          const n = WMH_PANTALLAS.filter(p => p.modulo === m.name).length;
          return <button key={m.name} onClick={()=>{ setModulo(m.name); setSel(null); }} style={{ padding:"5px 12px", borderRadius:DESIGN.radiusPill, border:`1px solid ${isA?DESIGN.ink:DESIGN.border}`, background:isA?DESIGN.ink:"#fff", color:isA?"#fff":DESIGN.inkSoft, fontSize:12, cursor:"pointer", fontFamily:DESIGN.font }}>
            {m.name} <span style={{ opacity:0.7 }}>{n}</span>
          </button>;
        })}
        <button onClick={()=>setShow({ slides: slidesWmhPantallas(lista), start: 0 })} style={{ ...btnPlay, marginLeft:"auto" }}>▶ Presentar módulo</button>
      </div>
      <p style={{ fontSize:12, color:DESIGN.muted, margin:"0 0 10px" }}>{mod.info}</p>

      <div style={{ display:"grid", gridTemplateColumns:`repeat(auto-fill,minmax(${actual?190:220}px,1fr))`, gap:10 }}>
        {lista.map(p => {
          const isA = p.id === sel;
          const u = usos[p.id] || [];
          return <button key={p.id} onClick={()=>setSel(isA ? null : p.id)} style={{ textAlign:"left", background:"#fff", border:`1px solid ${isA?DESIGN.ink:DESIGN.border}`, boxShadow:isA?`0 0 0 1px ${DESIGN.ink}`:"none", borderRadius:9, padding:0, cursor:"pointer", fontFamily:DESIGN.font, overflow:"hidden" }}>
            <img src={wmhImgUrl(p.img)} alt="" loading="lazy" style={{ width:"100%", aspectRatio:"950/600", objectFit:"cover", objectPosition:"top left", display:"block", borderBottom:`1px solid ${DESIGN.border}`, background:DESIGN.sunken }}/>
            <div style={{ padding:"8px 10px 10px" }}>
              <div style={{ fontSize:12.5, fontWeight:700, color:DESIGN.ink }}>{p.nombre}</div>
              <div style={{ fontSize:10.5, color:DESIGN.muted, fontFamily:"'Courier New', monospace" }}>{p.url}</div>
              {u.length > 0 && <div style={{ marginTop:5, fontSize:9.5, fontWeight:700, color:"#16a34a" }}>{u.map(x => x.codigo).join(" · ")}</div>}
            </div>
          </button>;
        })}
      </div>
    </div>

    {actual && <Panel p={actual} usos={usos[actual.id] || []} onClose={()=>setSel(null)}
      onPlay={setShow} lista={lista}/>}
    {show && <Presentacion slides={show.slides} start={show.start} onClose={()=>setShow(null)}
      onOpenWmh={(id) => { setShow(null); setModulo(WMH_BY_ID[id].modulo); setSel(id); }}/>}
  </div>;
}

function Panel({ p, usos, onClose, onPlay, lista }) {
  const { navigate } = useNav();
  return <aside style={{ width:460, flexShrink:0, position:"sticky", top:20, maxHeight:"calc(100vh - 40px)", overflowY:"auto", background:"#fff", border:`1px solid ${DESIGN.border}`, borderLeft:`4px solid ${ACCENT}`, borderRadius:10, padding:"12px 16px 16px", boxSizing:"border-box" }}>
    <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:10.5, color:DESIGN.muted }}>Torre de Control › {p.modulo}</div>
        <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink }}>{p.nombre}</div>
        <div style={{ fontSize:10.5, color:DESIGN.mutedSoft, fontFamily:"'Courier New', monospace" }}>{p.url}</div>
      </div>
      <button onClick={onClose} title="Cerrar" style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:16 }}>✕</button>
    </div>
    <div style={{ position:"relative", marginTop:10, cursor:"zoom-in" }} onClick={()=>onPlay({ slides: slidesWmhPantallas(lista), start: lista.findIndex(x => x.id === p.id) })} title="Ver en grande y recorrer el módulo">
      <img src={wmhImgUrl(p.img)} alt={p.figura} style={{ width:"100%", display:"block", borderRadius:6, border:`1px solid ${DESIGN.border}` }}/>
      <span style={{ position:"absolute", right:8, bottom:8, fontSize:11, fontWeight:700, color:"#fff", background:"rgba(15,23,42,0.8)", borderRadius:6, padding:"3px 8px" }}>⤢ Ver en grande</span>
    </div>
    <div style={{ fontSize:10.5, color:DESIGN.muted, marginTop:4, fontStyle:"italic" }}>Figura — {p.figura}</div>
    <p style={{ fontSize:12.5, color:DESIGN.inkSoft, lineHeight:1.55, margin:"10px 0 0" }}>{p.descripcion}</p>

    <L n={usos.length}>Procesos que usan esta pantalla</L>
    {usos.length === 0 ? <T>Ningún paso de proceso cita esta pantalla todavía.</T> : <div style={{ display:"grid", gap:6 }}>
      {usos.map(({ codigo, pasos }) => {
        const pr = PROCESOS[codigo];
        return <div key={codigo} style={{ border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"6px 8px" }}>
          <div style={{ display:"flex", gap:8, alignItems:"baseline" }}>
            <button onClick={()=>navigate({ tab:"olo-arch", codigo })} title="Abrir la ficha del proceso" style={{ ...link, fontSize:12, color:DESIGN.ink, flex:1, textAlign:"left" }}>{codigo} · {pr.nombre} ↗</button>
            <button onClick={()=>onPlay({ slides: slidesProceso(codigo), start: pasos[0] - 1 })} title="Presentar el proceso desde este paso"
              style={{ fontSize:10.5, fontWeight:700, color:"#fff", background:ACCENT, border:"none", borderRadius:5, padding:"2px 8px", cursor:"pointer", fontFamily:DESIGN.font, flexShrink:0 }}>▶ Desde paso {pasos[0]}</button>
          </div>
          <div style={{ fontSize:11, color:DESIGN.muted, marginTop:2 }}>{pasos.map(n => <div key={n}>Paso {n}: {pr.pasos[n-1].texto}</div>)}</div>
        </div>;
      })}
    </div>}

    {p.campos.length > 0 && <><L n={p.campos.length}>{p.id === "dashboard" ? "Indicadores" : "Campos / filtros"}</L>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{p.campos.map(c => <Chip key={c}>{c}</Chip>)}</div></>}
    {p.columnas.length > 0 && <><L n={p.columnas.length}>Columnas</L>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{p.columnas.map(c => <Chip key={c}>{c}</Chip>)}</div></>}
    {p.acciones.length > 0 && <><L n={p.acciones.length}>Acciones</L>
      <div style={{ display:"grid", gap:5 }}>{p.acciones.map(([a, d]) => <div key={a} style={{ fontSize:12 }}><b style={{ color:DESIGN.ink }}>{a}</b> <span style={{ color:DESIGN.muted }}>— {d}</span></div>)}</div></>}
  </aside>;
}

const btnPlay = { fontSize:11.5, fontWeight:700, color:"#fff", background:ACCENT, border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontFamily:DESIGN.font };
const btnProc = { fontSize:11, color:DESIGN.inkSoft, background:DESIGN.sunken, border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"3px 8px", cursor:"pointer", fontFamily:DESIGN.font };
const link = { background:"none", border:"none", padding:0, fontWeight:700, cursor:"pointer", fontFamily:DESIGN.font };
function L({ children, n }) { return <div style={{ fontSize:10, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.07em", textTransform:"uppercase", margin:"14px 0 6px" }}>{children}{n != null && <span style={{ color:DESIGN.mutedSoft, fontWeight:400 }}> · {n}</span>}</div>; }
function T({ children }) { return <p style={{ fontSize:12, color:DESIGN.muted, margin:0 }}>{children}</p>; }
function Chip({ children }) { return <span style={{ fontSize:11, color:DESIGN.inkSoft, background:DESIGN.sunken2, border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"2px 7px" }}>{children}</span>; }
