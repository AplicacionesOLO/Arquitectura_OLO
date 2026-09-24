// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA · ERDiagramRelational — Diagrama relacional FK (previously SRODiagramView)
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from "react";
import { SRO_GROUPS, SRO_TABLE_DEFS, RELATION_META } from "../data/sro.js";
import { DESIGN } from "../data/constants.js";
import { LinkIcon } from "../components/icons.jsx";

export function ERDiagramRelational({ activeGroups, selectedTable, setSelectedTable, getRelation, sroRows, GR=SRO_GROUPS, TD=SRO_TABLE_DEFS, storageKey="olo-er" }) {

  const [posOv,    setPosOv]    = useState(()=>{ try{return JSON.parse(localStorage.getItem(storageKey+'-pos'))||{};}catch{return {};} });
  const [erZoom,   setErZoom]   = useState(1);
  const [erPan,    setErPan]    = useState({x:0,y:0});
  const [fullscr,  setFullscr]  = useState(false);
  const erZoomRef  = useRef(1);
  const erPanRef   = useRef({x:0,y:0});
  const erDragRef  = useRef(null);
  const erPanDgRef = useRef(null);
  const erSvgRef   = useRef(null);
  const boxRef     = useRef(null);      // contenedor del lienzo (área visible)
  const limitesRef = useRef({});        // clúster de cada tabla: x/y mínimos y máximos

  useEffect(()=>{ document.body.style.overflow=fullscr?'hidden':''; return()=>{document.body.style.overflow='';};}, [fullscr]);

  const TW=200, TH_HD=22, TH_PK=13, TH_ROW=11, COL_W=260, COL_GAP=90, GRP_GAP=16, TBL_GAP=6, PX=18, PY=20;

  const visibleTables = new Set(
    Object.entries(GR).filter(([k])=>activeGroups.has(k)).flatMap(([,g])=>g.tables)
  );

  const tableH = t => {
    const d=TD[t];
    const fk=(d?.cols||[]).filter(c=>c.includes('→')).length;
    const da=(d?.cols||[]).filter(c=>!c.includes('→')).length;
    return TH_HD + TH_PK + Math.min(fk,5)*TH_ROW + Math.min(da,2)*TH_ROW + 8;
  };

  const groupKeys = Object.keys(GR).filter(k=>activeGroups.has(k)&&GR[k].tables.some(t=>visibleTables.has(t)));
  const cols=[[],[],[]]; const colH=[0,0,0];
  groupKeys.forEach(k=>{
    const h=22+GR[k].tables.filter(t=>visibleTables.has(t)).reduce((s,t)=>s+tableH(t)+TBL_GAP,0)+GRP_GAP;
    const ci=colH.indexOf(Math.min(...colH));
    cols[ci].push(k); colH[ci]+=h;
  });

  const tPos={}, gPos={};
  cols.forEach((grps,ci)=>{
    const bx=ci*(COL_W+COL_GAP)+PX; let y=PY;
    grps.forEach(gk=>{
      const tables=GR[gk].tables.filter(t=>visibleTables.has(t));
      const gh=22+tables.reduce((s,t)=>s+tableH(t)+TBL_GAP,0)+GRP_GAP-TBL_GAP+8;
      gPos[gk]={x:bx-6,y,w:COL_W+12,h:gh};
      y+=24;
      tables.forEach(t=>{ tPos[t]={x:bx+4,y,w:TW,h:tableH(t),gk}; y+=tableH(t)+TBL_GAP; });
      y+=GRP_GAP;
    });
  });

  const svgW=3*(COL_W+COL_GAP)+PX*2-COL_GAP;
  const svgH=Math.max(...colH)+PY*2+40;

  // Una tabla solo puede moverse dentro del recuadro de su clúster
  const limites = Object.fromEntries(Object.entries(tPos).map(([t,p])=>{
    const g=gPos[p.gk];
    return [t, { x0:g.x+4, x1:g.x+g.w-p.w-4, y0:g.y+22, y1:Math.max(g.y+22, g.y+g.h-p.h-4) }];
  }));
  useEffect(() => { limitesRef.current = limites; }); // el arrastre lee los límites vigentes
  const acotar = (t, x, y) => { const l=limites[t]; return l ? { x:Math.min(l.x1,Math.max(l.x0,x)), y:Math.min(l.y1,Math.max(l.y0,y)) } : { x, y }; };

  const effectiveTPos = Object.fromEntries(
    Object.entries(tPos).map(([t,p])=>[t, posOv[t]?{...p,...acotar(t, posOv[t].x, posOv[t].y)}:p])
  );

  useEffect(()=>{
    const onMove=(e)=>{
      const svg=erSvgRef.current; if(!svg) return;
      const r=svg.getBoundingClientRect();
      const rx=e.clientX-r.left, ry=e.clientY-r.top;
      const pd=erPanDgRef.current;
      if(pd){ const np={x:pd.px0+(rx-pd.mx0),y:pd.py0+(ry-pd.my0)}; erPanRef.current=np; setErPan(np); return; }
      const d=erDragRef.current; if(!d) return;
      const dx=(rx-d.mx0)/erZoomRef.current, dy=(ry-d.my0)/erZoomRef.current;
      if(Math.abs(dx)>2||Math.abs(dy)>2) d.moved=true;
      const l=limitesRef.current[d.id];
      const x=d.ox+dx, y=d.oy+dy;
      const np=l?{x:Math.min(l.x1,Math.max(l.x0,x)), y:Math.min(l.y1,Math.max(l.y0,y))}:{x,y};
      setPosOv(prev=>({...prev,[d.id]:np}));
    };
    const onUp=()=>{
      erPanDgRef.current=null;
      if(!erDragRef.current) return;
      erDragRef.current=null;
      setPosOv(prev=>{ localStorage.setItem(storageKey+'-pos',JSON.stringify(prev)); return prev; });
    };
    window.addEventListener('mousemove',onMove); window.addEventListener('mouseup',onUp);
    return()=>{ window.removeEventListener('mousemove',onMove); window.removeEventListener('mouseup',onUp); };
  },[storageKey]);

  useEffect(()=>{
    const svg=erSvgRef.current; if(!svg) return;
    const onWh=(e)=>{
      e.preventDefault();
      const factor=e.deltaY<0?1.15:1/1.15;
      const newZ=Math.max(0.1,Math.min(8,erZoomRef.current*factor));
      const r=svg.getBoundingClientRect();
      const rx=e.clientX-r.left, ry=e.clientY-r.top;
      const dz=newZ/erZoomRef.current;
      const np={x:rx-dz*(rx-erPanRef.current.x),y:ry-dz*(ry-erPanRef.current.y)};
      erZoomRef.current=newZ; erPanRef.current=np; setErZoom(newZ); setErPan(np);
    };
    svg.addEventListener('wheel',onWh,{passive:false});
    return()=>svg.removeEventListener('wheel',onWh);
  },[fullscr]);

  const ajustar=()=>{
    const el=boxRef.current; if(!el) return;
    const z=Math.max(0.1, Math.min(1.2, (el.clientWidth-24)/svgW, (el.clientHeight-24)/svgH));
    const np={x:(el.clientWidth-svgW*z)/2, y:12};
    erZoomRef.current=z; erPanRef.current=np; setErZoom(z); setErPan(np);
  };
  // zoom con los botones: centrado en el área visible
  const zoomBoton=(f)=>{
    const el=boxRef.current; const cx=el?el.clientWidth/2:0, cy=el?el.clientHeight/2:0;
    const nz=Math.max(0.1,Math.min(8,erZoomRef.current*f)); const dz=nz/erZoomRef.current;
    const np={x:cx-dz*(cx-erPanRef.current.x), y:cy-dz*(cy-erPanRef.current.y)};
    erZoomRef.current=nz; erPanRef.current=np; setErZoom(nz); setErPan(np);
  };
  const resetER=()=>{ setPosOv({}); localStorage.removeItem(storageKey+'-pos'); ajustar(); };
  // al abrir (y al cambiar de pantalla completa) el diagrama arranca encuadrado
  useEffect(()=>{ const id=requestAnimationFrame(ajustar); return ()=>cancelAnimationFrame(id); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[fullscr, storageKey]);

  const edgePts=(from,to)=>{
    const f=effectiveTPos[from],t=effectiveTPos[to]; if(!f||!t) return null;
    const fy=f.y+f.h/2, ty=t.y+t.h/2;
    if(t.x>=f.x+f.w+4) return [{x:f.x+f.w,y:fy},{x:t.x,y:ty}];
    if(t.x+t.w+4<=f.x) return [{x:f.x,y:fy},{x:t.x+t.w,y:ty}];
    if(t.y>f.y+f.h)    return [{x:f.x+f.w*0.7,y:f.y+f.h},{x:t.x+t.w*0.7,y:t.y}];
    if(t.y+t.h<f.y)    return [{x:f.x+f.w*0.3,y:f.y},{x:t.x+t.w*0.3,y:t.y+t.h}];
    const side=f.x+COL_W+COL_GAP/2;
    return [{x:f.x+f.w,y:fy,mid:side},{x:t.x+t.w,y:ty,mid:side}];
  };
  const makePath=([p1,p2])=>{
    if(!p1||!p2) return "";
    if(p1.mid){ const mx=p1.mid; return `M${p1.x},${p1.y}C${mx},${p1.y} ${mx},${p2.y} ${p2.x},${p2.y}`; }
    const dx=p2.x-p1.x, dy=p2.y-p1.y;
    if(Math.abs(dy)<3) return `M${p1.x},${p1.y}L${p2.x},${p2.y}`;
    if(Math.abs(dx)<3) return `M${p1.x},${p1.y}L${p2.x},${p2.y}`;
    const mx=(p1.x+p2.x)/2;
    return Math.abs(dx)>Math.abs(dy)
      ? `M${p1.x},${p1.y}C${mx},${p1.y} ${mx},${p2.y} ${p2.x},${p2.y}`
      : `M${p1.x},${p1.y}C${p1.x},${(p1.y+p2.y)/2} ${p2.x},${(p1.y+p2.y)/2} ${p2.x},${p2.y}`;
  };
  const getFKLabel=what=>{
    if(!what) return '';
    const m=what.match(/[.\s](\w+)\s*→/); if(m) return m[1];
    return what.split('→')[0].trim().split(' ').pop().split('.').pop();
  };
  const edgeColor=row=>{
    if(!selectedTable) return "#94a3b8";
    if(row.from===selectedTable) return "#f59e0b";
    if(row.to===selectedTable)   return "#ef4444";
    return "#94a3b8";
  };
  const visRows=sroRows.filter(r=>visibleTables.has(r.from)&&visibleTables.has(r.to));

  const diagramContent = (
    <div style={{ display:"flex", flexDirection:"column", height:fullscr?"100vh":"auto" }}>
      <div style={{ padding:"7px 12px", background:"#1e293b", borderBottom:"1px solid #334155", fontSize:11, color:"#94a3b8", display:"flex", gap:12, alignItems:"center", flexShrink:0 }}>
        <span style={{ fontWeight:700, color:"#e2e8f0" }}>Diagrama Relacional FK</span>
        <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><LinkIcon/> {visRows.length} relaciones</span>
        {!selectedTable && <span style={{ color:"#94a3b8" }}>Click tabla → resalta FK · Arrastra tabla → la reubica dentro de su módulo · Arrastra el fondo → desplaza · Rueda → zoom</span>}
        {selectedTable && <span style={{ color:"#93c5fd", fontWeight:600, fontSize:10 }}>
          <b style={{color:"#f59e0b"}}>⬆</b> apunta desde {selectedTable} &nbsp;·&nbsp; <b style={{color:"#ef4444"}}>⬇</b> apunta hacia {selectedTable}
        </span>}
        <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:3, background:"rgba(255,255,255,0.07)", borderRadius:5, padding:"2px 7px" }}>
            <button onClick={()=>zoomBoton(1.25)} title="Acercar" style={{ background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:15,lineHeight:1 }}>+</button>
            <span style={{ fontSize:10, color:"#64748b", minWidth:34, textAlign:"center" }}>{Math.round(erZoom*100)}%</span>
            <button onClick={()=>zoomBoton(1/1.25)} title="Alejar" style={{ background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:15,lineHeight:1 }}>−</button>
            <button onClick={ajustar} title="Encuadrar todo el diagrama" style={{ background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:11 }}>Ajustar</button>
            <button onClick={resetER} style={{ background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:10 }} title="Volver las tablas a su posición original">↺</button>
          </div>
          {selectedTable && <button onClick={()=>setSelectedTable(null)} style={{ fontSize:10, padding:"2px 8px", borderRadius:4, border:"1px solid #334155", background:"transparent", color:"#94a3b8", cursor:"pointer" }}>✕</button>}
          <button onClick={()=>setFullscr(f=>!f)} style={{ fontSize:13, padding:"3px 8px", borderRadius:5, border:"1px solid #334155", background:fullscr?"#1d4ed8":"transparent", color:fullscr?"#fff":"#94a3b8", cursor:"pointer" }} title="Pantalla completa">
            {fullscr?"⊠":"⛶"}
          </button>
        </div>
      </div>
      <div ref={boxRef} style={{ overflow:"hidden", ...(fullscr ? { flex:1, minHeight:0 } : { height:"min(72vh, 760px)" }), background:"#f8faff", position:"relative" }}>
      <svg ref={erSvgRef} width="100%" height="100%" style={{ display:"block", fontFamily:"'Segoe UI',sans-serif", userSelect:"none" }}>
        <defs>
          {[["fkD","#94a3b8"],["fkHL","#1d4ed8"],["fkDep","#f59e0b"],["fkImp","#ef4444"]].map(([id,c])=>(
            <marker key={id} id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M1 2L8 5L1 8" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
            </marker>
          ))}
        </defs>
        {/* Fondo que capta el arrastre: cubre SIEMPRE todo el lienzo (no se mueve con el contenido) */}
        <rect x={0} y={0} width="100%" height="100%" fill="transparent"
          style={{cursor:'grab'}}
          onMouseDown={e=>{
            if(erDragRef.current) return;
            const r=erSvgRef.current?.getBoundingClientRect(); if(!r) return;
            erPanDgRef.current={mx0:e.clientX-r.left,my0:e.clientY-r.top,px0:erPanRef.current.x,py0:erPanRef.current.y};
          }}
        />
        <g transform={`translate(${erPan.x},${erPan.y}) scale(${erZoom})`} style={{ pointerEvents:"none" }}>

        {Object.entries(gPos).map(([gk,gp])=>{
          const g=GR[gk];
          return <g key={gk}>
            <rect x={gp.x} y={gp.y} width={gp.w} height={gp.h} rx={7} fill={g.color+"09"} stroke={g.color+"44"} strokeWidth={0.8}/>
            <rect x={gp.x} y={gp.y} width={gp.w} height={18} rx={7} fill={g.color+"22"}/>
            <rect x={gp.x} y={gp.y+10} width={gp.w} height={8} fill={g.color+"22"}/>
            <text x={gp.x+8} y={gp.y+13} fontSize={8} fontWeight={700} fill={g.color} letterSpacing={0.1}>{g.label.toUpperCase()}</text>
          </g>;
        })}

        {visRows.filter(row=>selectedTable&&!(row.from===selectedTable||row.to===selectedTable)).map((row,i)=>{
          const pts=edgePts(row.from,row.to); if(!pts) return null;
          return <path key={`d${i}`} d={makePath(pts)} fill="none" stroke="#94a3b8" strokeWidth={0.6} strokeOpacity={0.18} markerEnd="url(#fkD)"/>;
        })}
        {!selectedTable && visRows.map((row,i)=>{
          const pts=edgePts(row.from,row.to); if(!pts) return null;
          const mx=(pts[0].x+pts[1].x)/2, my=(pts[0].y+pts[1].y)/2;
          const label=getFKLabel(row.what);
          return <g key={`n${i}`}>
            <path d={makePath(pts)} fill="none" stroke="#94a3b8" strokeWidth={0.7} strokeOpacity={0.4} markerEnd="url(#fkD)"/>
            {label && <text x={mx} y={my-3} textAnchor="middle" fontSize={7} fill="#b0b8c8" fontFamily={DESIGN.font}>{label}</text>}
          </g>;
        })}
        {selectedTable && visRows.filter(r=>r.from===selectedTable||r.to===selectedTable).map((row,i)=>{
          const pts=edgePts(row.from,row.to); if(!pts) return null;
          const mx=(pts[0].x+pts[1].x)/2, my=(pts[0].y+pts[1].y)/2;
          const col=edgeColor(row);
          const mId=row.from===selectedTable?"url(#fkDep)":"url(#fkImp)";
          const label=getFKLabel(row.what);
          return <g key={`h${i}`}>
            <path d={makePath(pts)} fill="none" stroke={col} strokeWidth={1.8} strokeOpacity={0.85} markerEnd={mId}/>
            {label && <>
              <rect x={mx-label.length*3} y={my-11} width={label.length*6+6} height={11} rx={3} fill="white" opacity={0.88}/>
              <text x={mx} y={my-3} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={col} fontFamily={DESIGN.font}>{label}</text>
            </>}
          </g>;
        })}

        {Object.entries(effectiveTPos).map(([table,pos])=>{
          const def=TD[table];
          const fkCols=(def?.cols||[]).filter(c=>c.includes('→'));
          const daCols=(def?.cols||[]).filter(c=>!c.includes('→')).slice(0,2);
          const col=GR[pos.gk]?.color||"#888";
          const rel=getRelation(table);
          const relM=rel?RELATION_META[rel]:null;
          const bdrCol=relM?.border||col+"66";
          const bgCol=relM?.bg||"#fff";
          const isSel=rel==="selected";
          const dim=rel==="none";
          let y0=pos.y+TH_HD+TH_PK;
          return (
            <g key={table} style={{ cursor:"grab", opacity:dim?0.15:1, pointerEvents:"all" }}
              onClick={()=>{ if(!erDragRef.current?.moved) setSelectedTable(prev=>prev===table?null:table); }}
              onMouseDown={e=>{
                e.stopPropagation();
                const r=erSvgRef.current?.getBoundingClientRect(); if(!r) return;
                erDragRef.current={id:table,ox:pos.x,oy:pos.y,mx0:e.clientX-r.left,my0:e.clientY-r.top,moved:false};
              }}>
              <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx={5} fill={bgCol} stroke={bdrCol} strokeWidth={isSel?2:0.9}/>
              <rect x={pos.x} y={pos.y} width={pos.w} height={TH_HD} rx={5} fill={isSel?col:col+"22"}/>
              <rect x={pos.x} y={pos.y+TH_HD-3} width={pos.w} height={3} fill={isSel?col:col+"22"}/>
              <text x={pos.x+6} y={pos.y+14} fontSize={9} fontWeight={700} fill={isSel?"#fff":col} fontFamily={DESIGN.font}>{table}</text>
              <text x={pos.x+5} y={pos.y+TH_HD+TH_PK-1} fontSize={8} fill="#b45309" fontFamily={DESIGN.font}>{def?.pk||"id"}</text>
              {fkCols.slice(0,5).map((c,ci)=>{
                const [field,ref]=c.split('→'); y0=pos.y+TH_HD+TH_PK+(ci+1)*TH_ROW+2;
                return <text key={c} x={pos.x+5} y={y0} fontSize={8} fontFamily={DESIGN.font}>
                  <tspan fill={col} fontWeight={600}>{field?.trim()}</tspan>
                  <tspan fill={col} opacity={0.55}> →{ref?.trim()}</tspan>
                </text>;
              })}
              {fkCols.length>5 && <text x={pos.x+5} y={pos.y+TH_HD+TH_PK+6*TH_ROW+2} fontSize={7.5} fill="#bbb" fontFamily={DESIGN.font}>+{fkCols.length-5} FK…</text>}
              {daCols.map((c,ci)=>{
                const dy=pos.y+TH_HD+TH_PK+(Math.min(fkCols.length,5)+ci+1)*TH_ROW+2;
                return <text key={c} x={pos.x+5} y={dy} fontSize={8} fill="#aaa" fontFamily={DESIGN.font}>· {c}</text>;
              })}
            </g>
          );
        })}
        </g>
      </svg>
      </div>
    </div>
  );

  return fullscr
    ? <div style={{ position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:9999,background:"#f8faff" }}>
        {diagramContent}
      </div>
    : <div style={{ border:"1px solid #e0e0e0", borderRadius:10, overflow:"hidden" }}>
        {diagramContent}
      </div>;
}
