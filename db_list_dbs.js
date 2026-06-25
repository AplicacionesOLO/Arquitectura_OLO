// db_list_dbs.js — list databases on all configured instances
// Reads credentials exclusively from .env (never CLI args)
const sql = require('mssql');
const INSTANCES = require('./db_config.js');

async function listOne(key) {
  const cfg = { ...INSTANCES[key], database: 'master' };
  try {
    const pool = await sql.connect(cfg);
    const r = await pool.request().query('SELECT name FROM sys.databases ORDER BY name');
    console.log(`\n--- ${cfg.label} [${key}] ---`);
    r.recordset.forEach(row => console.log('  ' + row.name));
    await pool.close();
    sql.close();
    return { key, ok: true, dbs: r.recordset.map(r => r.name) };
  } catch (e) {
    console.log(`\n--- ${cfg.label} [${key}] --- ERR: ${e.message}`);
    sql.close();
    return { key, ok: false, error: e.message };
  }
}

(async () => {
  const target = process.argv[2];
  const keys = target ? [target] : Object.keys(require('./db_config.js'));
  for (const k of keys) await listOne(k);
})();
