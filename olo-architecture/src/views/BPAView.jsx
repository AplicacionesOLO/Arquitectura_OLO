// ═══════════════════════════════════════════════════════════════════════════
// VISTA · BPA
// ═══════════════════════════════════════════════════════════════════════════
import { BPA_PROCESSES as BPA_PROCS } from "../data/softland.js";
import { BPA_AREA_COLORS as BPA_COLORS, MATURITY_TINTS } from "../data/constants.js";
import { KPICard, DetailPanel, ModuleChip } from "../components/ui.jsx";

export function BPAView({ selected, setSelected }) {
  const allProcs=[...BPA_PROCS.estrategicos.map(p=>({...p,area:"estrategicos"})),...BPA_PROCS.negocio.map(p=>({...p,area:"negocio"})),...BPA_PROCS.apoyo.map(p=>({...p,area:"apoyo"})),...BPA_PROCS.control.map(p=>({...p,area:"control"}))];
  const selProc=allProcs.find(p=>p.name===selected);
  const total=allProcs.length, withCov=allProcs.filter(p=>p.coverage&&p.coverage.length>0).length;
  const avgMat=(allProcs.reduce((s,p)=>s+p.maturity,0)/total).toFixed(2);
  return <div>
    <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
      <KPICard label="Procesos totales" value={total} color="#1D1D1B"/>
      <KPICard label="Con cobertura sistema" value={`${withCov}/${total}`} color="#27ae60"/>
      <KPICard label="Madurez promedio" value={`${avgMat}/5`} color="#f39c12" sub="Talento Humano (3) lidera"/>
      <KPICard label="Estratégicos" value={BPA_PROCS.estrategicos.length} color="#27ae60"/>
      <KPICard label="Negocio" value={BPA_PROCS.negocio.length} color="#f39c12"/>
      <KPICard label="Apoyo · Control" value={BPA_PROCS.apoyo.length+BPA_PROCS.control.length} color="#9b59b6"/>
    </div>
    <div style={{ background:"rgba(243,156,18,0.07)", border:"1px solid rgba(243,156,18,0.22)", borderLeft:"3px solid #f39c12", borderRadius:8, padding:"10px 14px", marginBottom:22, fontSize:12, color:"#666", lineHeight:1.6 }}>
      <b style={{ color:"#d35400" }}>Fuente:</b> Informe Final Diagnóstico Procesos OLO · CICR · diciembre 2024. Topología: estratégicos arriba, apoyo a la izquierda, procesos de negocio (misionales) al centro, control a la derecha. Click en cualquier proceso para ver qué módulos del ecosistema lo soportan.
    </div>
    {selProc && <DetailPanel item={{ name:selProc.name, color:BPA_COLORS[selProc.area].color, owner:selProc.owner!=="—"?selProc.owner:null, maturity:selProc.maturity, priority:selProc.priority, coverage:selProc.coverage, note:selProc.note, purpose:`Proceso del área ${BPA_COLORS[selProc.area].label.toLowerCase()}. ${selProc.coverage.length===0?"Sin cobertura por sistema documentado — candidato a levantamiento.":`Soportado por ${selProc.coverage.length} sistema${selProc.coverage.length>1?"s":""} del ecosistema.`}` }} onClose={()=>setSelected(null)}/>}
    <BPAArea area="estrategicos" processes={BPA_PROCS.estrategicos} selected={selected} onSelect={setSelected}/>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr 1fr", gap:14, marginTop:14 }}>
      <BPAArea area="apoyo" processes={BPA_PROCS.apoyo} selected={selected} onSelect={setSelected}/>
      <BPAArea area="negocio" processes={BPA_PROCS.negocio} selected={selected} onSelect={setSelected}/>
      <BPAArea area="control" processes={BPA_PROCS.control} selected={selected} onSelect={setSelected}/>
    </div>
    <div style={{ marginTop:18, padding:"12px 16px", background:"#fafafa", border:"1px solid #e0e0e0", borderRadius:8 }}>
      <div style={{ fontSize:10, fontWeight:700, color:"#666", letterSpacing:"0.1em", marginBottom:8, textTransform:"uppercase" }}>Lectura</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:16, alignItems:"center" }}>
        <span style={{ fontSize:11, color:"#444" }}><b>M0–M5</b> madurez · <b>P1–P3</b> prioridad de levantamiento</span>
        {[0,1,2,3].map(m=><div key={m} style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:10, fontWeight:700, color:MATURITY_TINTS[m], background:MATURITY_TINTS[m]+"20", padding:"1px 7px", borderRadius:4 }}>M{m}</span></div>)}
        <span style={{ fontSize:11, color:"#777", fontStyle:"italic" }}>Borde de color: el proceso tiene al menos un sistema documentado que lo soporta.</span>
      </div>
    </div>
  </div>;
}

export function BPAArea({ area, processes, selected, onSelect }) {
  const meta = BPA_COLORS[area];
  return <div style={{ background:meta.bg, border:`1px solid ${meta.border}`, borderRadius:12, padding:"14px 16px" }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}><div style={{ width:4, height:24, background:meta.color, borderRadius:2 }}/><div><div style={{ fontSize:12, fontWeight:700, color:meta.color }}>{meta.label} · {processes.length}</div><div style={{ fontSize:10, color:"#777" }}>{meta.desc}</div></div></div>
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      {processes.map(p=>{ const hasCov=p.coverage&&p.coverage.length>0; const isSel=selected===p.name; return <div key={p.name} onClick={()=>onSelect(isSel?null:p.name)} style={{ background:isSel?meta.color+"1a":"#ffffff", border:`1px solid ${hasCov?meta.color+"55":"#e0e0e0"}`, borderLeft:`3px solid ${MATURITY_TINTS[p.maturity]}`, borderRadius:8, padding:"8px 10px", cursor:"pointer", transition:"all 0.15s", boxShadow:isSel?`0 0 0 2px ${meta.color}33`:"none" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:6, marginBottom:hasCov?5:0 }}><span style={{ fontSize:11, color:"#1D1D1B", fontWeight:isSel?700:500, lineHeight:1.3, flex:1 }}>{p.name}</span><span style={{ fontSize:9, fontWeight:700, color:MATURITY_TINTS[p.maturity], whiteSpace:"nowrap" }}>M{p.maturity}·P{p.priority}</span></div>
        {hasCov && <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>{p.coverage.map(c=><ModuleChip key={c} code={c}/>)}</div>}
      </div>; })}
    </div>
  </div>;
}
