// Uso: node check_procesos_silos.mjs — valida procesos_silos.js: pantallas citadas existen en el manual, tablas en eFlow, enlaces entre procesos
import { pathToFileURL } from "url";
const B = "C:/GitHub/Arquitectura_OLO/olo-architecture/src/";
const { PROCESOS_SILOS } = await import(pathToFileURL(B + "data/procesos_silos.js"));
const { WMS_INDEX } = await import(pathToFileURL(B + "data/wms_links.js"));
const { EFW_GROUPS } = await import(pathToFileURL(B + "efw_constants.js"));
const tablas = new Set(Object.values(EFW_GROUPS).flatMap(g => g.tables));
const errs = [];
let pasos = 0, eflow = 0, inf = 0;
for (const [c, p] of Object.entries(PROCESOS_SILOS)) {
  for (const s of p.pasos) { pasos++; s.origen === "eflow_wms" ? eflow++ : inf++;
    if (s.screen && !WMS_INDEX[s.screen]) errs.push(`${c}: pantalla inexistente ${s.screen}`);
    if (s.origen === "eflow_wms" && !s.screen) errs.push(`${c}: paso eflow_wms sin pantalla: ${s.texto}`); }
  for (const t of p.tablas) if (!tablas.has(t.tabla)) errs.push(`${c}: tabla inexistente ${t.tabla}`);
  for (const r of [...(p.entradaDe || []), ...(p.salidaA || [])]) if (!PROCESOS_SILOS[r] && !/^P\d+$/.test(r)) errs.push(`${c}: enlace a proceso inexistente ${r}`);
}
console.log(`${Object.keys(PROCESOS_SILOS).length} procesos · ${pasos} pasos (${eflow} eflow_wms, ${inf} inferidos)`);
console.log(errs.length ? errs.join("\n") : "sin errores");
