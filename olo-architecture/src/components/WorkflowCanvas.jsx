// ═══════════════════════════════════════════════════════════════════════════
// Lienzo de Workflows: tarjetas HTML sobre una capa SVG de flechas, con
// desplazamiento (arrastrar el fondo), zoom (rueda / botones) y encuadre.
// En modo edición (admin/editor): arrastrar tarjetas o recuadros completos,
// conectar dos tarjetas y ocultar/quitar flechas. Los cambios se guardan
// solos en workflow_layouts (onSave) — los pasos no se editan aquí.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { DESIGN } from "../data/constants.js";
import { PROCESOS, SILO_LABELS } from "../data/procesos_fichas.js";
import { SISTEMAS_WF, ORIGEN_WF, TIPO_FICHA, tipoFicha, CARD, CARD_M, IMPACTO_SISTEMA } from "../data/workflows.js";

const HEAD = 64, PAD = 22;
const clave = a => `${a.from}>${a.to}`;

export function WorkflowCanvas({ modelo, maestro, layout, canEdit, onSave, resaltar, foco, sel, onSelect, onIr, onAbrirSilo }) {
  const [pos, setPos] = useState(() => layout?.posiciones || {});
  const [extra, setExtra] = useState(() => layout?.conexiones || []);
  const [ocultas, setOcultas] = useState(() => layout?.ocultas || []);
  const [editar, setEditar] = useState(false);
  const [desde, setDesde] = useState(null);           // conectar: tarjeta de origen
  const [estado, setEstado] = useState(null);         // "guardando" | "guardado" | "error"
  const [vista, setVista] = useState({ x:0, y:0, z:1 });
  const vistaRef = useRef(vista);
  const boxRef = useRef(null);
  const dragRef = useRef(null), panRef = useRef(null);
  const [cambios, setCambios] = useState(0);         // cada edición terminada dispara el guardado
  const marcar = () => setCambios(c => c + 1);
  const aplicarVista = useCallback(v => { vistaRef.current = v; setVista(v); }, []);

  const card = maestro ? CARD_M : CARD;
  const nodos = useMemo(() => modelo.nodos.map(n => pos[n.id] ? { ...n, ...pos[n.id] } : n), [modelo, pos]);
  const porId = useMemo(() => Object.fromEntries(nodos.map(n => [n.id, n])), [nodos]);
  const grupos = useMemo(() => modelo.grupos.map(g => {
    const hijos = nodos.filter(n => n.grupo === g.id);
    const x0 = Math.min(...hijos.map(n => n.x)) - PAD, y0 = Math.min(...hijos.map(n => n.y)) - HEAD;
    const x1 = Math.max(...hijos.map(n => n.x + card.w)) + PAD, y1 = Math.max(...hijos.map(n => n.y + card.h)) + PAD;
    return { ...g, x:x0, y:y0, w:x1 - x0, h:y1 - y0, hijos:hijos.map(n => n.id) };
  }), [modelo, nodos, card]);
  const aristas = useMemo(() => {
    const oc = new Set(ocultas);
    return [...modelo.aristas.map(a => ({ ...a, base:true })), ...extra].filter(a => !oc.has(clave(a)) && porId[a.from] && porId[a.to]);
  }, [modelo, extra, ocultas, porId]);
  const limites = useMemo(() => {
    const xs = grupos.flatMap(g => [g.x, g.x + g.w]), ys = grupos.flatMap(g => [g.y, g.y + g.h]);
    return { x0:Math.min(...xs), y0:Math.min(...ys), x1:Math.max(...xs), y1:Math.max(...ys) };
  }, [grupos]);

  // ── Encuadre y foco ──
  const ajustar = useCallback(() => {
    const el = boxRef.current; if (!el) return;
    const bw = limites.x1 - limites.x0, bh = limites.y1 - limites.y0;
    const z = Math.max(0.12, Math.min(1, (el.clientWidth - 40) / bw, (el.clientHeight - 40) / bh));
    aplicarVista({ z, x:(el.clientWidth - bw * z) / 2 - limites.x0 * z, y:20 - limites.y0 * z });
  }, [limites, aplicarVista]);
  const centrarEn = useCallback((g) => {
    const el = boxRef.current; if (!el || !g) return;
    // el proceso a lo ancho, desde su encabezado (legible aunque tenga muchos pasos)
    const z = Math.max(0.35, Math.min(0.95, (el.clientWidth - 60) / g.w));
    aplicarVista({ z, x:(el.clientWidth - g.w * z) / 2 - g.x * z, y:24 - g.y * z });
  }, [aplicarVista]);
  const inicial = useRef(true);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const g = foco && grupos.find(x => x.codigo === foco.codigo || (maestro && x.hijos.includes(`m:${foco.codigo}`)));
      // un silo abre sobre el proceso en foco o, si no hay, sobre el primero; el maestro, completo
      if (!maestro && (g || inicial.current)) centrarEn(g || grupos[0]); else if (inicial.current) ajustar();
      inicial.current = false;
    });
    return () => cancelAnimationFrame(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foco]);

  // ── Rueda: zoom en el cursor ──
  useEffect(() => {
    const el = boxRef.current; if (!el) return;
    const onWheel = e => {
      e.preventDefault();
      const r = el.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, v = vistaRef.current;
      const z = Math.max(0.12, Math.min(2.5, v.z * (e.deltaY < 0 ? 1.12 : 1 / 1.12))), f = z / v.z;
      aplicarVista({ z, x: mx - f * (mx - v.x), y: my - f * (my - v.y) });
    };
    el.addEventListener("wheel", onWheel, { passive:false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [aplicarVista]);
  const zoomBoton = f => {
    const el = boxRef.current, v = vistaRef.current, cx = el.clientWidth / 2, cy = el.clientHeight / 2;
    const z = Math.max(0.12, Math.min(2.5, v.z * f)), k = z / v.z;
    aplicarVista({ z, x: cx - k * (cx - v.x), y: cy - k * (cy - v.y) });
  };

  // ── Arrastre (tarjetas / recuadros) y desplazamiento ──
  useEffect(() => {
    const onMove = e => {
      const p = panRef.current;
      if (p) { aplicarVista({ ...vistaRef.current, x: p.x0 + e.clientX - p.mx, y: p.y0 + e.clientY - p.my }); return; }
      const d = dragRef.current; if (!d) return;
      const dx = (e.clientX - d.mx) / vistaRef.current.z, dy = (e.clientY - d.my) / vistaRef.current.z;
      if (Math.abs(dx) + Math.abs(dy) > 3) d.movido = true;
      if (!d.movido) return;
      setPos(prev => { const n = { ...prev }; for (const [id, o] of Object.entries(d.origen)) n[id] = { x: Math.round(o.x + dx), y: Math.round(o.y + dy) }; return n; });
    };
    const onUp = () => {
      const d = dragRef.current;
      if (d?.movido) marcar();
      if (d && !d.movido) d.click?.();
      dragRef.current = null; panRef.current = null;
    };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [aplicarVista]);

  const empezarArrastre = (e, ids, click) => {
    e.stopPropagation();
    if (!editar) { click?.(); return; }
    dragRef.current = { mx:e.clientX, my:e.clientY, movido:false, click, origen:Object.fromEntries(ids.map(id => [id, { x:porId[id].x, y:porId[id].y }])) };
  };

  // ── Guardado automático ──
  const datos = useRef(null);
  useEffect(() => { datos.current = { posiciones:pos, conexiones:extra, ocultas }; });
  useEffect(() => {
    if (!cambios) return;
    const t0 = setTimeout(() => setEstado("guardando"), 0);
    const t = setTimeout(async () => {
      const ok = await onSave(datos.current);
      setEstado(ok ? "guardado" : "error");
    }, 700);
    return () => { clearTimeout(t0); clearTimeout(t); };
  }, [cambios, onSave]);

  const clickNodo = n => {
    if (editar && desde) {
      if (desde !== n.id && !aristas.some(a => a.from === desde && a.to === n.id)) { setExtra(x => [...x, { from:desde, to:n.id }]); marcar(); }
      setDesde(null); return;
    }
    if (n.tipo === "entrada" || n.tipo === "salida") { onIr(n.refs[0]); return; }
    onSelect(n.tipo === "proceso" ? { tipo:"proceso", codigo:n.codigo } : { tipo:"paso", codigo:n.codigo, i:n.i });
  };
  const clickArista = a => {
    if (!editar) return;
    marcar();
    if (a.base) setOcultas(o => [...o, clave(a)]); else setExtra(x => x.filter(y => clave(y) !== clave(a)));
  };
  const restaurar = () => { marcar(); setPos({}); setExtra([]); setOcultas([]); requestAnimationFrame(ajustar); };

  // ── Resaltado por sistema ──
  const apagado = n => {
    if (!resaltar) return false;
    if (n.tipo === "paso") return n.paso.sistema !== resaltar;
    if (n.tipo === "proceso") return !IMPACTO_SISTEMA[resaltar]?.procesos[n.codigo];
    return true;
  };
  const selId = sel ? (sel.tipo === "paso" ? `${sel.codigo}:s${sel.i}` : maestro ? `m:${sel.codigo}` : null) : null;
  const sistemasAqui = useMemo(() => [...new Set(modelo.nodos.flatMap(n => n.tipo === "paso" ? [n.paso.sistema] : n.tipo === "proceso" ? PROCESOS[n.codigo].pasos.map(s => s.sistema) : []))], [modelo]);

  const btn = { fontSize:12, fontWeight:600, color:DESIGN.inkSoft, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:7, padding:"5px 10px", cursor:"pointer", fontFamily:DESIGN.font };
  return <div style={{ border:`1px solid ${DESIGN.border}`, borderRadius:12, overflow:"hidden", background:DESIGN.surface, boxShadow:DESIGN.shadowCard }}>
    {/* Barra */}
    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", padding:"10px 14px", borderBottom:`1px solid ${DESIGN.border}`, background:DESIGN.sunken }}>
      <span style={{ fontSize:11.5, color:DESIGN.muted, fontWeight:600 }}>Resaltar sistema:</span>
      {sistemasAqui.map(s => { const m = SISTEMAS_WF[s]; if (!m) return null; const on = resaltar === s;
        return <button key={s} onClick={() => onSelect({ tipo:"resaltar", sistema: on ? null : s })} title={`Resaltar los pasos en ${m.label}`}
          style={{ ...btn, fontSize:11, padding:"3px 9px", color: on ? "#fff" : m.color, background: on ? m.color : m.color + "12", borderColor: m.color + "55" }}>{m.label}</button>; })}
      <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center" }}>
        {estado && editar && <span style={{ fontSize:11, color: estado === "error" ? "#b91c1c" : DESIGN.muted }}>{estado === "guardando" ? "Guardando…" : estado === "guardado" ? "Guardado ✓" : "No se pudo guardar"}</span>}
        <button onClick={() => zoomBoton(1 / 1.2)} style={btn} title="Alejar">−</button>
        <span style={{ fontSize:11, color:DESIGN.muted, minWidth:38, textAlign:"center" }}>{Math.round(vista.z * 100)}%</span>
        <button onClick={() => zoomBoton(1.2)} style={btn} title="Acercar">+</button>
        <button onClick={ajustar} style={btn} title="Ver todo el lienzo">Ajustar</button>
        {canEdit && editar && <>
          <button onClick={() => setDesde(d => d ? null : "elige")} style={{ ...btn, color: desde ? "#fff" : "#7c3aed", background: desde ? "#7c3aed" : "#fff", borderColor:"#c4b5fd" }}>{desde ? "Elige origen y destino…" : "＋ Conectar"}</button>
          <button onClick={restaurar} style={btn} title="Volver al acomodo automático y quitar las conexiones manuales">↺ Restaurar</button>
        </>}
        {canEdit && <button onClick={() => { setEditar(e => !e); setDesde(null); }} style={{ ...btn, fontWeight:700, color: editar ? "#fff" : DESIGN.ink, background: editar ? "#dc2626" : "#fff", borderColor: editar ? "#dc2626" : DESIGN.borderStrong }}>{editar ? "✓ Listo" : "✏ Editar"}</button>}
      </div>
    </div>
    {editar && <div style={{ padding:"7px 14px", fontSize:11.5, color:"#991b1b", background:"#fef2f2", borderBottom:"1px solid #fecaca" }}>
      Modo edición · arrastra una tarjeta, o el encabezado de un recuadro para mover el proceso completo · «Conectar»: toca la tarjeta de origen y luego la de destino · toca una flecha para quitarla · se guarda solo y lo ven todos.
    </div>}

    {/* Lienzo */}
    <div ref={boxRef} onMouseDown={e => { panRef.current = { mx:e.clientX, my:e.clientY, x0:vistaRef.current.x, y0:vistaRef.current.y }; }}
      style={{ position:"relative", height:"min(74vh, 800px)", overflow:"hidden", cursor:"grab", userSelect:"none",
        backgroundColor:"#fbfcfe", backgroundImage:"radial-gradient(#dbe2ea 1px, transparent 1px)", backgroundSize:`${22 * vista.z}px ${22 * vista.z}px`, backgroundPosition:`${vista.x}px ${vista.y}px` }}>
      <div style={{ position:"absolute", left:0, top:0, transformOrigin:"0 0", transform:`translate(${vista.x}px, ${vista.y}px) scale(${vista.z})` }}>
        {grupos.map(g => <Grupo key={g.id} g={g} maestro={maestro} editar={editar}
          onDown={e => empezarArrastre(e, g.hijos, () => maestro ? onAbrirSilo(g.silo) : onSelect({ tipo:"proceso", codigo:g.codigo }))}/>)}
        <svg style={{ position:"absolute", left:0, top:0, width:1, height:1, overflow:"visible", pointerEvents:"none" }}>
          <defs>
            <marker id="wf-flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L9 5L0 9z" fill="#94a3b8"/></marker>
            <marker id="wf-flecha-x" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L9 5L0 9z" fill="#7c3aed"/></marker>
          </defs>
          {aristas.map(a => {
            const A = porId[a.from], B = porId[a.to], d = ruta(A, B, card), activa = selId && (a.from === selId || a.to === selId);
            const apag = resaltar && (apagado(A) || apagado(B));
            return <g key={clave(a)} style={{ pointerEvents: editar ? "stroke" : "none", cursor: editar ? "pointer" : "default" }} onMouseDown={e => e.stopPropagation()} onClick={() => clickArista(a)}>
              <path d={d} fill="none" stroke="transparent" strokeWidth={14}/>
              <path d={d} fill="none" stroke={a.base ? (activa ? "#475569" : "#94a3b8") : "#7c3aed"} strokeWidth={activa ? 2.4 : 1.6} strokeDasharray={a.base ? null : "6 4"}
                opacity={apag ? 0.2 : 1} markerEnd={`url(#${a.base ? "wf-flecha" : "wf-flecha-x"})`}/>
            </g>;
          })}
        </svg>
        {nodos.map(n => <Nodo key={n.id} n={n} card={card} sel={selId === n.id} origen={desde === n.id} apagado={apagado(n)} editar={editar}
          onDown={e => { if (editar && desde === "elige") { e.stopPropagation(); setDesde(n.id); return; } empezarArrastre(e, [n.id], () => clickNodo(n)); }}/>)}
      </div>
    </div>
  </div>;
}

// Curva entre dos tarjetas: sale por el lado más cercano al destino
function ruta(A, B, card) {
  const w = card.w, h = card.h;
  const ax = A.x + w / 2, ay = A.y + h / 2, bx = B.x + w / 2, by = B.y + h / 2, dx = bx - ax, dy = by - ay;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const s = Math.sign(dx) || 1, x1 = ax + s * w / 2, x2 = bx - s * w / 2, c = Math.max(30, Math.abs(x2 - x1) / 2);
    return `M${x1},${ay} C${x1 + s * c},${ay} ${x2 - s * c},${by} ${x2},${by}`;
  }
  const s = Math.sign(dy) || 1, y1 = ay + s * h / 2, y2 = by - s * h / 2, c = Math.max(24, Math.abs(y2 - y1) / 2);
  return `M${ax},${y1} C${ax},${y1 + s * c} ${bx},${y2 - s * c} ${bx},${y2}`;
}

function Grupo({ g, maestro, editar, onDown }) {
  const p = !maestro && PROCESOS[g.codigo];
  const tipo = p && TIPO_FICHA[tipoFicha(p)];
  const color = maestro ? "#64748b" : tipo.color;
  return <div style={{ position:"absolute", left:g.x, top:g.y, width:g.w, height:g.h, borderRadius:14, border:`1.5px solid ${color}40`, background:color + "07" }}>
    <div onMouseDown={onDown} title={maestro ? "Abrir el lienzo de este silo" : "Ver el proceso"}
      style={{ height:HEAD - 14, padding:"10px 16px 0", cursor: editar ? "move" : "pointer", display:"flex", alignItems:"flex-start", gap:10 }}>
      {maestro
        ? <div style={{ minWidth:0 }}>
            <div style={{ fontSize:11, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.06em" }}>SILO</div>
            <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{SILO_LABELS[g.silo]} ›</div>
          </div>
        : <div style={{ minWidth:0, flex:1 }}>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:12, fontWeight:700, color }}>{p.codigo}</span>
              <span style={{ fontSize:10.5, fontWeight:700, color, background:color + "18", border:`1px solid ${color}44`, borderRadius:4, padding:"0 6px" }}>{tipo.label}</span>
              <span style={{ fontSize:11, color:DESIGN.muted }}>{p.pasos.length} pasos</span>
            </div>
            <div style={{ fontSize:16, fontWeight:700, color:DESIGN.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.nombre}</div>
          </div>}
      {!maestro && (p.responsables || []).length > 0 && <div style={{ display:"flex", gap:4, flexWrap:"wrap", justifyContent:"flex-end", maxWidth:"45%" }}>
        {p.responsables.slice(0, 3).map(r => <span key={r} style={{ fontSize:10.5, color:"#6d28d9", background:"#f5f3ff", border:"1px solid #ddd6fe", borderRadius:999, padding:"1px 8px", whiteSpace:"nowrap" }}>👤 {r}</span>)}
        {p.responsables.length > 3 && <span style={{ fontSize:10.5, color:DESIGN.muted }}>+{p.responsables.length - 3}</span>}
      </div>}
    </div>
  </div>;
}

function Nodo({ n, card, sel, origen, apagado, editar, onDown }) {
  const base = { position:"absolute", left:n.x, top:n.y, width:card.w, height:card.h, opacity: apagado ? 0.22 : 1, transition:"opacity .15s", cursor: editar ? "move" : "pointer" };
  if (n.tipo === "entrada" || n.tipo === "salida") {
    const refs = n.refs.map(c => PROCESOS[c]);
    const entrada = n.tipo === "entrada";
    return <div onMouseDown={onDown} style={{ ...base, display:"flex", alignItems:"center", justifyContent:"center" }} title={entrada ? "Procesos de los que viene — toca para ir" : "Proceso siguiente — toca para ir"}>
      <div style={{ width:card.h + 4, height:card.h + 4, borderRadius:"50%", background: entrada ? "#f5f3ff" : "#faf5ff", border:`2px solid ${origen ? "#7c3aed" : "#c4b5fd"}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:6, boxSizing:"border-box" }}>
        <div style={{ fontSize:9.5, fontWeight:700, color:"#7c3aed", letterSpacing:"0.05em" }}>{entrada ? "VIENE DE" : "SIGUE EN"}</div>
        <div style={{ fontSize:11, fontWeight:700, color:"#4c1d95", lineHeight:1.2 }}>{refs.slice(0, 3).map(r => r.codigo).join(" · ")}{refs.length > 3 ? " …" : ""}</div>
        {refs.length === 1 && <div style={{ fontSize:9.5, color:"#6d28d9", lineHeight:1.2, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{refs[0].nombre}</div>}
      </div>
    </div>;
  }
  if (n.tipo === "proceso") {
    const p = PROCESOS[n.codigo], tipo = TIPO_FICHA[tipoFicha(p)];
    const sis = [...new Set(p.pasos.map(s => s.sistema))].filter(s => SISTEMAS_WF[s]);
    return <div onMouseDown={onDown} style={{ ...base, boxSizing:"border-box", background:"#fff", borderRadius:10, border:`1.5px solid ${sel || origen ? "#0f172a" : DESIGN.border}`, borderLeft:`4px solid ${tipo.color}`, boxShadow: sel ? "0 0 0 3px rgba(15,23,42,.12)" : DESIGN.shadowCard, padding:"8px 10px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", gap:6 }}>
        <span style={{ fontSize:11, fontWeight:700, color:tipo.color }}>{p.codigo}</span>
        <span style={{ fontSize:10, color:DESIGN.muted }}>{p.pasos.length} pasos</span>
      </div>
      <div style={{ fontSize:12.5, fontWeight:600, color:DESIGN.ink, lineHeight:1.25, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.nombre}</div>
      <div style={{ display:"flex", gap:3, marginTop:5 }}>{sis.map(s => <Icono key={s} s={s} size={18}/>)}</div>
    </div>;
  }
  const s = n.paso, m = SISTEMAS_WF[s.sistema] || SISTEMAS_WF.fisico, o = s.origen && ORIGEN_WF[s.origen];
  const total = PROCESOS[n.codigo].pasos.length;
  return <div onMouseDown={onDown} style={{ ...base, boxSizing:"border-box", background:"#fff", borderRadius:10, border:`1.5px solid ${sel || origen ? "#0f172a" : m.color + "55"}`, boxShadow: sel ? "0 0 0 3px rgba(15,23,42,.14)" : DESIGN.shadowCard, padding:"8px 10px", display:"flex", flexDirection:"column", gap:4 }}>
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <Icono s={s.sistema} size={20}/>
      <span style={{ fontSize:10.5, fontWeight:700, color:m.color, flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.label}</span>
      <span style={{ fontSize:10, color:DESIGN.mutedSoft, fontWeight:600 }}>{n.i + 1}/{total}</span>
    </div>
    <div style={{ fontSize:11.5, color:DESIGN.ink, lineHeight:1.3, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", flex:1 }}>{s.texto}</div>
    {(s.pantalla || o) && <div style={{ display:"flex", gap:5, alignItems:"center", minWidth:0 }}>
      {s.pantalla && <span title={s.pantalla} style={{ fontSize:9.5, color:DESIGN.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flex:1 }}>▸ {s.pantalla}</span>}
      {o && s.origen === "inferido" && <span style={{ fontSize:9, fontWeight:700, color:o.color, background:o.color + "18", borderRadius:3, padding:"0 4px", whiteSpace:"nowrap" }}>inferido</span>}
    </div>}
  </div>;
}

export function Icono({ s, size = 20 }) {
  const m = SISTEMAS_WF[s] || SISTEMAS_WF.fisico;
  return <span title={m.label} style={{ width:size, height:size, borderRadius:size / 4, background:m.color, color:"#fff", fontSize: m.icono.length > 1 ? size * 0.42 : size * 0.55, fontWeight:800, display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0, lineHeight:1 }}>{m.icono}</span>;
}
