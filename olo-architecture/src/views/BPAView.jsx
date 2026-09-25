// ═══════════════════════════════════════════════════════════════════════════
// VISTA · BPA
// Dos capas sobre el mismo modelo:
//  · Diagnóstico (CICR · dic 2024): 30 procesos con madurez, prioridad, dueño.
//  · Levantamiento actual: el silo de Procesos que corresponde a cada proceso,
//    cuántos procesos tiene en el árbol, sus fichas (procedimiento OLO o
//    borrador) y los sistemas que usan sus pasos.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { BPA_PROCESSES as BPA_PROCS } from "../data/softland.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { BPA_AREA_COLORS as BPA_COLORS, MATURITY_TINTS, DESIGN } from "../data/constants.js";
import { KPICard, DetailPanel, ModuleChip } from "../components/ui.jsx";
import { useValidaciones } from "../lib/useValidaciones.js";
import { tipoFicha } from "../data/workflows.js";

// Sistema de un paso de ficha → módulo de Operación
const SIS_A_MODULO = { eflow:"WMS-D", handheld:"WMS-RF", torre:"WMH", sorter:"SORTER" };

// Silos operativos del CEDI: no están en el diagnóstico 2024 como procesos
// propios, pero son parte del negocio misional y concentran el levantamiento.
const OPERACION_LOGISTICA = ["log_planificacion","log_almacenaje","log_preparacion","log_transporte","log_inventario","log_servicio_cliente","log_mantenimiento","log_desempeno","cross_docking"];

// Cada silo de operación logística (OL.x) es el detalle operativo del CEDI que
// sostiene un proceso de negocio del diagnóstico: no lo duplica, lo baja a piso.
const APORTA_A = {
  log_planificacion: "neg_almacenamiento", log_almacenaje: "neg_almacenamiento", log_preparacion: "neg_almacenamiento",
  log_transporte: "neg_transporte_local", log_inventario: "neg_almacenamiento", log_servicio_cliente: "neg_relacion_clientes",
  log_desempeno: "neg_seguimiento_operacion", cross_docking: "neg_almacenamiento",
};

const ESTADOS = {
  validado: { label:"Validado",          color:"#047857", desc:"todos sus procesos fueron validados en Workflows" },
  mixto:    { label:"OLO + borradores",  color:"#0f766e", desc:"tiene procedimientos OLO y también procesos borrador" },
  cedi:     { label:"Procedimiento OLO", color:"#15803d", desc:"tiene fichas de procedimientos aprobados del CEDI" },
  manual:   { label:"Manual del sistema", color:"#0891b2", desc:"mapeado del manual del proveedor, sin procedimiento OLO" },
  borrador: { label:"Borrador",          color:"#b45309", desc:"procesos armados sobre pantallas de eFlow, a validar" },
  arbol:    { label:"En el árbol",       color:"#2563eb", desc:"procesos en el árbol, sin ficha todavía" },
  vacio:    { label:"Sin levantar",      color:"#94a3b8", desc:"el silo existe pero no tiene procesos" },
  sinSilo:  { label:"Sin silo",          color:"#cbd5e1", desc:"todavía no tiene silo en Procesos" },
};

// Tipo de ficha: procedimiento aprobado del CEDI (CEDI-01…CEDI-14), mapeo del manual de un sistema, o borrador
// tipoFicha viene de workflows.js (una sola definición)

// Fichas por silo (registro estático de procesos): cuántas, de qué tipo y qué módulos usan sus pasos
const FICHAS_POR_SILO = (() => {
  const r = {};
  for (const p of Object.values(PROCESOS)) {
    const x = r[p.silo] ||= { cedi:0, manual:0, borrador:0, modulos:new Set() };
    x[tipoFicha(p)]++;
    // Softland: el módulo sale del código de la opción del menú (CC_DOCUMENTO → CC)
    for (const st of p.pasos || []) { const m = st.sistema === "softland" && st.screen ? st.screen.split("_")[0] : SIS_A_MODULO[st.sistema]; if (m) x.modulos.add(m); }
  }
  return r;
})();

const codigoSilo = (label = "") => label.match(/^((?:P\d+|OL)\.\d+)/)?.[1] ?? null;
const nombreSilo = (label = "") => label.replace(/^(?:P\d+|OL)\.\d+\s*·\s*/, "");

// Estado y datos del levantamiento de un silo
function levantamiento(siloId, cats, procsPorSilo, val) {
  if (!siloId) return { estado:"sinSilo" };
  const cat = cats?.find(c => c.id === siloId);
  const f = FICHAS_POR_SILO[siloId] || { cedi:0, manual:0, borrador:0, modulos:new Set() };
  const procesos = procsPorSilo?.[siloId] ?? 0;
  // validación hecha en Workflows (proceso completo y paso a paso)
  const fichas = Object.values(PROCESOS).filter(p => p.silo === siloId);
  const res = val?.cargado ? fichas.map(p => val.resumen(p.codigo)) : [];
  const pasosVal = res.reduce((a, r) => a + r.validados, 0), pasosTot = fichas.reduce((a, p) => a + p.pasos.length, 0);
  const procVal = res.filter(r => r.proceso === "validado").length;
  const estado = fichas.length && procVal === fichas.length ? "validado" : f.cedi && (f.borrador || f.manual) ? "mixto" : f.cedi ? "cedi" : f.manual ? "manual" : f.borrador ? "borrador" : procesos ? "arbol" : "vacio";
  return { estado, cat, codigo:codigoSilo(cat?.label), procesos, cedi:f.cedi, manual:f.manual, borrador:f.borrador, modulos:[...f.modulos], pasosVal, pasosTot, procVal, fichas:fichas.length };
}

export function BPAView({ selected, setSelected, onNavigate = () => {} }) {
  const [cats, setCats] = useState(null);
  const val = useValidaciones();
  const detalleRef = useRef(null);
  useEffect(() => { if (selected) detalleRef.current?.scrollIntoView({ behavior:"smooth", block:"nearest" }); }, [selected]);
  const [procsPorSilo, setProcsPorSilo] = useState(null);
  useEffect(() => {
    let vivo = true;
    Promise.all([
      supabase.from("procesos_categorias").select("id,num,label,color").order("num"),
      supabase.from("procesos_nodes").select("categoria_id,level").eq("level", 1),
    ]).then(([{ data: c }, { data: n }]) => {
      if (!vivo) return;
      const cuenta = {};
      (n || []).forEach(x => { cuenta[x.categoria_id] = (cuenta[x.categoria_id] || 0) + 1; });
      setCats(c || []); setProcsPorSilo(cuenta);
    });
    return () => { vivo = false; };
  }, []);

  const conLev = (p, area) => {
    const lev = levantamiento(p.silo, cats, procsPorSilo, val);
    // cobertura = lo documentado en el diagnóstico + lo que usan los pasos levantados
    const cobertura = [...new Set([...(p.coverage || []), ...(lev.modulos || [])])];
    return { ...p, area, lev, cobertura };
  };
  const areas = ["estrategicos","negocio","apoyo","control"];
  const porArea = Object.fromEntries(areas.map(a => [a, BPA_PROCS[a].map(p => conLev(p, a))]));
  const diagnostico = areas.flatMap(a => porArea[a]);
  const operacion = OPERACION_LOGISTICA.map(id => {
    const cat = cats?.find(c => c.id === id);
    const destino = cats?.find(c => c.id === APORTA_A[id]);
    return conLev({ name: cat ? nombreSilo(cat.label) : id, silo:id, maturity:null, priority:null, owner:"—", coverage:[],
      note: destino ? `Detalle operativo del CEDI que sostiene «${destino.label}» del diagnóstico.` : "Detalle operativo del CEDI (apoyo: no corresponde a un proceso de negocio del diagnóstico)." }, "operacion");
  });

  const total = diagnostico.length, withCov = diagnostico.filter(p => p.cobertura.length > 0).length;
  const covDiag = diagnostico.filter(p => (p.coverage || []).length > 0).length;
  const covLev = diagnostico.filter(p => (p.lev.modulos || []).length > 0).length;
  const avgMat = (diagnostico.reduce((s,p) => s + p.maturity, 0) / total).toFixed(2);
  const lider = diagnostico.reduce((a,b) => b.maturity > a.maturity ? b : a);
  const catsProc = cats ? cats.filter(c => !String(c.id).startsWith("ref_")) : null;
  const silosConProcesos = catsProc ? catsProc.filter(c => procsPorSilo?.[c.id]).length : null;
  const fichas = Object.values(PROCESOS);
  const nTipo = t => fichas.filter(p => tipoFicha(p) === t).length;
  const totPasos = fichas.reduce((a, p) => a + p.pasos.length, 0);
  const pasosValidados = val.cargado ? fichas.reduce((a, p) => a + val.resumen(p.codigo).validados, 0) : null;
  const procesosValidados = val.cargado ? fichas.filter(p => val.resumen(p.codigo).proceso === "validado").length : null;

  const selProc = [...diagnostico, ...operacion].find(p => p.name === selected);
  const detalle = selProc && (() => {
    const { lev } = selProc, meta = selProc.area === "operacion" ? BPA_COLORS.negocio : BPA_COLORS[selProc.area];
    const partes = [];
    partes.push(selProc.area === "operacion"
      ? "Silo operativo del CEDI. No aparece como proceso propio en el diagnóstico 2024 (sin madurez ni dueño asignados); forma parte del negocio misional."
      : `Proceso del área ${meta.label.toLowerCase()} en el diagnóstico 2024.`);
    if (lev.estado === "sinSilo") partes.push("Todavía no tiene silo en Procesos: pendiente de levantamiento.");
    else if (lev.estado === "vacio") partes.push(`Su silo ${lev.codigo ?? ""} existe en Procesos pero aún no tiene procesos.`);
    else partes.push(`Levantamiento: ${lev.procesos} proceso${lev.procesos === 1 ? "" : "s"} en el árbol de ${lev.codigo ?? nombreSilo(lev.cat?.label)}`
      + (lev.cedi ? ` · ${lev.cedi} ficha${lev.cedi > 1 ? "s" : ""} de procedimiento OLO` : "")
      + (lev.manual ? ` · ${lev.manual} ficha${lev.manual > 1 ? "s" : ""} del manual del sistema` : "")
      + (lev.borrador ? ` · ${lev.borrador} ficha${lev.borrador > 1 ? "s" : ""} borrador (a validar)` : "") + "."
      + (lev.fichas ? ` Validación: ${lev.pasosVal} de ${lev.pasosTot} pasos y ${lev.procVal} de ${lev.fichas} procesos validados en Workflows.` : ""));
    const soloPasos = lev.modulos?.filter(m => !(selProc.coverage || []).includes(m)) || [];
    if (soloPasos.length) partes.push(`Sistemas que aparecen en los pasos levantados y no en el diagnóstico: ${soloPasos.join(", ")}.`);
    return {
      name: selProc.name, code: lev.codigo, color: meta.color,
      owner: selProc.owner && selProc.owner !== "—" ? selProc.owner : null,
      maturity: selProc.maturity, priority: selProc.priority, coverage: selProc.cobertura, note: selProc.note,
      purpose: partes.join(" "),
      accion: lev.cat ? { label: `Ver ${lev.codigo ?? nombreSilo(lev.cat.label)} en Procesos`, onClick: () => onNavigate({ tab:"olo-arch", silo: lev.cat.id }) } : null,
    };
  })();

  return <div>
    <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
      <KPICard label="Procesos del diagnóstico" value={total} color="#1D1D1B" sub="4 áreas · CICR dic 2024"/>
      <KPICard label="Madurez promedio" value={`${avgMat}/5`} color="#f39c12" sub={`${lider.name} (M${lider.maturity}) lidera`}/>
      <KPICard label="Con cobertura de sistema" value={`${withCov}/${total}`} color="#27ae60" sub={`${covDiag} según el diagnóstico · ${covLev} por pasos levantados`}/>
      <KPICard label="Silos con procesos" value={catsProc ? `${silosConProcesos}/${catsProc.length}` : "…"} color="#2563eb" sub="módulo Procesos"/>
      <KPICard label="Pasos validados" value={pasosValidados == null ? "…" : `${pasosValidados}/${totPasos}`} color="#047857" sub={procesosValidados == null ? "" : `${procesosValidados} de ${fichas.length} procesos validados · en Workflows`}/>
      <KPICard label="Fichas de proceso" value={fichas.length} color="#b45309" sub={`${nTipo("cedi")} procedimiento OLO · ${nTipo("manual")} de manual · ${nTipo("borrador")} borrador`}/>
    </div>
    <div style={{ background:"rgba(243,156,18,0.07)", border:"1px solid rgba(243,156,18,0.22)", borderLeft:"3px solid #f39c12", borderRadius:8, padding:"10px 14px", marginBottom:22, fontSize:12, color:"#666", lineHeight:1.6 }}>
      <b style={{ color:"#d35400" }}>Dos capas:</b> madurez, prioridad y dueño vienen del <i>Informe Final Diagnóstico Procesos OLO · CICR · diciembre 2024</i> (no se modifican). El estado de cada tarjeta, su código (P1.x negocio · OL.x operación logística) y los sistemas agregados vienen del <b>levantamiento actual</b> en Procesos. Estratégicos arriba, apoyo a la izquierda, negocio al centro, control a la derecha; abajo, la operación logística del CEDI. Click en un proceso para ver su detalle e ir a su silo.
    </div>
    <div ref={detalleRef} style={{ scrollMarginTop:16 }}>{detalle && <DetailPanel item={detalle} onClose={()=>setSelected(null)}/>}</div>
    <BPAArea area="estrategicos" processes={porArea.estrategicos} selected={selected} onSelect={setSelected}/>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr 1fr", gap:14, marginTop:14 }}>
      <BPAArea area="apoyo" processes={porArea.apoyo} selected={selected} onSelect={setSelected}/>
      <BPAArea area="negocio" processes={porArea.negocio} selected={selected} onSelect={setSelected}/>
      <BPAArea area="control" processes={porArea.control} selected={selected} onSelect={setSelected}/>
    </div>
    <BPAArea area="negocio" titulo="Negocio › Operación logística del CEDI" desc="Silos OL.1–OL.9 · no evaluados como procesos en el diagnóstico 2024 · aquí están los 14 procedimientos del CEDI"
      processes={operacion} selected={selected} onSelect={setSelected} grid style={{ marginTop:14 }}/>
    <div style={{ marginTop:18, padding:"12px 16px", background:"#fafafa", border:"1px solid #e0e0e0", borderRadius:8 }}>
      <div style={{ fontSize:10, fontWeight:700, color:"#666", letterSpacing:"0.1em", marginBottom:8, textTransform:"uppercase" }}>Lectura</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:16, alignItems:"center", marginBottom:8 }}>
        <span style={{ fontSize:11, color:"#444" }}><b>M0–M5</b> madurez · <b>Prio 1–3</b> prioridad de levantamiento (diagnóstico)</span>
        {[0,1,2,3].map(m=><span key={m} style={{ fontSize:10, fontWeight:700, color:MATURITY_TINTS[m], background:MATURITY_TINTS[m]+"20", padding:"1px 7px", borderRadius:4 }}>M{m}</span>)}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:14, alignItems:"center" }}>
        <span style={{ fontSize:11, color:"#444" }}><b>Levantamiento:</b></span>
        {Object.entries(ESTADOS).map(([k,e])=><span key={k} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:"#555" }}><EstadoTag estado={k}/>{e.desc}</span>)}
      </div>
    </div>
  </div>;
}

function EstadoTag({ estado }) {
  const e = ESTADOS[estado];
  return <span style={{ fontSize:9.5, fontWeight:700, color:estado==="sinSilo"?"#64748b":e.color, background:e.color+"1c", border:`1px solid ${e.color}55`, padding:"1px 6px", borderRadius:4, whiteSpace:"nowrap" }}>{e.label}</span>;
}

export function BPAArea({ area, processes, selected, onSelect, titulo, desc, grid, style }) {
  const meta = BPA_COLORS[area];
  return <div style={{ background:meta.bg, border:`1px solid ${meta.border}`, borderRadius:12, padding:"14px 16px", ...style }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}><div style={{ width:4, height:24, background:meta.color, borderRadius:2 }}/><div><div style={{ fontSize:12, fontWeight:700, color:meta.color }}>{titulo ?? meta.label} · {processes.length}</div><div style={{ fontSize:10, color:"#777" }}>{desc ?? meta.desc}</div></div></div>
    <div style={grid ? { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:7 } : { display:"flex", flexDirection:"column", gap:7 }}>
      {processes.map(p => <ProcCard key={p.name} p={p} meta={meta} isSel={selected===p.name} onSelect={onSelect}/>)}
    </div>
  </div>;
}

function ProcCard({ p, meta, isSel, onSelect }) {
  const { lev, cobertura } = p, hasCov = cobertura.length > 0;
  const tint = p.maturity != null ? MATURITY_TINTS[p.maturity] : "#cbd5e1";
  const resumen = lev.estado === "sinSilo" || lev.estado === "vacio" ? null
    : [lev.procesos && `${lev.procesos} proc.`, lev.cedi && `${lev.cedi} OLO`, lev.manual && `${lev.manual} manual`, lev.borrador && `${lev.borrador} borr.`, lev.pasosVal && `✓ ${lev.pasosVal}/${lev.pasosTot} pasos`].filter(Boolean).join(" · ");
  return <div onClick={()=>onSelect(isSel?null:p.name)} style={{ background:isSel?meta.color+"1a":"#ffffff", border:`1px solid ${hasCov?meta.color+"55":"#e0e0e0"}`, borderLeft:`3px solid ${tint}`, borderRadius:8, padding:"8px 10px", cursor:"pointer", transition:"all 0.15s", boxShadow:isSel?`0 0 0 2px ${meta.color}33`:"none" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:6, marginBottom:5 }}>
      <span style={{ fontSize:11, color:"#1D1D1B", fontWeight:isSel?700:500, lineHeight:1.3, flex:1 }}>{p.name}</span>
      {p.maturity != null && <span style={{ fontSize:9, fontWeight:700, color:tint, whiteSpace:"nowrap" }}>M{p.maturity} · Prio {p.priority}</span>}
    </div>
    <div style={{ display:"flex", flexWrap:"wrap", gap:4, alignItems:"center" }}>
      {lev.codigo && <span style={{ fontSize:9.5, fontWeight:700, color:DESIGN.inkSoft, fontFamily:DESIGN.font }}>{lev.codigo}</span>}
      <EstadoTag estado={lev.estado}/>
      {resumen && <span style={{ fontSize:9.5, color:"#777" }}>{resumen}</span>}
    </div>
    {hasCov && <div style={{ display:"flex", flexWrap:"wrap", gap:3, marginTop:5 }}>{cobertura.map(c=><ModuleChip key={c} code={c}/>)}</div>}
  </div>;
}
