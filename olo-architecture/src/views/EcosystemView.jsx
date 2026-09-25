// ═══════════════════════════════════════════════════════════════════════════
// VISTA · ECOSISTEMA
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { SOFTLAND_MODULES, OPS_MODULES, SATELLITE_MODULES, EN_OLO } from "../data/softland.js";
import { MODULE_COLORS, OPS_COLORS, DESIGN } from "../data/constants.js";
import { StatusBadge, LayerBlock } from "../components/ui.jsx";
import { NODO_SIMPLE, queConexion } from "../data/ecosistema_simple.js";
import { useAncho } from "../lib/useAncho.js";

export function EcosystemView() {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const W=1200, H=720;
  const erpNodes=[{code:"AS",x:90,y:380,label:"Maestros"},{code:"CG",x:250,y:280},{code:"CB",x:380,y:230},{code:"CC",x:510,y:230},{code:"CP",x:640,y:230},{code:"DE",x:770,y:230},{code:"FA",x:510,y:320},{code:"CO",x:640,y:320},{code:"CI",x:770,y:320},{code:"AF",x:380,y:410},{code:"GN",x:510,y:410},{code:"MF",x:640,y:410},{code:"RH",x:770,y:410},{code:"RP",x:250,y:470},{code:"POS",x:380,y:490},{code:"FR",x:510,y:490},{code:"AC",x:640,y:490},{code:"CCH",x:770,y:490},{code:"PY",x:900,y:410},{code:"FC",x:900,y:320},{code:"CR",x:1030,y:320}];
  const opsNodes=[{code:"eIntegra",label:"middleware\nERP ↔ WMS",x:100,y:642},{code:"WMS-D",label:"eflow WMS\nDesktop",x:280,y:642},{code:"WMS-RF",label:"handheld RF\nv3.1.73.1",x:460,y:642},{code:"WMH",label:"WMH\nTorre Control",x:660,y:642},{code:"SORTER",label:"SORTER CLIRO\nMecalux",x:860,y:642},{code:"Apolo",label:"app móvil\ndespacho EPA",x:1060,y:642}];
  const extNodes=[{code:"EDI",label:"Portal · EDI",x:80,y:100},{code:"Aduanas",label:"Aduanero",x:230,y:100},{code:"TMSI",label:"TMS Internacional",x:380,y:100},{code:"Hacienda",label:"Factura\nelectrónica CR",x:530,y:100,c:true},{code:"BI",label:"BI · DW",x:680,y:100},{code:"ZF",label:"Zona Franca SEL",x:830,y:100},{code:"SFL-CLI",label:"Softland\ndel cliente",x:1000,y:100,c:true}];
  const links=[{a:"AS",b:"CG",c:true},{a:"AS",b:"CB",c:true},{a:"AS",b:"CC",c:true},{a:"AS",b:"CP",c:true},{a:"AS",b:"FA",c:true},{a:"AS",b:"CO",c:true},{a:"AS",b:"CI",c:true},{a:"AS",b:"AF",c:true},{a:"AS",b:"GN",c:true},{a:"CB",b:"CG",c:true},{a:"CC",b:"CG",c:true},{a:"CP",b:"CG",c:true},{a:"FA",b:"CG",c:true},{a:"CO",b:"CG",c:true},{a:"CI",b:"CG",c:true},{a:"AF",b:"CG",c:true},{a:"GN",b:"CG",c:true},{a:"MF",b:"CG",c:true},{a:"FA",b:"CC",c:true},{a:"FA",b:"CI",c:true},{a:"CO",b:"CP",c:true},{a:"CO",b:"CI",c:true},{a:"CC",b:"CB",c:true},{a:"CP",b:"CB",c:true},{a:"CCH",b:"CB",c:true},{a:"PY",b:"CB",c:true},{a:"GN",b:"CB",c:true},{a:"RH",b:"CB",c:true},{a:"FC",b:"CB",c:true},{a:"FA",b:"MF",c:true},{a:"POS",b:"MF",c:true},{a:"FR",b:"MF",c:true},{a:"AC",b:"MF",c:true},{a:"CC",b:"MF",c:true},{a:"CP",b:"MF",c:true},{a:"CO",b:"MF",c:true},{a:"CCH",b:"MF",c:true},{a:"FA",b:"DE",c:true},{a:"DE",b:"CP",c:true},{a:"DE",b:"Hacienda",c:true},{a:"MF",b:"Hacienda",c:true},{a:"CR",b:"CG",c:false},{a:"CR",b:"CO",c:false},{a:"RP",b:"CG",c:false},{a:"SFL-CLI",b:"eIntegra",c:false},{a:"eIntegra",b:"WMS-D",c:true},{a:"FA",b:"WMS-D",c:false},{a:"CO",b:"WMS-D",c:false},{a:"WMS-D",b:"WMS-RF",c:true},{a:"WMS-D",b:"WMH",c:true},{a:"SORTER",b:"WMH",c:false},{a:"WMS-D",b:"SORTER",c:true},{a:"SORTER",b:"Apolo",c:true},{a:"Apolo",b:"WMS-D",c:true},{a:"EDI",b:"FA",c:false},{a:"Aduanas",b:"CG",c:false},{a:"BI",b:"CG",c:false},{a:"ZF",b:"WMS-D",c:false},{a:"TMSI",b:"WMH",c:false}];
  const all=[...erpNodes.map(n=>({...n,kind:"erp"})),...opsNodes.map(n=>({...n,kind:"ops"})),...extNodes.map(n=>({...n,kind:"ext"}))];
  const lookup=Object.fromEntries(all.map(n=>[n.code,n]));

  const EXTRA = {
    eIntegra:{ code:"eIntegra", name:"eIntegra · middleware ERP ↔ WMS", status:"partial", role:"Bases EINTEGRA_COFERSA, EINTEGRA_MAYOREO y EINTEGRA_EPA (PROD CR) y eIntegra VE", purpose:"Pasa las órdenes del ERP de cada cliente (recepción y expedición) a eFlow y devuelve los cierres. Sus bases ya se leen (refresco de permisos del 25/09/2026), pero no está documentado el mecanismo ni la frecuencia (GAP·01)." },
    Apolo:{ code:"Apolo", name:"Apolo · control de despacho EPA", status:"confirmed", role:"App móvil", purpose:"Registro de tarimas con dos fotografías y control de lo que sale a tienda; se usa después del SORTER y con Carga Camión de eFlow (CEDI-04 · Despacho EPA)." },
    Hacienda:{ code:"Hacienda", name:"Ministerio de Hacienda · factura electrónica", status:"confirmed", role:"Externo · Costa Rica", purpose:"Documentos Electrónicos (DE) le envía el XML v4.4 firmado de cada factura y nota y recibe su respuesta; Monitor Fiscal prepara la declaración D104. Confirmado en el manual del Softland de OLO." },
    "SFL-CLI":{ code:"SFL-CLI", name:"Softland del cliente (Cofersa y otros)", status:"partial", role:"ERP de cada cliente · base MAR (QA CR)", purpose:"Es otro Softland, distinto del de OLO: el cliente registra ahí sus pedidos y compras, que llegan a eFlow por eIntegra. CEDI-07 (Facturación Cofersa) se hace en la compañía del cliente. El BPA tiene su diccionario (menú y tablas de Cofersa)." },
  };
  const enOlo = Object.fromEntries(SOFTLAND_MODULES.map(m => [m.code, m.enOlo]));
  const getDetail = (code) => EXTRA[code] || SOFTLAND_MODULES.find(m=>m.code===code) || OPS_MODULES.find(m=>m.code===code) || SATELLITE_MODULES.find(m=>m.name===code) || null;
  const active = hoveredNode || selectedNode;
  const isNodeHl = (code) => { if(!active) return false; if(active===code) return true; return links.some(l=>(l.a===active&&l.b===code)||(l.b===active&&l.a===code)); };
  const isLinkHl = (link) => active && (link.a===active||link.b===active);
  const ancho = useAncho(), angosto = ancho < 1250;
  return <div>

    <div style={{ display:"flex", flexDirection:"column", marginBottom:24 }}>
      <LayerBlock icon="◇" label="Sistemas Externos · inferidos por contexto 3PL" color="#7f8c8d" bg="rgba(127,140,141,0.08)" border="rgba(127,140,141,0.25)" radiusTop sub="Inferidos a partir del informe BPA y prácticas estándar de operadores logísticos. Sin documentación formal en el corpus accesible.">
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {[{code:"EDI",label:"Portal · EDI · Clientes"},{code:"Aduanas",label:"Sistema Aduanero · TICA"},{code:"TMSI",label:"TMS Internacional"},{code:"BI",label:"BI / Data Warehouse"},{code:"ZF",label:"Zona Franca SEL"}].map(e=>(
            <span key={e.code} style={{ fontSize:11, fontWeight:600, color:"#5e6b7a", background:"#ffffff", border:"1px dashed #b0bec5", padding:"5px 11px", borderRadius:6 }}>
              <b style={{ color:"#455A64", marginRight:6, fontFamily:DESIGN.font }}>{e.code}</b>{e.label}
            </span>
          ))}
        </div>
      </LayerBlock>
      <LayerBlock icon="⬡" label="ERP — Softland v7.00 · compañía OVERSEAS (el de OLO)" color="#c0392b" bg="rgba(192,57,43,0.05)" border="rgba(192,57,43,0.2)" sub={`${SOFTLAND_MODULES.length} módulos del producto · ${SOFTLAND_MODULES.filter(m => m.enOlo && m.enOlo !== "no").length} están en el Softland de OLO (● verde con pantallas, ● ámbar solo menú, ● rojo sin acceso) · los de borde punteado no están en OLO · el Softland de cada cliente es otro y llega a eFlow por eIntegra`}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {SOFTLAND_MODULES.map(m=>{ const c=MODULE_COLORS[m.code]??"#888"; return <div key={m.code} style={{ display:"flex", alignItems:"center", gap:7, background:"#ffffff", border:`1px solid ${c}44`, borderLeft:`3px solid ${c}`, padding:"6px 12px", borderRadius:6 }}><span style={{ fontSize:11, fontWeight:700, color:c, fontFamily:DESIGN.font }}>{m.code}</span><span style={{ fontSize:11, color:"#555" }}>{m.name}</span>{m.enOlo && <span title={EN_OLO[m.enOlo].label} style={{ fontSize:11, color:EN_OLO[m.enOlo].color }}>●</span>}</div>; })}
        </div>
      </LayerBlock>
      <LayerBlock icon="◒" label="Operación logística · ePRAC / eflow" color="#1abc9c" bg="rgba(26,188,156,0.08)" border="rgba(26,188,156,0.25)" sub="eflow Cloud Suite · WMS Desktop v3.2.8.5 coordina documentos, inventario y configuración · handheld RF v3.1.73.1 ejecuta en piso (5 módulos, 18 opciones) · WMH v4.18.4.4 es la torre de control de viajes · SORTER CLIRO clasifica el cross-docking de EPA y Apolo controla su despacho · eIntegra conecta el ERP de cada cliente">
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {OPS_MODULES.map(m=>{ const c=OPS_COLORS[m.code]??"#1abc9c"; return <div key={m.code} style={{ background:"#ffffff", border:`1px solid ${c}44`, borderLeft:`3px solid ${c}`, padding:"8px 14px", borderRadius:6, minWidth:160 }}><div style={{ fontSize:11, fontWeight:700, color:c, fontFamily:DESIGN.font, marginBottom:2 }}>{m.code}</div><div style={{ fontSize:12, color:"#444", fontWeight:600 }}>{m.name}</div></div>; })}
        </div>
      </LayerBlock>
      <LayerBlock icon="◎" label="Sistemas satélite · inferidos" color="#9b59b6" bg="rgba(155,89,182,0.08)" border="rgba(155,89,182,0.22)" radiusBottom sub="Mencionados parcialmente en manuales pero sin documentación dedicada en el corpus accesible.">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:8 }}>
          {SATELLITE_MODULES.map((s,i)=><div key={i} style={{ background:"#ffffff", border:"1px dashed #c39bd3", borderRadius:6, padding:"8px 12px" }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:3 }}><span style={{ fontSize:12, fontWeight:700, color:"#7B1FA2" }}>{s.name}</span><StatusBadge status={s.status}/></div><div style={{ fontSize:10, color:"#777", lineHeight:1.45 }}>{s.purpose}</div></div>)}
        </div>
      </LayerBlock>
    </div>
    <h3 style={{ fontSize:14, fontWeight:700, color:"#1D1D1B", margin:"0 0 4px 0" }}>Diagrama de conexiones</h3>
    <p style={{ fontSize:12, color:"#777", margin:"0 0 14px 0" }}>Líneas continuas: integración declarada en un manual, procedimiento o base leída. Líneas punteadas: inferidas por contexto. Círculos punteados: sistemas inferidos o módulos de Softland que no están en el ERP de OLO.</p>
    <div style={{ display:"flex", flexDirection:angosto ? "column" : "row", gap:14, alignItems:angosto ? "stretch" : "flex-start" }}>
    <div style={{ flex:1, minWidth:0, background:"#ffffff", border:"1px solid #e0e0e0", borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"10px 16px", borderBottom:"1px solid #f0f0f0", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8, background:"#fafafa" }}>
        <span style={{ fontSize:11, color:"#666", fontWeight:600 }}>ECOSISTEMA · 3 CAPAS · {erpNodes.length+opsNodes.length+extNodes.length} SISTEMAS</span>
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          {[["#c0392b","Confirmado",false],["#7f8c8d","Inferido",true]].map(([c,l,d])=><div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}><svg width="22" height="2"><line x1="0" y1="1" x2="22" y2="1" stroke={c} strokeWidth="1.5" strokeDasharray={d?"3 3":"0"}/></svg><span style={{ fontSize:10, color:"#666", fontWeight:500 }}>{l}</span></div>)}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", display:"block" }}>
        <rect x="0" y="40" width={W} height="120" fill="rgba(127,140,141,0.05)"/>
        <rect x="0" y="200" width={W} height="340" fill="rgba(192,57,43,0.04)"/>
        <rect x="0" y="570" width={W} height="120" fill="rgba(26,188,156,0.06)"/>
        <text x="20" y="60" fill="#7f8c8d" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em" }}>SISTEMAS EXTERNOS · HACIENDA Y ERP DEL CLIENTE CONFIRMADOS · RESTO INFERIDO</text>
        <text x="20" y="220" fill="#c0392b" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em" }}>SOFTLAND ERP v7.00 · COMPAÑÍA OVERSEAS (OLO)</text>
        <text x="20" y="589" fill="#1abc9c" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em" }}>OPERACIÓN LOGÍSTICA · ECO-EFFICIENCY / EFLOW</text>
        {links.map((link,i)=>{ const a=lookup[link.a],b=lookup[link.b]; if(!a||!b)return null; const hl=isLinkHl(link); const dim=active&&!hl; return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hl?(link.c?"#c0392b":"#7f8c8d"):(link.c?"#c0392b":"#7f8c8d")} strokeWidth={hl?2:1} strokeOpacity={dim?0.08:hl?0.9:(link.c?0.4:0.3)} strokeDasharray={link.c?"0":"3 3"} style={{ transition:"stroke-opacity 0.15s" }}/>; })}
        {all.map(n=>{ const r=n.kind==="erp"?24:36; const stroke=n.kind==="erp"?(MODULE_COLORS[n.code]??"#c0392b"):n.kind==="ops"?"#1abc9c":"#7f8c8d"; const fill=n.kind==="erp"?"#ffffff":n.kind==="ops"?"#f0fdfa":"#fafafa"; const hl=isNodeHl(n.code); const dim=active&&!hl; const isSel=selectedNode===n.code; return <g key={n.code} onClick={()=>setSelectedNode(selectedNode===n.code?null:n.code)} onMouseEnter={()=>setHoveredNode(n.code)} onMouseLeave={()=>setHoveredNode(null)} style={{ cursor:"pointer", opacity:dim?0.2:1, transition:"opacity 0.15s" }}><circle cx={n.x} cy={n.y} r={r} fill={fill} stroke={isSel?stroke:hl?stroke:stroke} strokeWidth={isSel?3.5:hl?2.5:(n.kind==="erp"?2:1.5)} strokeDasharray={(n.kind==="ext"&&!n.c)||enOlo[n.code]==="no"?"3 3":"0"} strokeOpacity={enOlo[n.code]==="no"?0.55:1}/><text x={n.x} y={n.y+(n.label?-2:4)} textAnchor="middle" fill={stroke} style={{ fontSize:n.kind==="erp"?11:10, fontWeight:700, letterSpacing:"0.04em" }}>{n.code}</text>{n.label&&n.label.split("\n").map((line,j)=><text key={j} x={n.x} y={n.y+14+j*11} textAnchor="middle" fill="#666" style={{ fontSize:9 }}>{line}</text>)}</g>; })}
      </svg>
    </div>
    <PanelConexion code={selectedNode} links={links} getDetail={getDetail} enOlo={enOlo} angosto={angosto}
      onSelect={setSelectedNode} onHover={setHoveredNode}/>
    </div>
    <div style={{ marginTop:24, padding:"14px 18px", background:"rgba(243,156,18,0.06)", border:"1px solid rgba(243,156,18,0.25)", borderLeft:"3px solid #f39c12", borderRadius:8 }}>
      <div style={{ fontSize:11, fontWeight:700, color:"#d35400", letterSpacing:"0.1em", marginBottom:6 }}>◆ NOTA METODOLÓGICA</div>
      <p style={{ fontSize:12, color:"#444", lineHeight:1.65, margin:0 }}>Hay <b style={{ color:"#c0392b" }}>dos Softland</b>: el <b>propio de OLO</b> (compañía OVERSEAS, servidor 10.17.224.40), donde OLO factura sus servicios logísticos, cobra, paga y lleva la contabilidad, y el <b>de cada cliente</b> (Cofersa y otros), donde nacen los pedidos y compras que opera el CEDI. El del cliente llega a <b style={{ color:"#1abc9c" }}>ePRAC / eflow Cloud Suite</b> por eIntegra («Consultar Interfaz» en Órdenes de Recepción); la Torre de Control lee de EFLOW_OLO por tablas de staging (ext_tms_*); Documentos Electrónicos envía las facturas de OLO a Hacienda. Sigue sin documentar el mecanismo exacto de eIntegra y cómo vuelven a eFlow los datos de la Torre.</p>
    </div>
  </div>;
}

// Panel lateral (a la derecha) del diagrama: qué es el sistema y con quién se conecta, en
// palabras simples. Tocar una conexión lleva al otro sistema.
function PanelConexion({ code, links, getDetail, enOlo, angosto, onSelect, onHover }) {
  const caja = { width:angosto ? "auto" : 340, flexShrink:0, background:"#fff", border:"1px solid #e0e0e0", borderRadius:12, padding:"14px 16px",
    boxSizing:"border-box", position:angosto ? "static" : "sticky", top:16, maxHeight:angosto ? "none" : "calc(100vh - 32px)", overflowY:"auto" };
  const titulo = { fontSize:11.5, fontWeight:700, color:"#7a7a7a", letterSpacing:"0.07em", textTransform:"uppercase", margin:"14px 0 6px" };
  if (!code) return <aside style={caja}>
    <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink }}>¿Cómo se conectan los sistemas?</div>
    <p style={{ fontSize:13.5, color:DESIGN.inkSoft, lineHeight:1.6, margin:"8px 0 0" }}>Toca cualquier círculo del diagrama para ver, en palabras simples, qué hace ese sistema, a quién le envía información y de quién la recibe.</p>
    <div style={titulo}>Cómo leer el diagrama</div>
    <div style={{ display:"grid", gap:8, fontSize:13, color:DESIGN.inkSoft, lineHeight:1.5 }}>
      <div><b style={{ color:"#c0392b" }}>━ Línea continua:</b> la conexión está confirmada por un manual, un procedimiento o una base de datos que el BPA leyó.</div>
      <div><b style={{ color:"#7f8c8d" }}>┅ Línea punteada:</b> es un supuesto razonable; nadie lo ha confirmado todavía.</div>
      <div><b>Círculo punteado:</b> un sistema que se supone que existe, o un módulo de Softland que OLO no usa.</div>
      <div><b>Arriba</b> están los sistemas externos, <b>en medio</b> el ERP de OLO y <b>abajo</b> los sistemas del almacén.</div>
    </div>
  </aside>;

  const d = getDetail(code) || {}, s = NODO_SIMPLE[code] || {};
  const color = MODULE_COLORS[code] || OPS_COLORS[code] || "#475569";
  const sale = links.filter(l => l.a === code), entra = links.filter(l => l.b === code);
  const Item = ({ l, otro }) => <button onClick={() => onSelect(otro)} onMouseEnter={() => onHover(otro)} onMouseLeave={() => onHover(null)}
    style={{ display:"block", width:"100%", textAlign:"left", background:"#fafafa", border:"1px solid #eee", borderLeft:`3px ${l.c ? "solid" : "dashed"} ${l.c ? "#c0392b" : "#9aa5ae"}`, borderRadius:7, padding:"7px 9px", cursor:"pointer", fontFamily:DESIGN.font }}>
    <div style={{ display:"flex", justifyContent:"space-between", gap:8, alignItems:"baseline" }}>
      <span style={{ fontSize:13.5, fontWeight:700, color:DESIGN.ink }}>{NODO_SIMPLE[otro]?.nombre || otro}</span>
      <span style={{ fontSize:11, fontWeight:700, color:l.c ? "#15803d" : "#7f8c8d", whiteSpace:"nowrap" }}>{l.c ? "Confirmada" : "Supuesta"}</span>
    </div>
    <div style={{ fontSize:12.5, color:DESIGN.inkSoft, lineHeight:1.45, marginTop:2 }}>{l.a === code ? queConexion(code, otro) : queConexion(otro, code)}</div>
  </button>;
  return <aside style={{ ...caja, borderLeft:`4px solid ${color}` }}>
    <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:800, color, letterSpacing:"0.04em" }}>{code}</div>
        <div style={{ fontSize:16, fontWeight:700, color:DESIGN.ink, lineHeight:1.3 }}>{s.nombre || d.name || code}</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:5 }}>
          {d.status && <StatusBadge status={d.status}/>}
          {enOlo[code] && <span style={{ fontSize:11.5, fontWeight:700, color:EN_OLO[enOlo[code]].color }}>● {EN_OLO[enOlo[code]].label}</span>}
        </div>
      </div>
      <button onClick={() => onSelect(null)} title="Cerrar" style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:16 }}>✕</button>
    </div>
    {s.simple && <><div style={titulo}>En palabras simples</div><p style={{ fontSize:14, color:DESIGN.ink, lineHeight:1.6, margin:0 }}>{s.simple}</p></>}
    <div style={titulo}>Envía información a · {sale.length}</div>
    {sale.length ? <div style={{ display:"grid", gap:6 }}>{sale.map((l, i) => <Item key={i} l={l} otro={l.b}/>)}</div> : <div style={{ fontSize:13, color:"#888" }}>No envía información a otro sistema del mapa.</div>}
    <div style={titulo}>Recibe información de · {entra.length}</div>
    {entra.length ? <div style={{ display:"grid", gap:6 }}>{entra.map((l, i) => <Item key={i} l={l} otro={l.a}/>)}</div> : <div style={{ fontSize:13, color:"#888" }}>No recibe información de otro sistema del mapa.</div>}
    {(d.purpose || d.role) && <details style={{ marginTop:14 }}>
      <summary style={{ fontSize:12.5, fontWeight:700, color:"#666", cursor:"pointer" }}>Detalle técnico</summary>
      {d.role && <div style={{ fontSize:12.5, color:"#777", fontStyle:"italic", marginTop:6 }}>{d.role}</div>}
      {d.purpose && <p style={{ fontSize:12.5, color:"#555", lineHeight:1.55, margin:"6px 0 0" }}>{d.purpose}</p>}
    </details>}
  </aside>;
}
