// gen_wmh_cr_defs.js — build WMH_CR_TABLE_DEFS + WMH_CR_COLORS from the real
// extracted schema (ve_schema_wmh_cr.json), reusing the existing WMH_CR_MOD /
// WMH_CR_GROUPS assignment already curated by hand in wmh_cr.js.
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('ve_schema_wmh_cr.json', 'utf8'));

// Mismo agrupamiento ya curado a mano en olo-architecture/src/data/wmh_cr.js
const WMH_CR_GROUPS = {
  tms: {
    label: 'Viajes & TMS', color: '#16a34a',
    tables: ['journeys','journey_orders','journey_members','journey_order_transportation',
             'drivers','transportation_companies','trasportation_units',
             'distribution_routes','distribution_zones'],
  },
  almacen: {
    label: 'Almacén & Config', color: '#0d9488',
    tables: ['warehouses','activities','system_rules','system_types','incline_belts',
             'users','warehouse_logo','customer_logo','app_counter','warehouse_queries'],
  },
  staging: {
    label: 'Staging ETL (desde eFlow)', color: '#64748b',
    tables: ['ext_tms_almacenmovimientos_carcam_mt','ext_tms_almacenmovimientos_mt',
             'ext_tms_articulosgestion_mt','ext_tms_clientes_mt','ext_tms_compania_mt',
             'ext_tms_drivers_mt','ext_tms_expedicionescabecera_mt','ext_tms_expedicionesdetalle_mt',
             'ext_tms_journey_order_transportation_mt','ext_tms_sucursal_mt',
             'ext_tms_transportation_companies_mt','ext_tms_trasportation_units_mt',
             'ext_tms_wms_pedido_factura_mt','stat_ts_sp_ejecucion_mt','tms_errors'],
  },
};

const tables = Object.values(WMH_CR_GROUPS).flatMap(g => g.tables);
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
Object.values(WMH_CR_GROUPS).forEach(g => { g.tables.forEach(t => { COLORS[t] = g.color; }); });

const out = [
  '',
  'export const WMH_CR_COLORS = ' + JSON.stringify(COLORS, null, 2) + ';',
  '',
  'export const WMH_CR_TABLE_DEFS = ' + JSON.stringify(TABLE_DEFS, null, 2) + ';',
  '',
].join('\n');

fs.writeFileSync('wmh_cr_defs_append.txt', out);
console.log('Written wmh_cr_defs_append.txt —', tables.length, 'tables,', Object.keys(COLORS).length, 'colors');
