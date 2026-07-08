// Deriva relaciones FK directamente de las columnas "COL→TABLA" en TABLE_DEFS.
// Fuente única para ERSchemaView (Diagrama Relacional FK / ER Radial) y para
// el resumen agregado de Venezuela — así el conteo siempre coincide.
export function deriveRowsFromTableDefs(TD) {
  const rows = [];
  Object.entries(TD || {}).forEach(([tableName, def]) => {
    (def?.cols || []).forEach(c => {
      if (typeof c !== "string" || !c.includes("→")) return;
      const [colName, targetTable] = c.split("→").map(s => s.trim());
      if (!targetTable || targetTable === tableName) return;
      rows.push({ from: tableName, to: targetTable, what: `${colName} → ${targetTable}`, status: "confirmed" });
    });
  });
  return rows;
}
