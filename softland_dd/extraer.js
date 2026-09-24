// softland_dd/extraer.js — diccionario real de Softland (QA Costa Rica, base MAR)
// a partir del esquema erpadmin, que es donde Softland describe sus módulos:
//   DD_MODULO / DD_MODULO_TABLA / DD_TABLA  → módulos y sus tablas
//   DD_ENTIDAD / DD_RELACION_ENTIDAD        → entidades de negocio
//   ACCION (+ MODULO_INSTALADO)             → menú: módulo › pantalla › acciones
// Cruza cada tabla con la compañía COFER (Cofersa): si existe, cuántas columnas
// tiene y si tiene datos. Solo lee diccionario y configuración (ninguna tabla de
// clientes ni movimientos). Salida: olo-architecture/src/data/softland_dd.json
// Uso: node softland_dd/extraer.js
const fs = require('fs');
const path = require('path');
const sql = require('mssql');
const I = require('../db_config.js');

const OUT = path.join(__dirname, '..', 'olo-architecture', 'src', 'data', 'softland_dd.json');
const CIA = 'COFER';
// DD_MODULO trae la descripción con doble codificación (UTF-8 leído como latin1)
const fix = s => { if (s == null) return s; const t = String(s); return /Ã|Â/.test(t) ? Buffer.from(t, 'latin1').toString('utf8') : t; };
const TIPO = { M: 'modulo', F: 'pantalla', A: 'accion', C: 'consulta', R: 'reporte', P: 'proceso' };

(async () => {
  const p = await new sql.ConnectionPool({ ...I['softland-qa-cr'], database: 'MAR', requestTimeout: 180000 }).connect();
  const q = async s => (await p.request().query(s)).recordset;

  const modulos = await q(`SELECT MODULO, DESCRIPCION, AREA FROM erpadmin.DD_MODULO ORDER BY MODULO`);
  const modTabla = await q(`SELECT MODULO, TABLA, PRINCIPAL FROM erpadmin.DD_MODULO_TABLA`);
  const tablas = await q(`SELECT TABLA, NOMBRE, DESCRIPCION FROM erpadmin.DD_TABLA`);
  const entidades = await q(`SELECT ENTIDAD, NOMBRE, DESCRIPCION, ENTIDAD_PADRE, MODULO FROM erpadmin.DD_ENTIDAD WHERE ENTIDAD > 0`);
  const acciones = await q(`SELECT ACCION, NOMBREACCION, DESCRIPCION, NOMBRECONSTANTE, TIPO, TABLA FROM erpadmin.ACCION ORDER BY ACCION`);
  const instalados = new Set((await q(`SELECT ACCION FROM erpadmin.MODULO_INSTALADO WHERE CONJUNTO = '${CIA}'`)).map(r => r.ACCION));
  // tablas de la compañía: columnas y si tienen datos (metadatos, no contenido)
  const enCia = {};
  (await q(`SELECT t.name tab, (SELECT COUNT(*) FROM sys.columns c WHERE c.object_id = t.object_id) cols,
              (SELECT SUM(p.rows) FROM sys.partitions p WHERE p.object_id = t.object_id AND p.index_id IN (0,1)) filas
            FROM sys.tables t JOIN sys.schemas s ON s.schema_id = t.schema_id WHERE s.name = '${CIA}'`))
    .forEach(r => { enCia[r.tab.toUpperCase()] = { cols: r.cols, conDatos: Number(r.filas) > 0 }; });
  await p.close(); await sql.close();

  const infoTabla = Object.fromEntries(tablas.map(t => [t.TABLA.toUpperCase(), fix(t.NOMBRE)]));
  const out = { fuente: `Softland QA Costa Rica · base MAR · esquema erpadmin (diccionario) · compañía ${CIA}`, generado: new Date().toISOString().slice(0, 10), modulos: {} };

  for (const m of modulos) {
    const pref = `${m.MODULO}_`;
    // menú del módulo: las acciones vienen en orden; cada pantalla (F/C/R/P) agrupa las acciones (A) que la siguen
    const propias = acciones.filter(a => a.NOMBRECONSTANTE?.startsWith(pref) || a.NOMBRECONSTANTE === `${m.MODULO}_MAIN`);
    const main = propias.find(a => a.TIPO === 'M');
    const pantallas = propias.filter(a => a.TIPO !== 'M' && a.TIPO !== 'A').map(a => ({ id: a.NOMBRECONSTANTE, orden: a.ACCION, nombre: fix(a.NOMBREACCION),
      descripcion: fix(a.DESCRIPCION), tipo: TIPO[a.TIPO] || a.TIPO, tabla: a.TABLA ? a.TABLA.toUpperCase() : null, acciones: [] }));
    // cada acción va a la pantalla cuyo código es el prefijo más largo del suyo (CC_CLIENTE → CC_CLIENTEADD);
    // las acciones que se agregaron después en Softland no quedan contiguas, por eso no basta el orden
    for (const a of propias.filter(x => x.TIPO === 'A')) {
      let dueña = null;
      for (const p of pantallas) if (a.NOMBRECONSTANTE.startsWith(p.id) && p.id.length > pref.length + 1 && (!dueña || p.id.length > dueña.id.length)) dueña = p;
      if (!dueña) dueña = [...pantallas].reverse().find(p => p.orden < a.ACCION && a.ACCION - p.orden < 12) || null;
      if (dueña && !dueña.acciones.includes(fix(a.NOMBREACCION))) dueña.acciones.push(fix(a.NOMBREACCION));
    }
    pantallas.forEach(p => delete p.orden);
    const tabs = modTabla.filter(x => x.MODULO === m.MODULO).map(x => {
      const t = x.TABLA.toUpperCase(), c = enCia[t];
      return { tabla: t, nombre: infoTabla[t] || null, principal: x.PRINCIPAL === 'S', enCofersa: !!c, columnas: c?.cols || null, conDatos: !!c?.conDatos };
    }).sort((a, b) => a.tabla.localeCompare(b.tabla));
    out.modulos[m.MODULO] = {
      nombre: fix(m.DESCRIPCION), area: m.AREA, instaladoEnCofersa: main ? instalados.has(main.ACCION) : false,
      pantallas: pantallas.filter(x => x.tipo !== 'accion'),
      tablas: tabs,
      entidades: entidades.filter(e => e.MODULO === m.MODULO).map(e => ({ id: e.ENTIDAD, nombre: fix(e.NOMBRE), descripcion: fix(e.DESCRIPCION), padre: e.ENTIDAD_PADRE })),
    };
  }
  fs.writeFileSync(OUT, JSON.stringify(out));
  const mods = Object.values(out.modulos);
  console.log(`módulos ${mods.length} (instalados en ${CIA}: ${mods.filter(m => m.instaladoEnCofersa).length}) · pantallas ${mods.reduce((a, m) => a + m.pantallas.length, 0)} · tablas ${mods.reduce((a, m) => a + m.tablas.length, 0)} · entidades ${mods.reduce((a, m) => a + m.entidades.length, 0)}`);
  console.log(`→ ${path.relative(path.join(__dirname, '..'), OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
