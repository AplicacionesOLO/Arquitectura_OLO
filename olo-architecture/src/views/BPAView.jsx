// ═══════════════════════════════════════════════════════════════════════════
// VISTA · BPA
// Dos capas sobre el mismo modelo:
//  · Diagnóstico (CICR · dic 2024): 30 procesos con madurez, prioridad, dueño.
//  · Levantamiento actual: el silo de Procesos que corresponde a cada proceso,
//    cuántos procesos tiene en el árbol, sus fichas (procedimiento OLO o
//    borrador) y los sistemas que usan sus pasos.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, Fragment } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { BPA_PROCESSES as BPA_PROCS } from "../data/softland.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { BPA_AREA_COLORS as BPA_COLORS, MATURITY_TINTS, DESIGN } from "../data/constants.js";
import { ModuleChip } from "../components/ui.jsx";
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
  const [vista, setVista] = useState("mapa");       // mapa (por área) | estado (color por estado del levantamiento)
  const [resaltar, setResaltar] = useState("");     // sistema a resaltar
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

  // ── mapa relacional: bandas por área, columnas de cadena de valor, tarjetas-entidad ──
  const todos = [...diagnostico, ...operacion];
  const sistemas = [...new Set(todos.flatMap(p => p.cobertura))].sort();
  const porNombre = n => todos.find(p => p.name === n);
  const col = (titulo, color, nombres, lista = porArea.negocio) => ({ titulo, color, procesos: nombres.map(n => lista.find(p => p.name === n)).filter(Boolean) });
  const negocioCols = [
    col("Comercial", "#2563eb", ["Gestión de Comercialización", "Toma de Requerimientos de Clientes", "Gestión de Relación con Clientes"]),
    col("Operación", "#15803d", ["Gestión de Internamiento Zona Franca SEL", "Administración de Procesos Aduaneros", "Gestión de Almacenamiento (ZF + nacional)", "Servicios de Valor Agregado", "Gestión de Transporte Local", "Gestión de Transporte Internacional", "Seguimiento y Control de la Operación"]),
    col("Financiero", "#c2410c", ["Administración Financiera Contable a Clientes", "Facturación", "Cobro", "Servicio de Gestión de Talento al Cliente"]),
  ];
  const opNombre = id => operacion.find(p => p.silo === id)?.name;
  const opCols = [
    col("Planificar y almacenar", "#2563eb", ["log_planificacion", "log_almacenaje", "log_inventario"].map(opNombre), operacion),
    col("Preparar y despachar", "#15803d", ["log_preparacion", "log_transporte", "cross_docking"].map(opNombre), operacion),
    col("Servicio y control", "#c2410c", ["log_servicio_cliente", "log_mantenimiento", "log_desempeno"].map(opNombre), operacion),
  ];
  const tarjeta = p => <EntidadCard key={p.name} p={p} sel={selected === p.name} onSelect={setSelected} vista={vista} resaltar={resaltar}/>;
  const sel = selected ? porNombre(selected) : null;

  return <div>
    <div style={{ display:"flex", gap:4, borderBottom:`1px solid ${DESIGN.border}`, marginBottom:12 }}>
      <span style={{ fontSize:13, fontWeight:700, color:DESIGN.ink, borderBottom:`2px solid ${DESIGN.ink}`, padding:"6px 12px", marginBottom:-1 }}>BPA · mapa relacional</span>
    </div>
    <div style={{ display:"flex", gap:14, alignItems:"center", flexWrap:"wrap", marginBottom:12 }}>
      <label style={{ fontSize:12.5, color:DESIGN.inkSoft, display:"flex", gap:6, alignItems:"center" }}>Vista:
        <select value={vista} onChange={e => setVista(e.target.value)} style={SEL}><option value="mapa">Mapa BPA</option><option value="estado">Estado del levantamiento</option></select></label>
      <label style={{ fontSize:12.5, color:DESIGN.inkSoft, display:"flex", gap:6, alignItems:"center" }}>Resaltar:
        <select value={resaltar} onChange={e => setResaltar(e.target.value)} style={SEL}><option value="">— Sistema —</option>{sistemas.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
      <div style={{ marginLeft:"auto", display:"flex", gap:14, flexWrap:"wrap", fontSize:12, color:DESIGN.muted }}>
        <span><b style={{ color:DESIGN.ink }}>{total}</b> procesos del diagnóstico</span>
        <span>madurez <b style={{ color:"#b45309" }}>{avgMat}/5</b> ({lider.name.split(" ").slice(0, 4).join(" ")} lidera)</span>
        <span><b style={{ color:"#15803d" }}>{withCov}/{total}</b> con sistema ({covDiag} diagnóstico · {covLev} pasos)</span>
        <span><b style={{ color:"#2563eb" }}>{catsProc ? `${silosConProcesos}/${catsProc.length}` : "…"}</b> silos con procesos</span>
        <span><b style={{ color:"#047857" }}>{pasosValidados == null ? "…" : `${pasosValidados}/${totPasos}`}</b> pasos validados{procesosValidados ? ` (${procesosValidados} procesos)` : ""}</span>
        <span><b style={{ color:"#b45309" }}>{fichas.length}</b> fichas ({nTipo("cedi")} OLO · {nTipo("manual")} manual · {nTipo("borrador")} borrador)</span>
      </div>
    </div>

    <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
      <div style={{ flex:1, minWidth:0, display:"grid", gap:12 }}>
        <Banda area="estrategicos" sigla="EST">
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            {porArea.estrategicos.map((p, i) => <Fragment key={p.name}>{i > 0 && <span style={{ color:DESIGN.mutedSoft, fontSize:14 }}>→</span>}{tarjeta(p)}</Fragment>)}
          </div>
        </Banda>
        <Banda area="negocio" sigla="NEG" titulo="Negocio · Misionales" desc="Cadena de valor del servicio: Comercial → Operación → Financiero" etiquetas={negocioCols}>
          <Columnas cols={negocioCols} tarjeta={tarjeta}/>
        </Banda>
        <Banda area="negocio" sigla="OL" titulo="Operación logística del CEDI" desc="Silos OL.1–OL.9: el detalle en piso que sostiene los procesos de negocio · aquí están los 14 procedimientos del CEDI" etiquetas={opCols}>
          <Columnas cols={opCols} tarjeta={tarjeta}/>
        </Banda>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Banda area="apoyo" sigla="APO"><div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{porArea.apoyo.map(tarjeta)}</div></Banda>
          <Banda area="control" sigla="CTL"><div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{porArea.control.map(tarjeta)}</div></Banda>
        </div>
        <div style={{ padding:"10px 14px", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:8, display:"flex", flexWrap:"wrap", gap:"6px 18px", fontSize:11.5, color:DESIGN.inkSoft, alignItems:"center" }}>
          <span><ModuleChip code="CC"/> módulo o sistema que soporta el proceso</span>
          <span><b>M0–M5</b> madurez · <b>Prio 1–3</b> prioridad de levantamiento (diagnóstico 2024)</span>
          <span style={{ color:"#dc2626", fontWeight:700 }}>▲</span><span style={{ marginLeft:-12 }}>Prio 1 sin levantar</span>
          <span>→ secuencia</span>
          <span><b>Ver procesos</b> abre el silo en Procesos</span>
          <span style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>Estado: {Object.keys(ESTADOS).map(k => <EstadoTag key={k} estado={k}/>)}</span>
        </div>
      </div>
      {sel && <PanelEntidad p={sel} detalle={detalle} onClose={() => setSelected(null)} onNavigate={onNavigate}/>}
    </div>
  </div>;
}

const SEL = { fontSize:12.5, padding:"4px 8px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:6, fontFamily:DESIGN.font, background:"#fff", minWidth:170 };

function EstadoTag({ estado }) {
  const e = ESTADOS[estado];
  return <span title={e.desc} style={{ fontSize:9.5, fontWeight:700, color:estado==="sinSilo"?"#64748b":e.color, background:e.color+"1c", border:`1px solid ${e.color}55`, padding:"1px 6px", borderRadius:4, whiteSpace:"nowrap" }}>{e.label}</span>;
}

// Banda de un área (como un macroproceso del mapa relacional)
function Banda({ area, sigla, titulo, desc, etiquetas, children }) {
  const m = BPA_COLORS[area];
  return <section style={{ background:m.bg, border:`1.5px solid ${m.border}`, borderRadius:8, padding:"10px 12px 12px" }}>
    <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:10 }}>
      <div style={{ width:3, alignSelf:"stretch", background:m.color, borderRadius:2 }}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:700, color:m.color }}>{sigla} — {titulo ?? m.label}</div>
        <div style={{ fontSize:11.5, color:DESIGN.muted }}>{desc ?? m.desc}</div>
      </div>
      {etiquetas && <div style={{ display:"flex", gap:4 }}>{etiquetas.map(c => <span key={c.titulo} style={{ fontSize:11, fontWeight:700, color:c.color, background:c.color + "14", border:`1px solid ${c.color}44`, borderRadius:4, padding:"2px 8px" }}>{c.titulo}</span>)}</div>}
    </div>
    {children}
  </section>;
}

function Columnas({ cols, tarjeta }) {
  return <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols.length}, minmax(0, 1fr))`, gap:10 }}>
    {cols.map(c => <div key={c.titulo} style={{ background:c.color + "0d", border:`1px solid ${c.color}26`, borderRadius:6, padding:"8px 8px 10px" }}>
      <div style={{ textAlign:"center", fontSize:12, fontWeight:700, color:c.color, marginBottom:8 }}>{c.titulo}</div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}>{c.procesos.map(tarjeta)}</div>
    </div>)}
  </div>;
}

// Tarjeta-entidad: código del silo, nombre, pie con «Ver procesos» o su estado
function EntidadCard({ p, sel, onSelect, vista, resaltar }) {
  const m = BPA_COLORS[p.area === "operacion" ? "negocio" : p.area], { lev } = p;
  const e = ESTADOS[lev.estado];
  const critico = p.priority === 1 && (lev.estado === "sinSilo" || lev.estado === "vacio");
  const apagado = resaltar && !p.cobertura.includes(resaltar);
  const borde = vista === "estado" ? e.color : sel ? m.color : "#cbd5e1";
  return <div onClick={() => onSelect(sel ? null : p.name)} title={`${p.name} · ${e.label}${p.cobertura.length ? ` · ${p.cobertura.join(", ")}` : ""}`}
    style={{ position:"relative", width:150, minHeight:64, boxSizing:"border-box", background: sel ? m.color + "14" : "#fff", borderTop:`${sel ? 2 : 1}px solid ${borde}`, borderRight:`${sel ? 2 : 1}px solid ${borde}`, borderBottom:`${sel ? 2 : 1}px solid ${borde}`,
      borderLeft: vista === "estado" ? `4px solid ${e.color}` : `${sel ? 2 : 1}px solid ${borde}`,
      borderRadius:6, padding:"6px 8px 5px", cursor:"pointer", display:"flex", flexDirection:"column", opacity: apagado ? 0.28 : 1, transition:"opacity .15s", boxShadow: sel ? `0 0 0 2px ${m.color}33` : "0 1px 2px rgba(0,0,0,.05)" }}>
    {critico && <span title="Prioridad 1 del diagnóstico y todavía sin levantar" style={{ position:"absolute", top:4, right:6, color:"#dc2626", fontSize:10 }}>▲</span>}
    <div style={{ fontSize:9.5, fontWeight:800, color: lev.codigo ? m.color : DESIGN.mutedSoft, letterSpacing:"0.03em" }}>{lev.codigo || "SIN SILO"}{p.maturity != null && <span style={{ color:MATURITY_TINTS[p.maturity], fontWeight:700, marginLeft:6 }}>M{p.maturity}·Prio {p.priority}</span>}</div>
    <div style={{ fontSize:11.5, color:DESIGN.ink, fontWeight: sel ? 700 : 500, lineHeight:1.25, flex:1, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", marginTop:1 }}>{p.name}</div>
    <div style={{ fontSize:9.5, color: lev.cat ? DESIGN.muted : DESIGN.mutedSoft, marginTop:3 }}>{lev.cat ? "Ver procesos" : e.label}{lev.procesos ? ` · ${lev.procesos}` : ""}</div>
  </div>;
}

function Seccion({ titulo, n, children }) {
  return <div style={{ borderTop:`1px solid ${DESIGN.border}`, paddingTop:8, marginTop:10 }}>
    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11.5, fontWeight:700, color:DESIGN.ink, marginBottom:5 }}><span>– {titulo}</span>{n != null && <span>{n}</span>}</div>{children}</div>;
}

// Panel lateral fijo con el detalle de la entidad seleccionada
function PanelEntidad({ p, detalle, onClose, onNavigate }) {
  const m = BPA_COLORS[p.area === "operacion" ? "negocio" : p.area], { lev } = p;
  const areaNombre = p.area === "operacion" ? "Operación logística del CEDI" : m.label;
  return <aside style={{ width:"clamp(280px, 24vw, 340px)", flexShrink:0, position:"sticky", top:16, maxHeight:"calc(100vh - 32px)", overflowY:"auto", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:8, padding:"12px 14px", boxShadow:DESIGN.shadowCard }}>
    <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
      <div style={{ fontSize:11, color:DESIGN.muted }}>{lev.codigo || "Sin silo"} · {areaNombre}</div>
      <button onClick={onClose} title="Cerrar" style={{ background:"none", border:"none", fontSize:16, color:DESIGN.muted, cursor:"pointer", lineHeight:1 }}>✕</button>
    </div>
    <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink, margin:"2px 0 6px" }}>{p.name}</div>
    <div style={{ fontSize:12, color:DESIGN.inkSoft, lineHeight:1.55 }}>{detalle?.purpose}</div>
    {p.note && <div style={{ fontSize:11.5, color:DESIGN.muted, fontStyle:"italic", marginTop:6, lineHeight:1.5 }}>{p.note}</div>}
    <Seccion titulo="Módulos y sistemas que lo soportan" n={p.cobertura.length}>
      {p.cobertura.length ? <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{p.cobertura.map(c => <ModuleChip key={c} code={c}/>)}</div> : <div style={{ fontSize:12, color:DESIGN.muted }}>Sin sistema documentado.</div>}
    </Seccion>
    <Seccion titulo="Levantamiento">
      <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", fontSize:12, color:DESIGN.inkSoft }}>
        <EstadoTag estado={lev.estado}/>{lev.procesos ? `${lev.procesos} procesos` : ""}{lev.cedi ? ` · ${lev.cedi} OLO` : ""}{lev.manual ? ` · ${lev.manual} manual` : ""}{lev.borrador ? ` · ${lev.borrador} borrador` : ""}
      </div>
      {lev.fichas > 0 && <div style={{ fontSize:11.5, color:DESIGN.muted, marginTop:4 }}>{lev.pasosVal} de {lev.pasosTot} pasos validados</div>}
    </Seccion>
    {p.maturity != null && <Seccion titulo="Diagnóstico 2024">
      <div style={{ fontSize:12, color:DESIGN.inkSoft, lineHeight:1.7 }}>Madurez <b style={{ color:MATURITY_TINTS[p.maturity] }}>M{p.maturity}/5</b> · prioridad {PRIORIDAD[p.priority]}{p.owner && p.owner !== "—" ? <><br/>Dueño: {p.owner}</> : null}</div>
    </Seccion>}
    <div style={{ display:"grid", gap:6, marginTop:14 }}>
      {lev.cat && <button onClick={() => onNavigate({ tab:"olo-arch", silo:lev.cat.id })} style={BTN}>Ver procesos asociados →</button>}
      {lev.fichas > 0 && <button onClick={() => onNavigate({ tab:"workflows", silo:lev.cat.id })} style={BTN}>Ver el flujo en Workflows →</button>}
    </div>
  </aside>;
}
const PRIORIDAD = { 1:"alta", 2:"media", 3:"baja" };
const BTN = { fontSize:12, fontWeight:700, color:DESIGN.ink, background:"#fff", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:6, padding:"6px 10px", cursor:"pointer", fontFamily:DESIGN.font, textAlign:"left" };
