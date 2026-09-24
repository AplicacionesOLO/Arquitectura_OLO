// schema_watch/run.js — la corrida completa del job de monitoreo:
//   1. instantánea de metadatos de todas las bases (snapshot.js)
//   2. comparación contra el BPA y contra la instantánea anterior (diff.js)
//   3. si hubo cambios o alertas nuevas: análisis en español con Claude Code en
//      modo solo lectura (herramientas Read/Grep/Glob; no puede modificar nada)
//   4. publicación del informe (y el análisis) en Supabase → el BPA lo muestra
// Uso:  node schema_watch/run.js [--sin-claude] [--sin-publicar] [--analizar  (fuerza el análisis aunque no haya cambios)]
// Pensado para el Programador de tareas de Windows (ver instalar_tarea.cmd):
// debe correr en un equipo dentro de la red de OLO, porque las bases son privadas.
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const DIR = __dirname, RAIZ = path.join(DIR, '..'), SNAP = path.join(DIR, 'snapshots'), REP = path.join(DIR, 'reports');
const args = new Set(process.argv.slice(2));
const MODELO = 'claude-opus-5-5';
const CONSERVAR = 30;

fs.mkdirSync(REP, { recursive: true });
const LOG = path.join(REP, 'job.log');
const log = m => { const l = `[${new Date().toISOString()}] ${m}`; console.log(l); fs.appendFileSync(LOG, l + '\n'); };

function correr(script) {
  execFileSync(process.execPath, [path.join(DIR, script)], { cwd: RAIZ, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
}

(async () => {
  log('inicio');
  correr('snapshot.js');
  log('instantánea lista');
  correr('diff.js');
  const ult = fs.readdirSync(REP).filter(f => /^\d{4}-\d\d-\d\d-\d\d-\d\d\.json$/.test(f)).sort().pop();
  const inf = JSON.parse(fs.readFileSync(path.join(REP, ult), 'utf8'));
  const md = fs.readFileSync(path.join(REP, ult.replace('.json', '.md')), 'utf8');
  const r = inf.resumen;
  log(`informe ${ult}: ${r.conAlertas} esquemas con alertas · ${r.tablasFaltan} tablas y ${r.columnasFaltan} columnas del BPA faltan · ${r.cambiosDesdeAnterior} bases con cambios desde la anterior`);

  // Solo se gasta en el análisis si hay algo nuevo que explicar
  let analisis = null;
  const hayNovedad = args.has('--analizar') || !inf.anterior || r.cambiosDesdeAnterior > 0 || r.tablasFaltan > 0 || r.columnasFaltan > 0;
  if (!args.has('--sin-claude') && hayNovedad) {
    const prompt = fs.readFileSync(path.join(DIR, 'analizar_prompt.md'), 'utf8').replaceAll('ULTIMO', ult.replace('.json', ''));
    // el prompt va por la entrada estándar (en Windows, pasarlo como argumento rompe las comillas)
    // comando fijo (sin datos variables): el shell solo resuelve claude.cmd en Windows
    const res = spawnSync(`claude -p --model ${MODELO} --allowedTools Read,Grep,Glob --output-format text`,
      { cwd: RAIZ, input: prompt, encoding: 'utf8', shell: true, timeout: 15 * 60 * 1000, maxBuffer: 16 * 1024 * 1024 });
    if (res.status === 0 && res.stdout.trim()) {
      analisis = res.stdout.trim();
      fs.writeFileSync(path.join(REP, ult.replace('.json', '.analisis.md')), analisis);
      log('análisis de Claude listo');
    } else log(`análisis de Claude no disponible (código ${res.status}): ${(res.stderr || '').slice(0, 200)}`);
  } else log(hayNovedad ? 'análisis de Claude omitido (--sin-claude)' : 'sin cambios: no hace falta análisis');

  if (!args.has('--sin-publicar')) {
    await require('./publicar.js').publicar(inf, md, analisis);
    log('publicado en Supabase');
  }

  // conservar solo las últimas instantáneas
  const snaps = fs.readdirSync(SNAP).filter(f => /^\d{4}-\d\d-\d\d-\d\d-\d\d\.json\.gz$/.test(f)).sort();
  snaps.slice(0, Math.max(0, snaps.length - CONSERVAR)).forEach(f => fs.unlinkSync(path.join(SNAP, f)));
  log('fin');
})().catch(e => { log(`ERROR: ${e.message}`); process.exit(1); });
