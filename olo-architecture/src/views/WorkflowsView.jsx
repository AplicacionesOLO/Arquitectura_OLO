// ═══════════════════════════════════════════════════════════════════════════
// VISTA · Workflows — plano maestro de la operación
// Pestañas: Workflows (mapa maestro + un lienzo por silo), Sistemas (qué
// depende de cada sistema), Roles (qué procesos ejecuta cada rol) y Cambios.
// Los pasos salen de las fichas de proceso; lo editable es el acomodo del
// lienzo (workflow_layouts).
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useNav } from "../lib/nav.js";
import { DESIGN } from "../data/constants.js";
import { PROCESOS, SILO_LABELS } from "../data/procesos_fichas.js";
import { SILOS_WF, SISTEMAS_WF, ORIGEN_WF, TIPO_FICHA, tipoFicha, IMPACTO_SISTEMA, ROLES_WF, lienzoSilo, lienzoMaestro, siloDe, entradasDe, salidasDe, rolInferido, decisionesDe, partirDecision } from "../data/workflows.js";
import { WorkflowCanvas, Icono } from "../components/WorkflowCanvas.jsx";
import { Presentacion } from "../components/Presentacion.jsx";
import { slidesProceso } from "../lib/presentacion.js";
import { useNovedadesDoc } from "../components/NovedadesModal.jsx";
import { ValidacionPaso, ValidacionProceso } from "../components/Validacion.jsx";

const PESTANAS = [["workflows","Workflows"],["sistemas","Sistemas"],["roles","Roles"],["cambios","Cambios"]];
const corto = l => (l || "").replace(/^(?:P\d+|OL)\.\d+\s*·\s*/, "");

export function WorkflowsView({ focus }) {
  const { navigate } = useNav();
  const { role } = useAuth();
  const canEdit = role === "admin" || role === "editor";
  const [pestana, setPestana] = useState("workflows");
  const [lienzo, setLienzo] = useState("maestro");
  const [resaltar, setResaltar] = useState(null);
  const [foco, setFoco] = useState(null);
  const [sel, setSel] = useState(null);
  const [show, setShow] = useState(null);           // { codigo, start }
  const [layouts, setLayouts] = useState(null);

  useEffect(() => {
    supabase.from("workflow_layouts").select("*").then(({ data }) => setLayouts(Object.fromEntries((data || []).map(r => [r.id, r]))));
  }, []);

  // Ir a un proceso (o silo) desde cualquier parte del módulo
  const irA = useCallback(({ codigo, silo, sistema }) => {
    setPestana("workflows");
    if (sistema !== undefined) setResaltar(sistema);
    if (codigo) { setLienzo(siloDe(codigo)); setFoco({ codigo, n: Date.now() }); setSel({ tipo:"proceso", codigo }); }
    else if (silo) { setLienzo(silo); setFoco(null); setSel(null); }
  }, []);
  const n = focus?.n;
  useEffect(() => {
    if (!focus) return;
    const t = setTimeout(() => {
      if (focus.codigo && PROCESOS[focus.codigo]) irA({ codigo:focus.codigo, sistema:focus.sistema });
      else if (focus.silo) irA({ silo:focus.silo, sistema:focus.sistema });
    }, 0);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const modelo = useMemo(() => lienzo === "maestro" ? lienzoMaestro() : lienzoSilo(lienzo), [lienzo]);
  const guardar = useCallback(async (datos) => {
    const fila = { id:lienzo, ...datos, updated_at:new Date().toISOString() };
    const { error } = await supabase.from("workflow_layouts").upsert(fila);
    if (!error) setLayouts(l => ({ ...l, [lienzo]: { ...l[lienzo], ...fila } }));
    return !error;
  }, [lienzo]);
  // rol de un paso asignado a mano (null = volver al inferido); se guarda en el lienzo de su silo
  const guardarRol = useCallback(async (codigo, i, rol) => {
    const silo = siloDe(codigo), nodo = `${codigo}:s${i}`;
    const roles = { ...(layouts?.[silo]?.roles || {}) };
    if (rol) roles[nodo] = rol; else delete roles[nodo];
    const fila = { id:silo, roles, updated_at:new Date().toISOString() };
    const { error } = await supabase.from("workflow_layouts").upsert(fila);
    if (!error) setLayouts(l => ({ ...l, [silo]: { ...(l[silo] || { posiciones:{}, conexiones:[], ocultas:[] }), ...fila } }));
    return error ? error.message : null;
  }, [layouts]);

  const onSelect = s => {
    if (s.tipo === "resaltar") { setResaltar(s.sistema); return; }
    setSel(s);
  };
  const abrirSilo = silo => { setLienzo(silo); setFoco(null); setSel(null); };

  const totalPasos = Object.values(PROCESOS).reduce((a, p) => a + p.pasos.length, 0);
  return <div>
    {/* Pestañas superiores */}
    <div style={{ display:"flex", gap:4, borderBottom:`1px solid ${DESIGN.border}`, marginBottom:16, flexWrap:"wrap" }}>
      {PESTANAS.map(([id, label]) => <button key={id} onClick={() => setPestana(id)}
        style={{ fontSize:14, fontWeight: pestana === id ? 700 : 500, color: pestana === id ? DESIGN.ink : DESIGN.muted, background:"none", border:"none", borderBottom:`2px solid ${pestana === id ? DESIGN.ink : "transparent"}`, padding:"8px 14px", cursor:"pointer", fontFamily:DESIGN.font, marginBottom:-1 }}>{label}</button>)}
      <span style={{ marginLeft:"auto", alignSelf:"center", fontSize:12, color:DESIGN.muted }}>{SILOS_WF.length} silos · {Object.keys(PROCESOS).length} procesos · {totalPasos} pasos · {ROLES_WF.length} roles</span>
    </div>

    {pestana === "workflows" && <>
      <SelectorLienzo lienzo={lienzo} onChange={abrirSilo}/>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
        <div style={{ flex:1, minWidth:0 }}>
          {layouts === null
            ? <div style={{ padding:40, textAlign:"center", color:DESIGN.muted, fontSize:13 }}>Cargando lienzo…</div>
            : <WorkflowCanvas key={lienzo} modelo={modelo} maestro={lienzo === "maestro"} layout={layouts[lienzo]} canEdit={canEdit} onSave={guardar}
                resaltar={resaltar} foco={foco} sel={sel} onSelect={onSelect} onIr={codigo => irA({ codigo })} onAbrirSilo={abrirSilo}/>}
          <div style={{ fontSize:11.5, color:DESIGN.muted, marginTop:8, lineHeight:1.5 }}>
            Arrastra el fondo para moverte · rueda para acercar · toca un paso para ver su pantalla y datos · los círculos morados llevan al proceso anterior o siguiente.
            {lienzo === "maestro" && " En el mapa maestro, toca el título de un silo para abrir su lienzo."}
          </div>
        </div>
        {sel && <Panel sel={sel} canEdit={canEdit} rolesMano={layouts?.[siloDe(sel.codigo)]?.roles || {}} onGuardarRol={guardarRol} onClose={() => setSel(null)} onIr={irA} onPresentar={(codigo, start) => setShow({ codigo, start })} navigate={navigate} lienzo={lienzo}/>}
      </div>
    </>}
    {pestana === "sistemas" && <VistaSistemas onIr={irA} navigate={navigate}/>}
    {pestana === "roles" && <VistaRoles onIr={irA}/>}
    {pestana === "cambios" && <VistaCambios layouts={layouts}/>}

    {show && <Presentacion slides={slidesProceso(show.codigo)} start={show.start} onClose={() => setShow(null)}
      onOpenScreen={id => { setShow(null); navigate({ tab:"ops", view:"wms", screen:id }); }}
      onOpenWmh={id => { setShow(null); navigate({ tab:"ops", view:"wmh", wmhScreen:id }); }}
      onOpenSorter={id => { setShow(null); navigate({ tab:"ops", view:"sorter", sorterScreen:id }); }}
      onOpenHh={id => { setShow(null); navigate({ tab:"ops", view:"hh", hhScreen:id }); }}/>}
  </div>;
}

// Pestañas de lienzos (como los departamentos de un plano maestro)
function SelectorLienzo({ lienzo, onChange }) {
  const chip = (id, label, extra) => { const on = lienzo === id;
    return <button key={id} onClick={() => onChange(id)} style={{ fontSize:12.5, fontWeight: on ? 700 : 500, color: on ? "#fff" : DESIGN.inkSoft, background: on ? "#2563eb" : "#fff", border:`1px solid ${on ? "#2563eb" : DESIGN.border}`, borderRadius:8, padding:"6px 11px", cursor:"pointer", fontFamily:DESIGN.font, whiteSpace:"nowrap" }}>
      {label}{extra != null && <span style={{ marginLeft:6, fontSize:11, opacity:0.75 }}>{extra}</span>}</button>; };
  return <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
    {chip("maestro", "◎ Mapa maestro")}
    {SILOS_WF.map(s => chip(s.id, corto(s.label), s.procesos.length))}
  </div>;
}

// ── Panel lateral: paso o proceso ────────────────────────────────────────────
function Panel({ sel, canEdit, rolesMano, onGuardarRol, onClose, onIr, onPresentar, navigate, lienzo }) {
  const slides = useMemo(() => PROCESOS[sel.codigo] ? slidesProceso(sel.codigo) : [], [sel.codigo]);
  const p = PROCESOS[sel.codigo]; if (!p) return null;
  const tipo = TIPO_FICHA[tipoFicha(p)];
  const ir = { fontSize:12.5, fontWeight:700, border:"none", borderRadius:7, padding:"7px 12px", cursor:"pointer", fontFamily:DESIGN.font };

  let cuerpo;
  if (sel.tipo === "decision") {
    const d = decisionesDe(p.codigo)[sel.j], { pregunta, opciones } = partirDecision(d.texto);
    cuerpo = <>
      <div style={{ fontSize:11.5, fontWeight:700, color:"#d97706", letterSpacing:"0.05em" }}>DECISIÓN · {d.despuesDe != null ? `después del paso ${d.despuesDe + 1} (ubicación inferida)` : "sin ubicar"}</div>
      <div style={{ fontSize:16, color:DESIGN.ink, lineHeight:1.45, fontWeight:600, marginTop:4 }}>{pregunta}</div>
      {opciones.length > 0 && <><Titulo>Opciones</Titulo>
        {opciones.map((o, k) => <div key={k} style={{ fontSize:13, color:DESIGN.inkSoft, background:"#fffbeb", border:"1px solid #fde68a", borderRadius:7, padding:"6px 9px", marginBottom:5 }}>{o}</div>)}</>}
      <div style={{ fontSize:12, color:DESIGN.muted, marginTop:10, lineHeight:1.5 }}>
        {d.despuesDe != null ? "Se ubicó junto al paso con el que comparte palabras clave: verifica que esté en su lugar." : "No se encontró un paso que coincida claramente. En modo edición, arrástrala a su lugar y conéctala con «Conectar»."}
      </div>
      <Titulo>Proceso</Titulo>
      <button onClick={() => onIr({ codigo:p.codigo })} style={{ ...ir, fontWeight:600, width:"100%", textAlign:"left", color:DESIGN.ink, background:DESIGN.sunken, border:`1px solid ${DESIGN.border}` }}>{p.codigo} · {p.nombre}</button>
    </>;
  } else if (sel.tipo === "paso") {
    const s = p.pasos[sel.i], m = SISTEMAS_WF[s.sistema] || SISTEMAS_WF.fisico, o = s.origen && ORIGEN_WF[s.origen], sl = slides[sel.i];
    const abrirPantalla = sl?.screenId ? () => navigate({ tab:"ops", view:"wms", screen:sl.screenId })
      : sl?.wmhId ? () => navigate({ tab:"ops", view:"wmh", wmhScreen:sl.wmhId })
      : sl?.sorterId ? () => navigate({ tab:"ops", view:"sorter", sorterScreen:sl.sorterId })
      : sl?.hhId ? () => navigate({ tab:"ops", view:"hh", hhScreen:sl.hhId }) : null;
    cuerpo = <>
      <div style={{ fontSize:11.5, color:DESIGN.muted, marginBottom:4 }}>Paso {sel.i + 1} de {p.pasos.length}</div>
      <div style={{ fontSize:15, color:DESIGN.ink, lineHeight:1.5, fontWeight:500 }}>{s.texto}</div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10, alignItems:"center" }}>
        <Icono s={s.sistema} size={22}/><span style={{ fontSize:13, fontWeight:700, color:m.color }}>{m.label}</span>
        {o && <span style={{ fontSize:11, fontWeight:700, color:o.color, background:o.color + "15", border:`1px solid ${o.color}44`, borderRadius:4, padding:"1px 7px" }}>{o.label}</span>}
      </div>
      {(sl?.donde || s.pantalla) && <><Titulo>Pantalla</Titulo><div style={{ fontSize:12.5, color:DESIGN.inkSoft }}>{sl?.donde || s.pantalla}</div></>}
      {sl?.img && <img src={sl.img} alt="" onClick={() => onPresentar(p.codigo, sel.i)} title="Ver en grande (presentación desde este paso)"
        style={{ width:"100%", marginTop:8, borderRadius:8, border:`1px solid ${DESIGN.border}`, cursor:"zoom-in", display:"block" }}/>}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:12 }}>
        <button onClick={() => onPresentar(p.codigo, sel.i)} style={{ ...ir, color:"#fff", background:"#0891b2" }}>▶ Presentar desde aquí</button>
        {abrirPantalla && <button onClick={abrirPantalla} style={{ ...ir, color:DESIGN.ink, background:DESIGN.sunken2 }}>Abrir en el manual ›</button>}
      </div>
      <RolPaso key={`rol-${p.codigo}#${sel.i}`} p={p} i={sel.i} canEdit={canEdit} mano={rolesMano[`${p.codigo}:s${sel.i}`]} onGuardar={onGuardarRol}/>
      <ValidacionPaso key={`${p.codigo}#${sel.i}`} codigo={p.codigo} i={sel.i} canEdit={canEdit}/>
      <Titulo>Proceso</Titulo>
      <button onClick={() => onIr({ codigo:p.codigo })} style={{ ...ir, fontWeight:600, width:"100%", textAlign:"left", color:DESIGN.ink, background:DESIGN.sunken, border:`1px solid ${DESIGN.border}` }}>{p.codigo} · {p.nombre}</button>
      {(p.responsables || []).length > 0 && <><Titulo>Roles del proceso</Titulo><Roles lista={p.responsables}/></>}
    </>;
  } else {
    const sis = {}; p.pasos.forEach(s => { sis[s.sistema] = (sis[s.sistema] || 0) + 1; });
    const ent = entradasDe(p.codigo), sal = salidasDe(p.codigo);
    cuerpo = <>
      <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:4 }}>
        <span style={{ fontSize:12, fontWeight:700, color:tipo.color }}>{p.codigo}</span>
        <span style={{ fontSize:10.5, fontWeight:700, color:tipo.color, background:tipo.color + "18", border:`1px solid ${tipo.color}44`, borderRadius:4, padding:"0 6px" }}>{tipo.label}</span>
      </div>
      <div style={{ fontSize:17, fontWeight:700, color:DESIGN.ink, lineHeight:1.3 }}>{p.nombre}</div>
      <div style={{ fontSize:12, color:DESIGN.muted, marginTop:2 }}>{SILO_LABELS[p.silo]}</div>
      {p.objetivo && <p style={{ fontSize:13, color:DESIGN.inkSoft, lineHeight:1.55, margin:"10px 0 0" }}>{p.objetivo}</p>}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:12 }}>
        {lienzo === "maestro" && <button onClick={() => onIr({ codigo:p.codigo })} style={{ ...ir, color:"#fff", background:"#2563eb" }}>Ver sus {p.pasos.length} pasos ›</button>}
        <button onClick={() => onPresentar(p.codigo, 0)} style={{ ...ir, color:"#fff", background:"#0891b2" }}>▶ Presentar</button>
        <button onClick={() => navigate({ tab:"olo-arch", codigo:p.codigo })} style={{ ...ir, color:DESIGN.ink, background:DESIGN.sunken2 }}>Ficha completa ›</button>
      </div>
      <ValidacionProceso key={p.codigo} codigo={p.codigo} canEdit={canEdit}/>
      <Titulo>Sistemas que usa</Titulo>
      {Object.entries(sis).sort((a,b) => b[1] - a[1]).map(([k, v]) => <div key={k} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12.5, marginBottom:4 }}>
        <Icono s={k} size={18}/><span style={{ flex:1, color:DESIGN.ink }}>{SISTEMAS_WF[k]?.label || k}</span><span style={{ color:DESIGN.muted }}>{v} paso{v > 1 ? "s" : ""}</span></div>)}
      {(p.responsables || []).length > 0 && <><Titulo>Roles</Titulo><Roles lista={p.responsables}/></>}
      {ent.length > 0 && <><Titulo>Viene de</Titulo>{ent.map(c => <Ref key={c} c={c} onIr={onIr}/>)}</>}
      {sal.length > 0 && <><Titulo>Sigue en</Titulo>{sal.map(c => <Ref key={c} c={c} onIr={onIr}/>)}</>}
      {(p.decisiones || []).length > 0 && <><Titulo>Decisiones · {p.decisiones.length}</Titulo>
        <ul style={{ margin:0, paddingLeft:16, fontSize:12, color:DESIGN.inkSoft, lineHeight:1.5 }}>{p.decisiones.map((d, i) => <li key={i} style={{ marginBottom:3 }}>{d}</li>)}</ul></>}
      {(p.tablas || []).length > 0 && <><Titulo>Tablas · {p.tablas.length}</Titulo>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{p.tablas.slice(0, 24).map(t => <button key={t.schema + t.tabla} title={t.motivo}
          onClick={() => t.schema !== "softland" && navigate({ tab:"integrations", cat:t.schema, table:t.tabla })}
          style={{ fontSize:10.5, fontFamily:"'Courier New', monospace", color:"#0e7490", background:"#ecfeff", border:"1px solid #cffafe", borderRadius:4, padding:"1px 6px", cursor:"pointer" }}>{t.tabla}</button>)}
          {p.tablas.length > 24 && <span style={{ fontSize:11, color:DESIGN.muted }}>+{p.tablas.length - 24}</span>}</div></>}
    </>;
  }
  return <aside style={{ width:"clamp(300px, 28vw, 400px)", flexShrink:0, position:"sticky", top:16, maxHeight:"calc(100vh - 32px)", overflowY:"auto", background:DESIGN.surface, border:`1px solid ${DESIGN.border}`, borderRadius:12, boxShadow:DESIGN.shadowCard, padding:"14px 16px" }}>
    <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:-8 }}>
      <button onClick={onClose} title="Cerrar" style={{ background:"none", border:"none", fontSize:18, color:DESIGN.muted, cursor:"pointer", lineHeight:1 }}>✕</button>
    </div>
    {cuerpo}
  </aside>;
}

// Rol del paso: asignado a mano o inferido (con el motivo), editable por admin/editor
function RolPaso({ p, i, canEdit, mano, onGuardar }) {
  const inf = rolInferido(p.codigo, i);
  const [err, setErr] = useState(null);
  const propios = p.responsables || [];
  const otros = [...new Set(ROLES_WF.map(r => r.nombre))].filter(r => !propios.includes(r));
  const cambiar = async v => setErr(await onGuardar(p.codigo, i, v === "__inferido" ? null : v));
  return <div style={{ marginTop:14 }}>
    <Titulo>Rol que lo ejecuta</Titulo>
    <div style={{ fontSize:13, color: mano || inf ? "#6d28d9" : DESIGN.muted, fontWeight:600 }}>👤 {mano || inf?.rol || "Sin rol asignado"}</div>
    <div style={{ fontSize:11.5, color:DESIGN.muted, marginTop:2 }}>{mano ? "Asignado a mano" : inf ? `Inferido: ${inf.motivo} · validar` : "Ninguno de los roles del proceso coincide claramente con este paso"}</div>
    {canEdit && <select value={mano || "__inferido"} onChange={e => cambiar(e.target.value)} style={{ marginTop:6, width:"100%", fontSize:12.5, padding:"6px 8px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:7, fontFamily:DESIGN.font, background:"#fff" }}>
      <option value="__inferido">{inf ? `Automático (${inf.rol})` : "Automático (sin rol)"}</option>
      {propios.length > 0 && <optgroup label="Roles de este proceso">{propios.map(r => <option key={r} value={r}>{r}</option>)}</optgroup>}
      <optgroup label="Otros roles">{otros.map(r => <option key={r} value={r}>{r}</option>)}</optgroup>
    </select>}
    {err && <div style={{ fontSize:11.5, color:"#b91c1c", marginTop:4 }}>No se pudo guardar: {err}</div>}
  </div>;
}

function Titulo({ children }) {
  return <div style={{ fontSize:10.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", textTransform:"uppercase", margin:"14px 0 6px" }}>{children}</div>;
}
function Ref({ c, onIr }) {
  return <button onClick={() => onIr({ codigo:c })} style={{ display:"block", width:"100%", textAlign:"left", fontSize:12, color:"#6d28d9", background:"#faf5ff", border:"1px solid #ede9fe", borderRadius:6, padding:"5px 8px", marginBottom:4, cursor:"pointer", fontFamily:DESIGN.font }}>
    <b>{c}</b> · {PROCESOS[c].nombre} <span style={{ color:DESIGN.muted }}>· {corto(SILO_LABELS[PROCESOS[c].silo])}</span></button>;
}
function Roles({ lista }) {
  return <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{lista.map(r => <span key={r} style={{ fontSize:11.5, color:"#6d28d9", background:"#f5f3ff", border:"1px solid #ddd6fe", borderRadius:999, padding:"2px 9px" }}>👤 {r}</span>)}</div>;
}

// ── Sistemas: qué depende de cada uno ────────────────────────────────────────
function VistaSistemas({ onIr, navigate }) {
  const lista = Object.entries(SISTEMAS_WF).map(([id, m]) => ({ id, ...m, imp:IMPACTO_SISTEMA[id] })).filter(s => s.imp.pasos).sort((a,b) => b.imp.pasos - a.imp.pasos);
  const [selId, setSelId] = useState(lista[0]?.id);
  const s = lista.find(x => x.id === selId);
  const max = Math.max(...lista.map(x => x.imp.pasos));
  const porSilo = s ? SILOS_WF.map(silo => ({ silo, procs: silo.procesos.filter(c => s.imp.procesos[c]) })).filter(x => x.procs.length) : [];
  return <div>
    <p style={{ fontSize:13, color:DESIGN.inkSoft, margin:"0 0 14px", lineHeight:1.6 }}>Cada sistema con todo lo que depende de él. Elige uno para ver qué pasos, procesos y silos se afectan si cambia, falla o se reemplaza.</p>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:10, marginBottom:18 }}>
      {lista.map(x => { const on = x.id === selId;
        return <button key={x.id} onClick={() => setSelId(x.id)} style={{ textAlign:"left", background:"#fff", border:`1.5px solid ${on ? x.color : DESIGN.border}`, boxShadow: on ? `0 0 0 3px ${x.color}22` : DESIGN.shadowCard, borderRadius:10, padding:"12px 14px", cursor:"pointer", fontFamily:DESIGN.font }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}><Icono s={x.id} size={26}/><span style={{ fontSize:14, fontWeight:700, color:DESIGN.ink }}>{x.label}</span></div>
          <div style={{ height:5, background:DESIGN.sunken2, borderRadius:3, margin:"10px 0 6px" }}><div style={{ width:`${x.imp.pasos / max * 100}%`, height:"100%", background:x.color, borderRadius:3 }}/></div>
          <div style={{ fontSize:12, color:DESIGN.muted }}>{x.imp.pasos} pasos · {Object.keys(x.imp.procesos).length} procesos · {x.imp.silos.size} silos</div>
        </button>; })}
    </div>
    {s && <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderTop:`3px solid ${s.color}`, borderRadius:12, padding:"16px 18px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <Icono s={s.id} size={30}/><h3 style={{ margin:0, fontSize:18, color:DESIGN.ink }}>{s.label}</h3>
        <span style={{ fontSize:13, color:DESIGN.muted }}>impacto: {s.imp.pasos} pasos · {Object.keys(s.imp.procesos).length} procesos · {s.imp.silos.size} silos · {s.imp.pantallas.size} pantallas{s.imp.tablas.size ? ` · ${s.imp.tablas.size} tablas` : ""}</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          <button onClick={() => onIr({ silo:"maestro", sistema:s.id })} style={{ fontSize:12.5, fontWeight:700, color:"#fff", background:s.color, border:"none", borderRadius:7, padding:"7px 12px", cursor:"pointer" }}>Resaltar en el mapa maestro</button>
          {s.ir && <button onClick={() => navigate(s.ir)} style={{ fontSize:12.5, fontWeight:700, color:DESIGN.ink, background:DESIGN.sunken2, border:"none", borderRadius:7, padding:"7px 12px", cursor:"pointer" }}>Ver en su módulo ›</button>}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12, marginTop:14 }}>
        {porSilo.map(({ silo, procs }) => <div key={silo.id} style={{ background:DESIGN.sunken, border:`1px solid ${DESIGN.border}`, borderRadius:9, padding:"10px 12px" }}>
          <button onClick={() => onIr({ silo:silo.id, sistema:s.id })} style={{ fontSize:13, fontWeight:700, color:DESIGN.ink, background:"none", border:"none", padding:0, cursor:"pointer", fontFamily:DESIGN.font, marginBottom:6 }}>{silo.label} ›</button>
          {procs.map(c => <button key={c} onClick={() => onIr({ codigo:c, sistema:s.id })} style={{ display:"flex", width:"100%", gap:8, textAlign:"left", fontSize:12, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"5px 8px", marginBottom:4, cursor:"pointer", fontFamily:DESIGN.font }}>
            <b style={{ color:DESIGN.inkSoft }}>{c}</b><span style={{ flex:1, color:DESIGN.ink }}>{PROCESOS[c].nombre}</span><span style={{ color:s.color, fontWeight:700, whiteSpace:"nowrap" }}>{s.imp.procesos[c]} paso{s.imp.procesos[c] > 1 ? "s" : ""}</span></button>)}
        </div>)}
      </div>
      {s.imp.tablas.size > 0 && <>
        <div style={{ fontSize:10.5, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", margin:"16px 0 8px" }}>TABLAS DE SU BASE QUE USAN ESTOS PROCESOS · {s.imp.tablas.size}</div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {[...s.imp.tablas.entries()].sort((a,b) => b[1].size - a[1].size).map(([t, procs]) => <button key={t} title={`Usada en: ${[...procs].join(", ")}`}
            onClick={() => s.schema !== "softland" && navigate({ tab:"integrations", cat:s.schema, table:t })}
            style={{ fontSize:11, fontFamily:"'Courier New', monospace", color:"#0e7490", background:"#ecfeff", border:"1px solid #cffafe", borderRadius:4, padding:"2px 7px", cursor:"pointer" }}>{t} <span style={{ color:DESIGN.muted }}>·{procs.size}</span></button>)}
        </div></>}
    </div>}
  </div>;
}

// ── Roles: qué procesos ejecuta cada rol ─────────────────────────────────────
function VistaRoles({ onIr }) {
  const [q, setQ] = useState("");
  const [selN, setSelN] = useState(ROLES_WF[0]?.nombre);
  const lista = ROLES_WF.filter(r => r.nombre.toLowerCase().includes(q.toLowerCase()));
  const r = ROLES_WF.find(x => x.nombre === selN);
  const porSilo = r ? SILOS_WF.map(s => ({ s, procs: s.procesos.filter(c => r.procesos.includes(c)) })).filter(x => x.procs.length) : [];
  return <div>
    <p style={{ fontSize:13, color:DESIGN.inkSoft, margin:"0 0 14px", lineHeight:1.6 }}>Los roles responsables de cada proceso, según las fichas. Por ahora el rol está asignado al proceso completo; asignarlo paso por paso queda para la siguiente entrega (marcado como inferido, para validar).</p>
    <div style={{ display:"flex", gap:14, alignItems:"flex-start", flexWrap:"wrap" }}>
      <div style={{ flex:"1 1 280px", maxWidth:380, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:12, padding:10 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar rol…" style={{ width:"100%", boxSizing:"border-box", fontSize:13, padding:"7px 10px", border:`1px solid ${DESIGN.borderStrong}`, borderRadius:7, marginBottom:8, fontFamily:DESIGN.font }}/>
        <div style={{ maxHeight:560, overflowY:"auto" }}>
          {lista.map(x => <button key={x.nombre} onClick={() => setSelN(x.nombre)} style={{ display:"flex", width:"100%", gap:8, alignItems:"center", textAlign:"left", fontSize:13, color:DESIGN.ink, background: x.nombre === selN ? "#f5f3ff" : "transparent", border:"none", borderRadius:7, padding:"7px 9px", cursor:"pointer", fontFamily:DESIGN.font }}>
            <span style={{ flex:1 }}>👤 {x.nombre}</span><span style={{ fontSize:11.5, color:"#6d28d9", fontWeight:700 }}>{x.procesos.length}</span></button>)}
        </div>
      </div>
      {r && <div style={{ flex:"2 1 420px", background:"#fff", border:`1px solid ${DESIGN.border}`, borderTop:"3px solid #7c3aed", borderRadius:12, padding:"16px 18px" }}>
        <h3 style={{ margin:"0 0 4px", fontSize:18, color:DESIGN.ink }}>👤 {r.nombre}</h3>
        <div style={{ fontSize:13, color:DESIGN.muted, marginBottom:12 }}>Responsable en {r.procesos.length} proceso{r.procesos.length > 1 ? "s" : ""} de {porSilo.length} silo{porSilo.length > 1 ? "s" : ""}</div>
        {porSilo.map(({ s, procs }) => <div key={s.id} style={{ marginBottom:10 }}>
          <div style={{ fontSize:12, fontWeight:700, color:DESIGN.inkSoft, marginBottom:4 }}>{s.label}</div>
          {procs.map(c => <button key={c} onClick={() => onIr({ codigo:c })} style={{ display:"flex", width:"100%", gap:8, textAlign:"left", fontSize:12.5, background:DESIGN.sunken, border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"6px 9px", marginBottom:4, cursor:"pointer", fontFamily:DESIGN.font }}>
            <b style={{ color:DESIGN.inkSoft }}>{c}</b><span style={{ flex:1, color:DESIGN.ink }}>{PROCESOS[c].nombre}</span><span style={{ color:DESIGN.muted }}>{PROCESOS[c].pasos.length} pasos ›</span></button>)}
        </div>)}
      </div>}
    </div>
  </div>;
}

// ── Cambios: novedades publicadas + ediciones de los lienzos ────────────────
function VistaCambios({ layouts }) {
  const { doc } = useNovedadesDoc();
  const ediciones = Object.values(layouts || {}).sort((a,b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
  const fecha = f => f ? new Date(f).toLocaleString("es-CR", { dateStyle:"medium", timeStyle:"short" }) : "";
  return <div style={{ display:"flex", gap:14, flexWrap:"wrap", alignItems:"flex-start" }}>
    <div style={{ flex:"2 1 460px", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:12, padding:"16px 18px" }}>
      <h3 style={{ margin:"0 0 2px", fontSize:16, color:DESIGN.ink }}>Novedades del BPA</h3>
      <div style={{ fontSize:12, color:DESIGN.muted, marginBottom:12 }}>{doc?.fecha}</div>
      {(doc?.items || []).map(it => <div key={it.id} style={{ borderLeft:`3px solid ${it.estado === "publicada" ? "#2563eb" : DESIGN.borderStrong}`, padding:"4px 0 4px 12px", marginBottom:10, opacity: it.estado === "publicada" ? 1 : 0.6 }}>
        <div style={{ fontSize:13.5, fontWeight:700, color:DESIGN.ink }}>{it.titulo} {it.estado !== "publicada" && <span style={{ fontSize:10.5, color:DESIGN.muted, fontWeight:500 }}>· anterior</span>}</div>
        <div style={{ fontSize:12.5, color:DESIGN.inkSoft, lineHeight:1.5 }}>{it.detalle}</div>
      </div>)}
    </div>
    <div style={{ flex:"1 1 280px", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:12, padding:"16px 18px" }}>
      <h3 style={{ margin:"0 0 10px", fontSize:16, color:DESIGN.ink }}>Ediciones de lienzos</h3>
      {ediciones.length === 0 && <div style={{ fontSize:12.5, color:DESIGN.muted }}>Todavía nadie ha reacomodado un lienzo: todos están en su acomodo automático.</div>}
      {ediciones.map(e => <div key={e.id} style={{ fontSize:12.5, color:DESIGN.ink, padding:"6px 0", borderBottom:`1px solid ${DESIGN.border}` }}>
        <b>{e.id === "maestro" ? "Mapa maestro" : SILO_LABELS[e.id] || e.id}</b>
        <div style={{ fontSize:11.5, color:DESIGN.muted }}>{fecha(e.updated_at)} · {Object.keys(e.posiciones || {}).length} tarjetas movidas · {(e.conexiones || []).length} conexiones agregadas · {(e.ocultas || []).length} ocultas</div>
      </div>)}
    </div>
  </div>;
}
