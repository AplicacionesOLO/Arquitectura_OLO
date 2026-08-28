// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA · DrawioFlowchart — renderiza un diagrama de flujo draw.io/mxGraph
// (un solo <diagram>...</diagram>, XML sin comprimir) como SVG interactivo:
// pan con arrastre de fondo, zoom con rueda, pantalla completa. Sin
// dependencias externas — parseo propio de mxCell (vertex/edge) vía DOMParser.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useRef, useEffect, useMemo } from "react";
import { DESIGN } from "../data/constants.js";
import { ExpandIcon, ContractIcon } from "../components/icons.jsx";

function parseStyle(str) {
  const out = {};
  (str || "").split(";").forEach(pair => {
    if (!pair) return;
    const i = pair.indexOf("=");
    if (i === -1) { out[pair.trim()] = "1"; return; }
    out[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  });
  return out;
}

function stripHtml(raw) {
  if (!raw) return "";
  const div = document.createElement("div");
  div.innerHTML = raw.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n");
  return (div.textContent || "").replace(/ /g, " ").trim();
}

function shapeKind(style) {
  if (style.ellipse) return "ellipse";
  if (style.rhombus) return "rhombus";
  if (style.shape === "ext") return "container";
  if (style.text) return "text";
  return "rect";
}

// Parsea el XML de UN <diagram> (empieza en <mxGraphModel>) a {vertices, edges, bounds}
export function parseDrawioDiagram(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  const cells = [...doc.getElementsByTagName("mxCell")];
  const vertices = [];
  const edges = [];
  cells.forEach(c => {
    const style = parseStyle(c.getAttribute("style"));
    const value = stripHtml(c.getAttribute("value"));
    if (c.getAttribute("vertex") === "1") {
      const geom = c.getElementsByTagName("mxGeometry")[0];
      if (!geom) return;
      const x = parseFloat(geom.getAttribute("x") || 0);
      const y = parseFloat(geom.getAttribute("y") || 0);
      const width = parseFloat(geom.getAttribute("width") || 0);
      const height = parseFloat(geom.getAttribute("height") || 0);
      vertices.push({
        id: c.getAttribute("id"), value, style, kind: shapeKind(style),
        x, y, width, height,
        cx: x + width / 2, cy: y + height / 2,
      });
    } else if (c.getAttribute("edge") === "1") {
      edges.push({ id: c.getAttribute("id"), source: c.getAttribute("source"), target: c.getAttribute("target"), value, style });
    }
  });
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  vertices.forEach(v => {
    if (v.style.container === "1" && v.kind === "container") return; // no cuenta el marco decorativo para el encuadre
    minX = Math.min(minX, v.x); minY = Math.min(minY, v.y);
    maxX = Math.max(maxX, v.x + v.width); maxY = Math.max(maxY, v.y + v.height);
  });
  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 800; maxY = 600; }
  return { vertices, edges, bounds: { minX, minY, maxX, maxY } };
}

function orthPath(sv, tv) {
  const dx = tv.cx - sv.cx, dy = tv.cy - sv.cy;
  let sx, sy, ex, ey;
  if (Math.abs(dy) >= Math.abs(dx)) {
    sy = dy > 0 ? sv.y + sv.height : sv.y;
    sx = sv.cx;
    ey = dy > 0 ? tv.y : tv.y + tv.height;
    ex = tv.cx;
    const midY = (sy + ey) / 2;
    if (Math.abs(sx - ex) < 2) return `M${sx},${sy} L${ex},${ey}`;
    return `M${sx},${sy} L${sx},${midY} L${ex},${midY} L${ex},${ey}`;
  }
  sx = dx > 0 ? sv.x + sv.width : sv.x;
  sy = sv.cy;
  ex = dx > 0 ? tv.x : tv.x + tv.width;
  ey = tv.cy;
  const midX = (sx + ex) / 2;
  if (Math.abs(sy - ey) < 2) return `M${sx},${sy} L${ex},${ey}`;
  return `M${sx},${sy} L${midX},${sy} L${midX},${ey} L${ex},${ey}`;
}

function Shape({ v }) {
  if (v.kind === "container") {
    return <rect x={v.x} y={v.y} width={v.width} height={v.height} rx={6} fill="none" stroke="#cbd5e1" strokeDasharray="6 4"/>;
  }
  const fill = v.style.fillColor || "#f1f5f9";
  const stroke = v.style.strokeColor || "#94a3b8";
  const fontColor = v.style.fontColor && v.style.fontColor !== "default" ? v.style.fontColor : "#1e293b";
  const fontWeight = /font-weight:\s*(bold|700)/i.test(v.value) || /^(Inicio|Fin)$/i.test(v.value) ? 700 : 400;

  let shape = null;
  if (v.kind === "text") {
    shape = null; // sin fondo, solo texto
  } else if (v.kind === "ellipse") {
    shape = <ellipse cx={v.cx} cy={v.cy} rx={v.width/2} ry={v.height/2} fill={fill} stroke={stroke} strokeWidth={1.4}/>;
  } else if (v.kind === "rhombus") {
    const pts = `${v.cx},${v.y} ${v.x+v.width},${v.cy} ${v.cx},${v.y+v.height} ${v.x},${v.cy}`;
    shape = <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={1.4}/>;
  } else {
    const rx = v.style.rounded === "1" ? Math.min(10, v.width/6) : 0;
    shape = <rect x={v.x} y={v.y} width={v.width} height={v.height} rx={rx} fill={fill} stroke={stroke} strokeWidth={1.4}/>;
  }

  return <g>
    {shape}
    <foreignObject x={v.x+4} y={v.y+2} width={Math.max(v.width-8,10)} height={Math.max(v.height-4,10)} style={{ pointerEvents:"none" }}>
      <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", fontFamily:DESIGN.font, fontSize: v.kind==="text"?11:11.5, fontWeight, color:fontColor, lineHeight:1.25, overflow:"hidden", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
        {v.value}
      </div>
    </foreignObject>
  </g>;
}

// Lienzo de referencia fijo — el viewBox NUNCA cambia con el contenido; el
// contenido (que puede ser enorme, con las dos notaciones ISO/BPMN) se
// escala para caber ahí mediante el zoom, no mediante el viewBox. Antes el
// viewBox se fijaba al tamaño del contenido y ADEMÁS se aplicaba zoom encima
// — se achicaba dos veces y el diagrama quedaba minúsculo.
const VIEW_W = 1200, VIEW_H = 720;

export function DrawioFlowchart({ xml, title }) {
  const { vertices, edges, bounds } = useMemo(() => parseDrawioDiagram(xml), [xml]);
  const W = Math.max(200, bounds.maxX - bounds.minX + 80);
  const H = Math.max(200, bounds.maxY - bounds.minY + 80);
  const offX = bounds.minX - 40, offY = bounds.minY - 40;

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [fullscr, setFullscr] = useState(false);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const svgRef = useRef(null);
  const dims = useRef({ w: VIEW_W, h: VIEW_H });
  dims.current = { w: VIEW_W, h: VIEW_H };

  useEffect(() => { document.body.style.overflow = fullscr ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [fullscr]);

  // Encuadre inicial: cada hoja trae DOS versiones del mismo flujo una al
  // lado de la otra (ISO 9000 + BPMN), así que el contenido es mucho más
  // ancho que alto. Ajustar por altura (no por ancho completo) para que el
  // texto quede a tamaño legible; el ancho sobrante se recorre arrastrando.
  const fitView = () => {
    const fitZ = Math.min(1.4, VIEW_H / H);
    const centeredY = (VIEW_H - H * fitZ) / 2;
    zoomRef.current = fitZ; setZoom(fitZ);
    panRef.current = { x: 24, y: centeredY }; setPan({ x: 24, y: centeredY });
  };
  useEffect(fitView, [xml]);

  useEffect(() => {
    const onMove = e => {
      const pd = dragRef.current; if (!pd) return;
      const r = svgRef.current?.getBoundingClientRect(); if (!r) return;
      const { w, h } = dims.current;
      const rx = (e.clientX - r.left) * (w / r.width), ry = (e.clientY - r.top) * (h / r.height);
      const np = { x: pd.px0 + (rx - pd.mx0), y: pd.py0 + (ry - pd.my0) };
      panRef.current = np; setPan(np);
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;
    const onWheel = e => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const newZ = Math.max(0.1, Math.min(6, zoomRef.current * factor));
      const r = svg.getBoundingClientRect();
      const { w, h } = dims.current;
      const rx = (e.clientX - r.left) * (w / r.width), ry = (e.clientY - r.top) * (h / r.height);
      const dz = newZ / zoomRef.current;
      const np = { x: rx - dz * (rx - panRef.current.x), y: ry - dz * (ry - panRef.current.y) };
      zoomRef.current = newZ; panRef.current = np; setZoom(newZ); setPan(np);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [fullscr]);

  const byId = {}; vertices.forEach(v => { byId[v.id] = v; });

  const canvas = (
    <div style={{ display:"flex", flexDirection:"column", height: fullscr?"100vh":"auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:DESIGN.sunken, borderBottom:`1px solid ${DESIGN.border}`, flexShrink:0 }}>
        <span style={{ fontSize:11, fontWeight:700, color:DESIGN.inkSoft }}>{title || "Diagrama de flujo"}</span>
        <div style={{ display:"flex", alignItems:"center", gap:3, background:DESIGN.sunken2, borderRadius:5, padding:"2px 6px", marginLeft:"auto" }}>
          <button onClick={()=>{ const nz=Math.min(6,zoomRef.current*1.25); zoomRef.current=nz; setZoom(nz); }} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:14, lineHeight:1, padding:"0 4px" }}>+</button>
          <span style={{ fontSize:10, color:"#888", minWidth:34, textAlign:"center" }}>{Math.round(zoom*100)}%</span>
          <button onClick={()=>{ const nz=Math.max(0.1,zoomRef.current/1.25); zoomRef.current=nz; setZoom(nz); }} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:14, lineHeight:1, padding:"0 4px" }}>−</button>
          <button onClick={fitView} title="Restablecer vista" style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:11, padding:"0 4px" }}>↺</button>
        </div>
        <span style={{ fontSize:10, color:"#bbb" }}>Arrastra el fondo para recorrer el diagrama (es ancho: trae ISO 9000 + BPMN) · Scroll = zoom</span>
        <button onClick={()=>setFullscr(f=>!f)} title="Pantalla completa" style={{ background:"none", border:`1px solid ${DESIGN.border}`, borderRadius:6, color:DESIGN.inkSoft, cursor:"pointer", padding:"4px 8px", fontSize:12, lineHeight:1 }}>
          {fullscr ? <ContractIcon/> : <ExpandIcon/>}
        </button>
      </div>
      <div style={{ background:"#fbfcfe", overflow:"hidden", flex: fullscr?1:"auto" }}>
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width:"100%", height: fullscr?"calc(100vh - 37px)":620, display:"block" }}>
          <defs>
            <marker id="dio-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M1 1L9 5L1 9" fill="none" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/>
            </marker>
          </defs>
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom}) translate(${-offX},${-offY})`}>
            <rect x={offX} y={offY} width={W} height={H} fill="transparent"
              onMouseDown={e=>{
                const r = svgRef.current.getBoundingClientRect();
                const { w, h } = dims.current;
                const rx=(e.clientX-r.left)*(w/r.width), ry=(e.clientY-r.top)*(h/r.height);
                dragRef.current = { mx0:rx, my0:ry, px0:panRef.current.x, py0:panRef.current.y };
              }}
              style={{ cursor:"grab" }}/>
            {edges.map(e => {
              const sv = byId[e.source], tv = byId[e.target];
              if (!sv || !tv) return null;
              return <path key={e.id} d={orthPath(sv, tv)} fill="none" stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#dio-arrow)"/>;
            })}
            {vertices.filter(v => v.kind === "container").map(v => <Shape key={v.id} v={v}/>)}
            {vertices.filter(v => v.kind !== "container").map(v => <Shape key={v.id} v={v}/>)}
          </g>
        </svg>
      </div>
    </div>
  );

  return fullscr
    ? <div style={{ position:"fixed", inset:0, zIndex:9999, background:"#fff" }}>{canvas}</div>
    : <div style={{ border:`1px solid ${DESIGN.border}`, borderRadius:10, overflow:"hidden" }}>{canvas}</div>;
}
