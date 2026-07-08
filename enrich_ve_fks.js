// enrich_ve_fks.js — adds "COL→TABLA" FK annotations into an existing
// generated *_ve.js file's TABLE_DEFS, using a fresh db_extract_schema.js
// dump. Does NOT touch table selection, GROUPS, COLORS or MOD — only rewrites
// the "cols" arrays in place, same convention as gen_softland_ve.js (only
// annotates a column as FK if the referenced table is also present in this
// file's own TABLE_DEFS, so the reference is actually navigable in this view).
// Usage: node enrich_ve_fks.js <dataFile.js> <fkDump.json>
const fs = require('fs');

const [, , dataFile, fkDumpFile] = process.argv;
if (!dataFile || !fkDumpFile) {
  console.error('Usage: node enrich_ve_fks.js <dataFile.js> <fkDump.json>');
  process.exit(1);
}

const src = fs.readFileSync(dataFile, 'utf8');
const dump = JSON.parse(fs.readFileSync(fkDumpFile, 'utf8'));

const lineRe = /^(\s*"([^"]+)":\s*\{\s*pk:"([^"]*)",\s*cols:\[)(.*)(\]\s*\},?)\s*$/;

// Pass 1: collect the set of tables present in this file's TABLE_DEFS.
const tableSet = new Set();
src.split('\n').forEach(line => {
  const m = line.match(lineRe);
  if (m) tableSet.add(m[2]);
});

// FK map: "TABLE::COL" -> target table (only when target table is in tableSet)
const fkMap = {};
dump.fks.forEach(fk => {
  if (!tableSet.has(fk.to_table)) return;
  fkMap[`${fk.from_table}::${fk.from_col}`] = fk.to_table;
});

let changed = 0;
const outLines = src.split('\n').map(line => {
  const m = line.match(lineRe);
  if (!m) return line;
  const [, prefix, tableName, , colsBody, suffix] = m;
  if (!colsBody.trim()) return line;
  const cols = colsBody.match(/"[^"]*"/g) || [];
  const newCols = cols.map(quoted => {
    const colName = quoted.slice(1, -1);
    const baseCol = colName.split('→')[0];
    const target = fkMap[`${tableName}::${baseCol}`];
    if (target && target !== tableName) {
      changed++;
      return `"${baseCol}→${target}"`;
    }
    return `"${baseCol}"`;
  });
  return `${prefix}${newCols.join(',')}${suffix}`;
});

fs.writeFileSync(dataFile, outLines.join('\n'));
console.log(`${dataFile}: ${tableSet.size} tablas, ${changed} columnas anotadas como FK`);
