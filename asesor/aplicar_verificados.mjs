// asesor/aplicar_verificados.mjs — marca en solicitudes_cambio los desarrollos
// que ePRAC confirmó como verificados en el WMS (desarrollos_verificados_2026.json):
//   · la solicitud que corresponde queda «aplicada», verificada, con su proforma
//     y su número de ePRAC (no toca las notas que se escribieron en el BPA)
//   · los desarrollos sin documento de solicitud se agregan con origen «lista»
// Es idempotente: se puede correr de nuevo cuando llegue una lista actualizada.
// Uso: node asesor/aplicar_verificados.mjs [--seco]
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SECO = process.argv.includes("--seco");
const L = JSON.parse(fs.readFileSync(path.join(RAIZ, "asesor", "desarrollos_verificados_2026.json"), "utf8"));
const env = {};
fs.readFileSync(path.join(RAIZ, ".env"), "utf8").split("\n").forEach(l => {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !l.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
});
const H = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" };
async function api(metodo, ruta, cuerpo, prefer = "return=minimal") {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${ruta}`, { method: metodo, headers: { ...H, Prefer: prefer }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  if (!r.ok) throw new Error(`${metodo} ${ruta.split("?")[0]}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  return prefer.includes("minimal") ? null : r.json();
}

const existentes = new Set((await api("GET", "solicitudes_cambio?select=id", null, "count=none")).map(r => r.id));
const numero = s => s.match(/ePRAC\s*-\s*(\d+)/i)?.[1] || null;
const compania = s => s.match(/-\s*([A-ZÁÉÍÓÚ]+)\s*$/)?.[1] || null;
const fuente = `${L.fuente} · ${L.archivo} · recibido ${L.recibido}`;
let marcadas = 0, nuevas = 0;
const faltan = [];
for (const d of L.desarrollos) {
  const base = { proforma: d.proforma, numero_eprac: numero(d.solicitud), estado: "aplicada", verificado: true, verificado_fuente: fuente };
  if (d.solicitudes.length) {
    for (const id of d.solicitudes) {
      if (!existentes.has(id)) { faltan.push(`${d.solicitud} → ${id}`); continue; }
      if (!SECO) await api("PATCH", `solicitudes_cambio?id=eq.${encodeURIComponent(id)}`, { ...base, verificado_coincidencia: d.coincidencia });
      marcadas++;
    }
  } else {
    // sin documento de solicitud en el BPA: se agrega desde la lista
    const id = `DEV-eprac-${numero(d.solicitud)}`;
    const fila = { id, titulo: d.descripcion.replace(/_/g, " "), archivo: null, compania: compania(d.solicitud), ...base, verificado_coincidencia: "lista", origen: "lista",
      descripcion: `Desarrollo ${d.solicitud} verificado en el WMS según la lista «${L.fuente}». No hay documento de la solicitud en el BPA.`, atencion: { solicitud: d.solicitud, proforma: d.proforma }, entidades: {} };
    if (!SECO) await api("POST", "solicitudes_cambio?on_conflict=id", [fila], "resolution=merge-duplicates,return=minimal");
    nuevas++;
  }
}
console.log(`${SECO ? "[seco] " : ""}${L.desarrollos.length} desarrollos verificados · ${marcadas} solicitudes marcadas · ${nuevas} agregadas desde la lista${faltan.length ? ` · NO ENCONTRADAS: ${faltan.join(", ")}` : ""}`);
