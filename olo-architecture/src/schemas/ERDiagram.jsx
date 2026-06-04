// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA · ERDiagram — Diagrama ER Radial interactivo
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from "react";
import { SOFTLAND_MODULES, OPS_MODULES } from "../data/softland.js";
import { MODULE_COLORS, OPS_COLORS, CLUSTER_COLORS } from "../data/constants.js";
import { SRO_COLORS } from "../data/sro.js";
import { SCO_COLORS } from "../data/sco.js";
import { EFW_COLORS } from "../data/efw.js";
import { ModuleChip, StatusBadge } from "../components/ui.jsx";

export function ERDiagram({ rows, storageKey }) {
  const [selected, setSelected] = useState(null);
  const [hovered,  setHovered]  = useState(null);

  const [posOv,   setPosOv]   = useState(()=>{ try{return storageKey?JSON.parse(localStorage.getItem(storageKey+'-radpos'))||{}:{};}catch{return {};} });
  const [erZoom,  setErZoom]  = useState(1);
  const [erPan,   setErPan]   = useState({x:0,y:0});
  const [fullscr, setFullscr] = useState(false);
  const erZoomRef = useRef(1);
  const erPanRef  = useRef({x:0,y:0});
  const erDragRef = useRef(null);
  const erPanDgRef= useRef(null);
  const erSvgRef  = useRef(null);
  const erDims    = useRef({w:1100,h:620});

  useEffect(()=>{document.body.style.overflow=fullscr?'hidden':'';return()=>{document.body.style.overflow='';};}, [fullscr]);

  useEffect(()=>{
    const onMove=(e)=>{
      const svg=erSvgRef.current; if(!svg) return;
      const r=svg.getBoundingClientRect();
      const {w,h}=erDims.current;
      const rx=(e.clientX-r.left)*(w/r.width), ry=(e.clientY-r.top)*(h/r.height);
      const pd=erPanDgRef.current;
      if(pd){ const np={x:pd.px0+(rx-pd.mx0),y:pd.py0+(ry-pd.my0)}; erPanRef.current=np; setErPan(np); return; }
      const d=erDragRef.current; if(!d) return;
      const dx=(rx-d.mx0)/erZoomRef.current, dy=(ry-d.my0)/erZoomRef.current;
      if(Math.abs(dx)>2||Math.abs(dy)>2) d.moved=true;
      setPosOv(prev=>({...prev,[d.id]:{x:d.ox+dx,y:d.oy+dy}}));
    };
    const onUp=()=>{
      erPanDgRef.current=null;
      if(!erDragRef.current) return;
      erDragRef.current=null;
      if(storageKey) setPosOv(prev=>{ localStorage.setItem(storageKey+'-radpos',JSON.stringify(prev)); return prev; });
    };
    window.addEventListener('mousemove',onMove); window.addEventListener('mouseup',onUp);
    return()=>{ window.removeEventListener('mousemove',onMove); window.removeEventListener('mouseup',onUp); };
  },[storageKey]);

  useEffect(()=>{
    const svg=erSvgRef.current; if(!svg) return;
    const onWh=(e)=>{
      e.preventDefault();
      const factor=e.deltaY<0?1.15:1/1.15;
      const newZ=Math.max(0.15,Math.min(8,erZoomRef.current*factor));
      const r=svg.getBoundingClientRect();
      const {w,h}=erDims.current;
      const rx=(e.clientX-r.left)*(w/r.width), ry=(e.clientY-r.top)*(h/r.height);
      const dz=newZ/erZoomRef.current;
      const np={x:rx-dz*(rx-erPanRef.current.x),y:ry-dz*(ry-erPanRef.current.y)};
      erZoomRef.current=newZ; erPanRef.current=np; setErZoom(newZ); setErPan(np);
    };
    svg.addEventListener('wheel',onWh,{passive:false});
    return()=>svg.removeEventListener('wheel',onWh);
  },[fullscr]);

  const resetER=()=>{ setPosOv({}); setErZoom(1); setErPan({x:0,y:0}); erZoomRef.current=1; erPanRef.current={x:0,y:0}; if(storageKey) localStorage.removeItem(storageKey+'-radpos'); };

  const W=1100, H=620, NW=100, NH=44;
  erDims.current={w:W,h:H};

  function getModInfo(code) {
    return SOFTLAND_MODULES.find(m=>m.code===code) || OPS_MODULES.find(m=>m.code===code) || null;
  }
  function modColor(code) {
    return MODULE_COLORS[code] || OPS_COLORS[code] || CLUSTER_COLORS[code] || SRO_COLORS[code] || SCO_COLORS[code] || EFW_COLORS[code] || "#7f8c8d";
  }

  const codes = [...new Set([...rows.map(r=>r.from),...rows.map(r=>r.to)])].filter(c=>c!=="*");
  const deg = c => rows.filter(r=>r.from===c||r.to===c).length;
  const sorted = [...codes].sort((a,b)=>deg(b)-deg(a));
  const cx=W/2, cy=H/2;
  const pos = {};
  sorted.forEach((code,i)=>{
    if (i===0) { pos[code]={x:cx,y:cy}; return; }
    const innerN = Math.min(7, sorted.length-1);
    if (i<=innerN) {
      const angle=(2*Math.PI*(i-1)/innerN)-Math.PI/2;
      const r = sorted.length>8 ? 178 : 155;
      pos[code]={x:cx+r*Math.cos(angle), y:cy+r*Math.sin(angle)};
    } else {
      const outerN = sorted.length-1-Math.min(7,sorted.length-1);
      const angle=(2*Math.PI*(i-1-Math.min(7,sorted.length-1))/outerN)-Math.PI/6;
      const r=335;
      pos[code]={
        x:Math.max(NW/2+8,Math.min(W-NW/2-8, cx+r*Math.cos(angle))),
        y:Math.max(NH/2+8,Math.min(H-NH/2-8, cy+r*Math.sin(angle)))
      };
    }
  });

  const effectivePos = Object.fromEntries(
    Object.entries(pos).map(([k,v])=>[k, posOv[k]?{...v,...posOv[k]}:v])
  );

  const pairMap={};
  rows.forEach(row=>{
    const k=`${row.from}||${row.to}`;
    if(!pairMap[k]) pairMap[k]={from:row.from,to:row.to,count:0,status:"inferred",whats:[]};
    pairMap[k].count++;
    pairMap[k].whats.push(row.what);
    if(row.status==="confirmed") pairMap[k].status="confirmed";
    else if(row.status==="partial"&&pairMap[k].status!=="confirmed") pairMap[k].status="partial";
  });
  const pairs = Object.values(pairMap);

  function makePath(from, to) {
    const f=effectivePos[from], t=effectivePos[to];
    if(!f||!t) return "";
    const dx=t.x-f.x, dy=t.y-f.y, len=Math.sqrt(dx*dx+dy*dy);
    if(len<1) return "";
    const nx=dx/len, ny=dy/len;
    const sx=f.x+nx*(NW/2+2),  sy=f.y+ny*(NH/2+2);
    const ex=t.x-nx*(NW/2+11), ey=t.y-ny*(NH/2+11);
    const qx=(sx+ex)/2-ny*22,  qy=(sy+ey)/2+nx*22;
    return `M${sx.toFixed(1)},${sy.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
  }

  const active = selected || hovered;
  const isConn  = (a,b) => rows.some(r=>(r.from===a&&r.to===b)||(r.to===a&&r.from===b));
  const nodeDim = code => !!active && active!==code && !isConn(active,code);
  const pairHl  = p => !!active && (p.from===active||p.to===active);
  const pairDim = p => !!active && !pairHl(p);

  function edgeColor(p) {
    if(!pairHl(p)) return "#d1d5db";
    return p.status==="confirmed"?"#27ae60":p.status==="partial"?"#f39c12":"#9b59b6";
  }
  function markerId(p) {
    if(!pairHl(p)) return "url(#mDim)";
    return p.status==="confirmed"?"url(#mConf)":p.status==="partial"?"url(#mPart)":"url(#mInf)";
  }

  const selOut = selected ? rows.filter(r=>r.from===selected) : [];
  const selInc = selected ? rows.filter(r=>r.to===selected)   : [];
  const selCol = selected ? modColor(selected) : "#888";
  const selMod = selected ? getModInfo(selected) : null;

  const erControls = (
    <div style={{ display:"flex", gap:8, alignItems:"center", padding:"6px 10px", background:"#f8fafc", borderBottom:"1px solid #e0e0e0", flexShrink:0 }}>
      <span style={{ fontSize:10, fontWeight:600, color:"#888" }}>Diagrama ER</span>
      <div style={{ display:"flex", alignItems:"center", gap:3, background:"#f0f0f0", borderRadius:5, padding:"2px 6px" }}>
        <button onClick={()=>{const nz=Math.min(8,erZoomRef.current*1.25);erZoomRef.current=nz;setErZoom(nz);}} style={{ background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:14,lineHeight:1,padding:"0 2px" }}>+</button>
        <span style={{ fontSize:10, color:"#888", minWidth:34, textAlign:"center" }}>{Math.round(erZoom*100)}%</span>
        <button onClick={()=>{const nz=Math.max(0.15,erZoomRef.current/1.25);erZoomRef.current=nz;setErZoom(nz);}} style={{ background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:14,lineHeight:1,padding:"0 2px" }}>−</button>
        <button onClick={resetER} title="Resetear" style={{ background:"none",border:"none",color:"#aaa",cursor:"pointer",fontSize:10,padding:"0 3px" }}>↺</button>
      </div>
      <span style={{ fontSize:10, color:"#bbb", flex:1 }}>Scroll=zoom · Arrastra nodo · Drag fondo=pan</span>
      {selected && <button onClick={()=>setSelected(null)} style={{ fontSize:10, padding:"2px 8px", borderRadius:4, border:"1px solid #ddd", background:"#fff", cursor:"pointer", color:"#666" }}>✕ {selected}</button>}
      <button onClick={()=>setFullscr(f=>!f)} style={{ fontSize:13, padding:"2px 8px", borderRadius:5, border:"1px solid #ddd", background:fullscr?"#1d4ed8":"#fff", color:fullscr?"#fff":"#666", cursor:"pointer" }} title="Pantalla completa">
        {fullscr?"⊠":"⛶"}
      </button>
    </div>
  );

  const erDiagram = (
    <div style={{ display:"flex", flexDirection:"column", height:fullscr?"100vh":"auto" }}>
      {erControls}
      {selected && (
        <div style={{ background:"#fff", border:`1px solid ${selCol}44`, borderLeft:`4px solid ${selCol}`, borderRadius:10, padding:"14px 18px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <ModuleChip code={selected} size="lg"/>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:"#1D1D1B" }}>{selMod?.name||selected}</div>
                {selMod?.role && <div style={{ fontSize:11, color:"#777", fontStyle:"italic" }}>{selMod.role}</div>}
              </div>
              {selOut.length>0 && <span style={{ fontSize:11, color:selCol, background:selCol+"15", padding:"3px 10px", borderRadius:6, fontWeight:600 }}>↗ {selOut.length} envía</span>}
              {selInc.length>0 && <span style={{ fontSize:11, color:"#7f8c8d", background:"#ecf0f1", padding:"3px 10px", borderRadius:6, fontWeight:600 }}>↙ {selInc.length} recibe</span>}
            </div>
            <button onClick={()=>setSelected(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:16, padding:4 }}>✕</button>
          </div>
          <div style={{ marginTop:12, display:"grid", gridTemplateColumns:selOut.length&&selInc.length?"1fr 1fr":"1fr", gap:12 }}>
            {selOut.length>0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:selCol, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6 }}>↗ Envía hacia</div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {selOut.map((r,i)=>{
                    const tm=getModInfo(r.to); const tc=modColor(r.to);
                    return <div key={i} onClick={()=>setSelected(r.to)} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 10px", borderRadius:6, cursor:"pointer", background:"#fafafa", border:`1px solid ${tc}22` }}>
                      <ModuleChip code={r.to}/>
                      <span style={{ fontSize:11, color:"#333", flex:1, fontWeight:500 }}>{tm?.name||r.to}</span>
                      <StatusBadge status={r.status}/>
                    </div>;
                  })}
                </div>
              </div>
            )}
            {selInc.length>0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#7f8c8d", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6 }}>↙ Recibe de</div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {selInc.map((r,i)=>{
                    const fm=getModInfo(r.from); const fc=modColor(r.from);
                    return <div key={i} onClick={()=>setSelected(r.from)} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 10px", borderRadius:6, cursor:"pointer", background:"#fafafa", border:`1px solid ${fc}22` }}>
                      <ModuleChip code={r.from}/>
                      <span style={{ fontSize:11, color:"#333", flex:1, fontWeight:500 }}>{fm?.name||r.from}</span>
                      <StatusBadge status={r.status}/>
                    </div>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ background:"#f8fafc", border:"1px solid #e0e0e0", borderRadius:fullscr?0:12, overflow:"auto", flex:fullscr?1:"auto" }}>
        <svg ref={erSvgRef} viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:fullscr?"calc(100vh - 80px)":"auto", display:"block", fontFamily:"'Segoe UI',sans-serif" }}>
          <defs>
            {[["mConf","#27ae60"],["mPart","#f39c12"],["mInf","#9b59b6"],["mDim","#d1d5db"]].map(([id,c])=>(
              <marker key={id} id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M1 2L8 5L1 8" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
              </marker>
            ))}
          </defs>

          <g transform={`translate(${erPan.x},${erPan.y}) scale(${erZoom})`}>
          <rect width={W} height={H} fill="transparent" style={{cursor:'grab'}}
            onMouseDown={e=>{
              if(erDragRef.current) return;
              const r=erSvgRef.current?.getBoundingClientRect(); if(!r) return;
              const {w,h}=erDims.current;
              erPanDgRef.current={mx0:(e.clientX-r.left)*(w/r.width),my0:(e.clientY-r.top)*(h/r.height),px0:erPanRef.current.x,py0:erPanRef.current.y};
            }}
          />

          {pairs.map((p,i)=>{
            const d=makePath(p.from,p.to);
            if(!d) return null;
            const hl=pairHl(p), dim=pairDim(p);
            return (
              <path key={i} d={d} fill="none"
                stroke={edgeColor(p)}
                strokeWidth={hl?2.5:1}
                strokeOpacity={dim?0.05:hl?0.88:0.28}
                strokeDasharray={p.status==="inferred"?"5 3":"0"}
                markerEnd={markerId(p)}
                style={{ transition:"stroke-opacity 0.18s, stroke-width 0.18s" }}
              />
            );
          })}

          {codes.map(code=>{
            const p=effectivePos[code]; if(!p) return null;
            const mod=getModInfo(code);
            const color=modColor(code);
            const isSel=selected===code, isHov=hovered===code;
            const faded=nodeDim(code);
            const label=(mod?.name||code);
            const short=label.length>15?label.slice(0,14)+"…":label;

            return (
              <g key={code}
                onClick={()=>{ if(!erDragRef.current?.moved) setSelected(selected===code?null:code); }}
                onMouseEnter={()=>setHovered(code)}
                onMouseLeave={()=>setHovered(null)}
                onMouseDown={e=>{
                  e.stopPropagation();
                  const r=erSvgRef.current?.getBoundingClientRect(); if(!r) return;
                  const {w,h}=erDims.current;
                  erDragRef.current={id:code,ox:p.x,oy:p.y,mx0:(e.clientX-r.left)*(w/r.width),my0:(e.clientY-r.top)*(h/r.height),moved:false};
                }}
                style={{ cursor:"grab", opacity:faded?0.15:1, transition:"opacity 0.18s" }}>
                {isSel && <rect x={p.x-NW/2-5} y={p.y-NH/2-5} width={NW+10} height={NH+10} rx="13" fill={color+"1a"} stroke={color+"44"} strokeWidth="1.2"/>}
                <rect x={p.x-NW/2} y={p.y-NH/2} width={NW} height={NH} rx="8"
                  fill={isSel?color+"18":"#ffffff"}
                  stroke={isSel||isHov?color:"#d1d5db"}
                  strokeWidth={isSel?2.2:isHov?1.6:0.8}/>
                <text x={p.x} y={p.y-5} textAnchor="middle"
                  fill={color} fontSize="12" fontWeight="700"
                  fontFamily="'JetBrains Mono','Consolas',monospace">{code}</text>
                <text x={p.x} y={p.y+10} textAnchor="middle" fill={isSel?"#444":"#999"} fontSize="8.2">{short}</text>
              </g>
            );
          })}
          </g>
        </svg>
      </div>

      <div style={{ display:"flex", gap:18, alignItems:"center", flexWrap:"wrap", padding:"8px 14px", background:"#fafafa", border:"1px solid #e8e8e8", borderRadius:8, fontSize:11, color:"#666", flexShrink:0 }}>
        {[["#27ae60","Confirmado","0"],["#f39c12","Parcial","0"],["#9b59b6","Inferido","5 3"]].map(([c,l,d])=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <svg width="34" height="10">
              <path d="M2,5 Q17,2 30,5" fill="none" stroke={c} strokeWidth="2" strokeDasharray={d}/>
              <path d="M26,3.5 L30,5 L26,6.5" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{l}</span>
          </div>
        ))}
        <span style={{ marginLeft:"auto", fontSize:10, color:"#bbb" }}>Click módulo · Arrastra nodo · Scroll zoom</span>
      </div>
    </div>
  );

  return fullscr
    ? <div style={{ position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:9999,background:"#f8fafc" }}>{erDiagram}</div>
    : erDiagram;
}
