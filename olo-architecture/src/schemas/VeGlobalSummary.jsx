// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA · VeGlobalSummary — "Global · Todos" del grupo Venezuela.
// Resumen agregado por capa (WMS / ERP / Middleware) sin fusionar los
// diagramas ER de cada schema en uno solo: varios comparten nombres de tabla
// (mismo software Softland/eFlow, distinta compañía) y fusionarlos sin
// renombrar por compañía perdería datos o los mezclaría incorrectamente.
// ═══════════════════════════════════════════════════════════════════════════
import { EFWBEVAL_TABLE_DEFS, EFWBEVAL_MOD } from "../data/beval_ve.js";
import { EFWFEBECA_TABLE_DEFS, EFWFEBECA_MOD } from "../data/febeca_ve.js";
import { EFWSILLACA_TABLE_DEFS, EFWSILLACA_MOD } from "../data/sillaca_ve.js";
import { EFWWMH_TABLE_DEFS, EFWWMH_MOD } from "../data/wmh_ve.js";
import { SFLBEVAL_TABLE_DEFS, SFLBEVAL_MOD } from "../data/softland_beval_ve.js";
import { SFLFEBECA_TABLE_DEFS, SFLFEBECA_MOD } from "../data/softland_febeca_ve.js";
import { SFLSILLACA_TABLE_DEFS, SFLSILLACA_MOD } from "../data/softland_sillaca_ve.js";
import { SFLTREXA_TABLE_DEFS, SFLTREXA_MOD } from "../data/softland_trexa_ve.js";
import { SFLPRISMA_TABLE_DEFS, SFLPRISMA_MOD } from "../data/softland_prisma_ve.js";
import { EINTEGRA_VE_TABLE_DEFS, EINTEGRA_VE_MOD, EINTEGRA_VE_INTEGRATIONS } from "../data/eintegra_ve.js";
import veCross from "../data/ve_cross.json";
import { deriveRowsFromTableDefs } from "./fkUtils.js";

const WMS_SCHEMAS = [
  { key:"efwbeval",   label:"Beval",   mod:EFWBEVAL_MOD,   td:EFWBEVAL_TABLE_DEFS   },
  { key:"efwfebeca",  label:"Febeca",  mod:EFWFEBECA_MOD,  td:EFWFEBECA_TABLE_DEFS  },
  { key:"efwsillaca", label:"Sillaca", mod:EFWSILLACA_MOD, td:EFWSILLACA_TABLE_DEFS },
  { key:"efwwmh",     label:"WMH · Torre de Control", mod:EFWWMH_MOD, td:EFWWMH_TABLE_DEFS },
];
const ERP_SCHEMAS = [
  { key:"softland_beval",   label:"Beval",   mod:SFLBEVAL_MOD,   td:SFLBEVAL_TABLE_DEFS   },
  { key:"softland_febeca",  label:"Febeca",  mod:SFLFEBECA_MOD,  td:SFLFEBECA_TABLE_DEFS  },
  { key:"softland_sillaca", label:"Sillaca", mod:SFLSILLACA_MOD, td:SFLSILLACA_TABLE_DEFS },
  { key:"softland_trexa",   label:"Trexa",   mod:SFLTREXA_MOD,   td:SFLTREXA_TABLE_DEFS   },
  { key:"softland_prisma",  label:"Prisma",  mod:SFLPRISMA_MOD,  td:SFLPRISMA_TABLE_DEFS  },
];

function withCounts(schemas) {
  return schemas.map(s => ({ ...s, tables: s.mod.size, relations: deriveRowsFromTableDefs(s.td).length }));
}

function sum(list, key) { return list.reduce((s, x) => s + x[key], 0); }

function GroupCard({ title, color, icon, schemas, onNavigate, note }) {
  const totalTables = sum(schemas, "tables");
  const totalRel = sum(schemas, "relations");
  return <div style={{ background:"#fff", border:"1px solid #e0e0e0", borderLeft:`4px solid ${color}`, borderRadius:10, padding:"14px 18px" }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
      <span style={{ fontSize:15 }}>{icon}</span>
      <span style={{ fontSize:13, fontWeight:700, color }}>{title}</span>
      <span style={{ marginLeft:"auto", fontSize:11, color:"#888" }}>{totalTables} tablas · {totalRel} relaciones FK</span>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {schemas.map(s => (
        <button key={s.key} onClick={()=>onNavigate(s.key)}
          style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 10px", border:"1px solid #f0f0f0", borderRadius:6, background:"#fafafa", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
          <span style={{ fontSize:12, fontWeight:600, color:"#444", flex:1 }}>{s.label}</span>
          <span style={{ fontSize:10.5, color:"#999" }}>{s.tables} tablas</span>
          <span style={{ fontSize:10.5, fontWeight:700, color: s.relations>0 ? color : "#cbb", background: s.relations>0 ? color+"15" : "#f0f0f0", padding:"1px 7px", borderRadius:8 }}>{s.relations} FK</span>
        </button>
      ))}
    </div>
    {note && <p style={{ fontSize:10.5, color:"#aaa", marginTop:10, marginBottom:0, lineHeight:1.5 }}>{note}</p>}
  </div>;
}

export function VeGlobalSummary({ onNavigate }) {
  const wms = withCounts(WMS_SCHEMAS);
  const erp = withCounts(ERP_SCHEMAS);
  const middlewareTables = EINTEGRA_VE_MOD.size;
  const middlewareRel = EINTEGRA_VE_INTEGRATIONS.length;
  const semanticTables = veCross.core.length + veCross.bevalFebeca.length + veCross.onlyBeval.length + veCross.onlyFebeca.length + veCross.onlySillaca.length + veCross.wmhOnly.length;

  const totalTables = sum(wms,"tables") + sum(erp,"tables") + middlewareTables;
  const totalRel = sum(wms,"relations") + sum(erp,"relations") + middlewareRel;

  return <div>
    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
      <div style={{ background:"#fff", border:"1px solid #e0e0e0", borderLeft:"4px solid #dc2626", borderRadius:10, padding:"14px 20px", minWidth:150 }}>
        <div style={{ fontSize:24, fontWeight:800, color:"#dc2626", lineHeight:1 }}>{totalTables}</div>
        <div style={{ fontSize:11, color:"#888", marginTop:4 }}>Tablas en Venezuela</div>
      </div>
      <div style={{ background:"#fff", border:"1px solid #e0e0e0", borderLeft:"4px solid #dc2626", borderRadius:10, padding:"14px 20px", minWidth:150 }}>
        <div style={{ fontSize:24, fontWeight:800, color:"#dc2626", lineHeight:1 }}>{totalRel}</div>
        <div style={{ fontSize:11, color:"#888", marginTop:4 }}>Relaciones FK confirmadas</div>
      </div>
      <div style={{ background:"#fff", border:"1px solid #e0e0e0", borderLeft:"4px solid #6366f1", borderRadius:10, padding:"14px 20px", minWidth:150 }}>
        <div style={{ fontSize:24, fontWeight:800, color:"#6366f1", lineHeight:1 }}>{middlewareTables}</div>
        <div style={{ fontSize:11, color:"#888", marginTop:4 }}>Tablas Middleware</div>
      </div>
      <div style={{ background:"#fff", border:"1px solid #e0e0e0", borderLeft:"4px solid #7c3aed", borderRadius:10, padding:"14px 20px", minWidth:150 }}>
        <div style={{ fontSize:24, fontWeight:800, color:"#7c3aed", lineHeight:1 }}>{semanticTables}</div>
        <div style={{ fontSize:11, color:"#888", marginTop:4 }}>Tablas analizadas (semántico)</div>
      </div>
    </div>

    <div style={{ background:"rgba(41,128,185,0.06)", border:"1px solid rgba(41,128,185,0.22)", borderLeft:"3px solid #2980b9", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#555", lineHeight:1.6 }}>
      No se fusionan los 10 schemas en un solo diagrama porque varios comparten nombres de tabla (mismo software, distinta compañía) — fusionarlos sin renombrar por compañía perdería o mezclaría datos. Este resumen agrega los totales y te lleva directo a cada schema.
    </div>

    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
      <GroupCard title="WMS Venezuela" color="#0891b2" icon="◒" schemas={wms} onNavigate={onNavigate}
        note="Las relaciones FK están en 0 porque la extracción de estos schemas (eFlow VE) no capturó metadata de foreign keys — brecha de datos, no un error de esta vista."/>
      <GroupCard title="ERP Venezuela" color="#b45309" icon="⬡" schemas={erp} onNavigate={onNavigate}/>
    </div>

    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
      <button onClick={()=>onNavigate("eintegra_ve")} style={{ display:"flex", alignItems:"center", gap:10, background:"#fff", border:"1px solid #e0e0e0", borderLeft:"4px solid #6366f1", borderRadius:10, padding:"14px 18px", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
        <span style={{ fontSize:15 }}>🔌</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#6366f1" }}>Middleware ERP↔WMS</div>
          <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{middlewareTables} tablas · {middlewareRel} relaciones FK</div>
        </div>
      </button>
      <button onClick={()=>onNavigate("ve_cross")} style={{ display:"flex", alignItems:"center", gap:10, background:"#fff", border:"1px solid #e0e0e0", borderLeft:"4px solid #7c3aed", borderRadius:10, padding:"14px 18px", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
        <span style={{ fontSize:15 }}>🔀</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#7c3aed" }}>Relaciones Semánticas VE</div>
          <div style={{ fontSize:11, color:"#888", marginTop:2 }}>Comparativa Beval / Febeca / Sillaca / WMH</div>
        </div>
      </button>
    </div>
  </div>;
}
