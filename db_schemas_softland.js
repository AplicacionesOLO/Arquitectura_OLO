const sql = require('mssql');
const INSTANCES = require('./db_config.js');
(async () => {
  const pool = await sql.connect(INSTANCES['softland-qa-ve']);
  const r = await pool.request().query(
    "SELECT TABLE_SCHEMA, COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' GROUP BY TABLE_SCHEMA ORDER BY cnt DESC"
  );
  console.log('Schemas in SOFTLANDQA:');
  r.recordset.forEach(x => console.log('  ' + x.TABLE_SCHEMA + ': ' + x.cnt + ' tables'));
  await pool.close();
  sql.close();
})();
