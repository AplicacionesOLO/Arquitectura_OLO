// schema_watch/publicar.js — sube el informe de diff.js a Supabase
// (tabla bpa_schema_cambios) con la clave de servicio de ../.env, para que el
// BPA lo muestre en Monitor › Cambios en bases. La clave nunca sale del .env.
const fs = require('fs');
const path = require('path');

function env() {
  const e = {};
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split('\n').forEach(l => {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !l.trim().startsWith('#')) e[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
  return e;
}

async function publicar(inf, md, analisis = null) {
  const e = env();
  if (!e.SUPABASE_URL || !e.SUPABASE_SERVICE_ROLE_KEY) throw new Error('faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env');
  // el detalle se recorta para que la fila no crezca sin límite (el informe completo queda en disco)
  const recorte = xs => Array.isArray(xs) ? xs.slice(0, 60) : xs;
  const detalle = {
    instancias: inf.instancias,
    bpa: inf.bpa.map(c => ({ ...c, faltan: recorte(c.faltan), colsFaltan: recorte(c.colsFaltan), nuevasDesdeMapeo: recorte(c.nuevasDesdeMapeo), alteradasDesdeMapeo: recorte(c.alteradasDesdeMapeo) })),
    sinMapear: inf.sinMapear,
    cambios: inf.cambios.map(c => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, recorte(v)]))),
  };
  const r = await fetch(`${e.SUPABASE_URL}/rest/v1/bpa_schema_cambios`, {
    method: 'POST',
    headers: { apikey: e.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${e.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ generado: inf.generado, anterior: inf.anterior, resumen: inf.resumen, detalle, informe_md: md, analisis_md: analisis }),
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

module.exports = { publicar };
