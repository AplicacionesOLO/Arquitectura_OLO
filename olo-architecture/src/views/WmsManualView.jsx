// ═══════════════════════════════════════════════════════════════════════════
// VISTA · MANUAL eFlow WMS — dentro de Operación. 122 pantallas del WMS de
// escritorio (crawl de la app, ver gen_wms_manual.mjs): captura, campos,
// botones, columnas y navegación, más el hilo del BPA:
//   PROCESO → PASO → PANTALLA → TABLA de BD   (enlaces en ambos sentidos)
// El detalle (wms_manual.json) se carga bajo demanda; los enlaces (wms_links.js)
// son livianos y los usan también la ficha de procesos e Integraciones.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from "react";
import { useNav } from "../lib/nav.js";
import { DESIGN } from "../data/constants.js";
import { SearchIcon } from "../components/icons.jsx";
import { PANTALLA_PROCESOS, PANTALLA_TABLAS, PASO_PANTALLA } from "../data/wms_links.js";
import { PROCESOS_CEDI_ORDEN } from "../data/procesos_cedi.js";
import { PROCESOS } from "../data/procesos_fichas.js";
import { Presentacion } from "../components/Presentacion.jsx";
import { slidesPantalla, slidesProceso, wmsImgUrl as imgUrl } from "../lib/presentacion.js";

const ACCENT = "#0891b2";
const KIND = { modifica: { label: "Modifica datos", color: "#b45309" }, salida: { label: "Exporta / imprime", color: "#7c3aed" },
  consulta: { label: "Consulta", color: "#0891b2" }, "estándar": { label: "Estándar", color: "#64748b" } };
const norm = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function WmsManualView({ focus }) {
  const [data, setData] = useState(null);
  const [modName, setModName] = useState(null);
  const [screenId, setScreenId] = useState(null);
  const [q, setQ] = useState("");
  const [show, setShow] = useState(null); // { slides, start }
  const { navigate } = useNav();

  useEffect(() => { import("../data/wms_manual.json").then(m => setData(m.default)); }, []);

  const byId = useMemo(() => {
    if (!data) return {};
    return Object.fromEntries(data.modules.flatMap(m => m.screens.map(s => [s.id, { ...s, module: m.name }])));
  }, [data]);

  // Foco desde otro módulo (paso de proceso o tabla): abre la pantalla.
  useEffect(() => {
    if (!data || !focus?.screen || !byId[focus.screen]) return;
    setModName(byId[focus.screen].module); setScreenId(focus.screen); setQ("");
  }, [focus, data, byId]);

  if (!data) return <div style={{ padding:24, textAlign:"center", color:DESIGN.muted, fontSize:13 }}>Cargando manual…</div>;

  const mod = data.modules.find(m => m.name === (modName || data.modules[1].name));
  const nq = norm(q.trim());
  const results = nq ? Object.values(byId).filter(s => norm(`${s.module} ${s.option} ${s.title} ${s.tables.flatMap(t => t.columns.map(c => c.name)).join(" ")} ${s.fields.map(f => f.label || f.name).join(" ")}`).includes(nq)) : null;
  const list = results || mod.screens.map(s => byId[s.id]);
  const sel = screenId && byId[screenId];

  return <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
    <nav style={{ width:210, minWidth:210, background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, overflow:"hidden", flexShrink:0, position:"sticky", top:20, maxHeight:"calc(100vh - 40px)", overflowY:"auto" }}>
      <div style={{ padding:"10px 14px", borderBottom:`1px solid ${DESIGN.sunken2}`, background:DESIGN.sunken, fontSize:10, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.08em", textTransform:"uppercase" }}>eFlow WMS {data.version} · módulos</div>
      {data.modules.map(m => {
        const isA = !results && mod.name === m.name;
        const usados = m.screens.filter(s => PANTALLA_PROCESOS[s.id]).length;
        return <button key={m.name} onClick={()=>{ setModName(m.name); setQ(""); }} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 14px", border:"none", borderLeft:`3px solid ${isA?ACCENT:"transparent"}`, borderBottom:`1px solid ${DESIGN.sunken}`, background:isA?ACCENT+"12":"transparent", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
          <span style={{ flex:1, fontSize:12, fontWeight:isA?700:500, color:isA?DESIGN.ink:DESIGN.inkSoft }}>{m.name}</span>
          {usados > 0 && <span title="Pantallas usadas en procesos" style={{ fontSize:9.5, fontWeight:700, color:"#16a34a" }}>●{usados}</span>}
          <span style={{ fontSize:10, color:DESIGN.mutedSoft }}>{m.screens.length}</span>
        </button>;
      })}
      <div style={{ padding:"10px 14px", fontSize:10.5, color:DESIGN.mutedSoft, lineHeight:1.5 }}>
        <span style={{ color:"#16a34a", fontWeight:700 }}>●</span> pantallas que usan los procesos CEDI
      </div>
    </nav>

    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ position:"relative", maxWidth:420, marginBottom:12 }}>
        <SearchIcon style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:13, color:DESIGN.mutedSoft }}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar pantalla, campo o columna en todo el WMS…"
          style={{ width:"100%", boxSizing:"border-box", fontSize:13, border:`1px solid ${DESIGN.borderStrong}`, borderRadius:8, padding:"8px 12px 8px 32px", fontFamily:DESIGN.font, outline:"none" }}/>
      </div>
      {!results && <RecorridosProceso onPlay={(codigo) => setShow({ slides: slidesProceso(codigo), start: 0 })}/>}
      {results
        ? <div style={{ fontSize:12, color:DESIGN.muted, marginBottom:10 }}>{results.length} pantalla{results.length===1?"":"s"} con "{q}"</div>
        : <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:16, fontWeight:700, color:DESIGN.ink }}>Módulo {mod.name}</div>
            <p style={{ fontSize:12.5, color:DESIGN.inkSoft, lineHeight:1.6, margin:"4px 0 0", maxWidth:820 }}>{mod.info}</p>
          </div>}
      <div style={{ display:"grid", gridTemplateColumns:`repeat(auto-fill,minmax(${sel?200:230}px,1fr))`, gap:10 }}>
        {list.map(s => <ScreenCard key={s.id} s={s} active={s.id === screenId} showModule={!!results} onClick={()=>setScreenId(s.id === screenId ? null : s.id)}/>)}
      </div>
    </div>

    {sel && <ScreenPanel key={sel.id} s={sel} byId={byId} onOpen={setScreenId} onClose={()=>setScreenId(null)} onPlay={setShow}/>}
    {show && <Presentacion slides={show.slides} start={show.start} onClose={()=>setShow(null)}
      onOpenScreen={(id) => { setShow(null); setModName(byId[id].module); setScreenId(id); setQ(""); }}
      onOpenWmh={(id) => { setShow(null); navigate({ tab:"ops", view:"wmh", wmhScreen:id }); }}/>}
  </div>;
}

// Recorridos guiados: cada proceso CEDI con pasos en eFlow se puede presentar
// pantalla por pantalla, en el orden de su procedimiento.
function RecorridosProceso({ onPlay }) {
  const cedi = PROCESOS_CEDI_ORDEN.filter(c => PASO_PANTALLA[c]);
  const borradores = Object.keys(PROCESOS).filter(c => PROCESOS[c].borrador && PASO_PANTALLA[c]);
  return <div style={{ background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
    <div style={{ fontSize:11, fontWeight:700, color:DESIGN.muted, marginBottom:6 }}>▶ Recorridos guiados por proceso <span style={{ fontWeight:400, color:DESIGN.mutedSoft }}>· las pantallas en el orden en que se usan</span></div>
    {[["Procedimientos CEDI", cedi, false], ["Borradores de silos de referencia", borradores, true]].map(([titulo, codes, borr]) => codes.length > 0 && <div key={titulo} style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center", marginTop:4 }}>
      <span style={{ fontSize:10.5, color:DESIGN.mutedSoft, marginRight:2 }}>{titulo}</span>
      {codes.map(c => <button key={c} onClick={()=>onPlay(c)} title={`Presentar los pasos de ${PROCESOS[c].nombre}`}
        style={{ fontSize:11, color:DESIGN.inkSoft, background:DESIGN.sunken, border:`1px ${borr?"dashed":"solid"} ${DESIGN.border}`, borderRadius:6, padding:"3px 8px", cursor:"pointer", fontFamily:DESIGN.font }}>
        <b>{c}</b> {PROCESOS[c].nombre}
      </button>)}
    </div>)}
  </div>;
}

function ScreenCard({ s, active, onClick, showModule }) {
  const procs = PANTALLA_PROCESOS[s.id] || [];
  const cols = s.tables.reduce((n, t) => n + t.columns.filter(c => !c.hidden).length, 0);
  return <button onClick={onClick} style={{ textAlign:"left", background:"#fff", border:`1px solid ${active?DESIGN.ink:DESIGN.border}`, boxShadow:active?`0 0 0 1px ${DESIGN.ink}`:"none", borderRadius:9, padding:0, cursor:"pointer", fontFamily:DESIGN.font, overflow:"hidden", display:"flex", flexDirection:"column" }}>
    {s.img
      ? <img src={imgUrl(s.img)} alt="" loading="lazy" style={{ width:"100%", aspectRatio:"1800/969", objectFit:"cover", objectPosition:"top left", display:"block", borderBottom:`1px solid ${DESIGN.border}`, background:DESIGN.sunken }}/>
      : <div style={{ aspectRatio:"1800/969", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:DESIGN.mutedSoft, background:DESIGN.sunken, borderBottom:`1px solid ${DESIGN.border}` }}>sin captura</div>}
    <div style={{ padding:"8px 10px 10px" }}>
      {showModule && <div style={{ fontSize:10, color:DESIGN.muted }}>{s.module}</div>}
      <div style={{ fontSize:12.5, fontWeight:700, color:DESIGN.ink }}>{s.option}</div>
      {s.title && s.title !== s.option && <div style={{ fontSize:10.5, color:DESIGN.muted }}>ventana «{s.title}»</div>}
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:6 }}>
        {procs.length > 0 && <span style={{ fontSize:9.5, fontWeight:700, color:"#16a34a", background:"#16a34a14", borderRadius:4, padding:"1px 5px" }}>{procs.map(p => p.codigo).join(" · ")}</span>}
        {cols > 0 && <span style={{ fontSize:9.5, color:DESIGN.muted, background:DESIGN.sunken2, borderRadius:4, padding:"1px 5px" }}>{cols} columnas</span>}
        {s.buttons.length > 0 && <span style={{ fontSize:9.5, color:DESIGN.muted, background:DESIGN.sunken2, borderRadius:4, padding:"1px 5px" }}>{s.buttons.length} acciones</span>}
      </div>
    </div>
  </button>;
}

const TABS = [["conexiones","Conexiones"],["pantalla","Pantalla"],["campos","Campos y acciones"],["columnas","Columnas"]];

function ScreenPanel({ s, byId, onOpen, onClose, onPlay }) {
  const [tab, setTab] = useState("conexiones");
  const { navigate } = useNav();
  const procs = PANTALLA_PROCESOS[s.id] || [];
  const tablas = PANTALLA_TABLAS[s.id] || [];
  const vistas = slidesPantalla(s); // ventana + pestañas + lo que abre (menú «…», diálogos)
  return <aside style={{ width:500, flexShrink:0, position:"sticky", top:20, maxHeight:"calc(100vh - 40px)", display:"flex", flexDirection:"column", background:"#fff", border:`1px solid ${DESIGN.border}`, borderLeft:`4px solid ${ACCENT}`, borderRadius:10, overflow:"hidden", boxSizing:"border-box" }}>
    <div style={{ padding:"12px 16px 0", flexShrink:0 }}>
      <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:10.5, color:DESIGN.muted }}>{s.module} › {s.option}</div>
          <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink }}>{s.title || s.option}</div>
          {s.formId && <div style={{ fontSize:10, color:DESIGN.mutedSoft, fontFamily:"'Courier New', monospace" }}>{s.formId}{s.loadSeconds ? ` · carga ${s.loadSeconds}s` : ""}</div>}
        </div>
        <button onClick={onClose} title="Cerrar" style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:16 }}>✕</button>
      </div>
      {s.img && <div style={{ position:"relative", marginTop:10, cursor:"zoom-in" }} onClick={()=>onPlay({ slides: vistas, start: 0 })} title="Ver en grande y recorrer la pantalla">
        <img src={imgUrl(s.img)} alt={`Captura de ${s.option}`} style={{ width:"100%", display:"block", borderRadius:6, border:`1px solid ${DESIGN.border}` }}/>
        <span style={{ position:"absolute", right:8, bottom:8, fontSize:11, fontWeight:700, color:"#fff", background:"rgba(15,23,42,0.8)", borderRadius:6, padding:"3px 8px" }}>
          ⤢ Ver en grande{vistas.length > 1 ? ` · ${vistas.length} vistas` : ""}
        </span>
      </div>}
      <div style={{ display:"flex", gap:2, marginTop:10, borderBottom:`1px solid ${DESIGN.border}` }}>
        {TABS.map(([id,label]) => <button key={id} onClick={()=>setTab(id)} style={{ fontSize:11.5, fontWeight:tab===id?700:500, color:tab===id?DESIGN.ink:DESIGN.muted, background:"none", border:"none", borderBottom:`2px solid ${tab===id?ACCENT:"transparent"}`, padding:"6px 8px", cursor:"pointer", fontFamily:DESIGN.font, marginBottom:-1 }}>{label}</button>)}
      </div>
    </div>
    <div style={{ padding:"12px 16px 16px", overflowY:"auto", flex:1 }}>
      {tab==="conexiones" && <>
        <Hilo procs={procs} s={s} tablas={tablas}/>
        <L n={procs.length}>Procesos que usan esta pantalla</L>
        {procs.length === 0 && <T>Ningún procedimiento CEDI la cita todavía.</T>}
        <div style={{ display:"grid", gap:6 }}>
          {procs.map(({ codigo, pasos }) => {
            const p = PROCESOS[codigo];
            return <div key={codigo} style={linkBox}>
              <div style={{ display:"flex", gap:8, alignItems:"baseline" }}>
                <button onClick={()=>navigate({ tab:"olo-arch", codigo })} title="Abrir la ficha del proceso" style={{ ...inlineLink, fontSize:12, color:DESIGN.ink, flex:1, textAlign:"left" }}>{codigo} · {p.nombre} ↗</button>
                {pasos.length > 0 && <button onClick={()=>onPlay({ slides: slidesProceso(codigo), start: pasos[0] - 1 })} title="Presentar el proceso desde este paso"
                  style={{ fontSize:10.5, fontWeight:700, color:"#fff", background:ACCENT, border:"none", borderRadius:5, padding:"2px 8px", cursor:"pointer", fontFamily:DESIGN.font, flexShrink:0 }}>▶ Recorrido desde paso {pasos[0]}</button>}
              </div>
              {pasos.length > 0 && <div style={{ fontSize:11, color:DESIGN.muted, marginTop:2 }}>
                {pasos.map(n => <div key={n}>Paso {n}: {p.pasos[n-1].texto}</div>)}
              </div>}
            </div>;
          })}
        </div>
        <L n={tablas.length}>Tablas de BD (eFlow · EFLOW_OLO)</L>
        {tablas.length === 0 && <T>Sin tablas inferidas para esta pantalla.</T>}
        <div style={{ display:"grid", gap:5 }}>
          {tablas.map(t => <div key={t.tabla} style={{ display:"flex", gap:8, alignItems:"baseline" }}>
            <button onClick={()=>navigate({ tab:"integrations", cat:"efw", table:t.tabla })} title="Ver la tabla en Integraciones" style={{ fontSize:11.5, fontWeight:700, color:ACCENT, background:"none", border:"none", padding:0, cursor:"pointer", fontFamily:"'Courier New', monospace", flexShrink:0 }}>{t.tabla}</button>
            <span style={{ fontSize:10.5, color:DESIGN.muted }}>
              {t.columnas.length > 0 ? `columnas: ${t.columnas.join(", ")}` : `usada por ${t.porProceso} en esta pantalla`}
            </span>
          </div>)}
        </div>
        {tablas.length > 0 && <div style={{ fontSize:10, color:DESIGN.mutedSoft, marginTop:6 }}>Inferidas: columnas del grid que coinciden con columnas clave de la tabla, o tablas que el proceso usa en esta pantalla.</div>}
        {s.nav.length > 0 && <>
          <L n={s.nav.length}>Navegación desde esta pantalla</L>
          <div style={{ display:"grid", gap:4 }}>
            {s.nav.map((n,i) => <div key={i} style={{ fontSize:11.5, color:DESIGN.inkSoft }}>
              {n.action} → {byId[n.to] ? <button onClick={()=>onOpen(n.to)} style={{ ...inlineLink }}>{n.toTitle}</button> : <b>{n.toTitle}</b>}
            </div>)}
          </div>
        </>}
      </>}
      {tab==="pantalla" && <>
        {!s.img && <T>{s.reason || "Sin captura."}</T>}
        {vistas.map((sl, k) => <div key={k}>
          <L>{sl.titulo}</L>
          <img src={sl.img} alt={sl.titulo} loading="lazy" onClick={()=>onPlay({ slides: vistas, start: k })} title="Ver en grande"
            style={{ width:"100%", borderRadius:6, border:`1px solid ${DESIGN.border}`, cursor:"zoom-in" }}/>
          <div style={{ fontSize:10.5, color:DESIGN.muted, marginTop:2 }}>{sl.texto}</div>
        </div>)}
        {s.tabs.length > 0 && <><L>Pestañas</L><div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{s.tabs.map(t => <Chip key={t}>{t}</Chip>)}</div></>}
      </>}
      {tab==="campos" && <>
        <L n={s.fields.length}>Campos / filtros</L>
        {s.fields.length === 0 ? <T>Sin campos de captura.</T> : <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{s.fields.map((f,i) => <Chip key={i}>{f.label || f.name}{f.type ? <span style={{ color:DESIGN.mutedSoft }}> · {f.type}</span> : null}</Chip>)}</div>}
        <L n={s.buttons.length}>Acciones / botones</L>
        <div style={{ display:"grid", gap:5 }}>
          {s.buttons.map((b,i) => <div key={i} style={{ display:"flex", gap:8, alignItems:"baseline", fontSize:12 }}>
            <b style={{ color:b.enabled===false?DESIGN.mutedSoft:DESIGN.ink, flexShrink:0 }}>{b.name}</b>
            <span style={{ fontSize:9.5, fontWeight:700, color:(KIND[b.kind]||KIND["estándar"]).color, flexShrink:0 }}>{(KIND[b.kind]||KIND["estándar"]).label}</span>
            {b.desc && <span style={{ color:DESIGN.muted, fontSize:11 }}>{b.desc}</span>}
          </div>)}
        </div>
        {s.menu.length > 0 && <><L>Menú «…»</L>{s.menu.map(g => <div key={g.group} style={{ fontSize:12, color:DESIGN.inkSoft, marginBottom:4 }}><b>{g.group}:</b> {g.items.map(it => it.name).join(" · ")}</div>)}</>}
      </>}
      {tab==="columnas" && (s.tables.length === 0 ? <T>Sin grids en esta pantalla.</T> : s.tables.map((t,i) => <div key={i}>
        <L n={t.columns.length}>Grid «{t.title}»</L>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {t.columns.map(c => <span key={c.name} title={c.hidden ? "Columna oculta por defecto" : undefined} style={{ fontSize:10.5, color:c.hidden?DESIGN.mutedSoft:DESIGN.inkSoft, background:c.hidden?"transparent":DESIGN.sunken2, border:`1px ${c.hidden?"dashed":"solid"} ${DESIGN.border}`, borderRadius:4, padding:"1px 6px" }}>{c.name}</span>)}
        </div>
      </div>))}
    </div>
  </aside>;
}

// Hilo conductor: dónde cae esta pantalla dentro de Proceso → Paso → Pantalla → Tabla
function Hilo({ procs, s, tablas }) {
  const cell = (label, value, on) => <div style={{ flex:1, minWidth:0, padding:"6px 8px", borderRadius:6, background:on?ACCENT+"14":DESIGN.sunken, border:`1px solid ${on?ACCENT+"55":DESIGN.border}` }}>
    <div style={{ fontSize:9, fontWeight:700, color:DESIGN.muted, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</div>
    <div style={{ fontSize:11, fontWeight:700, color:on?DESIGN.ink:DESIGN.inkSoft, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</div>
  </div>;
  const arrow = <span style={{ color:DESIGN.mutedSoft, fontSize:11 }}>→</span>;
  const nPasos = procs.reduce((n, p) => n + p.pasos.length, 0);
  return <div style={{ display:"flex", alignItems:"center", gap:4 }}>
    {cell("Proceso", procs.length ? procs.map(p => p.codigo).join(", ") : "—")}{arrow}
    {cell("Paso", nPasos ? `${nPasos} paso${nPasos===1?"":"s"}` : "—")}{arrow}
    {cell("Pantalla", s.option, true)}{arrow}
    {cell("Tabla", tablas.length ? `${tablas.length} tabla${tablas.length===1?"":"s"}` : "—")}
  </div>;
}

const linkBox = { textAlign:"left", background:"#fff", border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"6px 8px", cursor:"pointer", fontFamily:DESIGN.font };
const inlineLink = { background:"none", border:"none", padding:0, color:ACCENT, fontWeight:700, cursor:"pointer", fontFamily:DESIGN.font, fontSize:11.5 };
function L({ children, n }) {
  return <div style={{ fontSize:10, fontWeight:700, color:DESIGN.muted, letterSpacing:"0.07em", textTransform:"uppercase", margin:"14px 0 6px" }}>{children}{n != null && <span style={{ color:DESIGN.mutedSoft, fontWeight:400 }}> · {n}</span>}</div>;
}
function T({ children }) { return <p style={{ fontSize:12, color:DESIGN.muted, margin:0 }}>{children}</p>; }
function Chip({ children }) { return <span style={{ fontSize:11, color:DESIGN.inkSoft, background:DESIGN.sunken2, border:`1px solid ${DESIGN.border}`, borderRadius:6, padding:"2px 7px" }}>{children}</span>; }
