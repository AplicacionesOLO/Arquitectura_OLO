// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA · CrossSchemaView — Relaciones semánticas cross-schema Venezuela
// ═══════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { EFWBEVAL_TABLE_DEFS,   EFWBEVAL_COLORS   } from "../data/beval_ve.js";
import { EFWFEBECA_TABLE_DEFS                      } from "../data/febeca_ve.js";
import { EFWSILLACA_TABLE_DEFS                     } from "../data/sillaca_ve.js";
import { EFWWMH_TABLE_DEFS,     EFWWMH_COLORS      } from "../data/wmh_ve.js";
import veCross from "../data/ve_cross.json";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  beval:   { fg:"#0891b2", bg:"rgba(8,145,178,0.08)",   border:"rgba(8,145,178,0.3)"   },
  febeca:  { fg:"#0d9488", bg:"rgba(13,148,136,0.08)",  border:"rgba(13,148,136,0.3)"  },
  sillaca: { fg:"#7c3aed", bg:"rgba(124,58,237,0.08)",  border:"rgba(124,58,237,0.3)"  },
  wmh:     { fg:"#d97706", bg:"rgba(217,119,6,0.08)",   border:"rgba(217,119,6,0.3)"   },
  core:    { fg:"#1e293b", bg:"rgba(30,41,59,0.06)",    border:"rgba(30,41,59,0.2)"    },
  shared:  { fg:"#6d28d9", bg:"rgba(109,40,217,0.08)",  border:"rgba(109,40,217,0.3)"  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function schemasForTable(name) {
  const s = [];
  if (EFWBEVAL_TABLE_DEFS[name])   s.push("beval");
  if (EFWFEBECA_TABLE_DEFS[name])  s.push("febeca");
  if (EFWSILLACA_TABLE_DEFS[name]) s.push("sillaca");
  if (EFWWMH_TABLE_DEFS[name])     s.push("wmh");
  return s;
}

function tableDef(schema, name) {
  if (schema === "beval")   return EFWBEVAL_TABLE_DEFS[name];
  if (schema === "febeca")  return EFWFEBECA_TABLE_DEFS[name];
  if (schema === "sillaca") return EFWSILLACA_TABLE_DEFS[name];
  if (schema === "wmh")     return EFWWMH_TABLE_DEFS[name];
  return null;
}

const SCHEMA_LABELS = { beval:"Beval", febeca:"Febeca", sillaca:"Sillaca", wmh:"WMH" };

// ── Sub-components ────────────────────────────────────────────────────────────
function TableChip({ name, color, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      title={name}
      style={{
        fontFamily:"'JetBrains Mono',monospace",
        fontSize:10,
        padding:"2px 7px",
        borderRadius:4,
        border:`1px solid ${selected ? color : color+"55"}`,
        background: selected ? color+"22" : color+"0a",
        color: selected ? color : color+"cc",
        cursor:"pointer",
        fontWeight: selected ? 700 : 400,
        transition:"all 0.12s",
        whiteSpace:"nowrap",
        maxWidth:160,
        overflow:"hidden",
        textOverflow:"ellipsis",
      }}
    >
      {name}
    </button>
  );
}

function StatBadge({ count, label, color }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", gap:2,
      background: color+"0d", border:`1px solid ${color}33`,
      borderRadius:10, padding:"12px 18px", minWidth:110,
    }}>
      <span style={{ fontSize:26, fontWeight:800, color, lineHeight:1 }}>{count}</span>
      <span style={{ fontSize:10, color:"#666", textAlign:"center", lineHeight:1.35 }}>{label}</span>
    </div>
  );
}

function SectionCard({ title, color, tables, selectedTable, onSelect, emptyLabel }) {
  if (tables.length === 0 && emptyLabel) {
    return (
      <div style={{
        border:`1px dashed ${color}44`, borderRadius:8, padding:12,
        background: color+"06", minHeight:60,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <span style={{ fontSize:10, color: color+"88" }}>{emptyLabel}</span>
      </div>
    );
  }
  return (
    <div style={{
      border:`1px solid ${color}44`, borderRadius:8, padding:12,
      background: color+"06",
    }}>
      <div style={{ fontSize:10, fontWeight:700, color, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:8 }}>
        {title} <span style={{ fontWeight:400, color: color+"99" }}>({tables.length})</span>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
        {tables.map(name => (
          <TableChip
            key={name}
            name={name}
            color={color}
            selected={selectedTable === name}
            onClick={() => onSelect(name)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Core table list (compact, scrollable) ────────────────────────────────────
function CoreSection({ tables, selectedTable, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? tables : tables.slice(0, 60);
  return (
    <div style={{
      border:`1px solid ${C.core.border}`, borderRadius:8, padding:12,
      background: C.core.bg,
    }}>
      <div style={{
        fontSize:10, fontWeight:700, color: C.core.fg,
        letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:8,
        display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <span>Nucleo compartido — presentes en Beval, Febeca y Sillaca <span style={{ fontWeight:400, color:"#888" }}>(417)</span></span>
        <button
          onClick={() => setExpanded(p => !p)}
          style={{ fontSize:10, color:"#0891b2", background:"none", border:"1px solid #bae6fd", borderRadius:4, padding:"2px 8px", cursor:"pointer", fontFamily:"inherit" }}
        >
          {expanded ? "Colapsar" : `Mostrar los ${tables.length}`}
        </button>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
        {visible.map(name => (
          <TableChip
            key={name}
            name={name}
            color={C.core.fg}
            selected={selectedTable === name}
            onClick={() => onSelect(name)}
          />
        ))}
        {!expanded && tables.length > 60 && (
          <span style={{ fontSize:10, color:"#888", alignSelf:"center" }}>
            …y {tables.length - 60} más
          </span>
        )}
      </div>
    </div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function DetailPanel({ name, onClose }) {
  const schemas = schemasForTable(name);
  const allSchemas = ["beval","febeca","sillaca","wmh"];

  // Collect all unique columns across schemas
  const allCols = new Set();
  schemas.forEach(s => {
    const def = tableDef(s, name);
    if (def) (def.cols || []).forEach(c => allCols.add(c));
  });
  const colList = [...allCols].sort();

  const pkSet = new Set(schemas.map(s => tableDef(s, name)?.pk).filter(Boolean));

  return (
    <div style={{
      background:"#fff",
      border:"1px solid #e0e0e0",
      borderRadius:10,
      padding:"16px 20px",
      marginBottom:20,
      boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
    }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <div>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:800, fontSize:16, color:"#1e293b" }}>{name}</span>
          <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
            {allSchemas.map(s => {
              const present = schemas.includes(s);
              const col = C[s];
              return (
                <span key={s} style={{
                  fontSize:11, fontWeight:present ? 700 : 400,
                  padding:"2px 10px", borderRadius:12,
                  background: present ? col.bg : "#f5f5f5",
                  border:`1px solid ${present ? col.border : "#e0e0e0"}`,
                  color: present ? col.fg : "#bbb",
                }}>
                  {present ? "✓" : "✗"} {SCHEMA_LABELS[s]}
                </span>
              );
            })}
          </div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:18, lineHeight:1 }}>✕</button>
      </div>

      {/* PK */}
      {pkSet.size > 0 && (
        <div style={{ marginBottom:12 }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.07em" }}>Clave primaria:</span>
          <span style={{ marginLeft:6 }}>
            {[...pkSet].map(pk => (
              <span key={pk} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, background:"#fff8dc", border:"1px solid #fcd34d", color:"#92400e", padding:"2px 8px", borderRadius:4, marginRight:4 }}>
                🔑 {pk}
              </span>
            ))}
          </span>
        </div>
      )}

      {/* Column diff view */}
      {schemas.length >= 2 ? (
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>
            Columnas — vista comparativa
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ borderCollapse:"collapse", width:"100%", fontSize:11 }}>
              <thead>
                <tr style={{ background:"#f8faff" }}>
                  <th style={{ padding:"6px 10px", textAlign:"left", fontWeight:700, color:"#555", borderBottom:"2px solid #e0e0e0", fontFamily:"'JetBrains Mono',monospace" }}>Columna</th>
                  {schemas.map(s => (
                    <th key={s} style={{ padding:"6px 10px", textAlign:"center", fontWeight:700, color: C[s].fg, borderBottom:`2px solid ${C[s].border}`, minWidth:80 }}>
                      {SCHEMA_LABELS[s]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {colList.map((col, i) => {
                  const isFK = col.includes("→");
                  const presentIn = schemas.filter(s => (tableDef(s, name)?.cols || []).includes(col));
                  const allHave = presentIn.length === schemas.length;
                  const noneHave = presentIn.length === 0;
                  return (
                    <tr key={col} style={{ background: i%2===0 ? "#fff" : "#fafafa", borderBottom:"1px solid #f0f0f0" }}>
                      <td style={{ padding:"4px 10px", fontFamily:"'JetBrains Mono',monospace", color: isFK ? "#6d28d9" : "#334155", fontWeight: isFK ? 600 : 400 }}>
                        {isFK ? "🔗 " : ""}{col}
                      </td>
                      {schemas.map(s => {
                        const has = (tableDef(s, name)?.cols || []).includes(col);
                        return (
                          <td key={s} style={{ padding:"4px 10px", textAlign:"center" }}>
                            {has
                              ? <span style={{ color: allHave ? "#16a34a" : C[s].fg, fontWeight:700 }}>✓</span>
                              : <span style={{ color:"#e0e0e0" }}>—</span>
                            }
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Single-schema: simple column list */
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Columnas</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {colList.map(col => {
              const isFK = col.includes("→");
              const color = schemas[0] ? C[schemas[0]].fg : "#475569";
              return (
                <span key={col} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, padding:"2px 8px", borderRadius:4, background: isFK ? color+"12" : "#f5f5f5", border:`1px solid ${isFK ? color+"44" : "#e0e0e0"}`, color: isFK ? color : "#555" }}>
                  {isFK ? "🔗 " : ""}{col}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function CrossSchemaView() {
  const [selectedTable, setSelectedTable] = useState(null);

  const handleSelect = (name) => setSelectedTable(prev => prev === name ? null : name);

  // Stats
  const stats = [
    { count: veCross.core.length,        label:"Tablas núcleo\n(en los 3 eFlow)",   color: C.core.fg    },
    { count: veCross.bevalFebeca.length,  label:"Beval + Febeca\n(sin Sillaca)",     color: C.shared.fg  },
    { count: veCross.onlyBeval.length,    label:"Extensiones\nexclusivas Beval",     color: C.beval.fg   },
    { count: veCross.onlyFebeca.length,   label:"Extensiones\nexclusivas Febeca",    color: C.febeca.fg  },
    { count: veCross.onlySillaca.length,  label:"Extensiones\nexclusivas Sillaca",   color: C.sillaca.fg },
    { count: veCross.wmhOnly.length,      label:"Tablas WMH\n(Torre de Control)",    color: C.wmh.fg     },
  ];

  return (
    <div style={{ fontFamily:"system-ui, sans-serif" }}>

      {/* Title */}
      <div style={{ marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:"#1e293b" }}>
          Cross-Schema · Relaciones Semánticas Venezuela
        </h2>
        <p style={{ margin:"4px 0 0", fontSize:12, color:"#64748b" }}>
          Comparativa entre los 4 schemas eFlow Venezuela: Beval (470 tablas), Febeca (488), Sillaca (429) y WMH Torre de Control (83).
          Haz clic en cualquier tabla para ver detalle de columnas y presencia por schema.
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:24 }}>
        {stats.map(s => (
          <StatBadge key={s.label} count={s.count} label={s.label} color={s.color} />
        ))}
      </div>

      {/* Detail panel */}
      {selectedTable && (
        <DetailPanel name={selectedTable} onClose={() => setSelectedTable(null)} />
      )}

      {/* Venn-style layout */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr 1fr 1fr", gap:12, marginBottom:16 }}>

        {/* Only Beval */}
        <SectionCard
          title="Solo Beval"
          color={C.beval.fg}
          tables={veCross.onlyBeval}
          selectedTable={selectedTable}
          onSelect={handleSelect}
        />

        {/* Beval + Febeca (not Sillaca) */}
        <SectionCard
          title="Beval + Febeca"
          color={C.shared.fg}
          tables={veCross.bevalFebeca}
          selectedTable={selectedTable}
          onSelect={handleSelect}
        />

        {/* Core */}
        <CoreSection
          tables={veCross.core}
          selectedTable={selectedTable}
          onSelect={handleSelect}
        />

        {/* Only Febeca */}
        <SectionCard
          title="Solo Febeca"
          color={C.febeca.fg}
          tables={veCross.onlyFebeca}
          selectedTable={selectedTable}
          onSelect={handleSelect}
        />

        {/* Only Sillaca */}
        <SectionCard
          title="Solo Sillaca"
          color={C.sillaca.fg}
          tables={veCross.onlySillaca}
          selectedTable={selectedTable}
          onSelect={handleSelect}
        />

      </div>

      {/* WMH — separate row */}
      <div style={{
        border:`1px solid ${C.wmh.border}`, borderRadius:8, padding:14,
        background: C.wmh.bg, marginBottom:16,
      }}>
        <div style={{
          fontSize:10, fontWeight:700, color: C.wmh.fg,
          letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:8,
          display:"flex", alignItems:"center", gap:8,
        }}>
          <span>WMH — Torre de Control Venezuela</span>
          <span style={{ fontWeight:400, color: C.wmh.fg+"99" }}>(83 tablas — schema independiente, sin solapamiento con eFlow)</span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
          {veCross.wmhOnly.map(name => (
            <TableChip
              key={name}
              name={name}
              color={C.wmh.fg}
              selected={selectedTable === name}
              onClick={() => handleSelect(name)}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display:"flex", gap:16, flexWrap:"wrap", padding:"10px 14px",
        background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8,
        fontSize:11, color:"#64748b", alignItems:"center",
      }}>
        <span style={{ fontWeight:700, color:"#334155" }}>Leyenda:</span>
        {[
          { color: C.core.fg,    label:"Núcleo (Beval+Febeca+Sillaca)" },
          { color: C.beval.fg,   label:"Solo Beval" },
          { color: C.febeca.fg,  label:"Solo Febeca" },
          { color: C.sillaca.fg, label:"Solo Sillaca" },
          { color: C.shared.fg,  label:"Beval+Febeca" },
          { color: C.wmh.fg,     label:"WMH independiente" },
        ].map(({ color, label }) => (
          <span key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ width:10, height:10, borderRadius:"50%", background:color, flexShrink:0 }}/>
            {label}
          </span>
        ))}
        <span style={{ marginLeft:"auto", color:"#94a3b8" }}>
          Haz clic en una tabla para comparar columnas entre schemas
        </span>
      </div>

    </div>
  );
}
