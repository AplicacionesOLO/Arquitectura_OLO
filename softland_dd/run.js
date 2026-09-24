// softland_dd/run.js — job «Diccionario de Softland» (lo lanza jobs/despachador.js).
// 1. Extrae el diccionario actual de Softland (extraer.js) a un archivo temporal.
// 2. Lo compara con el que tiene el BPA (src/data/softland_dd.json): módulos
//    instalados en la compañía, opciones de menú, acciones y tablas.
// 3. Si hubo cambios: guarda una copia del anterior en historial/, reemplaza el
//    del BPA (queda listo para commit/deploy) y reporta el detalle.
// Al final imprime RESULTADO_JOB {…} para el despachador (sin IA: costo 0).
// Uso: node softland_dd/run.js [--solo-comparar]  (no reemplaza el archivo del BPA)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const DATA = path.join(__dirname, '..', 'olo-architecture', 'src', 'data', 'softland_dd.json');
const HIST = path.join(__dirname, 'historial');
const tmp = path.join(os.tmpdir(), `softland_dd_${Date.now()}.json`);
const soloComparar = process.argv.includes('--solo-comparar');

execFileSync(process.execPath, [path.join(__dirname, 'extraer.js'), '--salida', tmp], { stdio: ['ignore', 'pipe', 'pipe'] });
const nuevo = JSON.parse(fs.readFileSync(tmp, 'utf8'));
const viejo = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, 'utf8')) : { modulos: {} };
fs.rmSync(tmp, { force: true });

// ── comparación por módulo ──
const cambios = [];
const mods = new Set([...Object.keys(viejo.modulos), ...Object.keys(nuevo.modulos)]);
for (const k of [...mods].sort()) {
  const a = viejo.modulos[k], b = nuevo.modulos[k];
  if (!a) { cambios.push({ modulo: k, nombre: b.nombre, tipo: 'modulo_nuevo' }); continue; }
  if (!b) { cambios.push({ modulo: k, nombre: a.nombre, tipo: 'modulo_eliminado' }); continue; }
  const c = { modulo: k, nombre: b.nombre };
  if (a.instaladoEnCofersa !== b.instaladoEnCofersa) c.instalacion = b.instaladoEnCofersa ? 'se instaló en la compañía' : 'se desinstaló de la compañía';
  const pa = new Map(a.pantallas.map(p => [p.id, p])), pb = new Map(b.pantallas.map(p => [p.id, p]));
  const opcNuevas = [...pb.keys()].filter(id => !pa.has(id)).map(id => pb.get(id).nombre);
  const opcQuitadas = [...pa.keys()].filter(id => !pb.has(id)).map(id => pa.get(id).nombre);
  const accNuevas = [], accQuitadas = [];
  for (const [id, p] of pb) { const q = pa.get(id); if (!q) continue;
    p.acciones.filter(x => !q.acciones.includes(x)).forEach(x => accNuevas.push(`${p.nombre} › ${x}`));
    q.acciones.filter(x => !p.acciones.includes(x)).forEach(x => accQuitadas.push(`${p.nombre} › ${x}`)); }
  const ta = new Map(a.tablas.map(t => [t.tabla, t])), tb = new Map(b.tablas.map(t => [t.tabla, t]));
  const tabNuevas = [...tb.keys()].filter(t => !ta.has(t));
  const tabQuitadas = [...ta.keys()].filter(t => !tb.has(t));
  const tabCambios = [...tb.entries()].filter(([t, x]) => ta.has(t)).flatMap(([t, x]) => { const y = ta.get(t), r = [];
    if (x.enCofersa !== y.enCofersa) r.push(`${t}: ${x.enCofersa ? 'ahora existe en la compañía' : 'ya no existe en la compañía'}`);
    else if (x.columnas !== y.columnas) r.push(`${t}: columnas ${y.columnas} → ${x.columnas}`);
    if (x.conDatos && !y.conDatos) r.push(`${t}: empezó a tener datos`);
    return r; });
  Object.assign(c, { opcNuevas, opcQuitadas, accNuevas, accQuitadas, tabNuevas, tabQuitadas, tabCambios });
  if (c.instalacion || [opcNuevas, opcQuitadas, accNuevas, accQuitadas, tabNuevas, tabQuitadas, tabCambios].some(x => x.length)) cambios.push(c);
}

const n = cambios.length;
if (n && !soloComparar) {
  fs.mkdirSync(HIST, { recursive: true });
  if (fs.existsSync(DATA)) fs.copyFileSync(DATA, path.join(HIST, `softland_dd_${(viejo.generado || 'anterior')}_${Date.now()}.json`));
  fs.writeFileSync(DATA, JSON.stringify(nuevo));
}
const resumen = n ? `${n} módulo(s) con cambios: ${cambios.map(c => c.modulo).join(', ')}${soloComparar ? '' : ' · diccionario del BPA actualizado (falta commit/deploy)'}` : 'sin cambios en el diccionario de Softland';
console.log(resumen);
cambios.forEach(c => console.log(' ', JSON.stringify(c)));
console.log('RESULTADO_JOB ' + JSON.stringify({ modelo: null, costo_usd: 0, mensaje: resumen, detalle: { cambios } }));
