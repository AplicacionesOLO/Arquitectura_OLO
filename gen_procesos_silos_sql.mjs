// Genera supabase_procesos_silos_seed.sql a partir de
// olo-architecture/src/data/procesos_silos.js (borradores de los silos P1.x).
// · Proceso = nodo nivel 1 bajo el macroproceso existente (por nombre), con codigo.
// · Subprocesos = pasos numerados (codigo X.NN). Los pasos que citan una pantalla
//   llevan adjunta su captura: eFlow WMS (wms-manual/), handheld (hh-manual/) o SORTER CLIRO (sorter-manual/).
// · Crea los silos de SILOS_NUEVOS y los macroprocesos marcados con crearMacro.
// · Idempotente: todo se inserta solo si su codigo no existe. No borra ni modifica.
// Uso: node gen_procesos_silos_sql.mjs
import fs from "fs";
import { pathToFileURL } from "url";

const APP = "C:/GitHub/Arquitectura_OLO/olo-architecture/src";
const IMG_DIR = "C:/Users/arojast/WMS_eflow_map/manual/img";
const { PROCESOS_SILOS, SILOS_NUEVOS } = await import(pathToFileURL(`${APP}/data/procesos_silos.js`).href);
const { SORTER_BY_ID } = await import(pathToFileURL(`${APP}/data/sorter_manual.js`).href);
const { HH_BY_ID } = await import(pathToFileURL(`${APP}/data/hh_manual.js`).href);
// El tamaño del archivo es solo informativo: si la copia local no está, queda null.
const tam = (f) => { try { return fs.statSync(f).size; } catch { return "null"; } };
const { WMS_INDEX } = await import(pathToFileURL(`${APP}/data/wms_links.js`).href);

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const norm = (col) => `lower(regexp_replace(trim(${col}), '\\s+', ' ', 'g'))`;

const out = [`-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Procesos BORRADOR de los silos de referencia (P1.x)
-- GENERADO por gen_procesos_silos_sql.mjs desde src/data/procesos_silos.js.
-- No son procedimientos aprobados de OLO: los pasos citan pantallas reales de
-- eFlow WMS (origen eflow_wms) y lo demás es práctica 3PL (origen inferido);
-- el detalle y el origen de cada paso están en la ficha del frontend.
-- · Proceso (nivel 1) bajo el macroproceso existente del silo, con su codigo.
-- · Subprocesos = pasos numerados; los que citan una pantalla llevan su captura.
-- · Idempotente (por codigo). No borra ni modifica nada existente.
-- Safe to commit: solo datos de procesos, sin secretos.
-- ═══════════════════════════════════════════════════════════════════════════

-- Silos nuevos (no existían en la base)
${SILOS_NUEVOS.map(s => `insert into public.procesos_categorias (id, num, label, color) values (${q(s.id)}, ${s.num}, ${q(s.label)}, ${q(s.color)}) on conflict (id) do nothing;`).join("\n")}

do $$
declare
  v_macro uuid;
  v_proc  uuid;
  v_sub   uuid;
begin`];

for (const [codigo, p] of Object.entries(PROCESOS_SILOS)) {
  out.push(`
  -- ${codigo} · ${p.nombre}  (${p.siloLabel} › ${p.macro})
  select id into v_macro from public.procesos_nodes
    where categoria_id = ${q(p.silo)} and level = 0 and ${norm("name")} = ${norm(q(p.macro))}
    order by sort_order limit 1;
  ${p.crearMacro ? `if v_macro is null then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order)
      select ${q(p.silo)}, null, 0, ${q(p.macro)}, coalesce(max(sort_order), -1) + 1
      from public.procesos_nodes where categoria_id = ${q(p.silo)} and level = 0
      returning id into v_macro;
  end if;` : `if v_macro is null then raise exception 'No existe el macroproceso % en %', ${q(p.macro)}, ${q(p.silo)}; end if;`}
  if not exists (select 1 from public.procesos_nodes where codigo = ${q(codigo)}) then
    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      select ${q(p.silo)}, v_macro, 1, ${q(p.nombre)}, coalesce(max(sort_order), -1) + 1, ${q(codigo)}
      from public.procesos_nodes where parent_id = v_macro
      returning id into v_proc;`);
  p.pasos.forEach((st, i) => {
    const sub = `${codigo}.${String(i + 1).padStart(2, "0")}`;
    out.push(`    insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order, codigo)
      values (${q(p.silo)}, v_proc, 2, ${q(`${i + 1}. ${st.texto}`)}, ${i}, ${q(sub)}) returning id into v_sub;`);
    const srt = st.sistema === "sorter" && SORTER_BY_ID[st.screen];
    if (srt) {
      const size = "null";
      out.push(`    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', ${q(`sorter-manual/${srt.img}`)}, ${q(`SORTER CLIRO · ${srt.modulo} › ${srt.nombre}.jpg`)}, 'image/jpeg', ${size});`);
    }
    const hh = st.sistema === "handheld" && HH_BY_ID[st.screen];
    if (hh) out.push(`    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', ${q(`hh-manual/${hh.img}`)}, ${q(`Handheld · ${hh.url.replace(/›/g, "-")}.jpg`)}, 'image/jpeg', null);`);
    const w = !srt && !hh && st.screen && WMS_INDEX[st.screen];
    if (w?.img) {
      const size = tam(`${IMG_DIR}/${w.img}`);
      out.push(`    insert into public.procesos_archivos (node_id, bucket, path, file_name, mime_type, size_bytes)
      values (v_sub, 'Detalles_Porcesos', ${q(`wms-manual/${w.img}`)}, ${q(`eFlow WMS · ${w.module} › ${w.option}.jpg`)}, 'image/jpeg', ${size});`);
    }
  });
  out.push(`  end if;
  v_macro := null; v_proc := null;`);
}
out.push("end $$;\n");
fs.writeFileSync("C:/GitHub/Arquitectura_OLO/supabase_procesos_silos_seed.sql", out.join("\n"));

const n = Object.values(PROCESOS_SILOS);
const pasos = n.reduce((s, p) => s + p.pasos.length, 0);
const imgs = n.reduce((s, p) => s + p.pasos.filter(x => (x.sistema === "sorter" && SORTER_BY_ID[x.screen]) || (x.sistema === "handheld" && HH_BY_ID[x.screen]) || (x.screen && WMS_INDEX[x.screen]?.img)).length, 0);
console.log(`${n.length} procesos · ${pasos} subprocesos · ${imgs} con captura adjunta`);
