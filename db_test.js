// db_test.js — ping all configured SQL Server instances
// Usage: node db_test.js [key]   (key optional: test only that instance)
const sql = require('mssql');
const INSTANCES = require('./db_config.js');

const target = process.argv[2];
const keys = target ? [target] : Object.keys(INSTANCES);

async function testOne(key) {
  const cfg = INSTANCES[key];
  if (!cfg) { console.error(`Unknown instance: ${key}`); process.exit(1); }
  const start = Date.now();
  let pool;
  try {
    pool = await sql.connect(cfg);
    const res = await pool.request().query('SELECT @@VERSION AS ver, DB_NAME() AS db, GETDATE() AS ts');
    const row = res.recordset[0];
    const ms = Date.now() - start;
    console.log(`\n✓ ${cfg.label} [${key}]`);
    console.log(`  DB      : ${row.db}`);
    console.log(`  Server  : ${row.ver.split('\n')[0].trim()}`);
    console.log(`  Time    : ${ms}ms`);
    return { key, ok: true };
  } catch (err) {
    const ms = Date.now() - start;
    console.log(`\n✗ ${cfg.label} [${key}]  (${ms}ms)`);
    console.log(`  Error   : ${err.message}`);
    return { key, ok: false, error: err.message };
  } finally {
    try { if (pool) await pool.close(); } catch (_) {}
    sql.close();
  }
}

(async () => {
  console.log('Testing', keys.length, 'instance(s)...');
  const results = [];
  for (const k of keys) {
    results.push(await testOne(k));
  }
  const ok = results.filter(r => r.ok).length;
  console.log(`\n─── Summary: ${ok}/${results.length} connected ───`);
  results.forEach(r => console.log(`  ${r.ok ? '✓' : '✗'} ${r.key}`));
  process.exit(ok === results.length ? 0 : 1);
})();
