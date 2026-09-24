// jobs/despachador.js — lo ejecuta la tarea de Windows cada 15 minutos.
// Lee los jobs y su configuración desde Supabase (bpa_jobs, editable en el
// BPA › Monitor › Jobs), corre los que tocan según su frecuencia o los pedidos
// con «Ejecutar ahora», y registra cada corrida (duración, modelo, costo) en
// bpa_job_runs. Respeta el tope de gasto mensual: si se alcanzó, el job corre
// sin la parte de IA. Credenciales: ../.env (clave de servicio de Supabase).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { pathToFileURL } = require('url');

const RAIZ = path.join(__dirname, '..');
const LOCK = path.join(__dirname, '.lock');
const LOG = path.join(__dirname, 'despachador.log');
const log = m => { const l = `[${new Date().toISOString()}] ${m}`; console.log(l); fs.appendFileSync(LOG, l + '\n'); };

// Qué comando corre cada job según su configuración
const JOBS = {
  schema_watch: cfg => {
    const a = [path.join(RAIZ, 'schema_watch', 'run.js')];
    if (cfg.modelo) a.push('--modelo', cfg.modelo); else a.push('--sin-claude');
    if (cfg.solo_si_cambios === false) a.push('--analizar');
    return a;
  },
  softland_dd: () => [path.join(RAIZ, 'softland_dd', 'run.js')],
};

const env = {};
fs.readFileSync(path.join(RAIZ, '.env'), 'utf8').split('\n').forEach(l => {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !l.trim().startsWith('#')) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
});
const H = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' };
async function api(metodo, ruta, cuerpo) {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${ruta}`, { method: metodo, headers: { ...H, Prefer: 'return=representation' }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  if (!r.ok) throw new Error(`Supabase ${metodo} ${ruta.split('?')[0]}: ${r.status} ${(await r.text()).slice(0, 160)}`);
  return r.status === 204 ? null : r.json();
}

function correr(args, timeoutMin) {
  return new Promise(resolve => {
    const p = spawn(process.execPath, args, { cwd: RAIZ, windowsHide: true });
    let out = '', err = '';
    p.stdout.on('data', d => { out += d; }); p.stderr.on('data', d => { err += d; });
    const t = setTimeout(() => { p.kill(); err += `\ntiempo agotado (${timeoutMin} min)`; }, timeoutMin * 60000);
    p.on('close', code => { clearTimeout(t); resolve({ code, out, err }); });
  });
}

(async () => {
  // una corrida a la vez (una corrida larga no debe solaparse con la siguiente revisión)
  if (fs.existsSync(LOCK) && Date.now() - fs.statSync(LOCK).mtimeMs < 2 * 3600000) { log('otra corrida en curso: se omite esta revisión'); return; }
  fs.writeFileSync(LOCK, String(process.pid));
  const t0 = new Date();
  try {
    const { toca } = await import(pathToFileURL(path.join(RAIZ, 'olo-architecture', 'src', 'lib', 'frecuencia.js')).href);
    const jobs = await api('GET', 'bpa_jobs?select=*&order=orden');
    const yo = jobs.find(j => j.id === 'despachador');
    let corridos = 0;
    for (const j of jobs) {
      if (j.id === 'despachador' || !JOBS[j.id]) continue;
      const cfg = j.config || {};
      // nunca corrió: se toma esta revisión como punto de partida (no corre de golpe al instalarse)
      if (!j.ultima_ejecucion && !j.ejecutar_ahora) { await api('PATCH', `bpa_jobs?id=eq.${j.id}`, { ultima_ejecucion: t0.toISOString() }); continue; }
      const manual = j.ejecutar_ahora;
      if (!manual && !(cfg.activo && toca(cfg.frecuencia, new Date(j.ultima_ejecucion), t0))) continue;

      // tope de gasto del mes
      const mes = new Date(t0.getFullYear(), t0.getMonth(), 1).toISOString();
      const runs = await api('GET', `bpa_job_runs?select=costo_usd&job_id=eq.${j.id}&inicio=gte.${mes}`);
      const gastado = runs.reduce((a, r) => a + Number(r.costo_usd || 0), 0);
      const c = { ...cfg };
      let nota = '';
      if (cfg.modelo && cfg.limite_mensual_usd > 0 && gastado >= cfg.limite_mensual_usd) { c.modelo = null; nota = ` · sin IA: se alcanzó el tope del mes (US$ ${gastado.toFixed(2)})`; }

      const inicio = new Date();
      log(`${j.id}: inicia (${manual ? 'manual' : 'programado'})`);
      await api('PATCH', `bpa_jobs?id=eq.${j.id}`, { ejecutar_ahora: false, ultima_ejecucion: inicio.toISOString() });
      const res = await correr(JOBS[j.id](c), cfg.timeout_min || 30);
      const fin = new Date();
      const linea = res.out.split('\n').find(l => l.startsWith('RESULTADO_JOB '));
      let r = {};
      try { r = linea ? JSON.parse(linea.slice(14)) : {}; } catch { /* sin resultado legible */ }
      const ok = res.code === 0;
      await api('POST', 'bpa_job_runs', {
        job_id: j.id, inicio: inicio.toISOString(), fin: fin.toISOString(), duracion_ms: fin - inicio, estado: ok ? 'ok' : 'error',
        disparo: manual ? 'manual' : 'programado', modelo: r.modelo || null, costo_usd: r.costo_usd || 0,
        tokens_entrada: r.tokens_entrada || null, tokens_salida: r.tokens_salida || null, detalle: r.detalle || null,
        mensaje: ok ? (r.mensaje || 'ok') + nota : (res.err || res.out).trim().split('\n').slice(-3).join(' ').slice(0, 500),
      });
      log(`${j.id}: ${ok ? 'ok' : 'error'} en ${((fin - inicio) / 1000).toFixed(0)} s · US$ ${(r.costo_usd || 0).toFixed(4)}`);
      corridos++;
    }
    // latido del despachador (y su propia corrida, para ver cuánto tarda)
    const fin = new Date();
    await api('PATCH', 'bpa_jobs?id=eq.despachador', { ultima_revision: fin.toISOString(), ultima_ejecucion: t0.toISOString(), ubicacion: { ...(yo?.ubicacion || {}), equipo: os.hostname() } });
    await api('POST', 'bpa_job_runs', { job_id: 'despachador', inicio: t0.toISOString(), fin: fin.toISOString(), duracion_ms: fin - t0, estado: 'ok', disparo: 'programado', costo_usd: 0, mensaje: corridos ? `ejecutó ${corridos} job(s)` : 'nada pendiente' });
    // su historial se conserva 3 días (corre 96 veces al día)
    await api('DELETE', `bpa_job_runs?job_id=eq.despachador&inicio=lt.${new Date(Date.now() - 3 * 86400000).toISOString()}`);
  } catch (e) {
    log(`ERROR: ${e.message}`);
    process.exitCode = 1;
  } finally { fs.rmSync(LOCK, { force: true }); }
})();
