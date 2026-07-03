// gen_softland_ve.js — build olo-architecture/src/data/softland_<company>.js from a
// db_extract_schema.js-style JSON dump ({tables, columns, fks, pks}).
// Usage: node gen_softland_ve.js <schema.json> <CompanyLabel> <exportPrefix> <outFile>
const fs = require('fs');

const [, , inFile, companyLabel, prefix, outFile] = process.argv;
if (!inFile || !companyLabel || !prefix || !outFile) {
  console.error('Usage: node gen_softland_ve.js <schema.json> <CompanyLabel> <EXPORTPREFIX> <outFile>');
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const tables = data.tables.map(t => t.TABLE_NAME);
const columns = data.columns;
const fks = data.fks;
const pks = data.pks;

// ── Module classification (same 2-letter codes as MODULE_COLORS in constants.js) ──
const GROUP_META = {
  AS: { label: 'AS · Administración del Sistema', color: '#475569' },
  CG: { label: 'CG · Contabilidad General',       color: '#c0392b' },
  CB: { label: 'CB · Control Bancario',           color: '#2980b9' },
  CC: { label: 'CC · Cuentas por Cobrar',         color: '#27ae60' },
  CP: { label: 'CP · Cuentas por Pagar',          color: '#8e44ad' },
  FA: { label: 'FA · Facturación',                color: '#16a085' },
  CO: { label: 'CO · Compras',                    color: '#d35400' },
  CI: { label: 'CI · Control de Inventario',      color: '#f39c12' },
  AF: { label: 'AF · Activos Fijos',              color: '#7f8c8d' },
  GN: { label: 'GN · Gestión de Nómina',          color: '#e74c3c' },
  MF: { label: 'MF · Monitor Fiscal',             color: '#0284c7' },
  otros: { label: 'Otros / sin clasificar',       color: '#94a3b8' },
};

function classify(name) {
  const n = name.toUpperCase();
  // Explicit module-code suffix (e.g. HIST_DIFCAM_CB, GLOBALES_CO)
  const suf = n.match(/_(AS|CG|CB|CC|CP|FA|CO|CI|AF|GN|MF)$/);
  if (suf) return suf[1];

  if (n.startsWith('ACTIVO') || n.includes('DEPRECIACION') || n.includes('DESMANTELAMIENTO')) return 'AF';
  if (n.startsWith('ASIENTO') || n.includes('DIARIO') || n.startsWith('CUENTA_CONTABLE') || n.startsWith('CENTRO_COSTO') || n.startsWith('PERIODO')) return 'CG';
  if (n.startsWith('CHEQUE') || n.startsWith('BANCO') || n.startsWith('MOV_BANCO') || n.startsWith('CONCILIACION') || n.startsWith('CAJA')) return 'CB';
  if (n.startsWith('CLIENTE') || n.startsWith('COBRO') || n.startsWith('DOCUMENTOS_CC') || n.startsWith('ANTICIPO_') || n.startsWith('CATEGORIA_CLIENTE')) return 'CC';
  if (n.startsWith('PROVEEDOR') || n.startsWith('DOCUMENTOS_CP') || n.startsWith('LIQUIDAC_COMPRA') || n.startsWith('CATEGORIA_PROVEED')) return 'CP';
  if (n.startsWith('FACTURA') || n.startsWith('PEDIDO') || n.startsWith('DEVOLUCION') || n.startsWith('EMBARQUE') || n.startsWith('VENDEDOR') || n.startsWith('COTIZACION')) return 'FA';
  if (n.startsWith('COMPRA') || n.startsWith('ORDEN_COMPRA') || n.startsWith('REQUISICION')) return 'CO';
  if (n.startsWith('ARTICULO') || n.startsWith('BODEGA') || n.startsWith('INVENTARIO') || n.startsWith('EXISTENCIA') || n.startsWith('LOTE') || n.startsWith('KARDEX')) return 'CI';
  if (n.startsWith('EMPLEADO') || n.startsWith('NOMINA') || n.startsWith('PLANILLA')) return 'GN';
  if (n.startsWith('IMPUESTO') || n.startsWith('RETENCION') || n.startsWith('ARANCEL') || n.startsWith('ADUANA')) return 'MF';
  if (n.startsWith('USUARIO') || n.startsWith('PAIS') || n.startsWith('COMPANIA') || n.startsWith('SUCURSAL') || n.startsWith('MONEDA') || n.startsWith('PERFIL') || n.startsWith('PERMISO')) return 'AS';
  return 'otros';
}

// ── Junk filter: exclude backups/temp/deleted/personal one-offs from consideration ──
const JUNK_RE = /_DELETED$|_BACKUP$|_TEMP\d*$|^TEMP|^JM_|^ITS_|^LOG_|^LOCKS$|_ANTIGU|_OLD$|_COPIA$|^ANEXO/i;
const candidateTables = tables.filter(t => !JUNK_RE.test(t));

// ── FK indexes + connectivity score (same approach as gen_efw.js) ──
const fkFromMap = {};
fks.forEach(fk => { (fkFromMap[fk.from_table] ||= []).push({ col: fk.from_col, toTable: fk.to_table }); });
const fkToCount = {}, fkFromCount = {};
fks.forEach(fk => {
  fkToCount[fk.to_table] = (fkToCount[fk.to_table] || 0) + 1;
  fkFromCount[fk.from_table] = (fkFromCount[fk.from_table] || 0) + 1;
});
const scores = {};
candidateTables.forEach(t => { scores[t] = (fkToCount[t] || 0) * 2 + (fkFromCount[t] || 0); });

const ALWAYS_INCLUDE = new Set([
  'ARTICULO','CLIENTE','PROVEEDOR','FACTURA','PEDIDO','ASIENTO_DE_DIARIO','BODEGA',
  'EMPLEADO','VENDEDOR','COMPANIA','SUCURSAL','PAIS','IMPUESTO','ACTIVO_FIJO','USUARIOS',
]);

const TOP_N = 150;
const topTables = candidateTables
  .sort((a, b) => {
    const aIn = ALWAYS_INCLUDE.has(a) ? 1000 : 0;
    const bIn = ALWAYS_INCLUDE.has(b) ? 1000 : 0;
    return (bIn + scores[b]) - (aIn + scores[a]);
  })
  .slice(0, TOP_N);

// ── Columns per table ──
const colsByTable = {};
columns.forEach(c => { (colsByTable[c.TABLE_NAME] ||= []).push(c); });

const pkByTable = {};
pks.forEach(p => { if (!pkByTable[p.TABLE_NAME]) pkByTable[p.TABLE_NAME] = p.COLUMN_NAME; });

function colScore(c, fkColNames, pk) {
  const cn = c.COLUMN_NAME.toUpperCase();
  let s = 0;
  if (c.IS_NULLABLE === 'NO') s += 3;
  if (c.DATA_TYPE === 'int' || c.DATA_TYPE === 'bigint') s += 1;
  if (fkColNames.has(c.COLUMN_NAME)) s += 5;
  if (cn.startsWith('ID') || cn.startsWith('COD')) s += 2;
  if (c.COLUMN_NAME === pk) s += 10;
  return s;
}

const TABLE_DEFS = {};
topTables.forEach(tableName => {
  const cols = colsByTable[tableName] || [];
  const pk = pkByTable[tableName] || (cols[0] && cols[0].COLUMN_NAME) || '';
  const fkColsForTable = fkFromMap[tableName] || [];
  const fkColNames = new Set(fkColsForTable.map(f => f.col));
  const fkColToTable = {};
  fkColsForTable.forEach(f => { fkColToTable[f.col] = f.toTable; });

  const sorted = [...cols].sort((a, b) => colScore(b, fkColNames, pk) - colScore(a, fkColNames, pk));
  const pkCol = cols.find(c => c.COLUMN_NAME === pk);
  const rest = sorted.filter(c => c.COLUMN_NAME !== pk).slice(0, 7);
  const selected = pkCol ? [pkCol, ...rest] : sorted.slice(0, 8);

  TABLE_DEFS[tableName] = {
    pk,
    cols: selected.map(c => fkColNames.has(c.COLUMN_NAME) && topTables.includes(fkColToTable[c.COLUMN_NAME])
      ? `${c.COLUMN_NAME}→${fkColToTable[c.COLUMN_NAME]}`
      : c.COLUMN_NAME),
  };
});

// ── Colors + groups ──
const COLORS = {};
const groupTables = {};
topTables.forEach(t => {
  const code = classify(t);
  COLORS[t] = GROUP_META[code].color;
  (groupTables[code] ||= []).push(t);
});
const GROUPS = {};
Object.entries(groupTables).forEach(([code, tbls]) => {
  GROUPS[code.toLowerCase()] = { label: GROUP_META[code].label, color: GROUP_META[code].color, tables: tbls.sort() };
});

// ── Emit ──
const lines = [];
lines.push(`// AUTO-GENERADO por gen_softland_ve.js — NO editar a mano.`);
lines.push(`// Fuente: Softland ERP QA Venezuela · schema "${data.schema || ''}" (${companyLabel}) · SOFTLANDQA`);
lines.push(`// ${topTables.length} tablas mostradas de ${tables.length} totales en el schema (filtradas por conectividad FK, top ${TOP_N}).`);
lines.push('');
lines.push(`export const ${prefix}_COLORS = ${JSON.stringify(COLORS, null, 2)};`);
lines.push('');
lines.push(`export const ${prefix}_MOD = new Set(${JSON.stringify(topTables)});`);
lines.push('');
lines.push(`export const ${prefix}_GROUPS = ${JSON.stringify(GROUPS, null, 2)};`);
lines.push('');
lines.push(`export const ${prefix}_TABLE_DEFS = ${JSON.stringify(TABLE_DEFS, null, 2)};`);
lines.push('');
lines.push(`export const ${prefix}_INTEGRATIONS = [];`);
lines.push('');

fs.writeFileSync(outFile, lines.join('\n'));
console.log(`Written ${outFile}: ${topTables.length}/${tables.length} tables, ${Object.keys(GROUPS).length} groups`);
Object.entries(groupTables).forEach(([code, t]) => console.log(`  ${code}: ${t.length}`));
