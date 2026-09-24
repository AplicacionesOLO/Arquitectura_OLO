// schema_watch/snapshot.js — instantánea de metadatos de TODAS las bases de
// usuario de las instancias SQL Server de db_config.js (solo lectura de
// catálogo: sys.*). Guarda esquemas, tablas, columnas (tipo, largo, nulos),
// PK, FK, objetos programables (procs, vistas, funciones, triggers) con su
// fecha de modificación y el conteo aproximado de filas por tabla.
//
// Uso:  node schema_watch/snapshot.js            → todas las instancias
//       node schema_watch/snapshot.js eflow-prod-cr
// Salida: schema_watch/snapshots/<fecha>.json.gz  (+ latest.json.gz)
// Las credenciales salen de ../.env vía db_config.js; nunca se escriben aquí.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const sql = require('mssql');
const INSTANCES = require('../db_config.js');

const SISTEMA = new Set(['master', 'model', 'msdb', 'tempdb', 'DWConfiguration', 'DWDiagnostics', 'DWQueue']);
const OUT = path.join(__dirname, 'snapshots');

const Q = {
  tablas: `SELECT s.name sch, t.name tab, t.create_date cre, t.modify_date mod
           FROM sys.tables t JOIN sys.schemas s ON s.schema_id = t.schema_id WHERE t.is_ms_shipped = 0`,
  columnas: `SELECT s.name sch, t.name tab, c.name col, ty.name typ, c.max_length len, c.precision prec, c.scale sc, c.is_nullable nul, c.column_id pos
             FROM sys.columns c JOIN sys.tables t ON t.object_id = c.object_id JOIN sys.schemas s ON s.schema_id = t.schema_id
             JOIN sys.types ty ON ty.user_type_id = c.user_type_id WHERE t.is_ms_shipped = 0`,
  pks: `SELECT s.name sch, t.name tab, c.name col, ic.key_ordinal ord
        FROM sys.indexes i JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
        JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
        JOIN sys.tables t ON t.object_id = i.object_id JOIN sys.schemas s ON s.schema_id = t.schema_id
        WHERE i.is_primary_key = 1`,
  fks: `SELECT fk.name fk, sp.name fsch, tp.name ftab, cp.name fcol, sr.name tsch, tr.name ttab, cr.name tcol
        FROM sys.foreign_keys fk JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
        JOIN sys.tables tp ON tp.object_id = fkc.parent_object_id JOIN sys.schemas sp ON sp.schema_id = tp.schema_id
        JOIN sys.columns cp ON cp.object_id = fkc.parent_object_id AND cp.column_id = fkc.parent_column_id
        JOIN sys.tables tr ON tr.object_id = fkc.referenced_object_id JOIN sys.schemas sr ON sr.schema_id = tr.schema_id
        JOIN sys.columns cr ON cr.object_id = fkc.referenced_object_id AND cr.column_id = fkc.referenced_column_id`,
  objetos: `SELECT s.name sch, o.name nom, RTRIM(o.type) tipo, o.modify_date mod
            FROM sys.objects o JOIN sys.schemas s ON s.schema_id = o.schema_id
            WHERE o.type IN ('P','V','FN','IF','TF','TR') AND o.is_ms_shipped = 0`,
  filas: `SELECT s.name sch, t.name tab, SUM(p.rows) n
          FROM sys.tables t JOIN sys.schemas s ON s.schema_id = t.schema_id
          JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0,1)
          GROUP BY s.name, t.name`,
};

async function snapBase(cfgBase, db) {
  const pool = await new sql.ConnectionPool({ ...cfgBase, database: db, requestTimeout: 300000 }).connect();
  try {
    const r = {};
    for (const [k, q] of Object.entries(Q)) r[k] = (await pool.request().query(q)).recordset;
    // si el usuario no puede ver la estructura, las consultas vuelven vacías: se registra para no confundirlo con "borrado"
    const perm = (await pool.request().query("SELECT HAS_PERMS_BY_NAME(DB_NAME(),'DATABASE','VIEW DEFINITION') vd, IS_MEMBER('db_datareader') lec, IS_MEMBER('db_owner') own")).recordset[0];
    // estructura: esquema → tabla → { cols, pk, filas, mod }
    const esquemas = {};
    const tabla = (sch, tab) => ((esquemas[sch] ||= { tablas: {}, objetos: {} }).tablas[tab] ||= { cols: {}, pk: [], filas: 0 });
    r.tablas.forEach(x => { const t = tabla(x.sch, x.tab); t.cre = x.cre; t.mod = x.mod; });
    r.columnas.sort((a, b) => a.pos - b.pos).forEach(x => {
      const tipo = x.typ + (['varchar', 'nvarchar', 'char', 'nchar', 'varbinary'].includes(x.typ) ? `(${x.len === -1 ? 'max' : x.typ.startsWith('n') ? x.len / 2 : x.len})`
        : ['decimal', 'numeric'].includes(x.typ) ? `(${x.prec},${x.sc})` : '');
      tabla(x.sch, x.tab).cols[x.col] = { t: tipo, n: !!x.nul };
    });
    r.pks.sort((a, b) => a.ord - b.ord).forEach(x => tabla(x.sch, x.tab).pk.push(x.col));
    r.filas.forEach(x => { tabla(x.sch, x.tab).filas = Number(x.n) || 0; });
    r.objetos.forEach(x => { (esquemas[x.sch] ||= { tablas: {}, objetos: {} }).objetos[x.nom] = { tipo: x.tipo, mod: x.mod }; });
    const fks = r.fks.map(x => ({ fk: x.fk, de: `${x.fsch}.${x.ftab}.${x.fcol}`, a: `${x.tsch}.${x.ttab}.${x.tcol}` }));
    return { esquemas, fks, permisos: { verEstructura: !!perm.vd || !!perm.own, lector: !!perm.lec || !!perm.own } };
  } finally { await pool.close(); }
}

(async () => {
  const solo = process.argv[2];
  const claves = solo ? [solo] : Object.keys(INSTANCES);
  const snap = { generado: new Date().toISOString(), instancias: {} };
  for (const key of claves) {
    const cfg = INSTANCES[key];
    const inst = snap.instancias[key] = { label: cfg.label, bases: {}, error: null };
    let dbs = [];
    try {
      const pool = await new sql.ConnectionPool({ ...cfg, database: 'master' }).connect();
      const todas = (await pool.request().query("SELECT name, state_desc estado, HAS_DBACCESS(name) acceso FROM sys.databases ORDER BY name")).recordset
        .map(r => ({ ...r, name: r.name.trim() })).filter(r => !SISTEMA.has(r.name));
      // las que no están en línea o no dan acceso se registran con su motivo, sin intentar leerlas
      for (const r of todas) if (r.estado !== 'ONLINE') inst.bases[r.name] = { error: `base ${r.estado}`, estado: r.estado };
        else if (!r.acceso) inst.bases[r.name] = { error: 'sin acceso del usuario de integración', estado: r.estado };
      dbs = todas.filter(r => r.estado === 'ONLINE' && r.acceso).map(r => r.name);
      await pool.close();
    } catch (e) { inst.error = e.message; console.log(`✗ ${key}: ${e.message}`); continue; }
    for (const db of dbs) {
      const t0 = Date.now();
      try {
        const b = inst.bases[db] = await snapBase(cfg, db);
        const nt = Object.values(b.esquemas).reduce((a, e) => a + Object.keys(e.tablas).length, 0);
        console.log(`${b.permisos.verEstructura || nt ? '✓' : '⚠'} ${key} · ${db}: ${Object.keys(b.esquemas).length} esquemas, ${nt} tablas${!b.permisos.verEstructura && !nt ? ' — SIN PERMISO para ver la estructura' : ''} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
      } catch (e) { inst.bases[db] = { error: e.message }; console.log(`✗ ${key} · ${db}: ${e.message}`); }
    }
  }
  fs.mkdirSync(OUT, { recursive: true });
  const nombre = snap.generado.slice(0, 16).replace(/[:T]/g, '-');
  const gz = zlib.gzipSync(JSON.stringify(snap));
  fs.writeFileSync(path.join(OUT, `${nombre}.json.gz`), gz);
  fs.writeFileSync(path.join(OUT, 'latest.json.gz'), gz);
  console.log(`\nInstantánea: schema_watch/snapshots/${nombre}.json.gz (${(gz.length / 1024 / 1024).toFixed(1)} MB)`);
  await sql.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
