// db_extract_schema.js — extract table/column/FK/PK metadata (schema-only, no row data)
// Usage: node db_extract_schema.js <instance-key> <output.json>
const fs = require('fs');
const sql = require('mssql');
const INSTANCES = require('./db_config.js');

(async () => {
  const key = process.argv[2];
  const outFile = process.argv[3];
  if (!key || !outFile) {
    console.error('Usage: node db_extract_schema.js <instance-key> <output.json>');
    process.exit(1);
  }
  const cfg = INSTANCES[key];
  if (!cfg) { console.error('Unknown instance:', key); process.exit(1); }
  cfg.options = { ...cfg.options, requestTimeout: 180000 };

  const pool = await sql.connect(cfg);
  console.log(`Connected: ${cfg.label} (${cfg.database})`);

  const tablesRes = await pool.request().query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME"
  );
  const tables = tablesRes.recordset;
  console.log(`Tables: ${tables.length}`);

  const columnsRes = await pool.request().query(
    "SELECT TABLE_NAME, COLUMN_NAME, IS_NULLABLE, DATA_TYPE, ORDINAL_POSITION FROM INFORMATION_SCHEMA.COLUMNS ORDER BY TABLE_NAME, ORDINAL_POSITION"
  );
  const columns = columnsRes.recordset;
  console.log(`Columns: ${columns.length}`);

  const fksRes = await pool.request().query(`
    SELECT
      fk.name AS fk_name,
      tp.name AS from_table,
      cp.name AS from_col,
      tr.name AS to_table,
      cr.name AS to_col
    FROM sys.foreign_keys fk
    JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
    JOIN sys.tables tp ON tp.object_id = fkc.parent_object_id
    JOIN sys.columns cp ON cp.object_id = fkc.parent_object_id AND cp.column_id = fkc.parent_column_id
    JOIN sys.tables tr ON tr.object_id = fkc.referenced_object_id
    JOIN sys.columns cr ON cr.object_id = fkc.referenced_object_id AND cr.column_id = fkc.referenced_column_id
    ORDER BY tp.name
  `);
  const fks = fksRes.recordset.map(r => ({ from_table: r.from_table, from_col: r.from_col, to_table: r.to_table, to_col: r.to_col }));
  console.log(`FKs: ${fks.length}`);

  const pksRes = await pool.request().query(`
    SELECT tc.TABLE_NAME, kcu.COLUMN_NAME
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
      ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME AND tc.TABLE_NAME = kcu.TABLE_NAME
    WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
    ORDER BY tc.TABLE_NAME, kcu.ORDINAL_POSITION
  `);
  const pks = pksRes.recordset;
  console.log(`PK rows: ${pks.length}`);

  await pool.close();
  sql.close();

  fs.writeFileSync(outFile, JSON.stringify({ instance: key, database: cfg.database, tables, columns, fks, pks }, null, 0));
  console.log(`Written: ${outFile}`);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
