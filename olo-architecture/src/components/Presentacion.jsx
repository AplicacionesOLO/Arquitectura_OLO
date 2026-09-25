// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE · Presentación de pantallas — visor a pantalla completa que
// recorre capturas en un orden con sentido (pasos de un proceso, pestañas de
// una pantalla, flujo de un manual).
//
//   · Visor con zoom por zonas: arrastrar un rectángulo amplía esa zona; rueda
//     del mouse = zoom donde está el puntero; modo "Mover" para desplazarse;
//     doble clic = acercar ×2 (o volver a ajustar si ya está ampliada).
//   · Panel lateral con la información del paso (siempre visible junto a la
//     imagen) y la lista completa del recorrido para saltar a cualquier paso.
//   · Teclado: ← → pasos · + / − zoom · 0 ajustar · I mostrar/ocultar panel · Esc cerrar
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";
import { useSrc } from "../lib/imgPrivada.js";

const ORIGEN = {
  eflow_wms: { label: "eFlow WMS", color: "#22d3ee" },
  control_tower: { label: "Torre de Control", color: "#4ade80" },
  mecalux_sorter: { label: "SORTER Mecalux", color: "#fb923c" },
  eflow_hh: { label: "Handheld eFlow", color: "#2dd4bf" },
  softland_menu: { label: "Menú Softland", color: "#f87171" },
  inferido: { label: "Inferido · sin documento de OLO", color: "#fbbf24" },
};
const MAX_ZOOM = 8;

export function Presentacion({ slides, start = 0, onClose, onOpenScreen, onOpenWmh, onOpenSorter, onOpenHh, onOpenSfl }) {
  const [i, setI] = useState(Math.min(start, slides.length - 1));
  const [panel, setPanel] = useState(true);
  const go = useCallback((d) => setI(x => Math.max(0, Math.min(slides.length - 1, x + d))), [slides.length]);
  const viewer = useRef(null); // API del visor: zoomIn, zoomOut, fit

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") viewer.current?.zoomIn();
      else if (e.key === "-") viewer.current?.zoomOut();
      else if (e.key === "0") viewer.current?.fit();
      else if (e.key.toLowerCase() === "i") setPanel(p => !p);
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("presentacion-abierta"); // oculta el chat flotante (index.css)
    return () => { window.removeEventListener("keydown", onKey); document.body.classList.remove("presentacion-abierta"); };
  }, [go, onClose]);

  const s = slides[i];
  const imgSrc = useSrc(s.img); // capturas privadas (priv:…) → URL firmada
  const next = slides[i + 1];
  const prev = slides[i - 1];
  if (!s) return null;
  const btn = { background:"rgba(255,255,255,0.1)", color:"#fff", border:"1px solid rgba(255,255,255,0.18)", borderRadius:8, padding:"8px 14px", cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit" };
  const link = (fn, label) => <button onClick={fn} style={{ background:"none", border:"none", padding:0, color:"#67e8f9", cursor:"pointer", fontSize:14, fontFamily:"inherit", textAlign:"left" }}>{label} ↗</button>;

  return <div role="dialog" aria-modal="true" aria-label={s.titulo} style={{ position:"fixed", inset:0, zIndex:1000, background:"#0b1220", display:"flex", flexDirection:"column", color:"#e2e8f0", fontFamily:"inherit" }}>
    {/* Encabezado */}
    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 18px", borderBottom:"1px solid rgba(255,255,255,0.1)", flexShrink:0 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.contexto}</div>
        <div style={{ fontSize:19, fontWeight:700, color:"#fff" }}>{s.titulo}</div>
      </div>
      <span style={{ fontSize:14, color:"#94a3b8" }}>{i + 1} / {slides.length}</span>
      <button onClick={()=>setPanel(p => !p)} title="Mostrar u ocultar la información (I)" style={{ ...btn, padding:"6px 12px", fontSize:13 }}>{panel ? "Ocultar info" : "Mostrar info"}</button>
      <button onClick={onClose} title="Cerrar (Esc)" style={{ ...btn, padding:"6px 12px" }}>✕</button>
    </div>

    <div style={{ flex:1, minHeight:0, display:"flex" }}>
      {/* Imagen o tarjeta del paso */}
      <div style={{ flex:1, minWidth:0, position:"relative" }}>
        {s.img && !imgSrc ? <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8", fontSize:14 }}>Cargando captura…</div>
          : s.img
          ? <Visor key={imgSrc} src={imgSrc} alt={s.titulo} apiRef={viewer}/>
          : <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
              <div style={{ maxWidth:620, textAlign:"center", padding:"36px 32px", border:"1px solid rgba(255,255,255,0.15)", borderRadius:14, background:"rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#5eead4", textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.sistema || "Paso"}</div>
                <div style={{ fontSize:22, color:"#fff", lineHeight:1.5, marginTop:12 }}>{s.texto}</div>
                {s.donde && <div style={{ fontSize:15, color:"#94a3b8", marginTop:12 }}>{s.donde}</div>}
                <div style={{ fontSize:13, color:"#64748b", marginTop:16 }}>Este paso no tiene captura: no ocurre en una pantalla de eFlow WMS, el handheld, Torre de Control, el SORTER ni Softland.</div>
              </div>
            </div>}
      </div>

      {/* Panel de información: siempre legible junto a la imagen */}
      {panel && <aside style={{ width:"clamp(300px, 26vw, 400px)", flexShrink:0, borderLeft:"1px solid rgba(255,255,255,0.1)", background:"#0f172a", display:"flex", flexDirection:"column", minHeight:0 }}>
        <div style={{ padding:"16px 18px", overflowY:"auto", flex:1 }}>
          <div style={{ fontSize:17, color:"#fff", lineHeight:1.55, fontWeight:500 }}>{s.texto}</div>
          <div style={{ display:"grid", gap:8, marginTop:14 }}>
            {s.donde && <Dato k="Dónde">{s.donde}</Dato>}
            {s.sistema && <Dato k="Sistema">{s.sistema}</Dato>}
            {s.origen && ORIGEN[s.origen] && <Dato k="Origen"><span style={{ color:ORIGEN[s.origen].color, fontWeight:700 }}>{ORIGEN[s.origen].label}</span></Dato>}
            {(s.detalle || []).map(d => <Dato key={d.k} k={d.k}>{d.v}</Dato>)}
          </div>
          <div style={{ display:"grid", gap:6, marginTop:12 }}>
            {s.screenId && onOpenScreen && link(()=>onOpenScreen(s.screenId), "Ver ficha de la pantalla")}
            {s.wmhId && onOpenWmh && link(()=>onOpenWmh(s.wmhId), "Ver pantalla en el manual de Torre de Control")}
            {s.sorterId && onOpenSorter && link(()=>onOpenSorter(s.sorterId), "Ver pantalla en el manual del SORTER")}
            {s.hhId && onOpenHh && link(()=>onOpenHh(s.hhId), "Ver pantalla en el manual del handheld")}
            {s.sflId && onOpenSfl && link(()=>onOpenSfl(s.sflId), "Ver pantalla en el manual de Softland")}
          </div>
          {slides.length > 1 && <>
            <div style={{ fontSize:12, fontWeight:700, color:"#64748b", letterSpacing:"0.07em", textTransform:"uppercase", margin:"22px 0 8px" }}>Recorrido completo</div>
            <ol style={{ listStyle:"none", margin:0, padding:0, display:"grid", gap:2 }}>
              {slides.map((x, k) => <li key={k}>
                <button onClick={()=>setI(k)} style={{ display:"flex", gap:10, width:"100%", textAlign:"left", background:k === i ? "rgba(103,232,249,0.12)" : "transparent", border:"none", borderLeft:`3px solid ${k === i ? "#67e8f9" : "transparent"}`, borderRadius:4, padding:"6px 8px", cursor:"pointer", fontFamily:"inherit", color:k === i ? "#fff" : "#94a3b8" }}>
                  <span style={{ fontSize:12, fontWeight:700, flexShrink:0, width:22, color:x.img ? "#67e8f9" : "#64748b" }}>{k + 1}</span>
                  <span style={{ fontSize:13, lineHeight:1.4 }}>{x.texto?.length > 90 ? x.texto.slice(0, 88) + "…" : (x.texto || x.titulo)}</span>
                </button>
              </li>)}
            </ol>
          </>}
        </div>
      </aside>}
    </div>

    {/* Pie: navegación */}
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 18px", borderTop:"1px solid rgba(255,255,255,0.1)", flexShrink:0 }}>
      <button onClick={()=>go(-1)} disabled={!prev} style={{ ...btn, opacity:prev?1:0.35, cursor:prev?"pointer":"default", textAlign:"left", maxWidth:340 }}>
        <div style={{ fontSize:11, color:"#94a3b8", fontWeight:500 }}>← Anterior</div>
        <div style={{ fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{prev ? prev.titulo : "—"}</div>
      </button>
      <div style={{ flex:1, fontSize:12, color:"#64748b", textAlign:"center" }}>Arrastra sobre la imagen para ampliar una zona · rueda = zoom · doble clic = ×2</div>
      {next
        ? <button onClick={()=>go(1)} style={{ ...btn, textAlign:"right", maxWidth:380, background:"rgba(103,232,249,0.14)", borderColor:"rgba(103,232,249,0.4)" }}>
            <div style={{ fontSize:11, color:"#94a3b8", fontWeight:500 }}>Siguiente →</div>
            <div style={{ fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{next.titulo}{next.donde ? ` · ${next.donde}` : ""}</div>
          </button>
        : <button onClick={onClose} style={btn}>Fin del recorrido ✓</button>}
    </div>
  </div>;
}

function Dato({ k, children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"72px 1fr", gap:8, fontSize:14, lineHeight:1.45 }}>
    <span style={{ color:"#64748b" }}>{k}</span><span style={{ color:"#cbd5e1" }}>{children}</span>
  </div>;
}

// Visor de imagen con zoom por zonas, zoom con rueda y desplazamiento.
function Visor({ src, alt, apiRef }) {
  const box = useRef(null);
  const [nat, setNat] = useState(null);             // tamaño natural de la imagen
  const [t, setT] = useState({ s: 1, x: 0, y: 0 });  // escala y desplazamiento
  const [modo, setModo] = useState("zona");         // "zona" | "mover"
  const [sel, setSel] = useState(null);             // rectángulo en curso
  const drag = useRef(null);

  const fitT = useCallback(() => {
    const el = box.current;
    if (!el || !nat) return null;
    const cw = el.clientWidth, ch = el.clientHeight, pad = 16;
    const s = Math.min((cw - pad * 2) / nat.w, (ch - pad * 2) / nat.h, 2);
    return { s, x: (cw - nat.w * s) / 2, y: (ch - nat.h * s) / 2 };
  }, [nat]);
  const fit = useCallback(() => { const f = fitT(); if (f) setT(f); }, [fitT]);

  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => fit()); ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  const zoomAt = useCallback((px, py, factor) => setT(o => {
    const f = fitT(); const min = f ? f.s : 0.1;
    const s = Math.max(min, Math.min(MAX_ZOOM, o.s * factor));
    return { s, x: px - (px - o.x) * (s / o.s), y: py - (py - o.y) * (s / o.s) };
  }), [fitT]);
  useEffect(() => {
    const centro = () => { const el = box.current; return el ? [el.clientWidth / 2, el.clientHeight / 2] : [0, 0]; };
    apiRef.current = { zoomIn: () => zoomAt(...centro(), 1.4), zoomOut: () => zoomAt(...centro(), 1 / 1.4), fit };
  }, [apiRef, zoomAt, fit]);

  // La rueda necesita un listener no pasivo para evitar que la página haga scroll
  useEffect(() => {
    const el = box.current; if (!el) return;
    const onWheel = (e) => { e.preventDefault(); const r = el.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.18 : 1 / 1.18); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const pos = (e) => { const r = box.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const onDown = (e) => {
    if (e.button !== 0) return;
    const [x, y] = pos(e);
    drag.current = { x, y, t0: t };
    if (modo === "zona") setSel({ x0: x, y0: y, x1: x, y1: y });
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const [x, y] = pos(e);
    if (modo === "zona") setSel(r => r && { ...r, x1: x, y1: y });
    else { const d = drag.current; setT({ ...d.t0, x: d.t0.x + x - d.x, y: d.t0.y + y - d.y }); }
  };
  const onUp = () => {
    const d = drag.current; drag.current = null;
    if (modo !== "zona" || !sel) return;
    const w = Math.abs(sel.x1 - sel.x0), h = Math.abs(sel.y1 - sel.y0);
    setSel(null);
    if (w < 12 || h < 12 || !d) return; // fue un clic, no una selección
    const el = box.current, cw = el.clientWidth, ch = el.clientHeight;
    const ix = (Math.min(sel.x0, sel.x1) - t.x) / t.s, iy = (Math.min(sel.y0, sel.y1) - t.y) / t.s;
    const iw = w / t.s, ih = h / t.s;
    const s = Math.min(MAX_ZOOM, cw / iw, ch / ih);
    setT({ s, x: (cw - iw * s) / 2 - ix * s, y: (ch - ih * s) / 2 - iy * s });
  };
  const onDouble = (e) => {
    const f = fitT();
    if (f && t.s > f.s * 1.05) fit(); else zoomAt(...pos(e), 2);
  };

  const pct = Math.round(t.s * 100); // 100 % = tamaño real de la captura
  const tb = { background:"rgba(15,23,42,0.85)", color:"#fff", border:"1px solid rgba(255,255,255,0.2)", borderRadius:7, padding:"6px 10px", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit" };
  const on = (m) => ({ ...tb, background: modo === m ? "#0891b2" : tb.background });

  return <div ref={box} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onDoubleClick={onDouble}
    style={{ position:"absolute", inset:0, overflow:"hidden", cursor: modo === "zona" ? "crosshair" : "grab", userSelect:"none" }}>
    <img src={src} alt={alt} draggable={false}
      onLoad={e => { const n = { w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight }; setNat(n);
        const el = box.current; if (el) { const cw = el.clientWidth, ch = el.clientHeight; const s = Math.min((cw - 32) / n.w, (ch - 32) / n.h, 2); setT({ s, x: (cw - n.w * s) / 2, y: (ch - n.h * s) / 2 }); } }}
      style={{ position:"absolute", left:0, top:0, transformOrigin:"0 0", transform:`translate(${t.x}px, ${t.y}px) scale(${t.s})`, maxWidth:"none", boxShadow:"0 10px 40px rgba(0,0,0,0.5)", borderRadius:4, visibility: nat ? "visible" : "hidden" }}/>
    {sel && <div style={{ position:"absolute", left:Math.min(sel.x0, sel.x1), top:Math.min(sel.y0, sel.y1), width:Math.abs(sel.x1 - sel.x0), height:Math.abs(sel.y1 - sel.y0), border:"2px solid #22d3ee", background:"rgba(34,211,238,0.12)", pointerEvents:"none" }}/>}
    <div onMouseDown={e => e.stopPropagation()} onDoubleClick={e => e.stopPropagation()} style={{ position:"absolute", left:12, bottom:12, display:"flex", gap:6, alignItems:"center" }}>
      <button onClick={()=>setModo("zona")} style={on("zona")} title="Arrastra para ampliar una zona">⬚ Zona</button>
      <button onClick={()=>setModo("mover")} style={on("mover")} title="Arrastra para desplazarte">✥ Mover</button>
      <button onClick={()=>apiRef.current?.zoomOut()} style={tb} title="Alejar (−)">−</button>
      <span title="Respecto al tamaño real de la captura" style={{ ...tb, cursor:"default", minWidth:54, textAlign:"center" }}>{pct}%</span>
      <button onClick={()=>apiRef.current?.zoomIn()} style={tb} title="Acercar (+)">+</button>
      <button onClick={fit} style={tb} title="Ajustar a la pantalla (0)">Ajustar</button>
    </div>
  </div>;
}
