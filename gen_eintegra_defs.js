// gen_eintegra_defs.js — build EINTEGRA_VE_TABLE_DEFS + EINTEGRA_VE_COLORS
// from the real extracted schema (ve_schema_eintegra.json).
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('ve_schema_eintegra.json', 'utf8'));

const GROUPS = {
  interfaces: { color: '#6366f1', tables: ['INTERFACE','INTERFACE_CONTROL','INTERFACE_STEP','INTERFACE_TRACE','XML_MAPPING'] },
  transacciones: { color: '#7c3aed', tables: ['WMS_TRANSACCION','WMS_TRANSACCION_FEBECA','WMS_TRANSACCION_SILLACA','WMS_RESPUESTA'] },
  control: { color: '#64748b', tables: ['INTERFACE_LOG','TABLE_CONTROL','TEMP_TRACE'] },
};
const tables = Object.values(GROUPS).flatMap(g => g.tables);

const colsByTable = {};
data.columns.forEach(c => { (colsByTable[c.TABLE_NAME] ||= []).push(c); });
const pkByTable = {};
data.pks.forEach(p => { if (!pkByTable[p.TABLE_NAME]) pkByTable[p.TABLE_NAME] = p.COLUMN_NAME; });
const fkFromMap = {};
data.fks.forEach(fk => { (fkFromMap[fk.from_table] ||= []).push({ col: fk.from_col, toTable: fk.to_table }); });

function colScore(c, fkColNames, pk) {
  const cn = c.COLUMN_NAME.toUpperCase();
  let s = 0;
  if (c.IS_NULLABLE === 'NO') s += 3;
  if (c.DATA_TYPE === 'int' || c.DATA_TYPE === 'bigint') s += 1;
  if (fkColNames.has(c.COLUMN_NAME)) s += 5;
  if (cn.endsWith('_ID') || cn.endsWith('ID')) s += 2;
  if (c.COLUMN_NAME === pk) s += 10;
  return s;
}

const TABLE_DEFS = {};
tables.forEach(t => {
  const cols = colsByTable[t] || [];
  const pk = pkByTable[t] || (cols[0] && cols[0].COLUMN_NAME) || '';
  const fkCols = fkFromMap[t] || [];
  const fkColNames = new Set(fkCols.map(f => f.col));
  const fkColToTable = {};
  fkCols.forEach(f => { fkColToTable[f.col] = f.toTable; });

  const sorted = [...cols].sort((a, b) => colScore(b, fkColNames, pk) - colScore(a, fkColNames, pk));
  const pkCol = cols.find(c => c.COLUMN_NAME === pk);
  const rest = sorted.filter(c => c.COLUMN_NAME !== pk).slice(0, 7);
  const selected = pkCol ? [pkCol, ...rest] : sorted.slice(0, 8);

  TABLE_DEFS[t] = {
    pk,
    cols: selected.map(c => fkColNames.has(c.COLUMN_NAME) && tables.includes(fkColToTable[c.COLUMN_NAME])
      ? `${c.COLUMN_NAME}→${fkColToTable[c.COLUMN_NAME]}`
      : c.COLUMN_NAME),
  };
});

const COLORS = {};
Object.values(GROUPS).forEach(g => { g.tables.forEach(t => { COLORS[t] = g.color; }); });

const out = [
  '',
  'export const EINTEGRA_VE_COLORS = ' + JSON.stringify(COLORS, null, 2) + ';',
  '',
  'export const EINTEGRA_VE_TABLE_DEFS = ' + JSON.stringify(TABLE_DEFS, null, 2) + ';',
  '',
].join('\n');

fs.writeFileSync('eintegra_defs_append.txt', out);
console.log('Written eintegra_defs_append.txt —', tables.length, 'tables,', Object.keys(COLORS).length, 'colors');
