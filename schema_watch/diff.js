// schema_watch/diff.js — compara la última instantánea con:
//   1) lo que el BPA tiene mapeado (src/data/*_TABLE_DEFS): tablas o columnas
//      que el BPA usa y ya no existen, tablas nuevas, bases sin mapear;
//   2) la instantánea anterior (si existe): cambios exactos de tablas,
//      columnas, tipos, PK/FK, objetos programables y tablas que empezaron a
//      tener datos.
// Uso:  node schema_watch/diff.js [--publicar]
// Salida: schema_watch/reports/<fecha>.md y .json; con --publicar, un resumen
//         en Supabase (tabla bpa_schema_cambios) para que el BPA lo muestre.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pathToFileURL } = require('url');

const DIR = __dirname, SNAP = path.join(DIR, 'snapshots'), REP = path.join(DIR, 'reports');
const DATA = path.join(DIR, '..', 'olo-architecture', 'src', 'data');
const FECHA_MAPEO_BPA = '2026-07-20';   // cuándo se extrajeron los esquemas que hoy tiene el BPA

// Esquema del BPA → dónde puede estar (se elige el candidato con más tablas en común)
const MAPA = [
  { cat: 'efw',             label: 'EFW · eFlow WMS (CR)',           mod: 'efw.js',               exp: 'EFW_TABLE_DEFS',        cand: [['eflow-prod-cr', 'EFLOW_OLO'], ['eflow-qa-cr', 'QA_EFLOW_OLO']] },
  { cat: 'efw_config',      label: 'EFW · Configuración (CR)',       mod: 'efw_config.js',        exp: 'EFW_CONFIG_TABLE_DEFS', cand: [['eflow-prod-cr', 'EFLOW_OLO']] },
  { cat: 'wmh_cr',          label: 'WMH · Torre de Control (CR)',    mod: 'wmh_cr.js',            exp: 'WMH_CR_TABLE_DEFS',     cand: [['eflow-prod-cr', 'EFLOW_WMH'], ['eflow-qa-cr', 'EFLOW_WMH']] },
  { cat: 'efwbeval',        label: 'EFW · Beval (VE)',               mod: 'beval_ve.js',          exp: 'EFWBEVAL_TABLE_DEFS',   cand: [['eflow-prod-ve', 'EFLOW_BEVAL'], ['eflow-qa-ve', 'EFLOW_BEVAL']] },
  { cat: 'efwfebeca',       label: 'EFW · Febeca (VE)',              mod: 'febeca_ve.js',         exp: 'EFWFEBECA_TABLE_DEFS',  cand: [['eflow-prod-ve', 'EFLOW_FEBECA'], ['eflow-qa-ve', 'EFLOW_FEBECA']] },
  { cat: 'efwsillaca',      label: 'EFW · Sillaca (VE)',             mod: 'sillaca_ve.js',        exp: 'EFWSILLACA_TABLE_DEFS', cand: [['eflow-prod-ve', 'EFLOW_SILLACA']] },
  { cat: 'efwwmh',          label: 'WMH · Torre de Control (VE)',    mod: 'wmh_ve.js',            exp: 'EFWWMH_TABLE_DEFS',     cand: [['eflow-prod-ve', 'WMH'], ['eflow-qa-ve', 'WMH']] },
  { cat: 'eintegra_ve',     label: 'eIntegra · middleware (VE)',     mod: 'eintegra_ve.js',       exp: 'EINTEGRA_VE_TABLE_DEFS', cand: [['softland-qa-ve', 'EINTEGRA_CONFIG'], ['eflow-qa-ve', 'EINTEGRA_CONFIG_MAYOREO'], ['eflow-prod-ve', 'EINTEGRA_CONFIG_MAYOREO']] },
  ...['BEVAL', 'FEBECA', 'SILLACA', 'TREXA', 'PRISMA'].map(c => ({
    cat: `softland_${c.toLowerCase()}`, label: `Softland · ${c[0] + c.slice(1).toLowerCase()} (VE)`, mod: `softland_${c.toLowerCase()}_ve.js`,
    exp: `SFL${c}_TABLE_DEFS`, cand: [['softland-qa-ve', 'SOFTLANDQA', c]] })),
];

const leer = f => JSON.parse(zlib.gunzipSync(fs.readFileSync(f)));
const up = s => String(s).toUpperCase();
const colsBPA = def => (def.cols || []).map(c => String(c).split('→')[0].trim()).filter(Boolean);

// Tablas de una base (opcionalmente de un solo esquema) → { NOMBRE_MAYUS: { sch, nombre, ...tabla } }
function tablasDe(snap, inst, db, esquema) {
  const b = snap.instancias[inst]?.bases?.[db];
  if (!b || b.error) return null;
  const nt = Object.values(b.esquemas).reduce((a, e) => a + Object.keys(e.tablas).length, 0);
  if (!nt && b.permisos && !b.permisos.verEstructura) return null;   // sin permiso: no es lo mismo que vacía
  const out = {};
  for (const [sch, e] of Object.entries(b.esquemas)) {
    if (esquema && up(sch) !== up(esquema)) continue;
    for (const [t, d] of Object.entries(e.tablas)) out[up(t)] = { sch, nombre: t, ...d };
  }
  return out;
}

async function contraBPA(snap) {
  const res = [];
  for (const m of MAPA) {
    let defs;
    try { defs = (await import(pathToFileURL(path.join(DATA, m.mod)).href))[m.exp]; } catch (e) { res.push({ ...m, error: `no se pudo leer ${m.mod}: ${e.message}` }); continue; }
    const bpa = Object.keys(defs || {});
    // el candidato con más tablas del BPA presentes
    let mejor = null;
    for (const [inst, db, esq] of m.cand) {
      const t = tablasDe(snap, inst, db, esq); if (!t) continue;
      const n = bpa.filter(x => t[up(x)]).length;
      if (!mejor || n > mejor.n) mejor = { inst, db, esq, t, n };
    }
    if (!mejor) {
      const motivos = m.cand.map(([inst, db]) => { const b = snap.instancias[inst]?.bases?.[db];
        return `${inst} · ${db}: ${!b ? 'no existe' : b.error ? b.error : b.permisos && !b.permisos.verEstructura ? 'sin permiso para ver la estructura' : 'sin tablas'}`; });
      res.push({ cat: m.cat, label: m.label, error: `No se pudo comparar — ${motivos.join(' · ')}` }); continue;
    }
    const faltan = bpa.filter(x => !mejor.t[up(x)]);
    const colsFaltan = [];
    for (const x of bpa) {
      const vivo = mejor.t[up(x)]; if (!vivo) continue;
      const vivas = new Set(Object.keys(vivo.cols).map(up));
      colsBPA(defs[x]).forEach(c => { if (!vivas.has(up(c))) colsFaltan.push(`${x}.${c}`); });
    }
    const setBPA = new Set(bpa.map(up));
    const todas = Object.values(mejor.t);
    const nuevasDesdeMapeo = todas.filter(t => !setBPA.has(up(t.nombre)) && t.cre && new Date(t.cre) > new Date(FECHA_MAPEO_BPA)).map(t => `${t.sch}.${t.nombre}`);
    const alteradas = bpa.filter(x => { const v = mejor.t[up(x)]; return v?.mod && new Date(v.mod) > new Date(FECHA_MAPEO_BPA); });
    res.push({ cat: m.cat, label: m.label, fuente: `${mejor.inst} · ${mejor.db}${mejor.esq ? ` · ${mejor.esq}` : ''}`,
      tablasBPA: bpa.length, presentes: mejor.n, faltan, colsFaltan, totalEnBase: todas.length,
      nuevasDesdeMapeo, alteradasDesdeMapeo: alteradas });
  }
  return res;
}

// Bases que el BPA no tiene mapeadas
function basesSinMapear(snap) {
  const usadas = new Set(MAPA.flatMap(m => m.cand.map(([i, d]) => `${i}|${d}`)));
  const out = [];
  for (const [inst, x] of Object.entries(snap.instancias)) for (const [db, b] of Object.entries(x.bases || {})) {
    if (usadas.has(`${inst}|${db}`)) continue;
    const nt = b.error ? null : Object.values(b.esquemas).reduce((a, e) => a + Object.keys(e.tablas).length, 0);
    const sinPermiso = !b.error && !nt && b.permisos && !b.permisos.verEstructura;
    out.push({ instancia: inst, base: db, tablas: nt, error: b.error || (sinPermiso ? 'sin permiso para ver la estructura' : null) });
  }
  return out;
}

// Diferencias exactas entre dos instantáneas
function contraAnterior(ant, act) {
  const cambios = [];
  for (const [inst, x] of Object.entries(act.instancias)) for (const [db, b] of Object.entries(x.bases || {})) {
    const a = ant.instancias[inst]?.bases?.[db];
    if (!a) { cambios.push({ inst, db, tipo: 'base_nueva' }); continue; }
    if (a.error || b.error) continue;
    const r = { inst, db, tablasNuevas: [], tablasBorradas: [], colsNuevas: [], colsBorradas: [], tiposCambiados: [], pkCambiadas: [], fkNuevas: [], fkBorradas: [], objNuevos: [], objBorrados: [], objModificados: [], empezaronDatos: [] };
    const esq = new Set([...Object.keys(a.esquemas), ...Object.keys(b.esquemas)]);
    for (const s of esq) {
      const ta = a.esquemas[s]?.tablas || {}, tb = b.esquemas[s]?.tablas || {};
      for (const t of Object.keys(tb)) if (!ta[t]) r.tablasNuevas.push(`${s}.${t}`);
      for (const t of Object.keys(ta)) if (!tb[t]) r.tablasBorradas.push(`${s}.${t}`);
      for (const t of Object.keys(tb)) {
        if (!ta[t]) continue;
        const ca = ta[t].cols, cb = tb[t].cols;
        for (const c of Object.keys(cb)) if (!ca[c]) r.colsNuevas.push(`${s}.${t}.${c} ${cb[c].t}`);
        for (const c of Object.keys(ca)) if (!cb[c]) r.colsBorradas.push(`${s}.${t}.${c}`);
        for (const c of Object.keys(cb)) if (ca[c] && (ca[c].t !== cb[c].t || ca[c].n !== cb[c].n)) r.tiposCambiados.push(`${s}.${t}.${c}: ${ca[c].t}${ca[c].n ? ' null' : ''} → ${cb[c].t}${cb[c].n ? ' null' : ''}`);
        if (ta[t].pk.join(',') !== tb[t].pk.join(',')) r.pkCambiadas.push(`${s}.${t}: (${ta[t].pk.join(', ')}) → (${tb[t].pk.join(', ')})`);
        if (!ta[t].filas && tb[t].filas) r.empezaronDatos.push(`${s}.${t} (${tb[t].filas} filas)`);
      }
      const oa = a.esquemas[s]?.objetos || {}, ob = b.esquemas[s]?.objetos || {};
      for (const o of Object.keys(ob)) { if (!oa[o]) r.objNuevos.push(`${s}.${o} [${ob[o].tipo}]`); else if (String(oa[o].mod) !== String(ob[o].mod)) r.objModificados.push(`${s}.${o} [${ob[o].tipo}]`); }
      for (const o of Object.keys(oa)) if (!ob[o]) r.objBorrados.push(`${s}.${o} [${oa[o].tipo}]`);
    }
    const fa = new Set((a.fks || []).map(f => `${f.de}>${f.a}`)), fb = new Set((b.fks || []).map(f => `${f.de}>${f.a}`));
    fb.forEach(f => { if (!fa.has(f)) r.fkNuevas.push(f.replace('>', ' → ')); });
    fa.forEach(f => { if (!fb.has(f)) r.fkBorradas.push(f.replace('>', ' → ')); });
    const n = Object.entries(r).filter(([k, v]) => Array.isArray(v) && v.length).length;
    if (n) cambios.push(r);
  }
  for (const [inst, x] of Object.entries(ant.instancias)) for (const db of Object.keys(x.bases || {}))
    if (!act.instancias[inst]?.bases?.[db]) cambios.push({ inst, db, tipo: 'base_eliminada' });
  return cambios;
}

// ── Informe en Markdown ─────────────────────────────────────────────────────
const lista = (xs, max = 25) => xs.length ? xs.slice(0, max).map(x => `  - \`${x}\``).join('\n') + (xs.length > max ? `\n  - … y ${xs.length - max} más` : '') : '';
function markdown(inf) {
  const L = [`# Cambios en las bases de datos · ${inf.generado.slice(0, 10)}`, ''];
  L.push(`Instantánea: ${inf.instancias.map(i => `${i.key} (${i.ok ? `${i.bases} bases` : 'sin conexión'})`).join(' · ')}`, '');
  L.push('## 1. Contra lo que el BPA tiene mapeado', '');
  for (const c of inf.bpa) {
    if (c.error) { L.push(`### ${c.label}`, `- ⚠️ ${c.error}`, ''); continue; }
    const ok = !c.faltan.length && !c.colsFaltan.length;
    L.push(`### ${ok ? '✅' : '⚠️'} ${c.label} — ${c.fuente}`);
    L.push(`- ${c.presentes} de ${c.tablasBPA} tablas del BPA siguen existiendo · la base tiene ${c.totalEnBase} tablas`);
    if (c.faltan.length) L.push(`- **Tablas del BPA que ya no están:** ${c.faltan.length}`, lista(c.faltan));
    if (c.colsFaltan.length) L.push(`- **Columnas del BPA que ya no están:** ${c.colsFaltan.length}`, lista(c.colsFaltan));
    if (c.alteradasDesdeMapeo.length) L.push(`- Tablas del BPA con ALTER o cambios de índices desde el mapeo (${FECHA_MAPEO_BPA}): ${c.alteradasDesdeMapeo.length} — no implica columnas distintas (esas se verifican arriba); el detalle exacto sale de comparar instantáneas`, lista(c.alteradasDesdeMapeo, 15));
    if (c.nuevasDesdeMapeo.length) L.push(`- Tablas creadas después del mapeo y que el BPA no tiene: ${c.nuevasDesdeMapeo.length}`, lista(c.nuevasDesdeMapeo, 15));
    L.push('');
  }
  L.push('## 2. Bases que el BPA no tiene mapeadas', '');
  const accesibles = inf.sinMapear.filter(b => !b.error), cerradas = inf.sinMapear.filter(b => b.error);
  accesibles.sort((a, b) => b.tablas - a.tablas).forEach(b => L.push(`- \`${b.instancia} · ${b.base}\` — ${b.tablas} tablas`));
  if (cerradas.length) {
    L.push('', `Sin acceso para el usuario de integración (${cerradas.length}):`);
    const porMotivo = {};
    cerradas.forEach(b => (porMotivo[b.error] ||= []).push(`${b.instancia} · ${b.base}`));
    Object.entries(porMotivo).forEach(([m, xs]) => L.push(`- **${m}:** ${xs.map(x => `\`${x}\``).join(', ')}`));
  }
  L.push('', '## 3. Contra la instantánea anterior', '');
  if (!inf.anterior) L.push('Es la primera instantánea completa: queda como línea base. Desde la próxima corrida se detectará cualquier cambio exacto.');
  else if (!inf.cambios.length) L.push(`Sin cambios desde ${inf.anterior.slice(0, 16).replace('T', ' ')}.`);
  else for (const c of inf.cambios) {
    if (c.tipo) { L.push(`- **${c.tipo === 'base_nueva' ? 'Base nueva' : 'Base eliminada'}:** \`${c.inst} · ${c.db}\``); continue; }
    L.push(`### ${c.inst} · ${c.db}`);
    const E = { tablasNuevas: 'Tablas nuevas', tablasBorradas: 'Tablas eliminadas', colsNuevas: 'Columnas nuevas', colsBorradas: 'Columnas eliminadas', tiposCambiados: 'Tipos cambiados',
      pkCambiadas: 'Llaves primarias cambiadas', fkNuevas: 'Relaciones (FK) nuevas', fkBorradas: 'Relaciones (FK) eliminadas', objNuevos: 'Procedimientos / vistas / triggers nuevos',
      objBorrados: 'Procedimientos / vistas / triggers eliminados', objModificados: 'Procedimientos / vistas / triggers modificados', empezaronDatos: 'Tablas que empezaron a tener datos' };
    for (const [k, t] of Object.entries(E)) if (c[k]?.length) L.push(`- **${t}:** ${c[k].length}`, lista(c[k], 15));
    L.push('');
  }
  return L.join('\n');
}

(async () => {
  const archivos = fs.readdirSync(SNAP).filter(f => /^\d{4}-\d\d-\d\d-\d\d-\d\d\.json\.gz$/.test(f)).sort();
  if (!archivos.length) { console.error('No hay instantáneas: corre primero schema_watch/snapshot.js'); process.exit(1); }
  const act = leer(path.join(SNAP, archivos[archivos.length - 1]));
  const ant = archivos.length > 1 ? leer(path.join(SNAP, archivos[archivos.length - 2])) : null;
  const inf = {
    generado: act.generado, anterior: ant?.generado || null,
    instancias: Object.entries(act.instancias).map(([key, x]) => ({ key, ok: !x.error, bases: Object.keys(x.bases || {}).length, error: x.error })),
    bpa: await contraBPA(act), sinMapear: basesSinMapear(act), cambios: ant ? contraAnterior(ant, act) : [],
  };
  inf.resumen = {
    esquemasBPA: inf.bpa.length,
    conAlertas: inf.bpa.filter(c => c.error || c.faltan?.length || c.colsFaltan?.length).length,
    tablasFaltan: inf.bpa.reduce((a, c) => a + (c.faltan?.length || 0), 0),
    columnasFaltan: inf.bpa.reduce((a, c) => a + (c.colsFaltan?.length || 0), 0),
    basesSinMapear: inf.sinMapear.length,
    cambiosDesdeAnterior: inf.cambios.length,
  };
  fs.mkdirSync(REP, { recursive: true });
  const nombre = act.generado.slice(0, 16).replace(/[:T]/g, '-');
  fs.writeFileSync(path.join(REP, `${nombre}.json`), JSON.stringify(inf, null, 2));
  fs.writeFileSync(path.join(REP, `${nombre}.md`), markdown(inf));
  console.log(markdown(inf));
  console.log(`\nInforme: schema_watch/reports/${nombre}.md`);

  if (process.argv.includes('--publicar')) {
    const { publicar } = require('./publicar.js');
    await publicar(inf, markdown(inf));
    console.log('Publicado en Supabase (bpa_schema_cambios).');
  }
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
