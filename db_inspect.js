// db_inspect.js — list tables for one or more instances
// Usage: node db_inspect.js [key1] [key2] ...  (no args = all)
const sql = require('mssql');
const INSTANCES = require('./db_config.js');

async function inspect(key) {
  const cfg = INSTANCES[key];
  if (!cfg) { console.error('Unknown:', key); return; }
  let pool;
  try {
    pool = await sql.connect(cfg);
    const r = await pool.request().query(
      "SELECT TABLE_SCHEMA as s, TABLE_NAME as t FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_SCHEMA, TABLE_NAME"
    );
    console.log('\n=== ' + cfg.label + ' (' + cfg.database + ') — ' + r.recordset.length + ' tables ===');
    r.recordset.forEach(row => console.log('  [' + row.s + '] ' + row.t));
  } catch (e) {
    console.log('ERR [' + key + ']: ' + e.message);
  } finally {
    try { if (pool) await pool.close(); } catch (_) {}
    sql.close();
  }
}

(async () => {
  const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(INSTANCES);
  for (const k of keys) await inspect(k);
})();
