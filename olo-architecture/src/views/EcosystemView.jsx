// ═══════════════════════════════════════════════════════════════════════════
// VISTA · ECOSISTEMA
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { SOFTLAND_MODULES, OPS_MODULES, SATELLITE_MODULES } from "../data/softland.js";
import { MODULE_COLORS, OPS_COLORS } from "../data/constants.js";
import { StatusBadge, ModuleChip, LayerBlock } from "../components/ui.jsx";

export function EcosystemView() {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const W=1200, H=720;
  const erpNodes=[{code:"AS",x:90,y:380,label:"Maestros"},{code:"CG",x:250,y:280},{code:"CB",x:380,y:230},{code:"CC",x:510,y:230},{code:"CP",x:640,y:230},{code:"FA",x:510,y:320},{code:"CO",x:640,y:320},{code:"CI",x:770,y:320},{code:"AF",x:380,y:410},{code:"GN",x:510,y:410},{code:"MF",x:640,y:410},{code:"RH",x:770,y:410},{code:"POS",x:380,y:480},{code:"FR",x:510,y:480},{code:"AC",x:640,y:480},{code:"CCH",x:770,y:480},{code:"PY",x:900,y:410},{code:"FC",x:900,y:320}];
  const opsNodes=[{code:"WMS-D",label:"eflow WMS\nDesktop",x:280,y:620},{code:"WMS-RF",label:"eflow WMS\nRF · PDT",x:540,y:620},{code:"WMH",label:"WMH\nTorre Control",x:800,y:620}];
  const extNodes=[{code:"EDI",label:"Portal · EDI",x:90,y:100},{code:"Aduanas",label:"Aduanero",x:280,y:100},{code:"Mecalux",label:"Mecalux",x:470,y:100},{code:"TMSI",label:"TMS Internacional",x:660,y:100},{code:"BI",label:"BI · DW",x:850,y:100},{code:"ZF",label:"Zona Franca SEL",x:1040,y:100}];
  const links=[{a:"AS",b:"CG",c:true},{a:"AS",b:"CB",c:true},{a:"AS",b:"CC",c:true},{a:"AS",b:"CP",c:true},{a:"AS",b:"FA",c:true},{a:"AS",b:"CO",c:true},{a:"AS",b:"CI",c:true},{a:"AS",b:"AF",c:true},{a:"AS",b:"GN",c:true},{a:"CB",b:"CG",c:true},{a:"CC",b:"CG",c:true},{a:"CP",b:"CG",c:true},{a:"FA",b:"CG",c:true},{a:"CO",b:"CG",c:true},{a:"CI",b:"CG",c:true},{a:"AF",b:"CG",c:true},{a:"GN",b:"CG",c:true},{a:"MF",b:"CG",c:true},{a:"FA",b:"CC",c:true},{a:"FA",b:"CI",c:true},{a:"CO",b:"CP",c:true},{a:"CO",b:"CI",c:true},{a:"CC",b:"CB",c:true},{a:"CP",b:"CB",c:true},{a:"CCH",b:"CB",c:true},{a:"PY",b:"CB",c:true},{a:"GN",b:"CB",c:true},{a:"RH",b:"CB",c:true},{a:"FC",b:"CB",c:true},{a:"FA",b:"MF",c:true},{a:"POS",b:"MF",c:true},{a:"FR",b:"MF",c:true},{a:"AC",b:"MF",c:true},{a:"CC",b:"MF",c:true},{a:"CP",b:"MF",c:true},{a:"CO",b:"MF",c:true},{a:"CCH",b:"MF",c:true},{a:"FA",b:"WMS-D",c:true},{a:"CO",b:"WMS-D",c:true},{a:"WMS-D",b:"WMS-RF",c:true},{a:"WMS-D",b:"WMH",c:false},{a:"EDI",b:"FA",c:false},{a:"Aduanas",b:"CG",c:false},{a:"Mecalux",b:"WMH",c:false},{a:"BI",b:"CG",c:false},{a:"ZF",b:"WMS-D",c:false},{a:"TMSI",b:"WMH",c:false}];
  const all=[...erpNodes.map(n=>({...n,kind:"erp"})),...opsNodes.map(n=>({...n,kind:"ops"})),...extNodes.map(n=>({...n,kind:"ext"}))];
  const lookup=Object.fromEntries(all.map(n=>[n.code,n]));

  const getDetail = (code) => SOFTLAND_MODULES.find(m=>m.code===code) || OPS_MODULES.find(m=>m.code===code) || SATELLITE_MODULES.find(m=>m.name===code) || null;
  const active = hoveredNode || selectedNode;
  const isNodeHl = (code) => { if(!active) return false; if(active===code) return true; return links.some(l=>(l.a===active&&l.b===code)||(l.b===active&&l.a===code)); };
  const isLinkHl = (link) => active && (link.a===active||link.b===active);
  const selMod = selectedNode ? (getDetail(selectedNode) || { code:selectedNode, name:selectedNode, purpose:"" }) : null;
  return <div>
    {selMod && <div style={{ background:"#fff", border:`1px solid ${MODULE_COLORS[selMod.code]||"#888"}44`, borderLeft:`4px solid ${MODULE_COLORS[selMod.code]||"#888"}`, borderRadius:10, padding:"14px 18px", marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <ModuleChip code={selMod.code||""} size="lg"/>
            <span style={{ fontSize:14, fontWeight:700, color:"#1D1D1B" }}>{selMod.name||selMod.code}</span>
            {selMod.status && <StatusBadge status={selMod.status}/>}
          </div>
          {selMod.role && <div style={{ fontSize:11, color:"#777", fontStyle:"italic", marginBottom:4 }}>{selMod.role}</div>}
          {selMod.purpose && <p style={{ fontSize:12, color:"#444", lineHeight:1.6, margin:"6px 0 0" }}>{selMod.purpose}</p>}
        </div>
        <button onClick={()=>setSelectedNode(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:16 }}>✕</button>
      </div>
    </div>}

    <div style={{ display:"flex", flexDirection:"column", marginBottom:24 }}>
      <LayerBlock icon="🌐" label="Sistemas Externos · inferidos por contexto 3PL" color="#7f8c8d" bg="rgba(127,140,141,0.08)" border="rgba(127,140,141,0.25)" radiusTop sub="Inferidos a partir del informe BPA y prácticas estándar de operadores logísticos. Sin documentación formal en el corpus accesible.">
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {[{code:"EDI",label:"Portal · EDI · Clientes"},{code:"Aduanas",label:"Sistema Aduanero · TICA"},{code:"Mecalux",label:"Mecalux · racks"},{code:"TMSI",label:"TMS Internacional"},{code:"BI",label:"BI / Data Warehouse"},{code:"ZF",label:"Zona Franca SEL"}].map(e=>(
            <span key={e.code} style={{ fontSize:11, fontWeight:600, color:"#5e6b7a", background:"#ffffff", border:"1px dashed #b0bec5", padding:"5px 11px", borderRadius:6 }}>
              <b style={{ color:"#455A64", marginRight:6, fontFamily:"'JetBrains Mono','Consolas',monospace" }}>{e.code}</b>{e.label}
            </span>
          ))}
        </div>
      </LayerBlock>
      <LayerBlock icon="⬡" label="ERP — Softland v7.00 · motor Exactus" color="#c0392b" bg="rgba(192,57,43,0.05)" border="rgba(192,57,43,0.2)" sub={`${SOFTLAND_MODULES.length} módulos · AS provee maestros transversales · CG es el corazón financiero`}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {SOFTLAND_MODULES.map(m=>{ const c=MODULE_COLORS[m.code]??"#888"; return <div key={m.code} style={{ display:"flex", alignItems:"center", gap:7, background:"#ffffff", border:`1px solid ${c}44`, borderLeft:`3px solid ${c}`, padding:"6px 12px", borderRadius:6 }}><span style={{ fontSize:11, fontWeight:700, color:c, fontFamily:"'JetBrains Mono','Consolas',monospace" }}>{m.code}</span><span style={{ fontSize:11, color:"#555" }}>{m.name}</span></div>; })}
        </div>
      </LayerBlock>
      <LayerBlock icon="🏗" label="Operación logística · eco-efficiency / eflow" color="#1abc9c" bg="rgba(26,188,156,0.08)" border="rgba(26,188,156,0.25)" sub="eflow Cloud Suite v4.17.0.2 · Desktop coordina catálogos y configuración · RF ejecuta operaciones físicas · WMH es la torre de control">
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {OPS_MODULES.map(m=>{ const c=OPS_COLORS[m.code]??"#1abc9c"; return <div key={m.code} style={{ background:"#ffffff", border:`1px solid ${c}44`, borderLeft:`3px solid ${c}`, padding:"8px 14px", borderRadius:6, minWidth:160 }}><div style={{ fontSize:11, fontWeight:700, color:c, fontFamily:"'JetBrains Mono','Consolas',monospace", marginBottom:2 }}>{m.code}</div><div style={{ fontSize:12, color:"#444", fontWeight:600 }}>{m.name}</div></div>; })}
        </div>
      </LayerBlock>
      <LayerBlock icon="🛰" label="Sistemas satélite · inferidos" color="#9b59b6" bg="rgba(155,89,182,0.08)" border="rgba(155,89,182,0.22)" radiusBottom sub="Mencionados parcialmente en manuales pero sin documentación dedicada en el corpus accesible.">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:8 }}>
          {SATELLITE_MODULES.map((s,i)=><div key={i} style={{ background:"#ffffff", border:"1px dashed #c39bd3", borderRadius:6, padding:"8px 12px" }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:3 }}><span style={{ fontSize:12, fontWeight:700, color:"#7B1FA2" }}>{s.name}</span><StatusBadge status={s.status}/></div><div style={{ fontSize:10, color:"#777", lineHeight:1.45 }}>{s.purpose}</div></div>)}
        </div>
      </LayerBlock>
    </div>
    <h3 style={{ fontSize:14, fontWeight:700, color:"#1D1D1B", margin:"0 0 4px 0" }}>Diagrama de conexiones</h3>
    <p style={{ fontSize:12, color:"#777", margin:"0 0 14px 0" }}>Líneas continuas: integración declarada en algún manual. Líneas punteadas: inferidas por contexto.</p>
    <div style={{ background:"#ffffff", border:"1px solid #e0e0e0", borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"10px 16px", borderBottom:"1px solid #f0f0f0", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8, background:"#fafafa" }}>
        <span style={{ fontSize:11, color:"#666", fontWeight:600 }}>ECOSISTEMA · 3 CAPAS · {erpNodes.length+opsNodes.length+extNodes.length} SISTEMAS</span>
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          {[["#c0392b","Confirmado",false],["#7f8c8d","Inferido",true]].map(([c,l,d])=><div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}><svg width="22" height="2"><line x1="0" y1="1" x2="22" y2="1" stroke={c} strokeWidth="1.5" strokeDasharray={d?"3 3":"0"}/></svg><span style={{ fontSize:10, color:"#666", fontWeight:500 }}>{l}</span></div>)}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", display:"block" }}>
        <rect x="0" y="40" width={W} height="120" fill="rgba(127,140,141,0.05)"/>
        <rect x="0" y="200" width={W} height="340" fill="rgba(192,57,43,0.04)"/>
        <rect x="0" y="580" width={W} height="100" fill="rgba(26,188,156,0.06)"/>
        <text x="20" y="60" fill="#7f8c8d" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em" }}>SISTEMAS EXTERNOS · INFERIDOS</text>
        <text x="20" y="220" fill="#c0392b" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em" }}>SOFTLAND ERP v7.00 · MOTOR EXACTUS</text>
        <text x="20" y="600" fill="#1abc9c" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em" }}>OPERACIÓN LOGÍSTICA · ECO-EFFICIENCY / EFLOW</text>
        {links.map((link,i)=>{ const a=lookup[link.a],b=lookup[link.b]; if(!a||!b)return null; const hl=isLinkHl(link); const dim=active&&!hl; return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hl?(link.c?"#c0392b":"#7f8c8d"):(link.c?"#c0392b":"#7f8c8d")} strokeWidth={hl?2:1} strokeOpacity={dim?0.08:hl?0.9:(link.c?0.4:0.3)} strokeDasharray={link.c?"0":"3 3"} style={{ transition:"stroke-opacity 0.15s" }}/>; })}
        {all.map(n=>{ const r=n.kind==="erp"?24:36; const stroke=n.kind==="erp"?(MODULE_COLORS[n.code]??"#c0392b"):n.kind==="ops"?"#1abc9c":"#7f8c8d"; const fill=n.kind==="erp"?"#ffffff":n.kind==="ops"?"#f0fdfa":"#fafafa"; const hl=isNodeHl(n.code); const dim=active&&!hl; const isSel=selectedNode===n.code; return <g key={n.code} onClick={()=>setSelectedNode(selectedNode===n.code?null:n.code)} onMouseEnter={()=>setHoveredNode(n.code)} onMouseLeave={()=>setHoveredNode(null)} style={{ cursor:"pointer", opacity:dim?0.2:1, transition:"opacity 0.15s" }}><circle cx={n.x} cy={n.y} r={r} fill={fill} stroke={isSel?stroke:hl?stroke:stroke} strokeWidth={isSel?3.5:hl?2.5:(n.kind==="erp"?2:1.5)} strokeDasharray={n.kind==="ext"?"3 3":"0"}/><text x={n.x} y={n.y+(n.label?-2:4)} textAnchor="middle" fill={stroke} style={{ fontSize:n.kind==="erp"?11:10, fontWeight:700, letterSpacing:"0.04em" }}>{n.code}</text>{n.label&&n.label.split("\n").map((line,j)=><text key={j} x={n.x} y={n.y+14+j*11} textAnchor="middle" fill="#666" style={{ fontSize:9 }}>{line}</text>)}</g>; })}
      </svg>
    </div>
    <div style={{ marginTop:24, padding:"14px 18px", background:"rgba(243,156,18,0.06)", border:"1px solid rgba(243,156,18,0.25)", borderLeft:"3px solid #f39c12", borderRadius:8 }}>
      <div style={{ fontSize:11, fontWeight:700, color:"#d35400", letterSpacing:"0.1em", marginBottom:6 }}>◆ NOTA METODOLÓGICA</div>
      <p style={{ fontSize:12, color:"#444", lineHeight:1.65, margin:0 }}>El ERP es <b style={{ color:"#c0392b" }}>Softland v7.00</b> sobre motor configurable Exactus. El WMS y la Torre de Control son productos separados de <b style={{ color:"#1abc9c" }}>eco-efficiency / eflow Cloud Suite</b>. La integración Softland↔eflow se realiza por interfaz documental — su mecanismo concreto (batch, archivos, WS, BD intermedia) no está descrito en los manuales accesibles.</p>
    </div>
  </div>;
}
